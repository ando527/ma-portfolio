import { test, beforeEach, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import worker, { handleContact } from './index.ts'
import type { Env } from './env.ts'

const ORIGIN = 'https://mitchellanderson.com.au'
const URL_ = `${ORIGIN}/api/contact`

const GOOD_BODY = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines',
  siteType: 'webflow',
  budget: '5k-10k',
  timeline: 'asap',
  source: 'search',
  currentSite: 'example.com',
  message: 'Hello Mitchell, I need a new website.',
  website: '',
  turnstileToken: 'good-token',
}

let assetCalls: Request[] = []

function makeEnv(overrides: Partial<Env> = {}): Env {
  return {
    ASSETS: {
      fetch: async (req: Request) => {
        assetCalls.push(req)
        return new Response('<html>asset</html>', { status: 200, headers: { 'content-type': 'text/html' } })
      },
    } as unknown as Fetcher,
    TURNSTILE_SECRET_KEY: 'turnstile-secret-xyz',
    RESEND_API_KEY: 're_super_secret_key',
    CONTACT_TO: 'owner@example.net',
    CONTACT_FROM: 'Site <contact@mail.example.net>',
    ...overrides,
  }
}

function post(body: unknown, headers: Record<string, string> = {}, raw?: string): Request {
  return new Request(URL_, {
    method: 'POST',
    headers: { Origin: ORIGIN, 'Content-Type': 'application/json', ...headers },
    body: raw ?? JSON.stringify(body),
  })
}

const realFetch = globalThis.fetch
let fetchCalls: { url: string; init?: RequestInit }[] = []
let turnstileOk = true
let resendStatus = 200
let turnstileThrows = false

beforeEach(() => {
  fetchCalls = []
  assetCalls = []
  turnstileOk = true
  resendStatus = 200
  turnstileThrows = false
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    fetchCalls.push({ url, init })
    if (url.includes('challenges.cloudflare.com')) {
      if (turnstileThrows) throw new Error('turnstile down')
      return Response.json({ success: turnstileOk })
    }
    if (url.includes('api.resend.com')) {
      return resendStatus === 200
        ? Response.json({ id: 'x' })
        : new Response('{"message":"quota exceeded; key re_super_secret_key"}', { status: resendStatus })
    }
    throw new Error('unexpected fetch ' + url)
  }) as typeof fetch
})
afterEach(() => {
  globalThis.fetch = realFetch
  mock.restoreAll()
})

async function json(res: Response) {
  return (await res.json()) as Record<string, unknown>
}

function assertHardened(res: Response) {
  assert.equal(res.headers.get('cache-control'), 'no-store')
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(res.headers.get('content-type'), 'application/json; charset=utf-8')
}

test('405 for GET (and other methods) with Allow: POST', async () => {
  for (const method of ['GET', 'PUT', 'DELETE', 'HEAD', 'OPTIONS']) {
    const res = await handleContact(new Request(URL_, { method, headers: { Origin: ORIGIN } }), makeEnv())
    assert.equal(res.status, 405, method)
    assert.equal(res.headers.get('allow'), 'POST')
    assertHardened(res)
    if (method !== 'HEAD') assert.deepEqual(await json(res), { ok: false, error: 'method' })
  }
  assert.equal(fetchCalls.length, 0)
})

test('403 for cross-origin or missing Origin', async () => {
  for (const origin of ['https://evil.example', 'http://mitchellanderson.com.au', 'https://mitchellanderson.com.au:8443', 'null']) {
    const res = await handleContact(post(GOOD_BODY, { Origin: origin }), makeEnv())
    assert.equal(res.status, 403, origin)
    assert.deepEqual(await json(res), { ok: false, error: 'origin' })
  }
  const noOrigin = new Request(URL_, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(GOOD_BODY) })
  const res = await handleContact(noOrigin, makeEnv())
  assert.equal(res.status, 403)
  assert.equal(fetchCalls.length, 0)
})

