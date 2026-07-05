import { describe, expect, it } from 'vitest'
import { dHashFromGray, groupDuplicates, hammingDistance, hashToHex, hexToHash } from './hash'

function makeGray(rowPattern: number[][]): number[] {
  return rowPattern.flat()
}

describe('dHashFromGray', () => {
  it('produces a stable hash for identical images', () => {
    const gray = makeGray(Array.from({ length: 8 }, () => [10, 20, 30, 40, 50, 60, 70, 80, 90]))
    const a = dHashFromGray(gray)
    const b = dHashFromGray(gray)
    expect(a).toBe(b)
  })

  it('flips a bit when a single pixel pair inverts', () => {
    const base = Array.from({ length: 8 }, () => [10, 20, 30, 40, 50, 60, 70, 80, 90])
    const changed = base.map((row) => [...row])
    // invert the first pair in the first row: was increasing (10 < 20), now decreasing
    changed[0][0] = 25
    const hashA = dHashFromGray(makeGray(base))
    const hashB = dHashFromGray(makeGray(changed))
    expect(hammingDistance(hashA, hashB)).toBe(1)
  })

  it('throws on wrong buffer size', () => {
    expect(() => dHashFromGray([1, 2, 3])).toThrow()
  })
})

describe('hex round-trip', () => {
  it('survives a hex encode/decode cycle', () => {
    const gray = makeGray(Array.from({ length: 8 }, (_, r) => Array.from({ length: 9 }, (_, c) => r * 9 + c)))
    const hash = dHashFromGray(gray)
    expect(hexToHash(hashToHex(hash))).toBe(hash)
  })
})

describe('groupDuplicates', () => {
  it('groups photos whose hashes are close together', () => {
    const photos = [
      { id: 'a', phash: '0000000000000000' },
      { id: 'b', phash: '0000000000000001' }, // 1 bit off -> duplicate of a
      { id: 'c', phash: 'ffffffffffffffff' }, // far away -> not a duplicate
    ]
    const groups = groupDuplicates(photos)
    expect(groups).toEqual([['a', 'b']])
  })

  it('returns no groups when every photo is unique', () => {
    const photos = [
      { id: 'a', phash: '0000000000000000' },
      { id: 'b', phash: 'ffffffffffffffff' },
    ]
    expect(groupDuplicates(photos)).toEqual([])
  })
})
