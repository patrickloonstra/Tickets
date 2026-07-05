import { useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { PhotoThumb } from '../components/PhotoThumb'
import { PhotoViewerModal } from './PhotoViewerModal'
import { useAlbums, usePhotosByStatus } from '../hooks/usePhotos'
import { createAlbum } from '../lib/repo'

export function AlbumsView() {
  const albums = useAlbums()
  const photos = usePhotosByStatus(['kept', 'inbox'])
  const [selected, setSelected] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')

  if (albums === undefined || photos === undefined) return null

  if (selected) {
    const album = albums.find((a) => a.id === selected)
    const albumPhotos = photos.filter((p) => p.albumIds.includes(selected))
    return (
      <div className="px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
        <button type="button" onClick={() => setSelected(null)} className="mb-4 text-sm text-[var(--color-mist)]">
          ← Albums
        </button>
        <h1 className="mb-5 text-xl font-medium">{album?.name}</h1>
        {albumPhotos.length === 0 ? (
          <EmptyState title="Nog leeg" description="Voeg foto's toe aan dit album vanuit de bibliotheek." />
        ) : (
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {albumPhotos.map((photo) => (
              <PhotoThumb key={photo.id} photo={photo} onClick={() => setOpenId(photo.id)} />
            ))}
          </div>
        )}
        {openId && <PhotoViewerModal photoId={openId} onClose={() => setOpenId(null)} />}
      </div>
    )
  }

  return (
    <div className="px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-medium">Albums</h1>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="rounded-full border border-[var(--color-hairline-strong)] px-4 py-2 text-sm"
        >
          + Nieuw album
        </button>
      </div>

      {creating && (
        <form
          className="mb-5 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault()
            if (name.trim()) await createAlbum(name.trim())
            setName('')
            setCreating(false)
          }}
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Naam van het album"
            className="flex-1 rounded-full border border-[var(--color-hairline-strong)] bg-[var(--color-surface)] px-4 py-2 text-sm text-[var(--color-paper)] outline-none"
          />
          <button type="submit" className="rounded-full px-4 py-2 text-sm text-[var(--color-ink)]" style={{ background: 'var(--color-glow-2)' }}>
            Maak
          </button>
        </form>
      )}

      {albums.length === 0 ? (
        <EmptyState icon="▢" title="Nog geen albums" description="Groepeer foto's rond een thema, reis of gelegenheid." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {albums.map((album) => {
            const count = photos.filter((p) => p.albumIds.includes(album.id)).length
            return (
              <button
                key={album.id}
                type="button"
                onClick={() => setSelected(album.id)}
                className="rounded-2xl border border-[var(--color-hairline)] p-4 text-left"
              >
                <p className="text-sm font-medium text-[var(--color-paper)]">{album.name}</p>
                <p className="font-mono-num text-xs text-[var(--color-mist)]">{count} foto's</p>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
