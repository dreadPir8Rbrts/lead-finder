import { notFound } from 'next/navigation'
import { getDemoSite } from '../_data'

export default async function ContactPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const site = await getDemoSite(slug)
  if (!site) notFound()
  const { copy, business_name, phone, email, address, city, state, gbp_url } = site

  const mapQuery = encodeURIComponent(
    address ? `${address}, ${city}, ${state}` : `${business_name} ${city} ${state}`
  )
  const mapsEmbedUrl = `https://maps.google.com/maps?q=${mapQuery}&output=embed`
  const mapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`

  return (
    <>
      {/* Page Hero */}
      <section
        className="text-white py-20 px-6"
        style={{ background: 'linear-gradient(135deg, var(--brand-dark) 0%, var(--brand) 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          <p className="text-[var(--on-brand-muted)] text-sm font-semibold uppercase tracking-widest mb-3">
            Get In Touch
          </p>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">Contact Us</h1>
          <p className="text-[var(--on-brand-subtle)] text-lg max-w-xl">{business_name}</p>
        </div>
      </section>

      {/* Contact Info + Form */}
      <section className="py-20 px-6 bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14">

          {/* Left: Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Practice Information</h2>

            <div className="space-y-7">
              {address && (
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: 'var(--brand)' }}
                  >
                    Address
                  </p>
                  <p className="text-slate-700">{address}</p>
                  {city && state && (
                    <p className="text-slate-700">{city}, {state}</p>
                  )}
                  <a
                    href={mapsDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold mt-1 inline-block hover:underline"
                    style={{ color: 'var(--brand)' }}
                  >
                    Get Directions →
                  </a>
                </div>
              )}

              {phone && (
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: 'var(--brand)' }}
                  >
                    Phone
                  </p>
                  <a
                    href={`tel:${phone}`}
                    className="text-slate-700 font-semibold text-lg hover:underline"
                    style={{ color: 'var(--brand)' }}
                  >
                    {phone}
                  </a>
                </div>
              )}

              {email && (
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-widest mb-1"
                    style={{ color: 'var(--brand)' }}
                  >
                    Email
                  </p>
                  <a
                    href={`mailto:${email}`}
                    className="text-slate-700 hover:underline"
                  >
                    {email}
                  </a>
                </div>
              )}

              {gbp_url && (
                <div>
                  <a
                    href={gbp_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold hover:underline"
                    style={{ color: 'var(--brand)' }}
                  >
                    View on Google Maps →
                  </a>
                </div>
              )}

              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-3"
                  style={{ color: 'var(--brand)' }}
                >
                  Office Hours
                </p>
                <div className="text-slate-600 text-sm space-y-1.5">
                  <div className="flex justify-between max-w-xs">
                    <span>Monday – Friday</span>
                    <span className="font-medium">8:00am – 6:00pm</span>
                  </div>
                  <div className="flex justify-between max-w-xs">
                    <span>Saturday</span>
                    <span className="font-medium">9:00am – 1:00pm</span>
                  </div>
                  <div className="flex justify-between max-w-xs">
                    <span>Sunday</span>
                    <span className="font-medium text-slate-400">Closed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="bg-[var(--surface-alt)] rounded-3xl p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-1">Request an Appointment</h2>
            <p className="text-slate-500 text-sm mb-6">We'll get back to you within one business day. Please do not include any Protected Health Information (PHI), as we will address that during your appointment.</p>
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">First Name</label>
                  <input
                    type="text"
                    placeholder="Jane"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
                <input
                  type="tel"
                  placeholder="(555) 000-0000"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="jane@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand)]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">What brings you in?</label>
                <textarea
                  rows={4}
                  placeholder="Briefly describe your condition or concern..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand)] resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-[var(--btn-text)] font-bold py-3 rounded-[var(--radius-btn)] transition-colors text-base"
              >
                {copy.cta}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="relative overflow-hidden" style={{ height: '380px' }}>
        <iframe
          src={mapsEmbedUrl}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`${business_name} location map`}
        />
        <a
          href={mapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-[var(--btn-text)] font-bold px-6 py-2.5 rounded-[var(--radius-btn)] shadow-lg text-sm transition-colors"
        >
          Get Directions →
        </a>
      </section>

      {/* UVP + Testimonial */}
      {copy.uvp && (
        <section className="py-12 px-6 text-center" style={{ backgroundColor: 'var(--brand-soft)' }}>
          <p
            className="max-w-3xl mx-auto font-semibold text-lg leading-snug"
            style={{ color: 'var(--brand-dark)' }}
          >
            {copy.uvp}
          </p>
        </section>
      )}

      {copy.testimonials[0] && (
        <section className="py-20 px-6 text-white" style={{ backgroundColor: 'var(--brand)' }}>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-6xl font-serif mb-4" style={{ opacity: 0.4 }}>"</p>
            <p className="text-xl leading-relaxed mb-6">{copy.testimonials[0].text}</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--on-brand-muted)' }}>
              — {copy.testimonials[0].author}
            </p>
          </div>
        </section>
      )}
    </>
  )
}
