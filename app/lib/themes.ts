import type { CSSProperties } from 'react'

// Demo site styles. The template reads these as CSS variables (var(--brand) etc.),
// so adding a style means adding an entry here — no template changes needed.
export type ThemeVars = {
  '--brand': string // accents, eyebrow labels, dark sections
  '--brand-mid': string // second stop of the hero gradient
  '--brand-dark': string // dark text on light brand backgrounds
  '--brand-soft': string // light tinted section/card background
  '--brand-soft-border': string
  '--on-brand-muted': string // secondary text on dark brand sections
  '--on-brand-subtle': string // body text on dark brand sections
  '--btn': string // primary buttons only
  '--btn-hover': string
  '--btn-text': string
  '--radius-btn': string
  '--surface': string // default section background
  '--surface-alt': string // alternating section background
  '--font-heading': string
  '--font-body': string
}

export const THEMES: Record<string, { label: string; vars: ThemeVars }> = {
  classic: {
    label: 'Classic',
    vars: {
      '--brand': '#0B6E72',
      '--brand-mid': '#0d8a90',
      '--brand-dark': '#0a4a4e',
      '--brand-soft': '#e6f5f5',
      '--brand-soft-border': '#cce8e9',
      '--on-brand-muted': '#99d4d6',
      '--on-brand-subtle': '#ccfbf1',
      '--btn': '#F5B83D',
      '--btn-hover': '#E0A32A',
      '--btn-text': '#0a4a4e',
      '--radius-btn': '9999px',
      '--surface': '#ffffff',
      '--surface-alt': '#f8fafc',
      '--font-heading': 'system-ui, -apple-system, sans-serif',
      '--font-body': 'system-ui, -apple-system, sans-serif',
    },
  },
  warm: {
    label: 'Warm & Earthy',
    vars: {
      '--brand': '#4F6446', // deep sage
      '--brand-mid': '#6B7F5E',
      '--brand-dark': '#33402D',
      '--brand-soft': '#F3EADB', // sand
      '--brand-soft-border': '#E6D8C0',
      '--on-brand-muted': '#D9E2CC',
      '--on-brand-subtle': '#EEF2E6',
      '--btn': '#B4582F', // terracotta
      '--btn-hover': '#974824',
      '--btn-text': '#ffffff',
      '--radius-btn': '0.75rem',
      '--surface': '#FBF7F0', // cream
      '--surface-alt': '#F5EEE2',
      '--font-heading': 'Georgia, "Iowan Old Style", "Times New Roman", serif',
      '--font-body': 'system-ui, -apple-system, sans-serif',
    },
  },
}

export const DEFAULT_STYLE = 'classic'

export const STYLE_OPTIONS = Object.entries(THEMES).map(([value, t]) => ({
  value,
  label: t.label,
  swatches: [t.vars['--brand'], t.vars['--brand-soft'], t.vars['--btn']],
}))

export function themeStyle(style: string | null | undefined): CSSProperties {
  return (THEMES[style ?? ''] ?? THEMES[DEFAULT_STYLE]).vars as CSSProperties
}
