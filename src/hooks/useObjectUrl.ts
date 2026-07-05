import { useEffect, useState } from 'react'

/** Turns a Blob into an object URL for the lifetime of the component. Nothing is ever uploaded — this just lets the browser render a local Blob. */
export function useObjectUrl(blob: Blob | undefined): string | undefined {
  const [url, setUrl] = useState<string>()

  useEffect(() => {
    if (!blob) {
      setUrl(undefined)
      return
    }
    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [blob])

  return url
}
