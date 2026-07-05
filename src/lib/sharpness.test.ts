import { describe, expect, it } from 'vitest'
import { laplacianVariance } from './sharpness'

describe('laplacianVariance', () => {
  it('is zero for a flat, uniform image (nothing but blur)', () => {
    const width = 10
    const height = 10
    const gray = new Array(width * height).fill(128)
    expect(laplacianVariance(gray, width, height)).toBe(0)
  })

  it('is higher for a sharp checkerboard than for a smooth gradient', () => {
    const width = 20
    const height = 20

    const checkerboard: number[] = []
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        checkerboard.push((x + y) % 2 === 0 ? 0 : 255)
      }
    }

    const gradient: number[] = []
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        gradient.push(Math.round((x / width) * 255))
      }
    }

    const sharpVariance = laplacianVariance(checkerboard, width, height)
    const blurryVariance = laplacianVariance(gradient, width, height)

    expect(sharpVariance).toBeGreaterThan(blurryVariance)
  })

  it('returns 0 for degenerate (too small) buffers', () => {
    expect(laplacianVariance([1, 2, 3, 4], 2, 2)).toBe(0)
  })
})
