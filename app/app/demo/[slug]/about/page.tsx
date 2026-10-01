import { notFound } from 'next/navigation'
import { getDemoSite } from '../_data'

export default async function AboutPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const site = await getDemoSite(slug)
  if (!site) notFound()
  const { copy, business_name, city, state } = site

  return (
    <>
      {/* Page Hero */}
      <section
        className="text-white py-20 px-6"
        style={{ background: 'linear-gradient(135deg, var(--brand-dark) 0%, var(--brand) 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <p className="text-[var(--on-brand-muted)] text-sm font-semibold uppercase tracking-widest mb-3">About Us</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">{business_name}</h1>
          <p className="text-[var(--on-brand-subtle)] text-lg max-w-xl">{copy.uvp}</p>
        </div>
      </section>

      {/* Meet the Doctor */}
      <section className="py-20 px-6 bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div
            className="rounded-3xl h-96 flex items-center justify-center text-8xl font-bold select-none"
            style={{ backgroundColor: 'var(--brand-soft-border)', color: 'var(--brand)' }}
          >
            {copy.doctor.name.split(' ').slice(-1)[0]?.charAt(0) ?? 'D'}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--brand)' }}>
              Meet Your Chiropractor
            </p>
            <h2 className="text-3xl font-bold text-slate-800 mb-5">{copy.doctor.name}</h2>
            <p className="text-slate-600 leading-relaxed">{copy.doctor.bio}</p>
          </div>
        </div>
      </section>

      {/* UVP Divider */}
      {copy.uvp && (
        <section className="py-12 px-6" style={{ backgroundColor: 'var(--brand-soft)' }}>
          <p
            className="max-w-3xl mx-auto text-center font-semibold text-xl leading-snug"
            style={{ color: 'var(--brand-dark)' }}
          >
            {copy.uvp}
          </p>
        </section>
      )}

      {/* About the Office */}
      <section className="py-20 px-6 bg-[var(--surface)]">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--brand)' }}>
            Our Practice
          </p>
          <h2 className="text-3xl font-bold text-slate-800 mb-6">
            About {business_name}
          </h2>
          <p className="text-slate-600 leading-relaxed text-lg mb-5">{copy.about}</p>
          {copy.office && (
            <p className="text-slate-600 leading-relaxed text-lg">{copy.office}</p>
          )}
        </div>
      </section>

      {/* Services quick list */}
      {copy.services.length > 0 && (
        <section className="py-16 px-6 bg-[var(--surface-alt)]">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">What We Offer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {copy.services.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-3 rounded-xl px-5 py-4"
                  style={{ backgroundColor: 'var(--brand-soft)' }}
                >
                  <span className="font-bold" style={{ color: 'var(--brand)' }}>✓</span>
                  <span className="text-slate-700 font-medium">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Testimonial */}
      {copy.testimonials[1] && (
        <section className="py-20 px-6 text-white" style={{ backgroundColor: 'var(--brand)' }}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-6xl font-serif mb-4" style={{ opacity: 0.4 }}>"</p>
            <p className="text-xl leading-relaxed mb-6">{copy.testimonials[1].text}</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--on-brand-muted)' }}>
              — {copy.testimonials[1].author}
            </p>
          </div>
        </section>
      )}
    </>
  )
}
