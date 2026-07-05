import { useMemo, useState } from 'react'
import { PhotoThumb } from '../components/PhotoThumb'
import { EmptyState } from '../components/EmptyState'
import { ImportButton } from '../components/ImportButton'
import { PhotoViewerModal } from './PhotoViewerModal'
import { usePhotosByStatus } from '../hooks/usePhotos'
import type { Photo } from '../lib/db'

const monthNames = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]

function groupByMonth(photos: Photo[]): { label: string; photos: Photo[] }[] {
  const groups = new Map<string, Photo[]>()
  for (const photo of photos) {
    const d = new Date(photo.takenAt)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const list = groups.get(key) ?? []
    list.push(photo)
    groups.set(key, list)
  }
  return Array.from(groups.entries()).map(([key, list]) => {
    const [year, month] = key.split('-').map(Number)
    return { label: `${monthNames[month]} ${year}`, photos: list }
  })
}

export function LibraryView() {
  const photos = usePhotosByStatus(['kept', 'inbox'])
  const [openId, setOpenId] = useState<string | null>(null)
  const groups = useMemo(() => (photos ? groupByMonth(photos) : []), [photos])

  if (photos === undefined) return null

  if (photos.length === 0) {
    return (
      <EmptyState
        icon="✦"
        title="Nog geen foto's"
        description="Helder werkt volledig offline: je foto's worden alleen op dit toestel bewaard. Geen account, geen upload, geen tracking."
        action={<ImportButton className="mt-4" label="Kies foto's om te beginnen" />}
      />
    )
  }

  return (
    <div className="px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-medium">Bibliotheek</h1>
        <ImportButton label="+ Toevoegen" />
      </div>
      {groups.map((group) => (
        <div key={group.label} className="mb-6">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--color-mist-dim)]">
            {group.label}
          </h2>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-6">
            {group.photos.map((photo) => (
              <PhotoThumb key={photo.id} photo={photo} onClick={() => setOpenId(photo.id)} />
            ))}
          </div>
        </div>
      ))}
      {openId && <PhotoViewerModal photoId={openId} onClose={() => setOpenId(null)} />}
    </div>
  )
}