test('415 for form-encoded and missing content types; accepts json with parameters', async () => {
  for (const ct of ['application/x-www-form-urlencoded', 'text/plain', 'application/jsonx', 'application/json-patch+json', 'text/json']) {
    const res = await handleContact(post(GOOD_BODY, { 'Content-Type': ct }), makeEnv())
    assert.equal(res.status, 415, ct)
    assert.deepEqual(await json(res), { ok: false, error: 'content_type' })
    assertHardened(res)
  }
  for (const ct of ['application/json; charset=utf-8', 'Application/JSON', 'application/json;charset=UTF-8']) {
    const res = await handleContact(post(GOOD_BODY, { 'Content-Type': ct }), makeEnv())
    assert.equal(res.status, 200, ct)
  }
})

test('413 for a 1 MB body, via Content-Length and via an actual body without the header', async () => {
  const big = 'x'.repeat(1_000_000)
  const viaHeader = await handleContact(post(null, { 'Content-Length': '1000000' }, big), makeEnv())
  assert.equal(viaHeader.status, 413)
  assert.deepEqual(await json(viaHeader), { ok: false, error: 'too_large' })

  // Chunked/streamed body with no Content-Length.
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const chunk = new TextEncoder().encode('x'.repeat(100_000))
      for (let i = 0; i < 10; i++) controller.enqueue(chunk)
      controller.close()
    },
  })
  const streamed = new Request(URL_, {
    method: 'POST',
    headers: { Origin: ORIGIN, 'Content-Type': 'application/json' },
    body: stream,
    duplex: 'half',
  } as RequestInit)
  assert.equal(streamed.headers.get('content-length'), null)
  const res = await handleContact(streamed, makeEnv())
  assert.equal(res.status, 413)
  assert.equal(fetchCalls.length, 0)
})

test('413 is measured in bytes, not characters', async () => {
  // 4,000 emoji = 8,000 UTF-16 units but 16,000 UTF-8 bytes.
  const emoji = '😀'.repeat(4000)
  const res = await handleContact(post({ ...GOOD_BODY, message: emoji }), makeEnv())
  assert.equal(res.status, 413)
  // A body just under the limit in bytes still gets through to validation.
  const ok = await handleContact(post({ ...GOOD_BODY, message: 'é'.repeat(2000) }), makeEnv())
  assert.equal(ok.status, 200)
})

test('400 for invalid JSON, JSON null, arrays and scalars', async () => {
  for (const raw of ['{not json', '', 'null', '[]', '"str"', '42', '[{"name":"x"}]']) {
    const res = await handleContact(post(null, {}, raw), makeEnv())
    assert.ok(res.status === 400, `${raw} -> ${res.status}`)
    const body = await json(res)
    assert.equal(body.ok, false)
    assert.ok(body.error === 'bad_json' || body.error === 'validation', raw)
    assertHardened(res)
  }
  assert.equal(fetchCalls.length, 0)
})

test('a request with no body is a clean 400', async () => {
  const res = await handleContact(new Request(URL_, { method: 'POST', headers: { Origin: ORIGIN, 'Content-Type': 'application/json' } }), makeEnv())
  assert.equal(res.status, 400)
})

test('400 with field errors for an invalid submission, and no fetch calls at all', async () => {
  const res = await handleContact(post({ ...GOOD_BODY, email: 'not-an-email', siteType: 'nope' }), makeEnv())
  assert.equal(res.status, 400)
  const body = await json(res)
  assert.equal(body.error, 'validation')
  const fields = body.fields as Record<string, string>
  assert.equal(fields.email, 'Enter a valid email address.')
  assert.equal(fields.siteType, 'Choose the type of website.')
  assert.equal(fetchCalls.length, 0)
})

test('403 when turnstile fails, and mail is not sent', async () => {
  turnstileOk = false
  const res = await handleContact(post(GOOD_BODY), makeEnv())
  assert.equal(res.status, 403)
  assert.deepEqual(await json(res), { ok: false, error: 'turnstile' })
  assert.ok(!fetchCalls.some((c) => c.url.includes('resend')))
})

