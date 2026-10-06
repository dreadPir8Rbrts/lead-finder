import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDemoSite } from './_data'

export default async function DemoHomePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const site = await getDemoSite(slug)
  if (!site) notFound()
  const { copy, phone, city, state } = site
  const base = `/demo/${slug}`

  return (
    <>
      {/* Hero */}
      <section
        className="text-white py-28 px-6"
        style={{ background: 'linear-gradient(135deg, var(--brand-dark) 0%, var(--brand) 50%, var(--brand-mid) 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5 max-w-3xl">
            {copy.hero.headline}
          </h1>
          <p className="text-[var(--on-brand-subtle)] text-xl mb-9 max-w-2xl leading-relaxed">
            {copy.hero.subheadline}
          </p>
          <div className="flex flex-wrap gap-4">
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="bg-[var(--btn)] text-[var(--btn-text)] font-bold text-lg px-7 py-3 rounded-[var(--radius-btn)] hover:bg-[var(--btn-hover)] transition-colors"
              >
                {copy.cta}
              </a>
            ) : (
              <Link
                href={`${base}/contact`}
                className="bg-[var(--btn)] text-[var(--btn-text)] font-bold text-lg px-7 py-3 rounded-[var(--radius-btn)] hover:bg-[var(--btn-hover)] transition-colors"
              >
                {copy.cta}
              </Link>
            )}
            <Link
              href={`${base}/conditions`}
              className="border-2 border-white text-white font-semibold text-lg px-7 py-3 rounded-[var(--radius-btn)] hover:bg-white/10 transition-colors"
            >
              See What We Treat
            </Link>
          </div>
        </div>
      </section>

      {/* UVP Banner */}
      {copy.uvp && (
        <section className="py-8 px-6" style={{ backgroundColor: 'var(--brand-soft)' }}>
          <p className="max-w-3xl mx-auto text-center font-semibold text-lg" style={{ color: 'var(--brand-dark)' }}>
            {copy.uvp}
          </p>
        </section>
      )}

      {/* Conditions Treated */}
      <section className="py-20 px-6 bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--brand)' }}>
            Conditions We Treat
          </p>
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-3">
            Find Relief From Pain
          </h2>
          <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">
            We help patients in {city}{state ? `, ${state}` : ''} find lasting relief from a wide range of conditions.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {copy.conditions.slice(0, 6).map((c) => (
              <div
                key={c.name}
                className="border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-4 text-white font-bold"
                  style={{ backgroundColor: 'var(--brand)' }}
                >
                  ✓
                </div>
                <h3 className="font-bold text-slate-800 mb-2">{c.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href={`${base}/conditions`}
              className="font-semibold hover:underline"
              style={{ color: 'var(--brand)' }}
            >
              View All Conditions We Treat →
            </Link>
          </div>
        </div>
      </section>

      {/* Meet the Doctor */}
      <section className="py-20 px-6 bg-[var(--surface-alt)]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div
            className="rounded-3xl h-80 flex items-center justify-center text-7xl font-bold select-none"
            style={{ backgroundColor: 'var(--brand-soft-border)', color: 'var(--brand)' }}
          >
            {copy.doctor.name.split(' ').slice(-1)[0]?.charAt(0) ?? 'D'}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--brand)' }}>
              Meet Your Doctor
            </p>
            <h2 className="text-3xl font-bold text-slate-800 mb-4">{copy.doctor.name}</h2>
            <p className="text-slate-600 leading-relaxed mb-6">{copy.doctor.bio}</p>
            <Link
              href={`${base}/about`}
              className="font-semibold hover:underline"
              style={{ color: 'var(--brand)' }}
            >
              Learn more about us →
            </Link>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-20 px-6 bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--brand)' }}>
            Our Services
          </p>
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-3">
            Comprehensive Chiropractic Care
          </h2>
          <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">{copy.service_area}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {copy.services.map((s) => (
              <div
                key={s}
                className="flex items-center gap-3 rounded-xl px-5 py-4"
                style={{ backgroundColor: 'var(--brand-soft)' }}
              >
                <span className="font-bold text-lg" style={{ color: 'var(--brand)' }}>✓</span>
                <span className="text-slate-700 font-medium">{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Highlight */}
      {copy.testimonials[0] && (
        <section className="py-20 px-6" style={{ backgroundColor: 'var(--brand-soft)' }}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-6xl font-serif mb-4" style={{ color: 'var(--brand)', opacity: 0.4 }}>&ldquo;</p>
            <p className="text-xl leading-relaxed mb-6 text-slate-700">{copy.testimonials[0].text}</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--brand)' }}>
              — {copy.testimonials[0].author}
            </p>
          </div>
        </section>
      )}
    </>
  )
}
