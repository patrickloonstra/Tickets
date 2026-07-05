export type ViewName = 'library' | 'sort' | 'suggestions' | 'memories' | 'albums' | 'settings'

const items: { key: ViewName; label: string; icon: string }[] = [
  { key: 'library', label: 'Bibliotheek', icon: '▦' },
  { key: 'sort', label: 'Sorteren', icon: '◐' },
  { key: 'suggestions', label: 'Opschonen', icon: '✂' },
  { key: 'memories', label: 'Herinneringen', icon: '✦' },
  { key: 'albums', label: 'Albums', icon: '▢' },
]

interface Props {
  active: ViewName
  onChange: (view: ViewName) => void
  badgeCounts?: Partial<Record<ViewName, number>>
}

export function BottomNav({ active, onChange, badgeCounts }: Props) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-hairline)] bg-[var(--color-ink)]/90 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-xl items-stretch justify-between px-1">
        {items.map((item) => {
          const isActive = item.key === active
          const badge = badgeCounts?.[item.key]
          return (
            <li key={item.key} className="flex-1">
              <button
                type="button"
                onClick={() => onChange(item.key)}
                className={`relative flex w-full flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${
                  isActive ? 'text-[var(--color-paper)]' : 'text-[var(--color-mist-dim)]'
                }`}
              >
                <span className="text-base leading-none" style={isActive ? { color: 'var(--color-glow-2)' } : undefined}>
                  {item.icon}
                </span>
                {item.label}
                {!!badge && (
                  <span className="absolute right-4 top-1 min-w-[16px] rounded-full bg-[var(--color-glow-2)] px-1 text-center text-[9px] font-semibold leading-4 text-[var(--color-ink)]">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
