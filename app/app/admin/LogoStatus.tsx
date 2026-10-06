'use client'

import { useEffect, useRef, useState } from 'react'

export default function LogoStatus({ url, hasDemo }: { url: string | null; hasDemo: boolean }) {
  if (!url) {
    return <span className="text-gray-500 whitespace-nowrap" title="No logo URL is saved. Older leads may have had an unavailable image discarded during scraping.">Not available</span>
  }
  return <CheckedLogo key={url} url={url} hasDemo={hasDemo} />
}

function CheckedLogo({ url, hasDemo }: { url: string; hasDemo: boolean }) {
  const [status, setStatus] = useState<'checking' | 'loaded' | 'failed'>('checking')
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = ref.current
    if (img?.complete) setStatus(img.naturalWidth > 0 ? 'loaded' : 'failed')
  }, [])

  const label = status === 'checking' ? 'Checking…' : status === 'failed' ? 'Failed to load' : hasDemo ? 'Included' : 'Available'
  const color = status === 'failed' ? 'text-red-700' : status === 'loaded' ? 'text-green-700' : 'text-gray-500'

  return (
    <span className="flex items-center gap-2 whitespace-nowrap" title="Image availability checked in this browser. Available means no demo has been generated yet.">
      {/* Use the same image loading mechanism as the demo; remote hosts vary. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={url}
        alt=""
        className={status === 'failed' ? 'hidden' : 'h-8 w-8 rounded object-contain'}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('failed')}
      />
      <span className={color} aria-live="polite">{label}</span>
    </span>
  )
}
