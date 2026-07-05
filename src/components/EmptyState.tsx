import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 py-16 text-center">
      {icon && <div className="mb-1 text-3xl opacity-80">{icon}</div>}
      <h2 className="text-lg font-medium text-[var(--color-paper)]">{title}</h2>
      {description && <p className="max-w-xs text-sm leading-relaxed text-[var(--color-mist)]">{description}</p>}
      {action}
    </div>
  )
}
