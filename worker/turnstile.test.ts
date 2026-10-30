import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'
import { verifyTurnstile } from './turnstile.ts'

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
})

test('returns true when siteverify says success', async () => {
  stub(async () => Response.json({ success: true }))
  assert.equal(await verifyTurnstile('tok', 'sec', '203.0.113.9'), true)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify')
  assert.equal(calls[0].init?.method, 'POST')
  const body = new URLSearchParams(String(calls[0].init?.body))
  assert.equal(body.get('secret'), 'sec')
  assert.equal(body.get('response'), 'tok')
  assert.equal(body.get('remoteip'), '203.0.113.9')
})

test('omits remoteip when there is no ip', async () => {
  stub(async () => Response.json({ success: true }))
  assert.equal(await verifyTurnstile('tok', 'sec', null), true)
  assert.equal(new URLSearchParams(String(calls[0].init?.body)).has('remoteip'), false)
})

test('returns false when success is false', async () => {
  stub(async () => Response.json({ success: false, 'error-codes': ['timeout-or-duplicate'] }))
  assert.equal(await verifyTurnstile('tok', 'sec', null), false)
})

test('only a literal true counts as success', async () => {
  for (const body of [{ success: 'true' }, { success: 1 }, {}, [], null, 'yes']) {
    stub(async () => Response.json(body))
    assert.equal(await verifyTurnstile('tok', 'sec', null), false, JSON.stringify(body))
  }
})

test('fails closed when fetch throws', async () => {
  stub(async () => {
    throw new Error('network down')
  })
  assert.equal(await verifyTurnstile('tok', 'sec', null), false)
})

test('fails closed on non-JSON or non-200 response', async () => {
  stub(async () => new Response('oops', { status: 500 }))
  assert.equal(await verifyTurnstile('tok', 'sec', null), false)
  stub(async () => new Response('not json', { status: 200 }))
  assert.equal(await verifyTurnstile('tok', 'sec', null), false)
  // Even a body that says success is ignored on a non-2xx status.
  stub(async () => Response.json({ success: true }, { status: 500 }))
  assert.equal(await verifyTurnstile('tok', 'sec', null), false)
})

test('rejects empty, oversized or non-string tokens without calling fetch', async () => {
  stub(async () => Response.json({ success: true }))
  assert.equal(await verifyTurnstile('', 'sec', null), false)
  assert.equal(await verifyTurnstile('x'.repeat(2049), 'sec', null), false)
  assert.equal(await verifyTurnstile(undefined as unknown as string, 'sec', null), false)
  assert.equal(await verifyTurnstile('tok', '', null), false)
  assert.equal(calls.length, 0)
})

test('accepts a token of exactly 2048 characters', async () => {
  stub(async () => Response.json({ success: true }))
  assert.equal(await verifyTurnstile('x'.repeat(2048), 'sec', null), true)
})
