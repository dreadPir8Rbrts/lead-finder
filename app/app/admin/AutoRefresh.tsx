'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// While a pipeline run is in progress, re-fetch the admin page's server data every few
// seconds so run status, counts and new leads show up without a manual reload.
export default function AutoRefresh({ active, intervalMs = 3000 }: { active: boolean; intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => router.refresh(), intervalMs)
    return () => clearInterval(id)
  }, [active, intervalMs, router])

  if (!active) return null
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 normal-case tracking-normal">
      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      Live
    </span>
  )
}
