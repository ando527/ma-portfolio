// Fields, choices and limits for the contact form, shared by the form
// (src/components/ContactForm.tsx) and the Worker that receives it
// (worker/validate.ts), so both sides agree on what's allowed.
//
// No imports and only erasable TypeScript: the Worker bundles this file and
// `node --test` runs it directly.

export interface Choice<V extends string = string> {
  value: V
  label: string
}

export const SITE_TYPES = [
  { value: 'webflow', label: 'Webflow website' },
  { value: 'ecommerce', label: 'Shopify / e-commerce store' },
  { value: 'custom', label: 'Custom build (Next.js)' },
  { value: 'unsure', label: 'Not sure yet' },
] as const satisfies readonly Choice[]

/** Budgets are in AUD. */
export const BUDGETS = [
  { value: 'under-5k', label: 'Under $5k' },
  { value: '5k-10k', label: '$5k to $10k' },
  { value: '10k-plus', label: '$10k+' },
  { value: 'unsure', label: 'Not sure yet' },
] as const satisfies readonly Choice[]

export const TIMELINES = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '1-3-months', label: 'In 1 to 3 months' },
  { value: '3-plus-months', label: 'In 3+ months' },
  { value: 'flexible', label: 'Flexible' },
] as const satisfies readonly Choice[]

export const SOURCES = [
  { value: 'search', label: 'Google or another search engine' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: 'A referral or word of mouth' },
  { value: 'ai', label: 'ChatGPT or another AI assistant' },
  { value: 'cubing', label: 'The speedcubing community' },
  { value: 'other', label: 'Somewhere else' },
] as const satisfies readonly Choice[]

export type SiteType = (typeof SITE_TYPES)[number]['value']
export type Budget = (typeof BUDGETS)[number]['value']
export type Timeline = (typeof TIMELINES)[number]['value']
export type Source = (typeof SOURCES)[number]['value']

export const LIMITS = {
  name: { max: 100 },
  email: { max: 254 },
  company: { max: 100 },
  currentSite: { max: 200 },
  message: { min: 10, max: 5000 },
  /** Whole request body, in bytes. */
  body: 10_000,
} as const

/** The label for a stored value, or undefined if the value isn't one of the choices. */
export function labelFor(choices: readonly Choice[], value: string | undefined): string | undefined {
  return choices.find((c) => c.value === value)?.label
}
