'use client'

import { useMemo, useState } from 'react'
import { THEMES } from '@/lib/themes'

export type Lead = {
  id: string
  business_name: string
  niche: string
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  gbp_url: string | null
  lead_score: number
  demo_sites: { status: string; slug: string; style: string | null }[] | { status: string; slug: string; style: string | null } | null
  outreach: { status: string }[] | { status: string } | null
}

const first = <T,>(v: T[] | T | null): T | null => (Array.isArray(v) ? v[0] ?? null : v)

const NICHE_LABELS: Record<string, string> = { chiropractor: 'Chiropractor', lawn_care: 'Lawn Care' }

const inputClass =
  'border border-gray-300 rounded px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function LeadsTable({ leads }: { leads: Lead[] }) {
  const [query, setQuery] = useState('')
  const [niche, setNiche] = useState('')
  const [state, setState] = useState('')
  const [minScore, setMinScore] = useState(0)
  const [site, setSite] = useState<'' | 'yes' | 'no'>('')
  const [outreach, setOutreach] = useState('')

  // Filter options come from the data so new states/statuses show up automatically
  const niches = useMemo(() => [...new Set(leads.map(l => l.niche))].sort(), [leads])
  const states = useMemo(() => [...new Set(leads.map(l => l.state).filter(Boolean) as string[])].sort(), [leads])
  const outreachStatuses = useMemo(
    () => [...new Set(leads.map(l => first(l.outreach)?.status).filter(Boolean) as string[])].sort(),
    [leads]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return leads.filter(l => {
      if (q && ![l.business_name, l.city, l.phone, l.email].some(f => f?.toLowerCase().includes(q))) return false
      if (niche && l.niche !== niche) return false
      if (state && l.state !== state) return false
      if (l.lead_score < minScore) return false
      const hasSite = Boolean(first(l.demo_sites)?.slug)
      if (site === 'yes' && !hasSite) return false
      if (site === 'no' && hasSite) return false
      if (outreach && (first(l.outreach)?.status ?? 'none') !== outreach) return false
      return true
    })
  }, [leads, query, niche, state, minScore, site, outreach])

  const isFiltered = query || niche || state || minScore > 0 || site || outreach
  function clearFilters() {
    setQuery('')
    setNiche('')
    setState('')
    setMinScore(0)
    setSite('')
    setOutreach('')
  }

  return (
    <>
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Leads{' '}
        <span className="text-gray-400 font-normal normal-case">
          ({isFiltered ? `${filtered.length} of ${leads.length}` : leads.length})
        </span>
      </h2>

      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1 flex-1 min-w-56">
          <label htmlFor="lead-search" className="text-xs font-medium text-gray-600">Search</label>
          <input
            id="lead-search"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Business, city, phone or email"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Niche</label>
          <select value={niche} onChange={e => setNiche(e.target.value)} className={inputClass}>
            <option value="">All</option>
            {niches.map(n => <option key={n} value={n}>{NICHE_LABELS[n] ?? n}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">State</label>
          <select value={state} onChange={e => setState(e.target.value)} className={inputClass}>
            <option value="">All</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Min score</label>
          <select value={minScore} onChange={e => setMinScore(Number(e.target.value))} className={inputClass}>
            {[0, 1, 2, 3].map(n => <option key={n} value={n}>{n === 0 ? 'Any' : `${n}+`}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Demo site</label>
          <select value={site} onChange={e => setSite(e.target.value as '' | 'yes' | 'no')} className={inputClass}>
            <option value="">Any</option>
            <option value="yes">Has site</option>
            <option value="no">No site</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Outreach</label>
          <select value={outreach} onChange={e => setOutreach(e.target.value)} className={`${inputClass} capitalize`}>
            <option value="">Any</option>
            <option value="none">None</option>
            {outreachStatuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {isFiltered && (
          <button type="button" onClick={clearFilters} className="text-sm text-blue-600 hover:underline py-1.5">
            Clear filters
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              {['Business', 'Location', 'Phone', 'Email', 'Score', 'Demo Site', 'GBP', 'Outreach'].map(h => (
                <th key={h} className="px-4 py-2 text-left font-medium text-gray-600">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-gray-400">
                  {leads.length === 0 ? 'No leads yet' : 'No leads match these filters'}
                </td>
              </tr>
            )}
            {filtered.map(lead => {
              const demo = first(lead.demo_sites)
              const out = first(lead.outreach)
              return (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">
                    {lead.business_name}
                  </td>
                  <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                    {[lead.city, lead.state].filter(Boolean).join(', ')}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{lead.phone ?? '—'}</td>
                  <td className="px-4 py-2 text-gray-600">{lead.email ?? '—'}</td>
                  <td className="px-4 py-2 text-center font-medium text-gray-700">{lead.lead_score}</td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    {demo?.slug ? (
                      <>
                        <a href={`/demo/${demo.slug}`} target="_blank" className="text-blue-600 hover:underline">View</a>
                        <span className="text-gray-400 text-xs"> · {THEMES[demo.style ?? '']?.label ?? 'Classic'}</span>
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {lead.gbp_url
                      ? <a href={lead.gbp_url} target="_blank" className="text-blue-600 hover:underline">GBP</a>
                      : <span className="text-gray-400">—</span>
                    }
                  </td>
                  <td className="px-4 py-2 text-gray-600 capitalize">{out?.status ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
