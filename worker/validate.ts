// Validation and normalisation of the contact form body. Pure functions, no
// Worker globals, so `node --test` can run them directly.
//
// The browser form mirrors these rules, but this is the authority. Every string
// that survives here ends up in an email, so anything that could break out of a
// header, an HTML attribute or a mailto: link is rejected rather than escaped.

import { SITE_TYPES, BUDGETS, TIMELINES, SOURCES, LIMITS } from '../src/lib/contact-schema.ts'
import type { SiteType, Budget, Timeline, Source, Choice } from '../src/lib/contact-schema.ts'

export interface ContactInput {
  name: string
  email: string
  company?: string
  siteType: SiteType
  budget: Budget
  timeline?: Timeline
  source?: Source
  /** Normalised href (http or https) of the visitor's existing site. */
  currentSite?: string
  message: string
}

export type FieldErrors = Partial<Record<keyof ContactInput, string>>

export type ValidationResult =
  | { ok: true; value: ContactInput }
  | { ok: false; errors: FieldErrors }

const ERR = {
  name: 'Enter your name.',
  nameLong: `Name is too long (max ${LIMITS.name.max} characters).`,
  email: 'Enter a valid email address.',
  companyLong: `Company name is too long (max ${LIMITS.company.max} characters).`,
  companyLines: "Company name can't contain line breaks.",
  siteType: 'Choose the type of website.',
  budget: 'Choose a budget range.',
  choice: 'Choose one of the options.',
  currentSite: 'Enter a valid web address, like example.com.',
  messageShort: `Message needs to be at least ${LIMITS.message.min} characters.`,
  messageLong: `Message is too long (max ${LIMITS.message.max} characters).`,
} as const

// Excludes whitespace and everything that could close an HTML attribute or
// split a mailto: link: < > " ' ( ) , ; : \ [ ] and a second @.
const EMAIL_RE = /^[^\s@<>"'(),;:\\[\]]+@[^\s@<>"'(),;:\\[\]]+\.[^\s@<>"'(),;:\\[\]]+$/
const LINE_BREAK_RE = /[\r\n]/
const SCHEME_RE = /^[a-z][a-z0-9+.-]*:\/\//i

function isRecord(raw: unknown): raw is Record<string, unknown> {
  return typeof raw === 'object' && raw !== null && !Array.isArray(raw)
}

/** Own property read only, so inherited keys like `constructor` are never picked up. */
function field(raw: Record<string, unknown>, key: string): unknown {
  return Object.prototype.hasOwnProperty.call(raw, key) ? raw[key] : undefined
}

function isBlankOptional(v: unknown): boolean {
  return v === undefined || (typeof v === 'string' && v.trim() === '')
}

function matchChoice<V extends string>(choices: readonly Choice<V>[], v: unknown): V | undefined {
  if (typeof v !== 'string') return undefined
  const trimmed = v.trim()
  return choices.find((c) => c.value === trimmed)?.value
}

/** Returns the normalised https/http href, or null if the value isn't an acceptable web address. */
function normaliseWebAddress(input: string): string | null {
  const trimmed = input.trim()
  if (trimmed === '' || /\s/.test(trimmed)) return null // also covers CR/LF
  const candidate = SCHEME_RE.test(trimmed) ? trimmed : `https://${trimmed}`
  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    return null
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
  if (url.username !== '' || url.password !== '') return null
  // Needs a real dotted host: rejects `localhost`, bare words and IPv6 literals.
  if (!/^[^.]+(\.[^.]+)+$/.test(url.hostname)) return null
  const href = url.href
  if (href.length > LIMITS.currentSite.max) return null
  if (/[\s<>"']/.test(href)) return null // URL already encodes these; belt and braces
  return href
}

export function validateContact(raw: unknown): ValidationResult {
  const errors: FieldErrors = {}
  const src: Record<string, unknown> = isRecord(raw) ? raw : {}

  // name
  let name = ''
  const rawName = field(src, 'name')
  if (typeof rawName !== 'string') {
    errors.name = ERR.name
  } else {
    name = rawName.trim()
    if (name === '' || LINE_BREAK_RE.test(name)) errors.name = ERR.name
    else if (name.length > LIMITS.name.max) errors.name = ERR.nameLong
  }

  // email
  let email = ''
  const rawEmail = field(src, 'email')
  if (typeof rawEmail !== 'string') {
    errors.email = ERR.email
  } else {
    email = rawEmail.trim()
    if (email.length > LIMITS.email.max || !EMAIL_RE.test(email)) errors.email = ERR.email
  }

  // company (optional)
  let company: string | undefined
  const rawCompany = field(src, 'company')
  if (!isBlankOptional(rawCompany)) {
    if (typeof rawCompany !== 'string') {
      errors.company = ERR.companyLong
    } else {
      const c = rawCompany.trim()
      if (LINE_BREAK_RE.test(c)) errors.company = ERR.companyLines
      else if (c.length > LIMITS.company.max) errors.company = ERR.companyLong
      else company = c
    }
  }

  // siteType, budget (required enums)
  const siteType = matchChoice(SITE_TYPES, field(src, 'siteType'))
  if (siteType === undefined) errors.siteType = ERR.siteType
  const budget = matchChoice(BUDGETS, field(src, 'budget'))
  if (budget === undefined) errors.budget = ERR.budget

  // timeline, source (optional enums)
  let timeline: Timeline | undefined
  const rawTimeline = field(src, 'timeline')
  if (!isBlankOptional(rawTimeline)) {
    timeline = matchChoice(TIMELINES, rawTimeline)
    if (timeline === undefined) errors.timeline = ERR.choice
  }
  let source: Source | undefined
  const rawSource = field(src, 'source')
  if (!isBlankOptional(rawSource)) {
    source = matchChoice(SOURCES, rawSource)
    if (source === undefined) errors.source = ERR.choice
  }

  // currentSite (optional URL)
  let currentSite: string | undefined
  const rawSite = field(src, 'currentSite')
  if (!isBlankOptional(rawSite)) {
    const href = typeof rawSite === 'string' ? normaliseWebAddress(rawSite) : null
    if (href === null) errors.currentSite = ERR.currentSite
    else currentSite = href
  }

  // message
  let message = ''
  const rawMessage = field(src, 'message')
  if (typeof rawMessage !== 'string') {
    errors.message = ERR.messageShort
  } else {
    message = rawMessage.trim().replace(/\r\n?/g, '\n')
    if (message.length < LIMITS.message.min) errors.message = ERR.messageShort
    else if (message.length > LIMITS.message.max) errors.message = ERR.messageLong
  }

  if (Object.keys(errors).length > 0 || siteType === undefined || budget === undefined) {
    return { ok: false, errors }
  }

  const value: ContactInput = { name, email, siteType, budget, message }
  if (company !== undefined) value.company = company
  if (timeline !== undefined) value.timeline = timeline
  if (source !== undefined) value.source = source
  if (currentSite !== undefined) value.currentSite = currentSite
  return { ok: true, value }
}

/** True when the hidden `website` field holds any text (humans never see it). */
export function isHoneypotTripped(raw: unknown): boolean {
  if (!isRecord(raw)) return false
  const v = field(raw, 'website')
  return typeof v === 'string' && v.length > 0
}