test('403 when turnstile throws (fails closed)', async () => {
  turnstileThrows = true
  const res = await handleContact(post(GOOD_BODY), makeEnv())
  assert.equal(res.status, 403)
  assert.ok(!fetchCalls.some((c) => c.url.includes('resend')))
})

test('403 when turnstileToken is missing, empty or not a string; no fetch at all', async () => {
  for (const tok of [undefined, '', 5, null, {}, 'x'.repeat(3000)]) {
    const { turnstileToken: _unused, ...rest } = GOOD_BODY
    void _unused
    const body = tok === undefined ? rest : { ...rest, turnstileToken: tok }
    const res = await handleContact(post(body), makeEnv())
    assert.equal(res.status, 403, JSON.stringify(tok)?.slice(0, 20))
    assert.deepEqual(await json(res), { ok: false, error: 'turnstile' })
  }
  assert.ok(!fetchCalls.some((c) => c.url.includes('resend')))
})

test('200 and exactly one email for a valid submission, with the IP sent to siteverify', async () => {
  const res = await handleContact(post(GOOD_BODY, { 'CF-Connecting-IP': '203.0.113.7' }), makeEnv())
  assert.equal(res.status, 200)
  assert.deepEqual(await json(res), { ok: true })
  assertHardened(res)
  const verify = fetchCalls.filter((c) => c.url.includes('challenges.cloudflare.com'))
  const resend = fetchCalls.filter((c) => c.url.includes('api.resend.com'))
  assert.equal(verify.length, 1)
  assert.equal(resend.length, 1)
  const form = new URLSearchParams(String(verify[0].init?.body))
  assert.equal(form.get('remoteip'), '203.0.113.7')
  assert.equal(form.get('response'), 'good-token')
  assert.equal(form.get('secret'), 'turnstile-secret-xyz')
  const mail = JSON.parse(String(resend[0].init?.body))
  assert.equal(mail.to, 'owner@example.net')
  assert.equal(mail.reply_to, 'ada@example.com')
  assert.ok(mail.html.includes('https://example.com/'))
  // turnstileToken and the honeypot never leak into the email.
  assert.ok(!mail.text.includes('good-token'))
})

test('honeypot returns 200 but sends nothing and makes no fetch calls', async () => {
  const res = await handleContact(post({ ...GOOD_BODY, website: 'http://spam.example' }), makeEnv())
  assert.equal(res.status, 200)
  assert.deepEqual(await json(res), { ok: true })
  assert.equal(fetchCalls.length, 0)
})

test('502 when Resend fails, with no secret or upstream body in the response', async () => {
  for (const status of [429, 500]) {
    resendStatus = status
    const err = mock.method(console, 'error', () => {})
    const res = await handleContact(post(GOOD_BODY), makeEnv())
    assert.equal(res.status, 502)
    const text = JSON.stringify(await json(res))
    assert.equal(text, JSON.stringify({ ok: false, error: 'delivery' }))
    assert.ok(!text.includes('re_super_secret_key'))
    assert.ok(!text.includes('quota'))
    assert.equal(err.mock.callCount(), 1)
    const logged = err.mock.calls[0].arguments.map(String).join(' ')
    assert.ok(!logged.includes('re_super_secret_key'))
    assert.ok(!logged.includes('ada@example.com'))
    assert.ok(!logged.includes('Hello Mitchell'))
    mock.restoreAll()
  }
})

test('502 when the Resend fetch itself throws', async () => {
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    if (String(input).includes('challenges.cloudflare.com')) return Response.json({ success: true })
    throw new Error('network')
  }) as typeof fetch
  mock.method(console, 'error', () => {})
  const res = await handleContact(post(GOOD_BODY), makeEnv())
  assert.equal(res.status, 502)
})

