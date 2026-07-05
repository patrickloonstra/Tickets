/**
 * Groups photos into "events" (Picnic calls these moments/trips) using only
 * on-device EXIF date and GPS data — no geocoding, no network. A new event
 * starts when there's either a long gap in time or a big jump in distance
 * since the previous photo.
 */

export interface EventInput {
  id: string
  takenAt: number
  lat?: number
  lng?: number
}

export interface PhotoEvent {
  photoIds: string[]
  startAt: number
  endAt: number
}

export const EVENT_TIME_GAP_MS = 36 * 60 * 60 * 1000 // 36 hours
export const EVENT_DISTANCE_KM = 60

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function clusterEvents(
  photos: EventInput[],
  opts: { timeGapMs?: number; distanceKm?: number } = {},
): PhotoEvent[] {
  const timeGapMs = opts.timeGapMs ?? EVENT_TIME_GAP_MS
  const distanceKm = opts.distanceKm ?? EVENT_DISTANCE_KM

  const sorted = [...photos].sort((a, b) => a.takenAt - b.takenAt)
  const events: PhotoEvent[] = []
  let current: EventInput[] = []

  for (const photo of sorted) {
    const prev = current[current.length - 1]
    const startsNew =
      prev !== undefined &&
      (photo.takenAt - prev.takenAt > timeGapMs ||
        (prev.lat !== undefined &&
          prev.lng !== undefined &&
          photo.lat !== undefined &&
          photo.lng !== undefined &&
          haversineKm({ lat: prev.lat, lng: prev.lng }, { lat: photo.lat, lng: photo.lng }) > distanceKm))

    if (startsNew) {
      events.push(toEvent(current))
      current = [photo]
    } else {
      current.push(photo)
    }
  }
  if (current.length > 0) events.push(toEvent(current))

  return events.reverse() // most recent event first
}

function toEvent(photos: EventInput[]): PhotoEvent {
  return {
    photoIds: photos.map((p) => p.id),
    startAt: photos[0].takenAt,
    endAt: photos[photos.length - 1].takenAt,
  }
}
