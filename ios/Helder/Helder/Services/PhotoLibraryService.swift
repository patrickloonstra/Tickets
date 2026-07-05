import Foundation
import Photos
import UIKit
import SwiftData

/// Handles the one-time "grant access" flow and the on-device import
/// pipeline. Photos stay in the user's own Photos library at all times — we
/// only ever read them locally to compute metadata; nothing is copied out,
/// nothing is uploaded.
@MainActor
final class PhotoLibraryService: ObservableObject {
    @Published var authorizationStatus: PHAuthorizationStatus = .notDetermined
    @Published var isImporting = false
    @Published var importProgress: (done: Int, total: Int)?

    func refreshStatus() {
        authorizationStatus = PHPhotoLibrary.authorizationStatus(for: .readWrite)
    }

    func requestAccess() async {
        authorizationStatus = await PHPhotoLibrary.requestAuthorization(for: .readWrite)
    }

    /// Fetches every photo asset in the library that we haven't analyzed yet
    /// and inserts a `Photo` record for it.
    func importNewPhotos(context: ModelContext) async {
        guard authorizationStatus == .authorized || authorizationStatus == .limited else { return }
        isImporting = true
        defer { isImporting = false }

        let existingIdentifiers = Set((try? context.fetch(FetchDescriptor<Photo>()))?.map(\.assetIdentifier) ?? [])

        let fetchOptions = PHFetchOptions()
        fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: true)]
        let assets = PHAsset.fetchAssets(with: .image, options: fetchOptions)

        var newAssets: [PHAsset] = []
        assets.enumerateObjects { asset, _, _ in
            if !existingIdentifiers.contains(asset.localIdentifier) {
                newAssets.append(asset)
            }
        }

        guard !newAssets.isEmpty else { return }
        importProgress = (0, newAssets.count)

        for (index, asset) in newAssets.enumerated() {
            if let image = await requestImage(for: asset, targetSize: CGSize(width: 300, height: 300)) {
                let photo = Photo(
                    assetIdentifier: asset.localIdentifier,
                    takenAt: asset.creationDate ?? Date(),
                    latitude: asset.location?.coordinate.latitude,
                    longitude: asset.location?.coordinate.longitude,
                    phash: ImageAnalysis.dHash(of: image),
                    sharpness: ImageAnalysis.sharpness(of: image)
                )
                context.insert(photo)
            }
            importProgress = (index + 1, newAssets.count)
        }

        try? context.save()
        importProgress = nil
    }

    /// Actually deletes photos from the user's Photos library. iOS shows its
    /// own confirmation dialog for this — it can't be silently bypassed.
    func permanentlyDelete(_ identifiers: [String]) async {
        guard !identifiers.isEmpty else { return }
        let fetched = PHAsset.fetchAssets(withLocalIdentifiers: identifiers, options: nil)
        var assets: [PHAsset] = []
        fetched.enumerateObjects { asset, _, _ in assets.append(asset) }
        guard !assets.isEmpty else { return }
        try? await PHPhotoLibrary.shared().performChanges {
            PHAssetChangeRequest.deleteAssets(assets as NSArray)
        }
    }

    private func requestImage(for asset: PHAsset, targetSize: CGSize) async -> UIImage? {
        await withCheckedContinuation { continuation in
            let options = PHImageRequestOptions()
            options.deliveryMode = .highQualityFormat
            options.isNetworkAccessAllowed = true
            options.isSynchronous = false
            PHImageManager.default().requestImage(
                for: asset,
                targetSize: targetSize,
                contentMode: .aspectFit,
                options: options
            ) { image, _ in
                continuation.resume(returning: image)
            }
        }
    }
}
