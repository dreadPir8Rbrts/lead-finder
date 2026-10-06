'use client'

// Above [slug] so failures in the shared demo layout are caught too.
export default function DemoError({ retry }: { retry: () => void }) {
  return (
    <main className="p-8 text-slate-900 bg-white">
      <h1 className="text-xl font-semibold">This demo is temporarily unavailable</h1>
      <p className="my-4">Please try again in a moment.</p>
      <button onClick={retry} className="rounded bg-slate-800 px-4 py-2 text-white">
        Try again
      </button>
    </main>
  )
}
