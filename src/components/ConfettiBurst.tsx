import { motion } from 'framer-motion'
import { useMemo } from 'react'

const COLORS = [
  'var(--color-confetti-1)',
  'var(--color-confetti-2)',
  'var(--color-confetti-3)',
  'var(--color-confetti-4)',
  'var(--color-confetti-5)',
]

/** A brief, tasteful one-shot burst — not a looping animation. Respects reduced motion via the caller checking prefersReducedMotion before mounting this. */
export function ConfettiBurst({ count = 18 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.6,
        distance: 60 + Math.random() * 90,
        color: COLORS[i % COLORS.length],
        size: 5 + Math.random() * 5,
        delay: Math.random() * 0.08,
        rotate: Math.random() * 360,
      })),
    [count],
  )

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-sm"
          style={{ width: p.size, height: p.size, background: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 0.6 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance + 30,
            opacity: 0,
            rotate: p.rotate,
            scale: 1,
          }}
          transition={{ duration: 0.9, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  )
}
