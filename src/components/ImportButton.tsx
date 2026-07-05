import { useRef, useState } from 'react'
import { importFiles } from '../lib/repo'

interface Props {
  className?: string
  label?: string
  onDone?: () => void
}

export function ImportButton({ className, label = 'Foto’s toevoegen', onDone }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const files = Array.from(fileList)
    setProgress({ done: 0, total: files.length })
    await importFiles(files, (done, total) => setProgress({ done, total }))
    setProgress(null)
    onDone?.()
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={!!progress}
        className="rounded-full bg-gradient-to-br from-[var(--color-glow-1)] to-[var(--color-glow-2)] px-6 py-3 text-sm font-medium text-[var(--color-ink)] shadow-lg shadow-orange-950/30 transition-transform active:scale-95 disabled:opacity-70"
      >
        {progress ? `Bezig… ${progress.done}/${progress.total}` : label}
      </button>
    </div>
  )
}
