import { supabase } from '@/lib/supabase'
import TriggerForm from './TriggerForm'
import TestLeadForm from './TestLeadForm'
import LeadsTable from './LeadsTable'
import AutoRefresh from './AutoRefresh'

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
    .select('*, demo_sites(status, slug, style), outreach(status)')
    .order('lead_score', { ascending: false })
    .limit(1000)
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

const FINISHED_STATUSES = ['complete', 'failed']
// Runs older than this are treated as dead (e.g. the API restarted mid-run), so they don't poll forever
const MAX_RUN_AGE_MS = 60 * 60 * 1000

function hasActiveRun(runs: { status: string; started_at: string }[]) {
  const now = Date.now()
  return runs.some(
    run => !FINISHED_STATUSES.includes(run.status) && now - new Date(run.started_at).getTime() < MAX_RUN_AGE_MS
  )
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
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-3">
            Recent Runs
            <AutoRefresh active={hasActiveRun(runs)} />
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
          <LeadsTable leads={leads} />
        </section>
      </main>
    </div>
  )
}
