// Worker entry. Cloudflare runs this only for POST /api/contact (see
// `assets.run_worker_first` in wrangler.jsonc); everything else is served from
// the static export and never reaches this code.
//
// The Rubik's cube on the contact page is UX only. The server never receives or
// checks it: the invisible Turnstile token is the only bot check that counts.

import { LIMITS } from '../src/lib/contact-schema.ts'
import type { Env } from './env.ts'
import { validateContact, isHoneypotTripped } from './validate.ts'
import { verifyTurnstile } from './turnstile.ts'
import { sendContactEmail } from './mail.ts'

const ROUTE = '/api/contact'

function json(status: number, body: unknown, extraHeaders?: Record<string, string>): Response {
  // _headers does not apply to Worker responses, so set the headers here.
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...extraHeaders,
    },
  })
}

function fail(status: number, error: string, extra?: Record<string, unknown>, headers?: Record<string, string>): Response {
  return json(status, { ok: false, error, ...extra }, headers)
}

function isJsonContentType(value: string | null): boolean {
  if (value === null) return false
  return value.split(';')[0].trim().toLowerCase() === 'application/json'
}

/**
 * Reads the request body as text, giving up as soon as it passes `maxBytes`
 * (so a huge or endless chunked upload is never buffered). Returns null when
 * the limit is exceeded.
 */
async function readBodyText(request: Request, maxBytes: number): Promise<string | null> {
  if (request.body === null) return ''
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maxBytes) {
      await reader.cancel().catch(() => {})
      return null
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.byteLength
  }
  return new TextDecoder().decode(bytes)
}

function missingConfig(env: Env): string[] {
  const missing: string[] = []
  const required: (keyof Env)[] = ['TURNSTILE_SECRET_KEY', 'CONTACT_TO', 'CONTACT_FROM']
  // The dry run (local dev) never calls Resend, so it doesn't need a key.
  if (env.CONTACT_DRY_RUN !== '1') required.push('RESEND_API_KEY')
  for (const key of required) {
    const v = env[key]
    if (typeof v !== 'string' || v === '') missing.push(key)
  }
  return missing
}

export async function handleContact(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') return fail(405, 'method', undefined, { Allow: 'POST' })

  if (request.headers.get('Origin') !== new URL(request.url).origin) return fail(403, 'origin')

  if (!isJsonContentType(request.headers.get('Content-Type'))) return fail(415, 'content_type')

  const declared = request.headers.get('Content-Length')
  if (declared !== null && Number(declared) > LIMITS.body) return fail(413, 'too_large')

  let text: string | null
  try {
    text = await readBodyText(request, LIMITS.body)
  } catch {
    return fail(400, 'bad_json')
  }
  if (text === null) return fail(413, 'too_large')

  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return fail(400, 'bad_json')
  }
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return fail(400, 'bad_json')

  // Bots that fill the hidden field get a fake success and nothing is sent.
  if (isHoneypotTripped(raw)) return json(200, { ok: true })

  const result = validateContact(raw)
  if (!result.ok) return fail(400, 'validation', { fields: result.errors })

  const token = (raw as Record<string, unknown>).turnstileToken
  if (typeof token !== 'string' || token === '') return fail(403, 'turnstile')

  const missing = missingConfig(env)
  if (missing.length > 0) {
    console.error(`contact: not configured, missing: ${missing.join(', ')}`)
    return fail(500, 'not_configured')
  }

  const human = await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, request.headers.get('CF-Connecting-IP'))
  if (!human) return fail(403, 'turnstile')

  try {
    await sendContactEmail(env, result.value)
  } catch (err) {
    // Only the error message (a status code, never the key or upstream body).
    console.error('contact: delivery failed:', err instanceof Error ? err.message : 'unknown error')
    return fail(502, 'delivery')
  }

  return json(200, { ok: true })
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (new URL(request.url).pathname === ROUTE) return handleContact(request, env)
    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>
