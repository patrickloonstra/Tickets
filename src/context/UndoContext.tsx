import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { setStatus } from '../lib/repo'
import type { PhotoStatus } from '../lib/db'

interface UndoEntry {
  photoId: string
  previousStatus: PhotoStatus
  label: string
}

interface UndoContextValue {
  offerUndo: (photoId: string, previousStatus: PhotoStatus | undefined, label: string) => void
}

const UndoContext = createContext<UndoContextValue | null>(null)

const VISIBLE_MS = 4000

export function UndoProvider({ children }: { children: ReactNode }) {
  const [entry, setEntry] = useState<UndoEntry | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const offerUndo = useCallback((photoId: string, previousStatus: PhotoStatus | undefined, label: string) => {
    if (!previousStatus) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setEntry({ photoId, previousStatus, label })
    timeoutRef.current = setTimeout(() => setEntry(null), VISIBLE_MS)
  }, [])

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  async function handleUndo() {
    if (!entry) return
    await setStatus(entry.photoId, entry.previousStatus)
    setEntry(null)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }

  return (
    <UndoContext.Provider value={{ offerUndo }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 z-[60] flex justify-center px-4"
        style={{ top: 'max(3.5rem, calc(env(safe-area-inset-top) + 3rem))' }}
      >
        <AnimatePresence>
          {entry && (
            <motion.div
              initial={{ opacity: 0, y: -16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="pointer-events-auto flex items-center gap-3 rounded-full bg-[var(--color-surface-raised)] px-4 py-2.5 shadow-2xl shadow-black/40 ring-1 ring-[var(--color-hairline-strong)]"
            >
              <span className="text-sm text-[var(--color-paper)]">{entry.label}</span>
              <button
                type="button"
                onClick={handleUndo}
                className="text-sm font-semibold"
                style={{ color: 'var(--color-glow-2)' }}
              >
                Ongedaan maken
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </UndoContext.Provider>
  )
}

export function useUndo(): UndoContextValue {
  const ctx = useContext(UndoContext)
  if (!ctx) throw new Error('useUndo must be used within UndoProvider')
  return ctx
}
