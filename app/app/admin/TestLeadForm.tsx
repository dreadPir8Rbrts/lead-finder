'use client'

import { useState } from 'react'

export default function TestLeadForm() {
  const [niche, setNiche] = useState('chiropractor')
  const [businessName, setBusinessName] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ slug: string; demo_url: string } | { error: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pipeline/test-lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          niche,
          business_name: businessName,
          city,
          state,
          phone: phone || null,
          email: email || null,
          address: address || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) setResult({ error: data.detail ?? 'Request failed' })
      else setResult(data)
    } catch {
      setResult({ error: 'Failed to reach API' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex flex-wrap gap-3">
        {/* Niche */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Niche</label>
          <select
            value={niche}
            onChange={e => setNiche(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="chiropractor">Chiropractor</option>
            <option value="lawn_care">Lawn Care</option>
          </select>
        </div>

        {/* Business Name */}
        <div className="flex flex-col gap-1 flex-1 min-w-40">
          <label className="text-xs font-medium text-gray-600">Business Name *</label>
          <input
            required
            value={businessName}
            onChange={e => setBusinessName(e.target.value)}
            placeholder="Smith Chiropractic"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* City */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">City *</label>
          <input
            required
            value={city}
            onChange={e => setCity(e.target.value)}
            placeholder="Austin"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm text-black w-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* State */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">State *</label>
          <input
            required
            value={state}
            onChange={e => setState(e.target.value)}
            placeholder="TX"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm text-black w-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Phone */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="(512) 555-0100"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm text-black w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="info@smithchiro.com"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm text-black w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Address */}
        <div className="flex flex-col gap-1 flex-1 min-w-48">
          <label className="text-xs font-medium text-gray-600">Address</label>
          <input
            value={address}
            onChange={e => setAddress(e.target.value)}
            placeholder="123 Main St, Austin, TX 78701"
            className="border border-gray-300 rounded px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col justify-end">
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded transition-colors whitespace-nowrap"
          >
            {loading ? 'Generating…' : 'Generate Demo Site'}
          </button>
        </div>
      </div>

      {result && (
        <div className="text-sm">
          {'demo_url' in result ? (
            <span className="text-green-700">
              Done!{' '}
              <a
                href={result.demo_url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                View demo site →
              </a>
            </span>
          ) : (
            <span className="text-red-600">{result.error}</span>
          )}
        </div>
      )}
    </form>
  )
}
