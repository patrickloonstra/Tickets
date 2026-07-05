import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { useAlbums, usePhoto } from '../hooks/usePhotos'
import {
  addPhotosToAlbum,
  createAlbum,
  decidePhoto,
  removePhotoFromAlbum,
  restorePhoto,
  toggleFavorite,
  touchLastViewed,
} from '../lib/repo'
import { formatDateNl } from '../lib/date'

interface Props {
  photoId: string
  onClose: () => void
}

export function PhotoViewerModal({ photoId, onClose }: Props) {
  const photo = usePhoto(photoId)
  const url = useObjectUrl(photo?.blob)
  const albums = useAlbums()
  const [showAlbumPicker, setShowAlbumPicker] = useState(false)
  const [newAlbumName, setNewAlbumName] = useState('')

  useEffect(() => {
    touchLastViewed(photoId)
  }, [photoId])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!photo) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-[var(--color-ink)]/97 backdrop-blur-xl"
    >
      <div className="flex items-center justify-between px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <button type="button" onClick={onClose} className="rounded-full p-2 text-lg text-[var(--color-mist)]">
          ←
        </button>
        <span className="font-mono-num text-xs text-[var(--color-mist)]">{formatDateNl(photo.takenAt)}</span>
        <button
          type="button"
          onClick={() => toggleFavorite(photo.id, !photo.favorite)}
          className="rounded-full p-2 text-lg"
          style={{ color: photo.favorite ? 'var(--color-glow-2)' : 'var(--color-mist)' }}
          aria-label="Favoriet"
        >
          ✦
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-hidden p-2">
        {url && <img src={url} alt="" className="max-h-full max-w-full rounded-lg object-contain" />}
      </div>

      {showAlbumPicker && (
        <div className="mx-4 mb-2 max-h-56 overflow-y-auto rounded-2xl bg-[var(--color-surface)] p-3">
          <p className="mb-2 px-1 text-xs text-[var(--color-mist-dim)]">Toevoegen aan album</p>
          <div className="flex flex-col gap-1">
            {albums?.map((album) => {
              const inAlbum = photo.albumIds.includes(album.id)
              return (
                <button
                  key={album.id}
                  type="button"
                  onClick={() =>
                    inAlbum ? removePhotoFromAlbum(photo.id, album.id) : addPhotosToAlbum([photo.id], album.id)
                  }
                  className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm"
                  style={{ background: inAlbum ? 'var(--color-hairline)' : 'transparent' }}
                >
                  <span>{album.name}</span>
                  {inAlbum && <span style={{ color: 'var(--color-glow-2)' }}>✓</span>}
                </button>
              )
            })}
          </div>
          <form
            className="mt-2 flex gap-2"
            onSubmit={async (e) => {
              e.preventDefault()
              if (!newAlbumName.trim()) return
              const album = await createAlbum(newAlbumName.trim())
              await addPhotosToAlbum([photo.id], album.id)
              setNewAlbumName('')
            }}
          >
            <input
              value={newAlbumName}
              onChange={(e) => setNewAlbumName(e.target.value)}
              placeholder="Nieuw album"
              className="flex-1 rounded-full border border-[var(--color-hairline-strong)] bg-transparent px-3 py-1.5 text-sm outline-none"
            />
            <button type="submit" className="rounded-full px-3 py-1.5 text-xs text-[var(--color-ink)]" style={{ background: 'var(--color-glow-2)' }}>
              Maak
            </button>
          </form>
        </div>
      )}

      <div className="flex items-center justify-center gap-3 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-2">
        <button
          type="button"
          onClick={() => setShowAlbumPicker((v) => !v)}
          className="rounded-full border border-[var(--color-hairline-strong)] px-5 py-2.5 text-sm text-[var(--color-paper)]"
        >
          Album
        </button>
        {photo.status === 'archived' ? (
          <button
            type="button"
            onClick={() => restorePhoto(photo.id)}
            className="rounded-full border border-[var(--color-hairline-strong)] px-5 py-2.5 text-sm text-[var(--color-paper)]"
          >
            Terugzetten
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              decidePhoto(photo.id, 'archived')
              onClose()
            }}
            className="rounded-full border border-[var(--color-hairline-strong)] px-5 py-2.5 text-sm"
            style={{ color: 'var(--color-let-go)' }}
          >
            Archiveren
          </button>
        )}
      </div>
    </motion.div>
  )
}
