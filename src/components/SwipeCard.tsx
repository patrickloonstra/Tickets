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
  const keepOpacity = useTransform(x, [20, SWIPE_THRESHOLD], [0, 1])
  const letGoOpacity = useTransform(x, [-SWIPE_THRESHOLD, -20], [1, 0])

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
              style={{ opacity: keepOpacity, color: 'var(--color-keep)', borderColor: 'var(--color-keep)' }}
              className="absolute left-5 top-6 rotate-[-8deg] rounded-lg border-2 px-3 py-1 text-sm font-bold tracking-wide"
            >
              BEWAREN
            </motion.div>
            <motion.div
              style={{ opacity: letGoOpacity, color: 'var(--color-let-go)', borderColor: 'var(--color-let-go)' }}
              className="absolute right-5 top-6 rotate-[8deg] rounded-lg border-2 px-3 py-1 text-sm font-bold tracking-wide"
            >
              WEG
            </motion.div>
          </>
        )}
      </div>
    </motion.div>
  )
}
