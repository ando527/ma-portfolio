// Server-side check of a Cloudflare Turnstile token. This is the only thing
// the Worker trusts to tell a human from a bot. Fails closed: any problem at
// all counts as "not verified".

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const MAX_TOKEN_LENGTH = 2048
const TIMEOUT_MS = 8000

export async function verifyTurnstile(token: string, secret: string, ip: string | null): Promise<boolean> {
  if (typeof token !== 'string' || token === '' || token.length > MAX_TOKEN_LENGTH) return false
  if (typeof secret !== 'string' || secret === '') return false
  try {
    const body = new URLSearchParams({ secret, response: token })
    if (ip) body.set('remoteip', ip)
    const res = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!res.ok) return false
    const data: unknown = await res.json()
    return typeof data === 'object' && data !== null && (data as { success?: unknown }).success === true
  } catch {
    return false
  }
}
