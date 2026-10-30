'use client'

import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import RubiksCaptcha, { type CubeStatus } from '@/components/RubiksCaptcha'
import { btnPrimary, btnArrow } from '@/components/ui/button'
import { SITE } from '@/lib/site'
import { SITE_TYPES, BUDGETS, TIMELINES, SOURCES, LIMITS, type Choice } from '@/lib/contact-schema'

// The contact form. It posts JSON to /api/contact (worker/index.ts). Three
// layers sit in front of the send:
//   1. Client-side checks that mirror worker/validate.ts, so most mistakes are
//      caught without a round trip. The Worker is still the authority.
//   2. The Rubik's cube (RubiksCaptcha). This is UX only: it is never sent to
//      the server and nothing server-side trusts it.
//   3. An invisible Cloudflare Turnstile challenge, run when Send is pressed
//      (tokens last 5 minutes and are single use). This is the real bot check.

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || SITE.turnstileSiteKey
/** How long to wait for a Turnstile token before giving up. */
const TOKEN_TIMEOUT_MS = 20_000
/** How long to wait for the Turnstile script to finish loading when Send is pressed early. */
const SCRIPT_WAIT_MS = 8_000
/** Upper bound on the whole POST, so "Sending…" can never hang. */
const REQUEST_TIMEOUT_MS = 30_000

// ── Turnstile types (only the parts used here) ───────────────────────────────

