import { describe, expect, it } from 'vitest'
import { daysSince, formatDateNl, formatRangeNl, isSameDayOfYear, yearsAgo } from './date'

describe('isSameDayOfYear', () => {
  it('matches same month/day in a different year', () => {
    const then = new Date(2019, 6, 5).getTime()
    const now = new Date(2026, 6, 5).getTime()
    expect(isSameDayOfYear(then, now)).toBe(true)
  })

  it('rejects the same calendar date in the same year', () => {
    const now = new Date(2026, 6, 5).getTime()
    expect(isSameDayOfYear(now, now)).toBe(false)
  })

  it('rejects a different day', () => {
    const then = new Date(2019, 6, 6).getTime()
    const now = new Date(2026, 6, 5).getTime()
    expect(isSameDayOfYear(then, now)).toBe(false)
  })
})

describe('yearsAgo', () => {
  it('computes whole calendar years between two timestamps', () => {
    const then = new Date(2019, 6, 5).getTime()
    const now = new Date(2026, 6, 5).getTime()
    expect(yearsAgo(then, now)).toBe(7)
  })
})

describe('daysSince', () => {
  it('computes whole days between two timestamps', () => {
    const then = new Date(2026, 0, 1).getTime()
    const now = new Date(2026, 0, 11).getTime()
    expect(daysSince(then, now)).toBe(10)
  })
})

describe('formatDateNl', () => {
  it('formats a date in Dutch', () => {
    expect(formatDateNl(new Date(2026, 6, 5).getTime())).toBe('5 juli 2026')
  })
})

describe('formatRangeNl', () => {
  it('collapses to a single date when start and end are the same day', () => {
    const t = new Date(2026, 6, 5, 10).getTime()
    const t2 = new Date(2026, 6, 5, 18).getTime()
    expect(formatRangeNl(t, t2)).toBe('5 juli 2026')
  })

  it('formats a range within the same month', () => {
    const start = new Date(2026, 6, 12).getTime()
    const end = new Date(2026, 6, 14).getTime()
    expect(formatRangeNl(start, end)).toBe('12–14 juli 2026')
  })

  it('formats a range spanning two months in the same year', () => {
    const start = new Date(2026, 5, 28).getTime()
    const end = new Date(2026, 6, 2).getTime()
    expect(formatRangeNl(start, end)).toBe('28 juni – 2 juli 2026')
  })

  it('formats a range spanning two years', () => {
    const start = new Date(2025, 11, 30).getTime()
    const end = new Date(2026, 0, 2).getTime()
    expect(formatRangeNl(start, end)).toBe('30 december 2025 – 2 januari 2026')
  })
})
