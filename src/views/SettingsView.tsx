import { useEffect, useState } from 'react'
import { EmptyState } from '../components/EmptyState'
import { PhotoThumb } from '../components/PhotoThumb'
import { PhotoViewerModal } from './PhotoViewerModal'
import { usePhotosByStatus } from '../hooks/usePhotos'
import { permanentlyDelete, storageEstimate } from '../lib/repo'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB', 'TB']
  let value = bytes
  let unitIndex = -1
  do {
    value /= 1024
    unitIndex++
  } while (value >= 1024 && unitIndex < units.length - 1)
  return `${value.toFixed(1)} ${units[unitIndex]}`
}

export function SettingsView() {
  const kept = usePhotosByStatus(['kept'])
  const inbox = usePhotosByStatus(['inbox'])
  const archived = usePhotosByStatus(['archived'])
  const [openId, setOpenId] = useState<string | null>(null)
  const [estimate, setEstimate] = useState<StorageEstimate | null>(null)
  const [confirmEmpty, setConfirmEmpty] = useState(false)

  useEffect(() => {
    storageEstimate()?.then(setEstimate)
  }, [archived])

  const totalPhotos = (kept?.length ?? 0) + (inbox?.length ?? 0) + (archived?.length ?? 0)

  return (
    <div className="px-4 pb-24 pt-[max(1rem,env(safe-area-inset-top))]">
      <h1 className="mb-5 text-2xl font-bold tracking-tight">Instellingen &amp; privacy</h1>

      <section className="mb-6 rounded-2xl border border-[var(--color-hairline)] p-4">
        <h2 className="mb-3 text-sm font-medium">Overzicht</h2>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-[var(--color-mist-dim)]">Foto's</dt>
            <dd className="font-mono-num text-[var(--color-paper)]">{totalPhotos}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-mist-dim)]">In archief</dt>
            <dd className="font-mono-num text-[var(--color-paper)]">{archived?.length ?? 0}</dd>
          </div>
          {estimate?.usage !== undefined && (
            <div>
              <dt className="text-[var(--color-mist-dim)]">Ruimte gebruikt</dt>
              <dd className="font-mono-num text-[var(--color-paper)]">{formatBytes(estimate.usage)}</dd>
            </div>
          )}
        </dl>
      </section>

      <section className="mb-6 rounded-2xl border border-[var(--color-hairline)] p-4">
        <h2 className="mb-2 text-sm font-medium">Onze belofte</h2>
        <ul className="flex flex-col gap-2 text-sm text-[var(--color-mist)]">
          <li>— Geen account nodig, geen server: je bibliotheek staat alleen op dit toestel.</li>
          <li>— Geen enkele netwerkaanroep. Open gerust het netwerktabblad van je browser om het te checken.</li>
          <li>— Geen cookies, geen analytics, geen trackers van wie dan ook — ook niet "functioneel".</li>
          <li>— Open source: niemand hoeft ons op ons woord te geloven.</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-[var(--color-hairline)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-medium">Archief</h2>
          {!!archived?.length && (
            <button
              type="button"
              onClick={() => setConfirmEmpty(true)}
              className="text-xs"
              style={{ color: 'var(--color-let-go)' }}
            >
              Archief leegmaken
            </button>
          )}
        </div>

        {!archived?.length ? (
          <EmptyState title="Archief is leeg" />
        ) : (
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-6">
            {archived.map((photo) => (
              <PhotoThumb key={photo.id} photo={photo} onClick={() => setOpenId(photo.id)} />
            ))}
          </div>
        )}

        {confirmEmpty && archived && (
          <div className="mt-4 rounded-xl bg-[var(--color-surface)] p-4">
            <p className="mb-3 text-sm">
              {archived.length} foto's definitief verwijderen? Dit kan niet ongedaan worden gemaakt.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmEmpty(false)}
                className="flex-1 rounded-full border border-[var(--color-hairline-strong)] py-2 text-sm"
              >
                Annuleer
              </button>
              <button
                type="button"
                onClick={async () => {
                  await permanentlyDelete(archived.map((p) => p.id))
                  setConfirmEmpty(false)
                }}
                className="flex-1 rounded-full py-2 text-sm text-[var(--color-ink)]"
                style={{ background: 'var(--color-let-go)' }}
              >
                Verwijder definitief
              </button>
            </div>
          </div>
        )}
      </section>

      {openId && <PhotoViewerModal photoId={openId} onClose={() => setOpenId(null)} />}
    </div>
  )
}