interface TurnstileRenderOptions {
  sitekey: string
  execution: 'render' | 'execute'
  retry?: 'auto' | 'never'
  'refresh-expired'?: 'auto' | 'manual' | 'never'
  callback: (token: string) => void
  'error-callback': (code?: string) => void
  'expired-callback': () => void
  'timeout-callback': () => void
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string | undefined
  execute: (container: HTMLElement) => void
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

// ── Form model ───────────────────────────────────────────────────────────────

interface Values {
  name: string
  email: string
  company: string
  currentSite: string
  siteType: string
  budget: string
  timeline: string
  source: string
  message: string
}
type FieldKey = keyof Values
type Errors = Partial<Record<FieldKey, string>>

const EMPTY: Values = {
  name: '',
  email: '',
  company: '',
  currentSite: '',
  siteType: '',
  budget: '',
  timeline: '',
  source: '',
  message: '',
}

/** Field order on the page, which is also the order errors are listed in. */
const FIELD_ORDER: readonly FieldKey[] = [
  'name', 'email', 'company', 'currentSite', 'siteType', 'budget', 'timeline', 'source', 'message',
]

const LABELS: Record<FieldKey, string> = {
  name: 'Name',
  email: 'Email',
  company: 'Company',
  currentSite: 'Current website',
  siteType: 'What kind of website?',
  budget: 'Budget (AUD)',
  timeline: 'Timeline',
  source: 'How did you hear about me?',
  message: 'Tell me about your project',
}

// These rules and messages mirror worker/validate.ts exactly. Keep them in step.
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

const EMAIL_RE = /^[^\s@<>"'(),;:\\[\]]+@[^\s@<>"'(),;:\\[\]]+\.[^\s@<>"'(),;:\\[\]]+$/
const LINE_BREAK_RE = /[\r\n]/
const SCHEME_RE = /^[a-z][a-z0-9+.-]*:\/\//i

/** Same acceptance rules as the Worker: optional scheme, http(s) only, a dotted host, no credentials. */
function isAcceptableWebAddress(input: string): boolean {
  const trimmed = input.trim()
  if (trimmed === '' || /\s/.test(trimmed)) return false
  const candidate = SCHEME_RE.test(trimmed) ? trimmed : `https://${trimmed}`
  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    return false
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') return false
  if (url.username !== '' || url.password !== '') return false
  if (!/^[^.]+(\.[^.]+)+$/.test(url.hostname)) return false
  const href = url.href
  if (href.length > LIMITS.currentSite.max) return false
  if (/[\s<>"']/.test(href)) return false
  return true
}

function isChoice(choices: readonly Choice[], value: string): boolean {
  return choices.some((c) => c.value === value.trim())
}

function validate(v: Values): Errors {
  const errors: Errors = {}

  const name = v.name.trim()
  if (name === '' || LINE_BREAK_RE.test(name)) errors.name = ERR.name
  else if (name.length > LIMITS.name.max) errors.name = ERR.nameLong

  const email = v.email.trim()
  if (email.length > LIMITS.email.max || !EMAIL_RE.test(email)) errors.email = ERR.email

  const company = v.company.trim()
  if (company !== '') {
    if (LINE_BREAK_RE.test(company)) errors.company = ERR.companyLines
    else if (company.length > LIMITS.company.max) errors.company = ERR.companyLong
  }

  if (!isChoice(SITE_TYPES, v.siteType)) errors.siteType = ERR.siteType
  if (!isChoice(BUDGETS, v.budget)) errors.budget = ERR.budget
  if (v.timeline.trim() !== '' && !isChoice(TIMELINES, v.timeline)) errors.timeline = ERR.choice
  if (v.source.trim() !== '' && !isChoice(SOURCES, v.source)) errors.source = ERR.choice

  if (v.currentSite.trim() !== '' && !isAcceptableWebAddress(v.currentSite)) errors.currentSite = ERR.currentSite

  const message = v.message.trim().replace(/\r\n?/g, '\n')
  if (message.length < LIMITS.message.min) errors.message = ERR.messageShort
  else if (message.length > LIMITS.message.max) errors.message = ERR.messageLong

  return errors
}

/** Picks the field errors out of a Worker `{ error: 'validation', fields }` response. */
function fieldsFromServer(data: unknown): Errors {
  const out: Errors = {}
  if (typeof data !== 'object' || data === null) return out
  const fields = (data as { fields?: unknown }).fields
  if (typeof fields !== 'object' || fields === null) return out
  for (const key of FIELD_ORDER) {
    const msg = (fields as Record<string, unknown>)[key]
    if (typeof msg === 'string' && msg !== '') out[key] = msg
  }
  return out
}

// ── Styles ───────────────────────────────────────────────────────────────────

const linkClass =
  'font-medium text-primary underline underline-offset-[3px] decoration-1 decoration-maroon-300 hover:decoration-primary transition-colors duration-200'

const labelClass = 'block font-sans text-sm font-semibold text-foreground'

const controlBase =
  'block w-full rounded-xl border bg-white px-4 font-sans text-base text-foreground transition-colors duration-200 scroll-mt-28'

function controlState(invalid: boolean) {
  return invalid ? 'border-red-700' : 'border-maroon-200 hover:border-primary/50 focus:border-primary'
}

const inputClass = (invalid: boolean) =>
  `${controlBase} h-12 placeholder:text-muted-foreground/60 ${controlState(invalid)}`

// ── Small field components ───────────────────────────────────────────────────

function LinkedInLink({ children }: { children: ReactNode }) {
  return (
    <a href={SITE.links.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  )
}

function Optional() {
  return <span className="font-normal text-muted-foreground"> (optional)</span>
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 font-sans text-sm text-red-700">
      <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 flex-shrink-0">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-11.5a.75.75 0 0 1 1.5 0v4a.75.75 0 0 1-1.5 0v-4Zm.75 7.25a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </p>
  )
}

function describedBy(...ids: (string | false | undefined)[]) {
  const list = ids.filter(Boolean).join(' ')
  return list === '' ? undefined : list
}

interface TextFieldProps {
  field: FieldKey
  label: string
  optional?: boolean
  error?: string
  value: string
  onChange: (field: FieldKey, value: string) => void
  type?: 'text' | 'email'
  autoComplete?: string
  inputMode?: 'url' | 'email'
  placeholder?: string
}

function TextField({ field, label, optional, error, value, onChange, type = 'text', autoComplete, inputMode, placeholder }: TextFieldProps) {
  const id = `contact-${field}`
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={`${labelClass} mb-2`}>
        {label}
        {optional && <Optional />}
      </label>
      <input
        id={id}
        name={field}
        type={type}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        required={!optional}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(error && `${id}-error`)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        placeholder={placeholder}
        spellCheck={false}
        autoCapitalize={type === 'email' || inputMode === 'url' ? 'none' : undefined}
        className={inputClass(!!error)}
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}

function SelectField({
  field, label, choices, value, error, onChange,
}: {
  field: FieldKey
  label: string
  choices: readonly Choice[]
  value: string
  error?: string
  onChange: (field: FieldKey, value: string) => void
}) {
  const id = `contact-${field}`
  return (
    <div className="min-w-0">
      <label htmlFor={id} className={`${labelClass} mb-2`}>
        {label}
        <Optional />
      </label>
      <div className="relative">
        <select
          id={id}
          name={field}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(error && `${id}-error`)}
          className={`${controlBase} h-12 cursor-pointer appearance-none pr-11 ${controlState(!!error)}`}
        >
          <option value="">Choose one (optional)</option>
          {choices.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        >
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}

/** A radio group drawn as selectable cards. The real <input type="radio"> stays in the DOM (visually hidden), so arrow keys, focus and form semantics are native. */
function ChoiceGroup({
  field, legend, choices, value, error, onChange, columns,
}: {
  field: FieldKey
  legend: string
  choices: readonly Choice[]
  value: string
  error?: string
  onChange: (field: FieldKey, value: string) => void
  columns: string
}) {
  const id = `contact-${field}`
  return (
    <fieldset
      id={id}
      aria-describedby={describedBy(error && `${id}-error`)}
      className="m-0 min-w-0 scroll-mt-28 border-0 p-0"
    >
      <legend className={`${labelClass} mb-3 p-0`}>{legend}</legend>
      <div className={`grid gap-3 ${columns}`}>
        {choices.map((c) => (
          <label key={c.value} className="relative block cursor-pointer">
            <input
              type="radio"
              name={field}
              value={c.value}
              checked={value === c.value}
              onChange={() => onChange(field, c.value)}
              required
              className="peer sr-only"
            />
            {/* The radio dot, filled when checked */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full border-2 border-maroon-300 bg-white transition-[background-color,border-color,box-shadow] duration-200 peer-checked:border-primary peer-checked:bg-primary peer-checked:shadow-[inset_0_0_0_3px_#fff]"
            />
            <span
              className={`flex min-h-[52px] items-center rounded-xl border bg-white py-3 pl-11 pr-3 font-sans text-[15px] font-medium leading-snug text-foreground transition-[background-color,border-color,box-shadow] duration-200 hover:border-primary/50 peer-checked:border-primary peer-checked:bg-maroon-50 peer-checked:shadow-[inset_0_0_0_1px_#7C1D2E] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-secondary ${
                error ? 'border-red-700' : 'border-maroon-200'
              }`}
            >
              {c.label}
            </span>
          </label>
        ))}
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </fieldset>
  )
}

// ── The form ─────────────────────────────────────────────────────────────────

type FormMessage = 'cube' | 'verify' | 'fallback' | null
type Status = 'idle' | 'sending' | 'sent'

interface Pending {
  resolve: (token: string) => void
  reject: (error: Error) => void
}

export default function ContactForm() {
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [formMessage, setFormMessage] = useState<FormMessage>(null)
  const [cubeStatus, setCubeStatus] = useState<CubeStatus>('detecting')
  const [summaryFocusTick, setSummaryFocusTick] = useState(0)

  const formRef = useRef<HTMLFormElement>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)
  const honeypotRef = useRef<HTMLInputElement>(null)
  const cubeFocusRef = useRef<{ focus: () => void }>(null)

  // Turnstile
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)
  const scriptFailedRef = useRef(false)
  const pendingRef = useRef<Pending | null>(null)
  const sendingRef = useRef(false)

  const cubeOk = cubeStatus === 'solved' || cubeStatus === 'skipped'

  // ── Turnstile ──────────────────────────────────────────────────────────────

  /** Settles the waiting getToken() call, if any. Late callbacks find nothing and are ignored. */
  const settle = useCallback((result: { token: string } | { error: Error }) => {
    const pending = pendingRef.current
    if (!pending) return
    pendingRef.current = null
    if ('token' in result) pending.resolve(result.token)
    else pending.reject(result.error)
  }, [])

  const renderWidget = useCallback(() => {
    const api = window.turnstile
    const el = containerRef.current
    if (!api || !el || widgetIdRef.current !== null) return
    try {
      const id = api.render(el, {
        sitekey: TURNSTILE_SITE_KEY,
        // Wait for turnstile.execute(): the challenge runs when Send is pressed.
        execution: 'execute',
        // No background retries or token refreshes: each Send asks for one fresh token.
        retry: 'never',
        'refresh-expired': 'never',
        callback: (token) => settle({ token }),
        'error-callback': () => settle({ error: new Error('turnstile error') }),
        'expired-callback': () => settle({ error: new Error('turnstile expired') }),
        'timeout-callback': () => settle({ error: new Error('turnstile timeout') }),
      })
      if (id === undefined) scriptFailedRef.current = true
      else widgetIdRef.current = id
    } catch {
      // e.g. an invalid site key
      scriptFailedRef.current = true
    }
  }, [settle])

  /** Runs the invisible challenge and resolves with a single-use token. */
  const getToken = useCallback(async (): Promise<string> => {
    const waitUntil = Date.now() + SCRIPT_WAIT_MS
    while (widgetIdRef.current === null) {
      if (scriptFailedRef.current || Date.now() > waitUntil) throw new Error('turnstile unavailable')
      await new Promise((r) => setTimeout(r, 100))
    }
    const api = window.turnstile
    const container = containerRef.current
    if (!api || !container) throw new Error('turnstile unavailable')

    return new Promise<string>((resolve, reject) => {
      const timer = window.setTimeout(() => settle({ error: new Error('turnstile timed out') }), TOKEN_TIMEOUT_MS)
      pendingRef.current = {
        resolve: (token) => { window.clearTimeout(timer); resolve(token) },
        reject: (error) => { window.clearTimeout(timer); reject(error) },
      }
      try {
        api.execute(container)
      } catch (err) {
        settle({ error: err instanceof Error ? err : new Error('turnstile execute failed') })
      }
    })
  }, [settle])

  /** Tokens are single use, so after any failed send the widget goes back to its start state. */
  const resetWidget = useCallback(() => {
    const id = widgetIdRef.current
    if (id === null) return
    try {
      window.turnstile?.reset(id)
    } catch {
      // nothing to do: the next send will report the failure
    }
  }, [])

  useEffect(() => {
    // The script may already be loaded (client-side navigation back to this page).
    renderWidget()
    return () => {
      settle({ error: new Error('unmounted') })
      const id = widgetIdRef.current
      widgetIdRef.current = null
      if (id !== null) {
        try {
          window.turnstile?.remove(id)
        } catch {
          // ignore
        }
      }
    }
  }, [renderWidget, settle])

  // ── Focus management ───────────────────────────────────────────────────────

  useEffect(() => {
    if (summaryFocusTick > 0) summaryRef.current?.focus()
  }, [summaryFocusTick])

  useEffect(() => {
    if (status === 'sent') successRef.current?.focus()
  }, [status])

  function focusField(field: FieldKey) {
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${field}"]`)
    el?.focus()
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

  function onChange(field: FieldKey, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sendingRef.current) return // a second click or Enter while sending
    setFormMessage(null)

    const found = validate(values)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      setSummaryFocusTick((t) => t + 1)
      return
    }
    setErrors({})

    if (!cubeOk) {
      setFormMessage('cube')
      if (cubeFocusRef.current) cubeFocusRef.current.focus()
      else messageRef.current?.focus()
      return
    }

    sendingRef.current = true
    setStatus('sending')
    let sent = false
    const controller = new AbortController()
    const abortTimer = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
    try {
      const turnstileToken = await getToken()
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        // The cube is never part of the request: the server doesn't trust it.
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          company: values.company,
          siteType: values.siteType,
          budget: values.budget,
          timeline: values.timeline,
          source: values.source,
          currentSite: values.currentSite,
          message: values.message,
          website: honeypotRef.current?.value ?? '',
          turnstileToken,
        }),
      })

      let data: unknown = null
      try {
        data = await res.json()
      } catch {
        // not JSON: treated as a failure below
      }
      const body = (typeof data === 'object' && data !== null ? data : {}) as { ok?: unknown; error?: unknown }

      if (res.ok && body.ok === true) {
        sent = true
        setStatus('sent')
        return
      }

      resetWidget()
      if (body.error === 'validation') {
        const fromServer = fieldsFromServer(data)
        if (Object.keys(fromServer).length > 0) {
          setErrors(fromServer)
          setSummaryFocusTick((t) => t + 1)
          return
        }
        setFormMessage('fallback')
      } else if (body.error === 'turnstile') {
        setFormMessage('verify')
      } else {
        setFormMessage('fallback')
      }
    } catch {
      // Network error, aborted request, or no Turnstile token (script blocked, offline, timed out).
      resetWidget()
      setFormMessage('fallback')
    } finally {
      window.clearTimeout(abortTimer)
      if (!sent) {
        sendingRef.current = false
        setStatus('idle')
      }
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const errorList = FIELD_ORDER.filter((k) => errors[k])
  const sending = status === 'sending'
  const messageLength = values.message.length
  const showCount = messageLength >= LIMITS.message.max - 500
  const overLimit = messageLength > LIMITS.message.max
  const messageError = errors.message

  return (
    <div>
      {/* Loaded on this page only, never site-wide. */}
      <Script
        id="turnstile-api"
        src={TURNSTILE_SRC}
        strategy="afterInteractive"
        onReady={renderWidget}
        onError={() => {
          scriptFailedRef.current = true
        }}
      />

      {/* Where the invisible Turnstile widget mounts. It has no visible UI. */}
      <div ref={containerRef} aria-hidden="true" />

      <noscript>
        <p className="rounded-xl border border-maroon-200 bg-maroon-50 p-4 font-sans text-base text-foreground">
          The contact form needs JavaScript. <LinkedInLink>Message me on LinkedIn</LinkedInLink> instead.
        </p>
      </noscript>

      {status === 'sent' ? (
        <div
          ref={successRef}
          tabIndex={-1}
          role="status"
          className="rounded-2xl border border-maroon-200 bg-maroon-50 px-6 py-10 text-center sm:px-10 sm:py-14"
        >
          <span aria-hidden className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white">
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
              <path d="m4.5 10.5 3.5 3.5 7.5-8" />
            </svg>
          </span>
          <p className="display mt-6 text-3xl text-foreground sm:text-4xl">Thanks, your message is on its way.</p>
          <p className="mt-4 font-sans text-lg text-muted-foreground">I&rsquo;ll reply by email.</p>
        </div>
      ) : (
        // Without JavaScript the form can't send, so it's hidden (the <noscript> note above covers that case).
        <form
          ref={formRef}
          method="post"
          noValidate
          onSubmit={onSubmit}
          aria-label="Contact form"
          className="[html:not(.js)_&]:hidden"
        >
          {errorList.length > 0 && (
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              className="mb-8 scroll-mt-28 rounded-xl border border-red-700 bg-red-50 p-4 outline-none sm:p-5"
            >
              <p className="font-sans text-base font-semibold text-red-700">
                {errorList.length === 1 ? 'Please fix this field:' : 'Please fix these fields:'}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 font-sans text-[15px] text-red-700">
                {errorList.map((k) => (
                  <li key={k}>
                    <a
                      href={`#contact-${k}`}
                      onClick={(e) => {
                        e.preventDefault()
                        focusField(k)
                      }}
                      className="underline underline-offset-[3px] hover:no-underline"
                    >
                      {errors[k] === ERR.choice ? `${LABELS[k]}: ${errors[k]}` : errors[k]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField field="name" label="Name" value={values.name} error={errors.name} onChange={onChange} autoComplete="name" />
              <TextField field="email" label="Email" type="email" inputMode="email" value={values.email} error={errors.email} onChange={onChange} autoComplete="email" />
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <TextField field="company" label="Company" optional value={values.company} error={errors.company} onChange={onChange} autoComplete="organization" />
              <TextField
                field="currentSite"
                label="Current website"
                optional
                value={values.currentSite}
                error={errors.currentSite}
                onChange={onChange}
                inputMode="url"
                autoComplete="url"
                placeholder="yourbusiness.com.au"
              />
            </div>

            <ChoiceGroup
              field="siteType"
              legend={LABELS.siteType}
              choices={SITE_TYPES}
              value={values.siteType}
              error={errors.siteType}
              onChange={onChange}
              columns="grid-cols-1 sm:grid-cols-2"
            />

            <ChoiceGroup
              field="budget"
              legend={LABELS.budget}
              choices={BUDGETS}
              value={values.budget}
              error={errors.budget}
              onChange={onChange}
              columns="grid-cols-2 md:grid-cols-4"
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <SelectField field="timeline" label="Timeline" choices={TIMELINES} value={values.timeline} error={errors.timeline} onChange={onChange} />
              <SelectField field="source" label={LABELS.source} choices={SOURCES} value={values.source} error={errors.source} onChange={onChange} />
            </div>

            <div>
              <label htmlFor="contact-message" className={labelClass}>
                {LABELS.message}
              </label>
              <p id="contact-message-hint" className="mb-2 mt-1 font-sans text-sm text-muted-foreground">
                What you need, any deadlines, links to sites you like.
              </p>
              <textarea
                id="contact-message"
                name="message"
                value={values.message}
                onChange={(e) => onChange('message', e.target.value)}
                required
                rows={6}
                aria-invalid={messageError ? true : undefined}
                aria-describedby={describedBy('contact-message-hint', messageError && 'contact-message-error', showCount && 'contact-message-count')}
                className={`${controlBase} min-h-[160px] resize-y py-3 leading-relaxed ${controlState(!!messageError)}`}
              />
              <FieldError id="contact-message-error" message={messageError} />
              {showCount && (
                <p
                  id="contact-message-count"
                  aria-live="polite"
                  className={`mt-2 text-right font-sans text-sm tabular-nums ${overLimit ? 'font-semibold text-red-700' : 'text-muted-foreground'}`}
                >
                  {messageLength} / {LIMITS.message.max}
                </p>
              )}
            </div>

            {/* Honeypot: bots fill it, people never see it. The Worker drops any submission that has text here. */}
            <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
              <label>
                Leave this field empty
                <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
              </label>
            </div>

            <RubiksCaptcha onStatusChange={setCubeStatus} sendFocusRef={cubeFocusRef} />

            <div ref={messageRef} tabIndex={-1} role="alert" className="outline-none">
              {formMessage === 'cube' && !cubeOk && (
                <p className="flex items-start gap-1.5 font-sans text-[15px] text-red-700">
                  <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 flex-shrink-0">
                    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm-.75-11.5a.75.75 0 0 1 1.5 0v4a.75.75 0 0 1-1.5 0v-4Zm.75 7.25a.9.9 0 1 0 0-1.8.9.9 0 0 0 0 1.8Z" clipRule="evenodd" />
                  </svg>
                  <span>Solve the cube first, then press send.</span>
                </p>
              )}
              {formMessage === 'verify' && (
                <p className="rounded-xl border border-red-700 bg-red-50 p-4 font-sans text-[15px] text-red-700">
                  Verification failed. Please try again. If it keeps happening,{' '}
                  <a href={SITE.links.linkedin} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-[3px] hover:no-underline">
                    message me on LinkedIn<span className="sr-only"> (opens in a new tab)</span>
                  </a>{' '}
                  instead.
                </p>
              )}
              {formMessage === 'fallback' && (
                <p className="rounded-xl border border-red-700 bg-red-50 p-4 font-sans text-[15px] text-red-700">
                  Sorry, that didn&rsquo;t send. You can{' '}
                  <a href={SITE.links.linkedin} target="_blank" rel="noopener noreferrer" className="font-medium underline underline-offset-[3px] hover:no-underline">
                    message me on LinkedIn<span className="sr-only"> (opens in a new tab)</span>
                  </a>{' '}
                  instead.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <button
                type="submit"
                aria-disabled={sending}
                className={`${btnPrimary} w-full sm:w-auto ${sending ? 'cursor-wait opacity-80' : ''}`}
              >
                {sending ? 'Sending…' : 'Send message'}
                {!sending && <span aria-hidden className={btnArrow}>→</span>}
              </button>
              <p className="font-sans text-sm text-muted-foreground">
                Your message is emailed to me and isn&rsquo;t stored on this site.{' '}
                <Link prefetch={false} href="/privacy/" className={linkClass}>Privacy policy</Link>
              </p>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
