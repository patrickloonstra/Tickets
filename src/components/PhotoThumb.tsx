import { useObjectUrl } from '../hooks/useObjectUrl'
import type { Photo } from '../lib/db'

interface Props {
  photo: Photo
  onClick?: () => void
}

export function PhotoThumb({ photo, onClick }: Props) {
  const url = useObjectUrl(photo.thumbBlob)

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative aspect-square overflow-hidden rounded-xl bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-glow-2)]"
    >
      {url && (
        <img
          src={url}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 ease-[var(--ease-spring)] group-hover:scale-105"
        />
      )}
      {photo.favorite && (
        <span className="absolute right-1.5 top-1.5 text-xs drop-shadow" aria-label="Favoriet">
          ✦
        </span>
      )}
    </button>
  )
}
