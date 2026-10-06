'use client'

export default function AdminError({ retry }: { retry: () => void }) {
  return (
    <main className="p-8 text-slate-900 bg-white">
      <h1 className="text-xl font-semibold">Unable to load the dashboard</h1>
      <p className="my-4">Your data could not be loaded. Please try again.</p>
      <button onClick={retry} className="rounded bg-blue-600 px-4 py-2 text-white">
        Try again
      </button>
    </main>
  )
}
