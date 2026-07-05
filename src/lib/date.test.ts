import { describe, expect, it } from 'vitest'
import { daysSince, formatDateNl, isSameDayOfYear, yearsAgo } from './date'

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
