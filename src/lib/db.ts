import Dexie, { type EntityTable } from 'dexie'

export type PhotoStatus = 'inbox' | 'kept' | 'archived'

export interface Photo {
  id: string
  blob: Blob
  thumbBlob: Blob
  fileName: string
  mimeType: string
  width: number
  height: number
  takenAt: number
  importedAt: number
  size: number
  phash: string
  sharpness: number
  status: PhotoStatus
  favorite: boolean
  albumIds: string[]
  lastViewedAt: number
  lat?: number
  lng?: number
}

export interface Album {
  id: string
  name: string
  createdAt: number
  coverPhotoId?: string
}

export const db = new Dexie('helder') as Dexie & {
  photos: EntityTable<Photo, 'id'>
  albums: EntityTable<Album, 'id'>
}

db.version(1).stores({
  photos: 'id, status, takenAt, phash, favorite, importedAt',
  albums: 'id, name, createdAt',
})
