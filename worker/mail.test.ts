import { test, beforeEach, afterEach, mock } from 'node:test'
import assert from 'node:assert/strict'
import { buildSubject, buildEmailText, buildEmailHtml, escapeHtml, sendContactEmail } from './mail.ts'
import { validateContact } from './validate.ts'
import type { ContactInput } from './validate.ts'

const SENT_AT = new Date('2026-10-30T02:15:00Z') // 12:15pm Friday in Brisbane (UTC+10, no DST)

const FULL: ContactInput = {
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  company: 'Analytical Engines Pty Ltd',
  siteType: 'webflow',
  budget: '5k-10k',
  timeline: '1-3-months',
  source: 'linkedin',
  currentSite: 'https://example.com/shop',
  message: 'Hi Mitchell,\n\nI need a new site for my cafe.\nCan we talk this week?',
}

const MINIMAL: ContactInput = {
  name: 'Bob',
  email: 'bob@example.com',
  siteType: 'unsure',
  budget: 'unsure',
  message: 'Just a short message here.',
}

function make(overrides: Partial<ContactInput>): ContactInput {
  return { ...FULL, ...overrides }
}

const realFetch = globalThis.fetch
let calls: { url: string; init?: RequestInit }[] = []

function stub(impl: () => Promise<Response>) {
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({ url: String(input), init })
    return impl()
  }) as typeof fetch
}

beforeEach(() => {
  calls = []
})
afterEach(() => {
  globalThis.fetch = realFetch
  mock.restoreAll()
})

// ---------------------------------------------------------------- escapeHtml

test('escapeHtml escapes & < > " and apostrophes', () => {
  assert.equal(escapeHtml(`<a href="x" title='y'>&</a>`), '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;')
  assert.equal(escapeHtml('plain 田中 👋'), 'plain 田中 👋')
})

// ------------------------------------------------------------------- subject

test('buildSubject starts with the fixed prefix and includes the labels', () => {
  const s = buildSubject(FULL)
  assert.ok(s.startsWith('New enquiry from '))
  assert.equal(s, 'New enquiry from Ada Lovelace · Webflow website · $5k to $10k')
})

test('buildSubject strips control characters', () => {
  const s = buildSubject(make({ name: 'Ada\r\nBcc: x@y.com\t\u0000\u007Fend' }))
  assert.doesNotMatch(s, /[\u0000-\u001F\u007F]/)
  assert.doesNotMatch(s, /[\r\n]/)
  assert.ok(s.startsWith('New enquiry from Ada Bcc: x@y.com end'))
})

test('buildSubject caps length at 120 and truncates the name, keeping the labels', () => {
  const s = buildSubject(make({ name: 'A'.repeat(100), siteType: 'ecommerce', budget: '10k-plus' }))
  assert.ok(s.length <= 120, `length ${s.length}`)
  assert.ok(s.startsWith('New enquiry from AAAA'))
  assert.ok(s.endsWith(' · Shopify / e-commerce store · $10k+'))
})

