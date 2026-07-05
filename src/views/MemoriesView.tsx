import { useMemo, useState } from 'react'
import { PhotoThumb } from '../components/PhotoThumb'
import { EmptyState } from '../components/EmptyState'
import { PhotoViewerModal } from './PhotoViewerModal'
import { usePhotosByStatus } from '../hooks/usePhotos'
import { daysSince, isSameDayOfYear, yearsAgo } from '../lib/date'
import type { Photo } from '../lib/db'

function pickForgottenGems(photos: Photo[], now: number, count = 12): Photo[] {
  const old = photos.filter((p) => daysSince(p.lastViewedAt, now) > 30)
  const shuffled = [...old].sort((a, b) => a.lastViewedAt - b.lastViewedAt)
  return shuffled.slice(0, count)
}

export function MemoriesView() {
  const photos = usePhotosByStatus(['kept', 'inbox'])
  const [openId, setOpenId] = useState<string | null>(null)
  const now = useMemo(() => Date.now(), [])

  const onThisDay = useMemo(
    () => (photos ? photos.filter((p) => isSameDayOfYear(p.takenAt, now)) : []),
    [photos, now],
  )
  const forgotten = useMemo(() => (photos ? pickForgottenGems(photos, now) : []), [photos, now])

  if (photos === undefined) return null

  if (photos.length === 0) {
    return <EmptyState icon="✦" title="Nog geen herinneringen" description="Zodra je wat foto's toevoegt, duiken hier oude momenten weer op." />
  }

  return (
    <div className="px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <h1 className="mb-5 text-xl font-medium">Herinneringen</h1>

      {onThisDay.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-2 text-sm font-medium text-[var(--color-paper)]">Op deze dag</h2>
          <p className="mb-3 text-xs text-[var(--color-mist)]">
            {yearsAgo(onThisDay[0].takenAt, now)} jaar geleden
          </p>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {onThisDay.map((photo) => (
              <PhotoThumb key={photo.id} photo={photo} onClick={() => setOpenId(photo.id)} />
            ))}
          </div>
        </section>
      )}

      {forgotten.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-medium text-[var(--color-paper)]">Bijna vergeten</h2>
          <p className="mb-3 text-xs text-[var(--color-mist)]">Even niet bekeken — nog steeds de moeite waard.</p>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {forgotten.map((photo) => (
              <PhotoThumb key={photo.id} photo={photo} onClick={() => setOpenId(photo.id)} />
            ))}
          </div>
        </section>
      )}

      {onThisDay.length === 0 && forgotten.length === 0 && (
        <EmptyState icon="✦" title="Nog even geduld" description="Hoe langer je Helder gebruikt, hoe meer herinneringen hier vanzelf opduiken." />
      )}

      {openId && <PhotoViewerModal photoId={openId} onClose={() => setOpenId(null)} />}
    </div>
  )
}
