import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { SwipeCard } from '../components/SwipeCard'
import { EmptyState } from '../components/EmptyState'
import { usePhotosByStatus } from '../hooks/usePhotos'
import { decidePhoto } from '../lib/repo'

const STACK_SIZE = 4

interface Props {
  /** Restrict the deck to these photo ids (used for sorting within one event/group). Omit to sort the whole inbox. */
  photoIds?: string[]
  title?: string
  onBack?: () => void
}

export function SortView({ photoIds, title, onBack }: Props) {
  const allInbox = usePhotosByStatus(['inbox'])
  const inbox = photoIds ? allInbox?.filter((p) => photoIds.includes(p.id)) : allInbox
  const queue = inbox?.slice(0, STACK_SIZE)
  const top = queue?.[0]

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!top) return
      if (e.key === 'ArrowRight') decidePhoto(top.id, 'kept')
      if (e.key === 'ArrowLeft') decidePhoto(top.id, 'archived')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [top])

  if (inbox === undefined) return null

  if (inbox.length === 0) {
    return (
      <EmptyState
        icon="◐"
        title="Helemaal bijgewerkt"
        description={
          onBack
            ? 'Niets meer te sorteren in dit groepje.'
            : "Geen nieuwe foto's om te sorteren. Geef toegang tot meer foto's via Bibliotheek."
        }
        action={
          onBack && (
            <button type="button" onClick={onBack} className="mt-2 text-sm underline text-[var(--color-mist)]">
              Terug
            </button>
          )
        }
      />
    )
  }

  return (
    <div className="flex flex-1 flex-col items-center px-6 pb-6 pt-[max(1rem,env(safe-area-inset-top))]">
      {onBack && (
        <div className="mb-2 flex w-full max-w-sm items-center justify-between">
          <button type="button" onClick={onBack} className="text-sm text-[var(--color-mist)]">
            ← Terug
          </button>
          {title && <span className="text-sm text-[var(--color-paper)]">{title}</span>}
          <span />
        </div>
      )}
      <p className="mb-4 text-sm text-[var(--color-mist)] font-mono-num">{inbox.length} te gaan</p>
      <div className="relative w-full max-w-sm flex-1" style={{ aspectRatio: '3 / 4' }}>
        <AnimatePresence>
          {queue?.map((photo, i) => (
            <SwipeCard
              key={photo.id}
              photo={photo}
              isTop={i === 0}
              stackIndex={i}
              onDecide={(decision) => decidePhoto(photo.id, decision)}
            />
          ))}
        </AnimatePresence>
      </div>
      <div className="mt-6 flex items-center gap-8">
        <button
          type="button"
          aria-label="Archiveren"
          onClick={() => top && decidePhoto(top.id, 'archived')}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-hairline-strong)] text-xl transition-transform active:scale-90"
          style={{ color: 'var(--color-let-go)' }}
        >
          ✕
        </button>
        <button
          type="button"
          aria-label="Bewaren"
          onClick={() => top && decidePhoto(top.id, 'kept')}
          className="flex h-16 w-16 items-center justify-center rounded-full text-2xl text-[var(--color-ink)] transition-transform active:scale-90"
          style={{ background: 'linear-gradient(135deg, var(--color-glow-1), var(--color-glow-2))' }}
        >
          ♥
        </button>
      </div>
      <p className="mt-4 text-xs text-[var(--color-mist-dim)]">Swipe, of gebruik de pijltjestoetsen</p>
    </div>
  )
}
