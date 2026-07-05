import Foundation
import Photos
import UIKit

/// Loads a displayable UIImage for a PHAsset identifier on demand, with a
/// small in-memory cache. Nothing here touches the network beyond iCloud
/// Photos' own on-demand download (governed entirely by the user's existing
/// Photos settings, not by us).
@MainActor
final class ImageLoader: ObservableObject {
    static let shared = ImageLoader()
    private let cache = NSCache<NSString, UIImage>()

    private init() {}

    func image(for identifier: String, targetSize: CGSize) async -> UIImage? {
        let cacheKey = "\(identifier)-\(Int(targetSize.width))" as NSString
        if let cached = cache.object(forKey: cacheKey) {
            return cached
        }

        let fetched = PHAsset.fetchAssets(withLocalIdentifiers: [identifier], options: nil)
        guard let asset = fetched.firstObject else { return nil }

        return await withCheckedContinuation { continuation in
            let options = PHImageRequestOptions()
            options.deliveryMode = .highQualityFormat
            options.isNetworkAccessAllowed = true
            PHImageManager.default().requestImage(
                for: asset,
                targetSize: targetSize,
                contentMode: .aspectFill,
                options: options
            ) { [weak self] image, _ in
                if let image {
                    self?.cache.setObject(image, forKey: cacheKey)
                }
                continuation.resume(returning: image)
            }
        }
    }
}
