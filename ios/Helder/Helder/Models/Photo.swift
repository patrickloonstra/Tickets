import Foundation
import SwiftData

enum PhotoStatus: String, Codable {
    case inbox, kept, archived
}

/// A lightweight local record about one photo in the user's own Photos
/// library. We never copy or upload the image itself — only this metadata
/// (identifier, date, GPS, perceptual hash, sharpness) ever leaves the
/// Photos framework, and it never leaves the device.
@Model
final class Photo: Identifiable {
    @Attribute(.unique) var assetIdentifier: String
    var takenAt: Date
    var latitude: Double?
    var longitude: Double?
    var statusRaw: String
    var isFavorite: Bool
    var phash: UInt64
    var sharpness: Double
    var lastViewedAt: Date
    var importedAt: Date
    var albumIDs: [UUID]

    var id: String { assetIdentifier }

    var status: PhotoStatus {
        get { PhotoStatus(rawValue: statusRaw) ?? .inbox }
        set { statusRaw = newValue.rawValue }
    }

    init(assetIdentifier: String, takenAt: Date, latitude: Double?, longitude: Double?, phash: UInt64, sharpness: Double) {
        self.assetIdentifier = assetIdentifier
        self.takenAt = takenAt
        self.latitude = latitude
        self.longitude = longitude
        self.statusRaw = PhotoStatus.inbox.rawValue
        self.isFavorite = false
        self.phash = phash
        self.sharpness = sharpness
        self.lastViewedAt = .now
        self.importedAt = .now
        self.albumIDs = []
    }
}
