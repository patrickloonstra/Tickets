import type { Photo } from './db'
import { readTakenAt } from './exif'
import { dHashFromGray, hashToHex } from './hash'
import { createThumbnail, grayscaleForHash, grayscaleForSharpness, readImageDimensions } from './imagePixels'
import { laplacianVariance } from './sharpness'

/**
 * Full local analysis pipeline for a single imported file: thumbnail,
 * dimensions, EXIF date, perceptual hash and blur score. Nothing here
 * touches the network — nothing leaves the device.
 */
export async function analyzeFile(file: File): Promise<Omit<Photo, 'id' | 'status' | 'favorite' | 'albumIds' | 'lastViewedAt'>> {
  const [thumbBlob, dims, takenAt, hashGray, sharpGray] = await Promise.all([
    createThumbnail(file),
    readImageDimensions(file),
    readTakenAt(file),
    grayscaleForHash(file),
    grayscaleForSharpness(file),
  ])

  const phash = hashToHex(dHashFromGray(hashGray))
  const sharpness = laplacianVariance(sharpGray.data, sharpGray.width, sharpGray.height)

  return {
    blob: file,
    thumbBlob,
    fileName: file.name,
    mimeType: file.type,
    width: dims.width,
    height: dims.height,
    takenAt,
    importedAt: Date.now(),
    size: file.size,
    phash,
    sharpness,
  }
}
