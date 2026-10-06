import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDemoSite } from './_data'
import { themeStyle } from '@/lib/themes'
import LogoImage from './LogoImage'

export default async function DemoLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const site = await getDemoSite(slug)
  if (!site) notFound()

  const base = `/demo/${slug}`
  const navLinks = [
    { href: base, label: 'Home' },
    { href: `${base}/about`, label: 'About' },
    { href: `${base}/conditions`, label: 'Conditions Treated' },
    { href: `${base}/contact`, label: 'Contact' },
  ]

  return (
    <div
      className="demo-site min-h-screen flex flex-col bg-[var(--surface)]"
      style={{ ...themeStyle(site.style), fontFamily: 'var(--font-body)' }}
    >
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-[var(--surface)] shadow-sm border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href={base}
            className="flex items-center gap-3 font-bold text-lg"
            style={{ color: 'var(--brand)' }}
          >
            {site.logo_url && (
              <LogoImage src={site.logo_url} className="h-10 w-10 rounded-lg object-cover" />
            )}
            {site.business_name}
          </Link>
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-[var(--brand)] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {site.phone ? (
            <a
              href={`tel:${site.phone}`}
              className="hidden md:inline-block bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-[var(--btn-text)] text-sm font-semibold px-5 py-2 rounded-[var(--radius-btn)] transition-colors"
            >
              {site.copy.cta}
            </a>
          ) : (
            <Link
              href={`${base}/contact`}
              className="hidden md:inline-block bg-[var(--btn)] hover:bg-[var(--btn-hover)] text-[var(--btn-text)] text-sm font-semibold px-5 py-2 rounded-[var(--radius-btn)] transition-colors"
            >
              {site.copy.cta}
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer CTA Block */}
      <section style={{ backgroundColor: 'var(--brand)' }} className="text-white py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-3">{site.copy.cta}</h2>
          <p className="text-[var(--on-brand-subtle)] mb-7 text-lg">{site.copy.service_area}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {site.phone && (
              <a
                href={`tel:${site.phone}`}
                className="inline-block bg-[var(--btn)] text-[var(--btn-text)] font-bold text-lg px-8 py-3 rounded-[var(--radius-btn)] hover:bg-[var(--btn-hover)] transition-colors"
              >
                {site.phone}
              </a>
            )}
            <Link
              href={`${base}/contact`}
              className="inline-block border-2 border-white text-white font-semibold text-lg px-8 py-3 rounded-[var(--radius-btn)] hover:bg-white/10 transition-colors"
            >
              Request Appointment
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              {site.logo_url && (
                <LogoImage src={site.logo_url} className="h-9 w-9 rounded-lg object-cover bg-white" />
              )}
              <p className="text-white font-bold text-lg">{site.business_name}</p>
            </div>
            <p className="text-sm leading-relaxed">{site.copy.uvp || site.copy.service_area}</p>
          </div>
          <div>
            <p className="text-white text-xs font-semibold uppercase tracking-widest mb-3">Hours</p>
            <div className="text-sm space-y-1">
              <p>Mon – Fri: 8:00am – 6:00pm</p>
              <p>Saturday: 9:00am – 1:00pm</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
          <div>
            <p className="text-white text-xs font-semibold uppercase tracking-widest mb-3">Contact</p>
            <div className="text-sm space-y-1">
              {site.address && <p>{site.address}</p>}
              {site.city && site.state && <p>{site.city}, {site.state}</p>}
              {site.phone && (
                <p><a href={`tel:${site.phone}`} className="hover:text-white">{site.phone}</a></p>
              )}
              {site.email && (
                <p><a href={`mailto:${site.email}`} className="hover:text-white">{site.email}</a></p>
              )}
            </div>
          </div>
          <div>
            <p className="text-white text-xs font-semibold uppercase tracking-widest mb-3">Navigate</p>
            <ul className="text-sm space-y-1">
              {navLinks.map(link => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-8 border-t border-slate-700 text-xs text-slate-500 text-center">
          © {new Date().getFullYear()} {site.business_name}. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
