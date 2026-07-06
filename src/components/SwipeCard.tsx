import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useObjectUrl } from '../hooks/useObjectUrl'
import type { Photo } from '../lib/db'

interface Props {
  photo: Photo
  isTop: boolean
  stackIndex: number
  onDecide: (decision: 'kept' | 'archived') => void
}

const SWIPE_THRESHOLD = 120

export function SwipeCard({ photo, isTop, stackIndex, onDecide }: Props) {
  const url = useObjectUrl(photo.blob)
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 300], [-18, 18])

  const keepWashOpacity = useTransform(x, [10, SWIPE_THRESHOLD], [0, 0.55])
  const letGoWashOpacity = useTransform(x, [-SWIPE_THRESHOLD, -10], [0.55, 0])
  const keepBadgeScale = useTransform(x, [10, SWIPE_THRESHOLD], [0.6, 1])
  const letGoBadgeScale = useTransform(x, [-SWIPE_THRESHOLD, -10], [1, 0.6])

  return (
    <motion.div
      className="absolute inset-0"
      style={
        isTop
          ? { x, rotate }
          : {
              scale: 1 - stackIndex * 0.04,
              y: stackIndex * 12,
              opacity: stackIndex > 2 ? 0 : 1 - stackIndex * 0.15,
            }
      }
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={(_e, info) => {
        if (info.offset.x > SWIPE_THRESHOLD) onDecide('kept')
        else if (info.offset.x < -SWIPE_THRESHOLD) onDecide('archived')
      }}
      animate={isTop ? { x: 0 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-3xl bg-[var(--color-surface)] shadow-2xl shadow-black/50">
        {url && <img src={url} alt="" className="h-full w-full object-cover" draggable={false} />}

        {isTop && (
          <>
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: keepWashOpacity,
                background: 'linear-gradient(180deg, transparent 40%, var(--color-keep) 100%)',
              }}
            />
            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{
                opacity: letGoWashOpacity,
                background: 'linear-gradient(180deg, transparent 40%, var(--color-let-go) 100%)',
              }}
            />

            <motion.div
              style={{ opacity: keepWashOpacity, scale: keepBadgeScale }}
              className="absolute left-6 top-6 flex items-center gap-1.5 rounded-full px-4 py-2 text-base font-extrabold tracking-wide text-white shadow-lg"
            >
              <span className="absolute inset-0 -z-10 rounded-full" style={{ background: 'var(--color-keep)' }} />
              ♥ BEWAREN
            </motion.div>
            <motion.div
              style={{ opacity: letGoWashOpacity, scale: letGoBadgeScale }}
              className="absolute right-6 top-6 flex items-center gap-1.5 rounded-full px-4 py-2 text-base font-extrabold tracking-wide text-white shadow-lg"
            >
              <span className="absolute inset-0 -z-10 rounded-full" style={{ background: 'var(--color-let-go)' }} />
              WEG ✕
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  )
}
