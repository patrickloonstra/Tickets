/**
 * Blur detection via variance of the Laplacian. Low variance in the
 * Laplacian-filtered image means few sharp edges, i.e. a blurry photo.
 * Pure function over a grayscale buffer so it can be unit tested directly.
 */
export function laplacianVariance(gray: ArrayLike<number>, width: number, height: number): number {
  if (width < 3 || height < 3) return 0

  const laplacian: number[] = []
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const center = gray[y * width + x]
      const up = gray[(y - 1) * width + x]
      const down = gray[(y + 1) * width + x]
      const left = gray[y * width + (x - 1)]
      const right = gray[y * width + (x + 1)]
      laplacian.push(up + down + left + right - 4 * center)
    }
  }

  const mean = laplacian.reduce((sum, v) => sum + v, 0) / laplacian.length
  const variance = laplacian.reduce((sum, v) => sum + (v - mean) ** 2, 0) / laplacian.length
  return variance
}

/** Below this variance, a photo is flagged as a blur candidate for the declutter queue. */
export const BLUR_THRESHOLD = 60