test('500 when a required secret or var is missing; logs the name, never a value', async () => {
  for (const key of ['RESEND_API_KEY', 'TURNSTILE_SECRET_KEY', 'CONTACT_TO', 'CONTACT_FROM'] as const) {
    fetchCalls = []
    const err = mock.method(console, 'error', () => {})
    const env = makeEnv({ [key]: '' } as Partial<Env>)
    const res = await handleContact(post(GOOD_BODY), env)
    assert.equal(res.status, 500, key)
    assert.deepEqual(await json(res), { ok: false, error: 'not_configured' })
    assert.equal(fetchCalls.length, 0)
    const logged = err.mock.calls.map((c) => c.arguments.map(String).join(' ')).join('\n')
    assert.ok(logged.includes(key))
    assert.ok(!logged.includes('re_super_secret_key'))
    assert.ok(!logged.includes('turnstile-secret-xyz'))
    assert.ok(!logged.includes('owner@example.net'))
    mock.restoreAll()
  }
  // Undefined (binding absent) counts as missing too.
  const env = makeEnv()
  delete (env as unknown as Record<string, unknown>).CONTACT_TO
  mock.method(console, 'error', () => {})
  assert.equal((await handleContact(post(GOOD_BODY), env)).status, 500)
})

test('dry run: RESEND_API_KEY is not required, nothing is sent, response is ok', async () => {
  const log = mock.method(console, 'log', () => {})
  const res = await handleContact(post(GOOD_BODY), makeEnv({ RESEND_API_KEY: '', CONTACT_DRY_RUN: '1' }))
  assert.equal(res.status, 200)
  assert.ok(!fetchCalls.some((c) => c.url.includes('resend')))
  assert.equal(log.mock.callCount(), 1)
})

test('success path never logs the body, visitor email or secrets', async () => {
  const log = mock.method(console, 'log', () => {})
  const err = mock.method(console, 'error', () => {})
  const warn = mock.method(console, 'warn', () => {})
  await handleContact(post(GOOD_BODY), makeEnv())
  await handleContact(post({ ...GOOD_BODY, email: 'bad' }), makeEnv())
  for (const spy of [log, err, warn]) {
    const all = spy.mock.calls.map((c) => c.arguments.map(String).join(' ')).join('\n')
    assert.ok(!all.includes('ada@example.com'))
    assert.ok(!all.includes('good-token'))
    assert.ok(!all.includes('Hello Mitchell'))
  }
})

test('every response carries no-store, nosniff and a JSON content type', async () => {
  const cases: Request[] = [
    new Request(URL_, { method: 'GET' }),
    post(GOOD_BODY, { Origin: 'https://evil.example' }),
    post(GOOD_BODY, { 'Content-Type': 'text/plain' }),
    post(null, {}, '{bad'),
    post({ ...GOOD_BODY, email: 'x' }),
    post(GOOD_BODY),
  ]
  for (const req of cases) assertHardened(await handleContact(req, makeEnv()))
})

test('non-api paths are passed to ASSETS untouched', async () => {
  const req = new Request(`${ORIGIN}/about/`)
  const res = await worker.fetch(req, makeEnv())
  assert.equal(res.status, 200)
  assert.equal(await res.text(), '<html>asset</html>')
  assert.equal(assetCalls.length, 1)
  assert.equal(assetCalls[0], req)
  assert.equal(fetchCalls.length, 0)
})

test('only the exact /api/contact path reaches the handler', async () => {
  const get = await worker.fetch(new Request(URL_), makeEnv())
  assert.equal(get.status, 405)
  assert.equal(assetCalls.length, 0)
  for (const path of ['/api/contact/', '/api/contacts', '/API/contact']) {
    const res = await worker.fetch(new Request(`${ORIGIN}${path}`), makeEnv())
    assert.equal(res.status, 200, path) // handed to ASSETS
  }
  assert.equal(assetCalls.length, 3)
})

test('worker.fetch routes POST /api/contact to the handler', async () => {
  const res = await worker.fetch(post(GOOD_BODY), makeEnv())
  assert.equal(res.status, 200)
  assert.deepEqual(await json(res), { ok: true })
})
