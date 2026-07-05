import Foundation

/// Groups photos into "events" (moments/trips) using only on-device date and
/// GPS data — no geocoding, no network. A new event starts when there's
/// either a long gap in time or a big jump in distance since the previous
/// photo. Ported 1:1 from the web app's `events.ts`.
struct EventInput {
    let id: String
    let takenAt: Date
    let latitude: Double?
    let longitude: Double?
}

struct PhotoEvent {
    let photoIDs: [String]
    let startAt: Date
    let endAt: Date
}

enum EventClustering {
    static let defaultTimeGap: TimeInterval = 36 * 60 * 60 // 36 hours
    static let defaultDistanceKm: Double = 60

    static func cluster(
        _ photos: [EventInput],
        timeGap: TimeInterval = defaultTimeGap,
        distanceKm: Double = defaultDistanceKm
    ) -> [PhotoEvent] {
        let sorted = photos.sorted { $0.takenAt < $1.takenAt }
        var events: [PhotoEvent] = []
        var current: [EventInput] = []

        for photo in sorted {
            guard let prev = current.last else {
                current.append(photo)
                continue
            }

            var startsNew = photo.takenAt.timeIntervalSince(prev.takenAt) > timeGap
            if !startsNew,
               let plat = prev.latitude, let plng = prev.longitude,
               let lat = photo.latitude, let lng = photo.longitude {
                let distance = haversineKm(lat1: plat, lng1: plng, lat2: lat, lng2: lng)
                if distance > distanceKm { startsNew = true }
            }

            if startsNew {
                events.append(makeEvent(current))
                current = [photo]
            } else {
                current.append(photo)
            }
        }
        if !current.isEmpty {
            events.append(makeEvent(current))
        }

        return Array(events.reversed())
    }

    private static func makeEvent(_ photos: [EventInput]) -> PhotoEvent {
        PhotoEvent(
            photoIDs: photos.map(\.id),
            startAt: photos.first!.takenAt,
            endAt: photos.last!.takenAt
        )
    }

    private static func haversineKm(lat1: Double, lng1: Double, lat2: Double, lng2: Double) -> Double {
        let earthRadiusKm = 6371.0
        let dLat = (lat2 - lat1) * .pi / 180
        let dLng = (lng2 - lng1) * .pi / 180
        let a = sin(dLat / 2) * sin(dLat / 2)
            + cos(lat1 * .pi / 180) * cos(lat2 * .pi / 180) * sin(dLng / 2) * sin(dLng / 2)
        let c = 2 * atan2(sqrt(a), sqrt(1 - a))
        return earthRadiusKm * c
    }
}
