import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SwipeCard } from '../components/SwipeCard'
import { EmptyState } from '../components/EmptyState'
import { ConfettiBurst } from '../components/ConfettiBurst'
import { usePhotosByStatus } from '../hooks/usePhotos'
import { decidePhoto } from '../lib/repo'
import { useUndo } from '../context/UndoContext'
import type { Photo } from '../lib/db'

const STACK_SIZE = 4

interface Props {
  /** Restrict the deck to these photo ids (used for sorting within one event/group). Omit to sort the whole inbox. */
  photoIds?: string[]
  title?: string
  onBack?: () => void
}

interface SessionStats {
  kept: number
  archived: number
  bytesFreed: number
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const prefersReducedMotion =
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

export function SortView({ photoIds, title, onBack }: Props) {
  const allInbox = usePhotosByStatus(['inbox'])
  const inbox = photoIds ? allInbox?.filter((p) => photoIds.includes(p.id)) : allInbox
  const queue = inbox?.slice(0, STACK_SIZE)
  const top = queue?.[0]
  const { offerUndo } = useUndo()

  const [stats, setStats] = useState<SessionStats>({ kept: 0, archived: 0, bytesFreed: 0 })
  const [showCelebration, setShowCelebration] = useState(false)
  const hadPhotosRef = useRef(false)

  async function decide(photo: Photo, decision: 'kept' | 'archived') {
    const previousStatus = await decidePhoto(photo.id, decision)
    offerUndo(photo.id, previousStatus, decision === 'kept' ? 'Foto bewaard' : 'Foto gearchiveerd')
    setStats((s) => ({
      kept: s.kept + (decision === 'kept' ? 1 : 0),
      archived: s.archived + (decision === 'archived' ? 1 : 0),
      bytesFreed: s.bytesFreed + (decision === 'archived' ? photo.size : 0),
    }))
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!top) return
      if (e.key === 'ArrowRight') decide(top, 'kept')
      if (e.key === 'ArrowLeft') decide(top, 'archived')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [top])

  useEffect(() => {
    if (!inbox) return
    if (inbox.length > 0) {
      hadPhotosRef.current = true
      setShowCelebration(false)
    } else if (hadPhotosRef.current && (stats.kept > 0 || stats.archived > 0)) {
      setShowCelebration(true)
      hadPhotosRef.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inbox?.length])

  if (inbox === undefined) return null

  if (inbox.length === 0) {
    if (showCelebration) {
      return (
        <div className="relative flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
          {!prefersReducedMotion && <ConfettiBurst />}
          <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full text-2xl" style={{ background: 'linear-gradient(135deg, var(--color-glow-1), var(--color-glow-2))' }}>
            ✓
          </div>
          <h2 className="text-xl font-semibold text-[var(--color-paper)]">Klaar!</h2>
          <p className="font-mono-num text-sm text-[var(--color-mist)]">
            {stats.kept} bewaard · {stats.archived} gearchiveerd
          </p>
          {stats.bytesFreed > 0 && (
            <p className="text-sm" style={{ color: 'var(--color-coral)' }}>
              ≈ {formatBytes(stats.bytesFreed)} opgeruimd
            </p>
          )}
          {onBack && (
            <button type="button" onClick={onBack} className="mt-3 text-sm underline text-[var(--color-mist)]">
              Terug
            </button>
          )}
        </div>
      )
    }

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
              onDecide={(decision) => decide(photo, decision)}
            />
          ))}
        </AnimatePresence>
      </div>
      <div className="mt-6 flex items-center gap-8">
        <motion.button
          whileTap={{ scale: 0.88 }}
          type="button"
          aria-label="Archiveren"
          onClick={() => top && decide(top, 'archived')}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 text-xl"
          style={{ borderColor: 'var(--color-let-go)', color: 'var(--color-let-go)' }}
        >
          ✕
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.88 }}
          type="button"
          aria-label="Bewaren"
          onClick={() => top && decide(top, 'kept')}
          className="flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white shadow-lg"
          style={{ background: 'var(--color-keep)' }}
        >
          ♥
        </motion.button>
      </div>
      <p className="mt-4 text-xs text-[var(--color-mist-dim)]">Swipe, of gebruik de pijltjestoetsen</p>
    </div>
  )
}
