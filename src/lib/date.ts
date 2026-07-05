const DAY_MS = 24 * 60 * 60 * 1000

export function isSameDayOfYear(timestamp: number, reference: number): boolean {
  const a = new Date(timestamp)
  const b = new Date(reference)
  return a.getMonth() === b.getMonth() && a.getDate() === b.getDate() && a.getFullYear() !== b.getFullYear()
}

export function yearsAgo(timestamp: number, reference: number): number {
  return new Date(reference).getFullYear() - new Date(timestamp).getFullYear()
}

export function daysSince(timestamp: number, reference: number): number {
  return Math.floor((reference - timestamp) / DAY_MS)
}

const monthNames = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
]

export function formatDateNl(timestamp: number): string {
  const d = new Date(timestamp)
  return `${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`
}

/** Compact Dutch date range, e.g. "5 juli 2026", "12–14 juli 2026", or "28 juni – 2 juli 2026". */
export function formatRangeNl(startAt: number, endAt: number): string {
  const a = new Date(startAt)
  const b = new Date(endAt)

  if (a.toDateString() === b.toDateString()) {
    return formatDateNl(startAt)
  }
  if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) {
    return `${a.getDate()}–${b.getDate()} ${monthNames[a.getMonth()]} ${a.getFullYear()}`
  }
  if (a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()} ${monthNames[a.getMonth()]} – ${b.getDate()} ${monthNames[b.getMonth()]} ${a.getFullYear()}`
  }
  return `${formatDateNl(startAt)} – ${formatDateNl(endAt)}`
}
