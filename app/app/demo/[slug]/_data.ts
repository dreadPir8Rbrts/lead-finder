import { cache } from 'react'
import { supabase } from '@/lib/supabase'

export type ChiroCopy = {
  hero: { headline: string; subheadline: string }
  uvp: string
  doctor: { name: string; bio: string }
  conditions: Array<{ name: string; description: string }>
  services: string[]
  about: string
  office: string
  testimonials: Array<{ text: string; author: string }>
  faq: Array<{ question: string; answer: string }>
  service_area: string
  cta: string
}

export type DemoSite = {
  slug: string
  niche: string
  business_name: string
  phone: string | null
  email: string | null
  address: string | null
  city: string | null
  state: string | null
  gbp_url: string | null
  logo_url: string | null
  style: string
  copy: ChiroCopy
}

export const getDemoSite = cache(async (slug: string): Promise<DemoSite | null> => {
  const { data } = await supabase
    .from('demo_sites')
    .select(`
      slug,
      style,
      site_data,
      leads (
        niche,
        business_name,
        phone,
        email,
        address,
        city,
        state,
        gbp_url,
        logo_url
      )
    `)
    .eq('slug', slug)
    .single()

  if (!data) return null

  const lead = (data.leads as any) ?? {}
  const copy = (data.site_data as any) ?? {}

  return {
    slug: data.slug,
    niche: lead.niche ?? 'chiropractor',
    business_name: lead.business_name ?? 'Our Practice',
    phone: lead.phone ?? null,
    email: lead.email ?? null,
    address: lead.address ?? null,
    city: lead.city ?? null,
    state: lead.state ?? null,
    gbp_url: lead.gbp_url ?? null,
    logo_url: lead.logo_url ?? null,
    style: data.style ?? 'classic',
    copy: {
      hero: copy.hero ?? { headline: '', subheadline: '' },
      uvp: copy.uvp ?? '',
      doctor: copy.doctor ?? { name: 'Our Doctor', bio: '' },
      conditions: copy.conditions ?? [],
      services: copy.services ?? [],
      about: copy.about ?? '',
      office: copy.office ?? '',
      testimonials: copy.testimonials ?? [],
      faq: copy.faq ?? [],
      service_area: copy.service_area ?? '',
      cta: copy.cta ?? 'Book Your Free Consultation',
    },
  }
})
