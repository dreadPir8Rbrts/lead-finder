import { supabase } from '@/lib/supabase'
import TriggerForm from './TriggerForm'
import TestLeadForm from './TestLeadForm'

async function getPipelineRuns() {
  const { data } = await supabase
    .from('pipeline_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(10)
  return data ?? []
}

async function getLeads() {
  const { data } = await supabase
    .from('leads')
    .select('*, demo_sites(status, slug), outreach(status)')
    .order('lead_score', { ascending: false })
    .limit(200)
  return data ?? []
}

const STATUS_COLORS: Record<string, string> = {
  queued: 'bg-gray-100 text-gray-700',
  scraping: 'bg-blue-100 text-blue-700',
  filtering: 'bg-yellow-100 text-yellow-700',
  generating: 'bg-purple-100 text-purple-700',
  queuing_outreach: 'bg-orange-100 text-orange-700',
  complete: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
}

export default async function AdminPage() {
  const [runs, leads] = await Promise.all([getPipelineRuns(), getLeads()])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Lead Generator — Admin</h1>
      </header>

      <main className="px-6 py-6 space-y-8 max-w-screen-xl mx-auto">

        {/* Trigger */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Run Pipeline</h2>
          <TriggerForm />
        </section>

        {/* Test Lead Generator */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Generate Test Demo Site</h2>
          <TestLeadForm />
        </section>

        {/* Pipeline Runs */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Recent Runs
          </h2>
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  {['Started', 'Trigger', 'Status', 'Found', 'Scored', 'Sites', 'Emails', 'Filters'].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-medium text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {runs.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">No runs yet</td></tr>
                )}
                {runs.map((run: any) => (
                  <tr key={run.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-700 whitespace-nowrap">
                      {new Date(run.started_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-2 text-gray-600 capitalize">{run.trigger}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[run.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {run.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-700">{run.leads_found}</td>
                    <td className="px-4 py-2 text-gray-700">{run.leads_scored}</td>
                    <td className="px-4 py-2 text-gray-700">{run.sites_generated}</td>
                    <td className="px-4 py-2 text-gray-700">{run.emails_queued}</td>
                    <td className="px-4 py-2 text-gray-500 text-xs">
                      {run.filters ? `${run.filters.city ?? ''}${run.filters.state ? `, ${run.filters.state}` : ''} · limit ${run.filters.limit ?? '—'}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Leads */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Leads <span className="text-gray-400 font-normal normal-case">({leads.length})</span>
          </h2>
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
                {leads.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">No leads yet</td></tr>
                )}
                {leads.map((lead: any) => {
                  const site = Array.isArray(lead.demo_sites) ? lead.demo_sites[0] : lead.demo_sites
                  const outreach = Array.isArray(lead.outreach) ? lead.outreach[0] : lead.outreach
                  return (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium text-gray-900 whitespace-nowrap">{lead.business_name}</td>
                      <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                        {[lead.city, lead.state].filter(Boolean).join(', ')}
                      </td>
                      <td className="px-4 py-2 text-gray-600">{lead.phone ?? '—'}</td>
                      <td className="px-4 py-2 text-gray-600">{lead.email ?? '—'}</td>
                      <td className="px-4 py-2 text-center font-medium text-gray-700">{lead.lead_score}</td>
                      <td className="px-4 py-2">
                        {site?.slug
                          ? <a href={`/demo/${site.slug}`} target="_blank" className="text-blue-600 hover:underline">View</a>
                          : <span className="text-gray-400">—</span>
                        }
                      </td>
                      <td className="px-4 py-2">
                        {lead.gbp_url
                          ? <a href={lead.gbp_url} target="_blank" className="text-blue-600 hover:underline">GBP</a>
                          : <span className="text-gray-400">—</span>
                        }
                      </td>
                      <td className="px-4 py-2 text-gray-600 capitalize">{outreach?.status ?? '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
