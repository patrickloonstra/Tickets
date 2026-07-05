import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Photo, type PhotoStatus } from '../lib/db'

export function usePhotosByStatus(statuses: PhotoStatus[]): Photo[] | undefined {
  return useLiveQuery(
    () => db.photos.where('status').anyOf(statuses).reverse().sortBy('takenAt'),
    [statuses.join(',')],
  )
}

export function useAllPhotos(): Photo[] | undefined {
  return useLiveQuery(() => db.photos.toArray(), [])
}

export function useAlbums() {
  return useLiveQuery(() => db.albums.orderBy('createdAt').reverse().toArray(), [])
}

export function usePhoto(id: string | undefined): Photo | undefined {
  return useLiveQuery(() => (id ? db.photos.get(id) : undefined), [id])
}
