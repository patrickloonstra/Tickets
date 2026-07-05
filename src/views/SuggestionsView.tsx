import { useEffect, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { PhotoThumb } from '../components/PhotoThumb'
import { PhotoViewerModal } from './PhotoViewerModal'
import { usePhotosByStatus } from '../hooks/usePhotos'
import { computeSuggestions, decidePhoto, type Suggestion } from '../lib/repo'
import type { Photo } from '../lib/db'

export function SuggestionsView() {
  const photos = usePhotosByStatus(['kept', 'inbox'])
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    if (!photos) return
    let cancelled = false
    computeSuggestions(['kept', 'inbox']).then((result) => {
      if (!cancelled) setSuggestions(result)
    })
    return () => {
      cancelled = true
    }
  }, [photos])

  if (photos === undefined || suggestions === null) return null

  const byId = new Map(photos.map((p) => [p.id, p]))

  if (suggestions.length === 0) {
    return (
      <EmptyState
        icon="✂"
        title="Lekker opgeruimd"
        description="Geen dubbele of wazige foto's gevonden. Kom later terug — Helder houdt dit lokaal en automatisch bij."
      />
    )
  }

  return (
    <div className="px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <h1 className="mb-1 text-xl font-medium">Opschonen</h1>
      <p className="mb-5 text-sm text-[var(--color-mist)]">
        Suggesties op basis van gelijkenis en scherpte — jij beslist, niets verdwijnt automatisch.
      </p>
      <div className="flex flex-col gap-6">
        {suggestions.map((s, i) => {
          if (s.kind === 'duplicate') {
            const group = s.photoIds.map((id) => byId.get(id)).filter((p): p is Photo => !!p)
            if (group.length < 2) return null
            return (
              <div key={`dup-${i}`} className="rounded-2xl border border-[var(--color-hairline)] p-3">
                <p className="mb-2 text-sm text-[var(--color-paper)]">
                  {group.length} foto’s lijken op elkaar
                </p>
                <div className="grid grid-cols-4 gap-1.5">
                  {group.map((photo) => (
                    <div key={photo.id} className="relative">
                      <PhotoThumb photo={photo} onClick={() => setOpenId(photo.id)} />
                      <button
                        type="button"
                        onClick={() => decidePhoto(photo.id, 'archived')}
                        className="absolute inset-x-1 bottom-1 rounded-md bg-black/60 py-0.5 text-[10px] backdrop-blur"
                        style={{ color: 'var(--color-let-go)' }}
                      >
                        Archiveer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )
          }

          const photo = byId.get(s.photoId)
          if (!photo) return null
          return (
            <div key={`blur-${i}`} className="flex items-center gap-3 rounded-2xl border border-[var(--color-hairline)] p-3">
              <div className="w-20">
                <PhotoThumb photo={photo} onClick={() => setOpenId(photo.id)} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[var(--color-paper)]">Deze lijkt wazig</p>
                <p className="text-xs text-[var(--color-mist)]">Bekijk 'm rustig en beslis zelf</p>
              </div>
              <button
                type="button"
                onClick={() => decidePhoto(photo.id, 'archived')}
                className="rounded-full border border-[var(--color-hairline-strong)] px-3 py-1.5 text-xs"
                style={{ color: 'var(--color-let-go)' }}
              >
                Archiveer
              </button>
            </div>
          )
        })}
      </div>
      {openId && <PhotoViewerModal photoId={openId} onClose={() => setOpenId(null)} />}
    </div>
  )
}
