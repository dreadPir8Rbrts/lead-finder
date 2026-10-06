'use client'

import { useEffect, useRef, useState } from 'react'

// GBP logo URLs can go dead after scraping (Google removes old profile photos),
// so hide the image instead of showing a broken-image icon.
export default function LogoImage({ src, className }: { src: string; className?: string }) {
  return <LogoForSource key={src} src={src} className={className} />
}

// Remount when the URL changes so a previously failed logo can recover.
function LogoForSource({ src, className }: { src: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  const ref = useRef<HTMLImageElement>(null)

  // The server-rendered <img> can fail before React hydrates and attaches onError
  useEffect(() => {
    const img = ref.current
    if (img?.complete && img.naturalWidth === 0) setFailed(true)
  }, [src])

  if (failed) return null
  // GBP logos come from arbitrary Google hosts, so a plain <img> rather than next/image
  // eslint-disable-next-line @next/next/no-img-element
  return <img ref={ref} src={src} alt="" className={className} onError={() => setFailed(true)} />
}
