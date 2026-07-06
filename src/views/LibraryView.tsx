import { useMemo, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { ImportButton } from '../components/ImportButton'
import { GroupDetailView } from './GroupDetailView'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { usePhotosByStatus } from '../hooks/usePhotos'
import { clusterEvents } from '../lib/events'
import { formatRangeNl } from '../lib/date'
import type { Photo } from '../lib/db'

const monthNames = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]

interface Group {
  key: string
  title: string
  subtitle?: string
  photos: Photo[]
}

function groupByMonth(photos: Photo[]): Group[] {
  const groups = new Map<string, Photo[]>()
  for (const photo of photos) {
    const d = new Date(photo.takenAt)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const list = groups.get(key) ?? []
    list.push(photo)
    groups.set(key, list)
  }
  return Array.from(groups.entries())
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([key, list]) => {
      const [year, month] = key.split('-').map(Number)
      return { key, title: `${monthNames[month]} ${year}`, photos: list }
    })
}

function groupByEvent(photos: Photo[]): Group[] {
  const events = clusterEvents(photos.map((p) => ({ id: p.id, takenAt: p.takenAt, lat: p.lat, lng: p.lng })))
  const byId = new Map(photos.map((p) => [p.id, p]))
  return events.map((event) => ({
    key: `${event.startAt}-${event.photoIds[0]}`,
    title: formatRangeNl(event.startAt, event.endAt),
    subtitle: `${event.photoIds.length} foto's`,
    photos: event.photoIds.map((id) => byId.get(id)).filter((p): p is Photo => !!p),
  }))
}

export function LibraryView() {
  const photos = usePhotosByStatus(['kept', 'inbox'])
  const [mode, setMode] = useState<'events' | 'month'>('events')
  const [openGroupKey, setOpenGroupKey] = useState<string | null>(null)

  const groups = useMemo(() => {
    if (!photos) return []
    return mode === 'month' ? groupByMonth(photos) : groupByEvent(photos)
  }, [photos, mode])

  const openGroup = groups.find((g) => g.key === openGroupKey)

  if (photos === undefined) return null

  if (photos.length === 0) {
    return (
      <EmptyState
        icon="✦"
        title="Nog geen toegang tot foto's"
        description="Helder werkt volledig offline: je foto's blijven alleen op dit toestel. Geen account, geen upload, geen tracking. Geef toegang en selecteer in één keer je hele bibliotheek — daarna organiseren we ze automatisch per maand en gebeurtenis."
        action={<ImportButton className="mt-4" label="Geef toegang tot je foto's" />}
      />
    )
  }

  if (openGroup) {
    return (
      <GroupDetailView
        title={openGroup.title}
        subtitle={openGroup.subtitle}
        photos={openGroup.photos}
        onBack={() => setOpenGroupKey(null)}
      />
    )
  }

  return (
    <div className="px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Bibliotheek</h1>
        <ImportButton label="+ Toegang" />
      </div>

      <div className="mb-5 inline-flex rounded-full border border-[var(--color-hairline-strong)] p-0.5 text-sm">
        {(['events', 'month'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="rounded-full px-3.5 py-1.5 transition-colors"
            style={
              mode === m
                ? { background: 'var(--color-surface-raised)', color: 'var(--color-paper)' }
                : { color: 'var(--color-mist)' }
            }
          >
            {m === 'events' ? 'Gebeurtenissen' : 'Maand'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {groups.map((group) => {
          const cover = group.photos[0]
          const inboxCount = group.photos.filter((p) => p.status === 'inbox').length
          return (
            <button
              key={group.key}
              type="button"
              onClick={() => setOpenGroupKey(group.key)}
              className="group overflow-hidden rounded-2xl border border-[var(--color-hairline)] text-left"
            >
              <div className="relative aspect-[4/3] bg-[var(--color-surface)]">
                {cover && <CoverImage photo={cover} />}
                {inboxCount > 0 && (
                  <span className="absolute right-2 top-2 rounded-full bg-[var(--color-glow-2)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-ink)]">
                    {inboxCount} nieuw
                  </span>
                )}
              </div>
              <div className="p-2.5">
                <p className="truncate text-sm font-medium text-[var(--color-paper)]">{group.title}</p>
                <p className="text-xs text-[var(--color-mist)]">{group.subtitle ?? `${group.photos.length} foto's`}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CoverImage({ photo }: { photo: Photo }) {
  const url = useObjectUrl(photo.thumbBlob)
  return url ? <img src={url} alt="" className="h-full w-full object-cover" /> : null
}
