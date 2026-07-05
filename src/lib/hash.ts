/**
 * Perceptual difference-hash (dHash). Operates on a plain grayscale pixel
 * buffer so the math can be unit tested without a real canvas/DOM.
 * Expects a 9x8 grayscale image (72 pixels): for each row, compares each
 * pixel to its right neighbour, producing a 64-bit fingerprint.
 */
export const DHASH_WIDTH = 9
export const DHASH_HEIGHT = 8

export function dHashFromGray(gray: ArrayLike<number>, width = DHASH_WIDTH, height = DHASH_HEIGHT): bigint {
  if (gray.length !== width * height) {
    throw new Error(`expected ${width * height} gray values, got ${gray.length}`)
  }
  let hash = 0n
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width - 1; col++) {
      const left = gray[row * width + col]
      const right = gray[row * width + col + 1]
      hash <<= 1n
      if (left > right) hash |= 1n
    }
  }
  return hash
}

export function hammingDistance(a: bigint, b: bigint): number {
  let x = a ^ b
  let count = 0
  while (x > 0n) {
    count += Number(x & 1n)
    x >>= 1n
  }
  return count
}

export function hashToHex(hash: bigint): string {
  return hash.toString(16).padStart(16, '0')
}

export function hexToHash(hex: string): bigint {
  return BigInt(`0x${hex}`)
}

/** Two photos below this distance are considered near-duplicates. */
export const DUPLICATE_THRESHOLD = 8

export function groupDuplicates(photos: { id: string; phash: string }[]): string[][] {
  const groups: string[][] = []
  const assigned = new Set<string>()

  for (let i = 0; i < photos.length; i++) {
    if (assigned.has(photos[i].id)) continue
    const group = [photos[i].id]
    assigned.add(photos[i].id)
    const hashA = hexToHash(photos[i].phash)

    for (let j = i + 1; j < photos.length; j++) {
      if (assigned.has(photos[j].id)) continue
      const hashB = hexToHash(photos[j].phash)
      if (hammingDistance(hashA, hashB) <= DUPLICATE_THRESHOLD) {
        group.push(photos[j].id)
        assigned.add(photos[j].id)
      }
    }

    if (group.length > 1) groups.push(group)
  }

  return groups
}
