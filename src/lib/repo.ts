import { db, type Album, type Photo, type PhotoStatus } from './db'
import { groupDuplicates } from './hash'
import { analyzeFile } from './importPhoto'
import { BLUR_THRESHOLD } from './sharpness'

function uuid(): string {
  return crypto.randomUUID()
}

export async function importFiles(files: File[], onProgress?: (done: number, total: number) => void): Promise<void> {
  let done = 0
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      done++
      onProgress?.(done, files.length)
      continue
    }
    try {
      const analyzed = await analyzeFile(file)
      const photo: Photo = {
        id: uuid(),
        ...analyzed,
        status: 'inbox',
        favorite: false,
        albumIds: [],
        lastViewedAt: Date.now(),
      }
      await db.photos.add(photo)
    } catch (err) {
      console.error('kon foto niet importeren', file.name, err)
    }
    done++
    onProgress?.(done, files.length)
  }
}

export async function decidePhoto(id: string, decision: 'kept' | 'archived'): Promise<void> {
  await db.photos.update(id, { status: decision })
}

export async function restorePhoto(id: string): Promise<void> {
  await db.photos.update(id, { status: 'kept' })
}

export async function permanentlyDelete(ids: string[]): Promise<void> {
  await db.photos.bulkDelete(ids)
}

export async function toggleFavorite(id: string, favorite: boolean): Promise<void> {
  await db.photos.update(id, { favorite })
}

export async function touchLastViewed(id: string): Promise<void> {
  await db.photos.update(id, { lastViewedAt: Date.now() })
}

export async function createAlbum(name: string): Promise<Album> {
  const album: Album = { id: uuid(), name, createdAt: Date.now() }
  await db.albums.add(album)
  return album
}

export async function addPhotosToAlbum(photoIds: string[], albumId: string): Promise<void> {
  for (const id of photoIds) {
    const photo = await db.photos.get(id)
    if (!photo) continue
    if (!photo.albumIds.includes(albumId)) {
      await db.photos.update(id, { albumIds: [...photo.albumIds, albumId] })
    }
  }
}

export async function removePhotoFromAlbum(photoId: string, albumId: string): Promise<void> {
  const photo = await db.photos.get(photoId)
  if (!photo) return
  await db.photos.update(photoId, { albumIds: photo.albumIds.filter((a) => a !== albumId) })
}

export interface DuplicateSuggestion {
  kind: 'duplicate'
  photoIds: string[]
}

export interface BlurSuggestion {
  kind: 'blur'
  photoId: string
}

export type Suggestion = DuplicateSuggestion | BlurSuggestion

/** Non-destructive: surfaces candidates for the user to review, never deletes anything on its own. */
export async function computeSuggestions(status: PhotoStatus[] = ['kept', 'inbox']): Promise<Suggestion[]> {
  const photos = await db.photos.where('status').anyOf(status).toArray()
  const suggestions: Suggestion[] = []

  const duplicateGroups = groupDuplicates(photos.map((p) => ({ id: p.id, phash: p.phash })))
  for (const group of duplicateGroups) {
    suggestions.push({ kind: 'duplicate', photoIds: group })
  }

  const groupedIds = new Set(duplicateGroups.flat())
  for (const photo of photos) {
    if (groupedIds.has(photo.id)) continue
    if (photo.sharpness < BLUR_THRESHOLD) {
      suggestions.push({ kind: 'blur', photoId: photo.id })
    }
  }

  return suggestions
}

export function storageEstimate(): Promise<StorageEstimate> | null {
  if (navigator.storage?.estimate) return navigator.storage.estimate()
  return null
}