test('buildSubject never splits an emoji when truncating', () => {
  const s = buildSubject(make({ name: '👋'.repeat(100) }))
  assert.ok(s.length <= 120)
  assert.doesNotMatch(s, /[\uD800-\uDBFF](?![\uDC00-\uDFFF])/) // no lone high surrogate
  assert.doesNotMatch(s, /(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/) // no lone low surrogate
})

// ---------------------------------------------------------------------- text

test('buildEmailText includes every field, the message verbatim, and the Brisbane time', () => {
  const t = buildEmailText(FULL, SENT_AT)
  for (const piece of [
    'Ada Lovelace',
    'ada@example.com',
    'Analytical Engines Pty Ltd',
    'https://example.com/shop',
    'Webflow website',
    '$5k to $10k',
    'In 1 to 3 months',
    'LinkedIn',
    FULL.message,
    'Brisbane time',
    'mitchellanderson.com.au',
  ]) {
    assert.ok(t.includes(piece), `text should include ${piece}`)
  }
  assert.match(t, /Friday, 30 October 2026/)
  assert.match(t, /12:15\s?pm/i)
})

test('buildEmailText shows "Not given" for missing optional values and preserves emoji and CJK', () => {
  const t = buildEmailText(make({ name: '田中 太郎', company: undefined, timeline: undefined, source: undefined, currentSite: undefined, message: 'こんにちは 👋 I need a website.' }), SENT_AT)
  assert.ok(t.includes('田中 太郎'))
  assert.ok(t.includes('こんにちは 👋 I need a website.'))
  assert.match(t, /Timeline:\s+Not given/)
  assert.match(t, /Found me via:\s+Not given/)
  assert.doesNotMatch(t, /Company:/)
})

// ---------------------------------------------------------------------- html

test('buildEmailHtml is a well-formed email shell', () => {
  const h = buildEmailHtml(FULL, SENT_AT)
  assert.match(h, /^<!doctype html>/i)
  assert.ok(h.includes('<html lang="en-AU"'))
  assert.ok(h.includes('<meta name="color-scheme" content="light">'))
  assert.ok(h.includes('<meta name="supported-color-schemes" content="light">'))
  assert.ok(h.includes('role="presentation"'))
  assert.ok(h.includes('NEW ENQUIRY'))
  assert.ok(h.includes('Ada Lovelace'))
  assert.ok(h.includes('Analytical Engines Pty Ltd'))
  assert.ok(h.includes('Webflow website'))
  assert.ok(h.includes('$5k to $10k'))
  assert.ok(h.includes('In 1 to 3 months'))
  assert.ok(h.includes('LinkedIn'))
  assert.ok(h.includes('Reply to Ada'))
  assert.ok(h.includes('(Brisbane time)'))
  assert.ok(h.includes('Sent from the contact form on mitchellanderson.com.au'))
  assert.ok(h.includes('#7C1D2E'))
  // Message newlines become <br> after escaping.
  assert.ok(h.includes('Hi Mitchell,<br><br>I need a new site for my cafe.<br>Can we talk this week?'))
})

test('buildEmailHtml links: mailto is encoded, current site is the validated URL', () => {
  const h = buildEmailHtml(FULL, SENT_AT)
  assert.ok(h.includes('href="mailto:ada%40example.com?subject=Re%3A%20your%20enquiry"'))
  assert.ok(h.includes('href="https://example.com/shop"'))
  assert.ok(h.includes('>example.com/shop</a>'))
  const hrefs = [...h.matchAll(/href="([^"]*)"/g)].map((m) => m[1])
  for (const href of hrefs) assert.match(href, /^(mailto:|https?:\/\/)/, href)
})

test('buildEmailHtml shows "Not given" and omits the website row when optional fields are missing', () => {
  const h = buildEmailHtml(MINIMAL, SENT_AT)
  assert.equal((h.match(/Not given/g) ?? []).length, 2) // timeline + source
  assert.ok(!h.includes('Current website'))
  assert.ok(!h.includes('Analytical'))
  assert.ok(h.includes('Reply to Bob'))
})

test('buildEmailHtml has a hidden preheader from the message, escaped and padded', () => {
  const h = buildEmailHtml(make({ message: '<b>Hello</b> there, '.repeat(20) }), SENT_AT)
  const m = h.match(/<div style="display:none[^"]*">([\s\S]*?)<\/div>/)
  assert.ok(m, 'preheader div present')
  assert.ok(m[1].startsWith('&lt;b&gt;Hello&lt;/b&gt; there,'))
  assert.ok(m[1].includes('&zwnj;&nbsp;'))
  assert.doesNotMatch(m[1], /<b>/)
})

const PAYLOADS = ['<img src=x onerror=alert(1)>', '"><script>alert(1)</script>', "'><svg onload=alert(1)>"]

for (const payload of PAYLOADS) {
  test(`HTML-escapes hostile name, company and message: ${payload}`, () => {
    const h = buildEmailHtml(make({ name: payload, company: payload, message: `${payload} and more text` }), SENT_AT)
    assert.ok(!h.includes('<img src=x'), 'raw <img> must not appear')
    assert.ok(!h.includes('<script>alert'), 'raw <script> must not appear')
    assert.ok(!h.includes('<svg onload'), 'raw <svg> must not appear')
    assert.ok(!h.includes(payload), 'payload must never appear verbatim')
    assert.ok(!/<[a-z]+[^>]*\sonerror\s*=/i.test(h), 'no element may carry onerror')
    assert.ok(h.includes(escapeHtml(payload)), 'escaped payload should appear')
    // The only <script>-like tag text allowed is none at all.
    assert.ok(!/<script/i.test(h))
  })
}

test('hostile values cannot break out of attributes', () => {
  // The validator rejects these emails; prove the builder is still safe if one ever got through.
  const evil = make({ email: 'a"onmouseover="alert(1)@b.co', currentSite: 'https://example.com/"onmouseover="alert(1)' })
  const h = buildEmailHtml(evil, SENT_AT)
  assert.ok(!h.includes('"onmouseover="'))
  assert.ok(!/\sonmouseover=/.test(h))
})

test('hostile name cannot reach the title, preheader or button', () => {
  const h = buildEmailHtml(make({ name: '"><script>alert(1)</script>' }), SENT_AT)
  assert.ok(!/<script/i.test(h))
  assert.ok(h.includes('<title>New enquiry from &quot;&gt;&lt;script&gt;'))
})

test('a validated javascript: address can never become an href', () => {
  const r = validateContact({ name: 'Eve', email: 'eve@example.com', siteType: 'custom', budget: 'unsure', message: 'Hello, this is a test.', currentSite: 'javascript:alert(1)' })
  assert.equal(r.ok, false)
  const h = buildEmailHtml(MINIMAL, SENT_AT)
  assert.ok(!/href="javascript:/i.test(h))
})

test('emoji and CJK survive intact in the HTML and text', () => {
  const input = make({ name: '田中 太郎', company: '株式会社テスト', message: 'こんにちは 👋\n2行目 🚀' })
  const h = buildEmailHtml(input, SENT_AT)
  const t = buildEmailText(input, SENT_AT)
  for (const piece of ['田中 太郎', '株式会社テスト', 'こんにちは 👋', '2行目 🚀']) {
    assert.ok(h.includes(piece), `html: ${piece}`)
    assert.ok(t.includes(piece), `text: ${piece}`)
  }
  assert.ok(h.includes('Reply to 田中'))
})

test('long unbroken strings are given word-break rules', () => {
  const h = buildEmailHtml(make({ message: 'A'.repeat(500) }), SENT_AT)
  assert.ok(h.includes('word-break:break-word'))
  assert.ok(h.includes('overflow-wrap:anywhere'))
})

// ---------------------------------------------------------------------- send

const ENV = { RESEND_API_KEY: 're_secret_key_123', CONTACT_TO: 'owner@example.net', CONTACT_FROM: 'Site <contact@mail.example.net>' }

test('sends to CONTACT_TO with reply_to set to the visitor, html and text, no cc/bcc', async () => {
  stub(async () => Response.json({ id: 'x' }))
  await sendContactEmail(ENV, FULL)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://api.resend.com/emails')
  assert.equal(calls[0].init?.method, 'POST')
  const headers = new Headers(calls[0].init?.headers)
  assert.equal(headers.get('authorization'), 'Bearer re_secret_key_123')
  assert.equal(headers.get('content-type'), 'application/json')
  const body = JSON.parse(String(calls[0].init?.body))
  assert.equal(body.to, 'owner@example.net')
  assert.equal(body.from, 'Site <contact@mail.example.net>')
  assert.equal(body.reply_to, 'ada@example.com')
  assert.equal(body.subject, buildSubject(FULL))
  assert.ok(body.html.startsWith('<!doctype html>'))
  assert.ok(body.text.includes('Ada Lovelace'))
  assert.equal('cc' in body, false)
  assert.equal('bcc' in body, false)
})

test('throws on non-2xx, naming the status but not the key or the upstream body', async () => {
  for (const status of [429, 500, 422]) {
    stub(async () => new Response('{"message":"upstream said re_secret_key_123 is bad"}', { status }))
    await assert.rejects(
      () => sendContactEmail(ENV, FULL),
      (err: unknown) => {
        assert.ok(err instanceof Error)
        assert.ok(err.message.includes(String(status)))
        assert.ok(!err.message.includes('re_secret_key_123'))
        assert.ok(!err.message.includes('upstream said'))
        return true
      },
    )
  }
})

test('propagates network errors', async () => {
  stub(async () => {
    throw new Error('boom')
  })
  await assert.rejects(() => sendContactEmail(ENV, FULL))
})

test('dry run logs one line with the subject only and does not call fetch', async () => {
  stub(async () => {
    throw new Error('fetch must not be called')
  })
  const log = mock.method(console, 'log', () => {})
  await sendContactEmail({ ...ENV, CONTACT_DRY_RUN: '1' }, FULL)
  assert.equal(calls.length, 0)
  assert.equal(log.mock.callCount(), 1)
  const line = String(log.mock.calls[0].arguments.join(' '))
  assert.ok(line.includes(buildSubject(FULL)))
  assert.ok(!line.includes('ada@example.com'))
  assert.ok(!line.includes('new site for my cafe'))
  assert.ok(!line.includes('owner@example.net'))
})
