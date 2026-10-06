'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import StylePicker from './StylePicker'
import { DEFAULT_STYLE } from '@/lib/themes'

export default function TriggerForm() {
  const [niche, setNiche] = useState('chiropractor')
  const [city, setCity] = useState('Fresno')
  const [state, setState] = useState('CA')
  const [limit, setLimit] = useState(50)
  const [style, setStyle] = useState(DEFAULT_STYLE)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ run_id: string } | { error: string } | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pipeline/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          trigger: 'manual',
          filters: { niche, city, state, limit, style },
        }),
      })
      const data = await res.json()
      setResult(res.ok ? data : { error: 'Failed to start pipeline. Check the API and try again.' })
      // Show the new run right away; AutoRefresh keeps it updating from there
      if (res.ok) router.refresh()
    } catch {
      setResult({ error: 'Failed to reach API' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Niche</label>
        <select
          value={niche}
          onChange={e => setNiche(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="lawn_care">Lawn Care</option>
          <option value="chiropractor">Chiropractor</option>
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">City</label>
        <input
          value={city}
          onChange={e => setCity(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-36 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">State</label>
        <input
          value={state}
          onChange={e => setState(e.target.value)}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-20 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-600">Limit</label>
        <input
          type="number"
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
          min={10}
          max={200}
          className="border border-gray-300 rounded px-3 py-1.5 text-sm w-24 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <StylePicker value={style} onChange={setStyle} />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors"
      >
        {loading ? 'Starting…' : 'Run Pipeline'}
      </button>
      {result && (
        <span className="text-sm">
          {'run_id' in result
            ? <span className="text-green-700">Started — run ID: <code className="font-mono">{result.run_id.slice(0, 8)}…</code></span>
            : <span className="text-red-600">{result.error}</span>
          }
        </span>
      )}
    </form>
  )
}
