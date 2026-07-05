import { parse } from 'exifr'

export interface ExifData {
  takenAt: number
  lat?: number
  lng?: number
}

/** Best-effort date + GPS from EXIF. Falls back to the file's last-modified time when there's no date, and omits GPS when there's none — nothing here ever leaves the device. */
export async function readExif(file: File): Promise<ExifData> {
  try {
    const data = await parse(file, { pick: ['DateTimeOriginal', 'CreateDate'], gps: true })
    const date = data?.DateTimeOriginal ?? data?.CreateDate
    const takenAt = date instanceof Date && !Number.isNaN(date.getTime()) ? date.getTime() : file.lastModified
    const lat = typeof data?.latitude === 'number' ? data.latitude : undefined
    const lng = typeof data?.longitude === 'number' ? data.longitude : undefined
    return { takenAt, lat, lng }
  } catch {
    // no EXIF data, or an unsupported format — that's fine, we fall back below
  }
  return { takenAt: file.lastModified }
}
