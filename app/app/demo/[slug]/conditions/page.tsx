import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDemoSite } from '../_data'

export default async function ConditionsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const site = await getDemoSite(slug)
  if (!site) notFound()
  const { copy, business_name, city, state } = site
  const base = `/demo/${slug}`

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: copy.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }

  return (
    <>
      {/* FAQ Schema */}
      {copy.faq.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {/* Page Hero */}
      <section
        className="text-white py-20 px-6"
        style={{ background: 'linear-gradient(135deg, var(--brand-dark) 0%, var(--brand) 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <p className="text-[var(--on-brand-muted)] text-sm font-semibold uppercase tracking-widest mb-3">
            Conditions Treated
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">What We Treat</h1>
          <p className="text-[var(--on-brand-subtle)] text-lg max-w-xl">{copy.service_area}</p>
        </div>
      </section>

      {/* Conditions Grid */}
      <section className="py-20 px-6 bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-800 text-center mb-3">
            Conditions We Treat
          </h2>
          <p className="text-slate-500 text-center mb-12 max-w-xl mx-auto">
            Our practice provides chiropractic care for a wide range of conditions affecting patients
            in {city}{state ? `, ${state}` : ''} and the surrounding area.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {copy.conditions.map((c) => (
              <div
                key={c.name}
                className="border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center mb-4 text-white font-bold"
                  style={{ backgroundColor: 'var(--brand)' }}
                >
                  ✓
                </div>
                <h3 className="font-bold text-slate-800 text-lg mb-2">{c.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{c.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We Can Help */}
      <section className="py-20 px-6 bg-[var(--surface-alt)]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--brand)' }}>
            Our Approach
          </p>
          <h2 className="text-3xl font-bold text-slate-800 mb-6">How We Can Help</h2>
          <p className="text-slate-600 leading-relaxed text-lg">{copy.about}</p>
          {copy.office && (
            <p className="text-slate-600 leading-relaxed text-lg mt-4">{copy.office}</p>
          )}
        </div>
      </section>

      {/* FAQ */}
      {copy.faq.length > 0 && (
        <section className="py-20 px-6 bg-[var(--surface)]">
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--brand)' }}>
              Common Questions
            </p>
            <h2 className="text-3xl font-bold text-slate-800 text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-0">
              {copy.faq.map((item, i) => (
                <div
                  key={item.question}
                  className="border-t border-gray-100 py-7"
                  style={i === copy.faq.length - 1 ? { borderBottom: '1px solid #f3f4f6' } : {}}
                >
                  <h3 className="font-bold text-slate-800 text-lg mb-3">{item.question}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Internal CTA */}
      <section className="py-14 px-6 text-center" style={{ backgroundColor: 'var(--brand-soft)' }}>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--brand-dark)' }}>
          Ready to find relief?
        </h2>
        <p className="text-slate-600 mb-6">
          Contact {business_name} today and take the first step toward feeling better.
        </p>
        <Link
          href={`${base}/contact`}
          className="inline-block bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-[var(--btn-text)] font-bold px-8 py-3 rounded-[var(--radius-btn)] transition-colors"
        >
          {copy.cta}
        </Link>
      </section>
    </>
  )
}
