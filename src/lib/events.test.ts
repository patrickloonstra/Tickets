import { describe, expect, it } from 'vitest'
import { clusterEvents } from './events'

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR
const BASE = new Date(2026, 0, 1).getTime()

describe('clusterEvents', () => {
  it('keeps photos taken close together in time in one event', () => {
    const photos = [
      { id: 'a', takenAt: BASE },
      { id: 'b', takenAt: BASE + 1 * HOUR },
      { id: 'c', takenAt: BASE + 5 * HOUR },
    ]
    const events = clusterEvents(photos)
    expect(events).toHaveLength(1)
    expect(events[0].photoIds.sort()).toEqual(['a', 'b', 'c'])
  })

  it('splits into separate events on a big time gap', () => {
    const photos = [
      { id: 'a', takenAt: BASE },
      { id: 'b', takenAt: BASE + 2 * DAY },
    ]
    const events = clusterEvents(photos)
    expect(events).toHaveLength(2)
  })

  it('splits into separate events on a big jump in distance, even same day', () => {
    const photos = [
      { id: 'a', takenAt: BASE, lat: 52.37, lng: 4.9 }, // Amsterdam
      { id: 'b', takenAt: BASE + 1 * HOUR, lat: 48.85, lng: 2.35 }, // Paris
    ]
    const events = clusterEvents(photos)
    expect(events).toHaveLength(2)
  })

  it('keeps nearby GPS points together', () => {
    const photos = [
      { id: 'a', takenAt: BASE, lat: 52.37, lng: 4.9 },
      { id: 'b', takenAt: BASE + 1 * HOUR, lat: 52.38, lng: 4.91 },
    ]
    const events = clusterEvents(photos)
    expect(events).toHaveLength(1)
  })

  it('does not require GPS — falls back to time-only clustering', () => {
    const photos = [
      { id: 'a', takenAt: BASE },
      { id: 'b', takenAt: BASE + 1 * HOUR },
    ]
    const events = clusterEvents(photos)
    expect(events).toHaveLength(1)
  })

  it('orders events most-recent-first', () => {
    const photos = [
      { id: 'old', takenAt: BASE },
      { id: 'new', takenAt: BASE + 3 * DAY },
    ]
    const events = clusterEvents(photos)
    expect(events[0].photoIds).toEqual(['new'])
    expect(events[1].photoIds).toEqual(['old'])
  })

  it('returns an empty array for no photos', () => {
    expect(clusterEvents([])).toEqual([])
  })
})
