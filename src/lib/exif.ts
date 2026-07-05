import { parse } from 'exifr'

/** Best-effort "date taken". Falls back to the file's last-modified time. */
export async function readTakenAt(file: File): Promise<number> {
  try {
    const data = await parse(file, { pick: ['DateTimeOriginal', 'CreateDate'] })
    const date = data?.DateTimeOriginal ?? data?.CreateDate
    if (date instanceof Date && !Number.isNaN(date.getTime())) {
      return date.getTime()
    }
  } catch {
    // no EXIF data, or an unsupported format — that's fine, we fall back below
  }
  return file.lastModified
}
