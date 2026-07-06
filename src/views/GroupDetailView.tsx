import { useState } from 'react'
import { PhotoThumb } from '../components/PhotoThumb'
import { EmptyState } from '../components/EmptyState'
import { PhotoViewerModal } from './PhotoViewerModal'
import { SortView } from './SortView'
import { decidePhoto } from '../lib/repo'
import { useUndo } from '../context/UndoContext'
import type { Photo } from '../lib/db'

interface Props {
  title: string
  subtitle?: string
  photos: Photo[]
  onBack: () => void
}

export function GroupDetailView({ title, subtitle, photos, onBack }: Props) {
  const [openId, setOpenId] = useState<string | null>(null)
  const [sorting, setSorting] = useState(false)
  const inboxIds = photos.filter((p) => p.status === 'inbox').map((p) => p.id)
  const { offerUndo } = useUndo()

  async function discard(photo: Photo) {
    const previousStatus = await decidePhoto(photo.id, 'archived')
    offerUndo(photo.id, previousStatus, 'Foto weggegooid')
  }

  if (sorting) {
    return <SortView photoIds={inboxIds} title={title} onBack={() => setSorting(false)} />
  }

  return (
    <div className="px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <button type="button" onClick={onBack} className="mb-4 text-sm text-[var(--color-mist)]">
        ← Terug
      </button>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-xs text-[var(--color-mist)]">{subtitle}</p>}
        </div>
        {inboxIds.length > 0 && (
          <button
            type="button"
            onClick={() => setSorting(true)}
            className="rounded-full px-4 py-2 text-sm text-[var(--color-ink)]"
            style={{ background: 'linear-gradient(135deg, var(--color-glow-1), var(--color-glow-2))' }}
          >
            Sorteren ({inboxIds.length})
          </button>
        )}
      </div>

      {photos.length === 0 ? (
        <EmptyState title="Leeg" />
      ) : (
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {photos.map((photo) => (
            <div key={photo.id} className="relative">
              <PhotoThumb photo={photo} onClick={() => setOpenId(photo.id)} />
              {photo.status !== 'archived' && (
                <button
                  type="button"
                  onClick={() => discard(photo)}
                  className="absolute inset-x-1 bottom-1 rounded-md bg-black/60 py-0.5 text-[10px] backdrop-blur"
                  style={{ color: 'var(--color-let-go)' }}
                >
                  Weggooien
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {openId && <PhotoViewerModal photoId={openId} onClose={() => setOpenId(null)} />}
    </div>
  )
}
