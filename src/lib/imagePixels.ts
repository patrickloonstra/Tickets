import { DHASH_HEIGHT, DHASH_WIDTH } from './hash'

export interface GrayscaleBuffer {
  data: Float64Array
  width: number
  height: number
}

function toGrayscale(imageData: ImageData): Float64Array {
  const { data } = imageData
  const gray = new Float64Array(data.length / 4)
  for (let i = 0; i < gray.length; i++) {
    const r = data[i * 4]
    const g = data[i * 4 + 1]
    const b = data[i * 4 + 2]
    // luma weights
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b
  }
  return gray
}

async function drawToImageData(bitmap: ImageBitmap, width: number, height: number): Promise<ImageData> {
  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2d context unavailable')
  ctx.drawImage(bitmap, 0, 0, width, height)
  return ctx.getImageData(0, 0, width, height)
}

/** Small grayscale buffer used for the dHash fingerprint. */
export async function grayscaleForHash(blob: Blob): Promise<Float64Array> {
  const bitmap = await createImageBitmap(blob)
  try {
    const imageData = await drawToImageData(bitmap, DHASH_WIDTH, DHASH_HEIGHT)
    return toGrayscale(imageData)
  } finally {
    bitmap.close()
  }
}

/** Slightly larger grayscale buffer used for the sharpness/blur score. */
export async function grayscaleForSharpness(blob: Blob, maxDim = 200): Promise<GrayscaleBuffer> {
  const bitmap = await createImageBitmap(blob)
  try {
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(3, Math.round(bitmap.width * scale))
    const height = Math.max(3, Math.round(bitmap.height * scale))
    const imageData = await drawToImageData(bitmap, width, height)
    return { data: toGrayscale(imageData), width, height }
  } finally {
    bitmap.close()
  }
}

export async function readImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(blob)
  try {
    return { width: bitmap.width, height: bitmap.height }
  } finally {
    bitmap.close()
  }
}

export async function createThumbnail(blob: Blob, maxDim = 480, quality = 0.82): Promise<Blob> {
  const bitmap = await createImageBitmap(blob)
  try {
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height))
    const width = Math.max(1, Math.round(bitmap.width * scale))
    const height = Math.max(1, Math.round(bitmap.height * scale))
    const canvas = new OffscreenCanvas(width, height)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('2d context unavailable')
    ctx.drawImage(bitmap, 0, 0, width, height)
    return await canvas.convertToBlob({ type: 'image/jpeg', quality })
  } finally {
    bitmap.close()
  }
}
