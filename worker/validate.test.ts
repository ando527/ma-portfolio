import { test } from 'node:test'
import assert from 'node:assert/strict'
import { validateContact, isHoneypotTripped } from './validate.ts'
import type { ValidationResult } from './validate.ts'
import { SITE_TYPES, BUDGETS, TIMELINES, SOURCES } from '../src/lib/contact-schema.ts'

function valid(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    siteType: 'webflow',
    budget: '5k-10k',
    message: 'Hello there, I need a website.',
    ...overrides,
  }
}

function errorsOf(result: ValidationResult): Record<string, string> {
  assert.equal(result.ok, false, 'expected validation to fail')
  return result.ok ? {} : (result.errors as Record<string, string>)
}

function valueOf(result: ValidationResult) {
  assert.equal(result.ok, true, 'expected validation to pass: ' + JSON.stringify(result))
  if (!result.ok) throw new Error('unreachable')
  return result.value
}

test('accepts a valid submission and trims whitespace', () => {
  const v = valueOf(
    validateContact({
      name: '  Ada ',
      email: ' ada@example.com ',
      siteType: ' webflow ',
      budget: ' 5k-10k ',
      message: '  Hello there, I need a site.  ',
    }),
  )
  assert.deepEqual(v, {
    name: 'Ada',
    email: 'ada@example.com',
    siteType: 'webflow',
    budget: '5k-10k',
    message: 'Hello there, I need a site.',
  })
})

test('optional fields are omitted (key absent) when missing, undefined or blank', () => {
  for (const extra of [{}, { company: undefined, timeline: undefined, source: undefined, currentSite: undefined }, { company: '  ', timeline: '', source: '   ', currentSite: ' ' }]) {
    const v = valueOf(validateContact(valid(extra)))
    for (const key of ['company', 'timeline', 'source', 'currentSite']) {
      assert.equal(key in v, false, `${key} should be absent`)
    }
  }
})

test('accepts all optional fields when valid', () => {
  const v = valueOf(
    validateContact(valid({ company: ' Acme Pty Ltd ', timeline: 'asap', source: 'linkedin', currentSite: 'https://acme.com.au/about' })),
  )
  assert.equal(v.company, 'Acme Pty Ltd')
  assert.equal(v.timeline, 'asap')
  assert.equal(v.source, 'linkedin')
  assert.equal(v.currentSite, 'https://acme.com.au/about')
})

test('rejects non-object input', () => {
  for (const raw of [null, [], 'x', 42, undefined, true]) {
    const errors = errorsOf(validateContact(raw))
    for (const key of ['name', 'email', 'siteType', 'budget', 'message']) {
      assert.ok(errors[key], `${String(raw)} should give an error for ${key}`)
    }
  }
})

test('rejects non-string required fields', () => {
  const errors = errorsOf(validateContact({ name: 1, email: {}, siteType: 3, budget: [], message: [] }))
  for (const key of ['name', 'email', 'siteType', 'budget', 'message']) assert.ok(errors[key], key)
})

test('rejects missing required fields with the exact copy', () => {
  const errors = errorsOf(validateContact({}))
  assert.equal(errors.name, 'Enter your name.')
  assert.equal(errors.email, 'Enter a valid email address.')
  assert.equal(errors.siteType, 'Choose the type of website.')
  assert.equal(errors.budget, 'Choose a budget range.')
  assert.equal(errors.message, 'Message needs to be at least 10 characters.')
})

test('enforces length limits', () => {
  assert.equal(errorsOf(validateContact(valid({ name: 'a'.repeat(101) }))).name, 'Name is too long (max 100 characters).')
  valueOf(validateContact(valid({ name: 'a'.repeat(100) })))

  assert.equal(errorsOf(validateContact(valid({ email: 'a'.repeat(250) + '@b.co' }))).email, 'Enter a valid email address.')
  const exact254 = 'a'.repeat(254 - '@b.co'.length) + '@b.co'
  assert.equal(exact254.length, 254)
  valueOf(validateContact(valid({ email: exact254 })))
  assert.ok(errorsOf(validateContact(valid({ email: 'a' + exact254 }))).email)

  assert.equal(errorsOf(validateContact(valid({ message: 'a'.repeat(9) }))).message, 'Message needs to be at least 10 characters.')
  assert.equal(errorsOf(validateContact(valid({ message: 'a'.repeat(5001) }))).message, 'Message is too long (max 5000 characters).')
  valueOf(validateContact(valid({ message: 'a'.repeat(10) })))
  valueOf(validateContact(valid({ message: 'a'.repeat(5000) })))

  assert.equal(errorsOf(validateContact(valid({ company: 'a'.repeat(101) }))).company, 'Company name is too long (max 100 characters).')
  valueOf(validateContact(valid({ company: 'a'.repeat(100) })))
})

test('rejects emails without a domain dot, with spaces, or with unsafe characters', () => {
  for (const email of ['a@b', 'a b@c.com', '@c.com', 'a@.com', 'a@b.', 'a@@b.com']) {
    assert.equal(errorsOf(validateContact(valid({ email }))).email, 'Enter a valid email address.', email)
  }
  for (const email of ['a<b@c.com', 'a"b@c.com', "a'b@c.com", 'a(b)@c.com', 'a,b@c.com', 'a;b@c.com', 'a:b@c.com', 'a\\b@c.com', 'a[b]@c.com', 'a@b>.com', 'a@b.c"d']) {
    assert.ok(errorsOf(validateContact(valid({ email }))).email, email)
  }
  assert.equal(valueOf(validateContact(valid({ email: 'a+tag@sub.example.com.au' }))).email, 'a+tag@sub.example.com.au')
})

test('rejects CR/LF in name, email and company (header injection)', () => {
  assert.ok(errorsOf(validateContact(valid({ name: 'Ada\r\nBcc: x@y.com' }))).name)
  assert.ok(errorsOf(validateContact(valid({ name: 'Ada\nx' }))).name)
  assert.ok(errorsOf(validateContact(valid({ email: 'a@b.com\nBcc: x@y.com' }))).email)
  assert.ok(errorsOf(validateContact(valid({ email: 'a@b.com\r\nBcc: x@y.com' }))).email)
  assert.equal(errorsOf(validateContact(valid({ company: 'Acme\r\nBcc: x@y.com' }))).company, "Company name can't contain line breaks.")
  assert.ok(errorsOf(validateContact(valid({ company: 'Acme\nInc' }))).company)
})

test('allows newlines in message, normalised to \\n', () => {
  assert.equal(valueOf(validateContact(valid({ message: 'line1\r\nline2' }))).message, 'line1\nline2')
  assert.equal(valueOf(validateContact(valid({ message: 'line1\rline2 and more' }))).message, 'line1\nline2 and more')
  assert.equal(valueOf(validateContact(valid({ message: 'para one\n\npara two' }))).message, 'para one\n\npara two')
})

test('accepts non-Latin and emoji text', () => {
  const v = valueOf(
    validateContact(valid({ name: '田中 太郎', company: '株式会社テスト', message: 'こんにちは 👋 I need a website for my cafe.' })),
  )
  assert.equal(v.name, '田中 太郎')
  assert.equal(v.company, '株式会社テスト')
  assert.equal(v.message, 'こんにちは 👋 I need a website for my cafe.')
})

const enumFields = [
  { key: 'siteType', list: SITE_TYPES, error: 'Choose the type of website.', required: true },
  { key: 'budget', list: BUDGETS, error: 'Choose a budget range.', required: true },
  { key: 'timeline', list: TIMELINES, error: 'Choose one of the options.', required: false },
  { key: 'source', list: SOURCES, error: 'Choose one of the options.', required: false },
] as const

for (const { key, list, error } of enumFields) {
  test(`${key}: accepts every listed value, rejects unknown values and wrong types`, () => {
    for (const choice of list) {
      assert.equal(valueOf(validateContact(valid({ [key]: choice.value })))[key], choice.value)
    }
    for (const bad of ['nope', 'WEBFLOW', 'webflow ,x', list[0].label, '__proto__', 'constructor', 'toString']) {
      assert.equal(errorsOf(validateContact(valid({ [key]: bad })))[key], error, bad)
    }
    for (const bad of [1, true, {}, [], [list[0].value], null]) {
      assert.equal(errorsOf(validateContact(valid({ [key]: bad })))[key], error, JSON.stringify(bad))
    }
  })
}

test('currentSite: bare domain gets https:// and a normalised href', () => {
  assert.equal(valueOf(validateContact(valid({ currentSite: 'example.com' }))).currentSite, 'https://example.com/')
  assert.equal(valueOf(validateContact(valid({ currentSite: '  www.example.com.au/shop?a=1 ' }))).currentSite, 'https://www.example.com.au/shop?a=1')
  assert.equal(valueOf(validateContact(valid({ currentSite: 'http://example.com' }))).currentSite, 'http://example.com/')
  assert.equal(valueOf(validateContact(valid({ currentSite: 'HTTPS://Example.COM/Path' }))).currentSite, 'https://example.com/Path')
})

test('currentSite: rejects dangerous, malformed or non-public values', () => {
  const bad = [
    'javascript:alert(1)',
    'JavaScript:alert(1)',
    'javascript://example.com/%0aalert(1)',
    'data:text/html,<script>alert(1)</script>',
    'vbscript:msgbox(1)',
    'ftp://example.com',
    'file:///etc/passwd',
    'http://user:pass@x.com',
    'http://user@x.com',
    'not a url',
    'localhost',
    'http://localhost:3000',
    'http://[::1]/',
    'example.com\nBcc: x@y.com',
    'exam\r\nple.com',
    'exa mple.com',
    'a.',
    '.com',
    'https://',
    'https://example.com/' + 'a'.repeat(200),
  ]
  for (const currentSite of bad) {
    assert.equal(errorsOf(validateContact(valid({ currentSite }))).currentSite, 'Enter a valid web address, like example.com.', JSON.stringify(currentSite))
  }
  for (const currentSite of [5, true, {}, [], null]) {
    assert.equal(errorsOf(validateContact(valid({ currentSite }))).currentSite, 'Enter a valid web address, like example.com.')
  }
})

test('currentSite: stored href can never contain quotes, angle brackets or spaces', () => {
  const v = valueOf(validateContact(valid({ currentSite: 'https://example.com/"onmouseover="alert(1)<b>' })))
  assert.ok(v.currentSite)
  assert.doesNotMatch(v.currentSite, /["'<>\s]/)
  assert.match(v.currentSite, /^https?:\/\//)
})

test('currentSite: final href length is capped at 200', () => {
  const ok = 'https://example.com/' + 'a'.repeat(180)
  assert.equal(ok.length, 200)
  assert.equal(valueOf(validateContact(valid({ currentSite: ok }))).currentSite, ok)
  assert.ok(errorsOf(validateContact(valid({ currentSite: ok + 'a' }))).currentSite)
})

test('collects every field error at once', () => {
  const errors = errorsOf(validateContact({ name: '', email: 'x', siteType: 'x', budget: 'x', message: 'x', company: 1, timeline: 'x', source: 'x', currentSite: 'x' }))
  assert.deepEqual(Object.keys(errors).sort(), ['budget', 'company', 'currentSite', 'email', 'message', 'name', 'siteType', 'source', 'timeline'])
})

test('ignores unknown keys (turnstileToken, website) in the result', () => {
  const v = valueOf(validateContact(valid({ turnstileToken: 'abc', website: '', extra: 1 })))
  assert.deepEqual(Object.keys(v).sort(), ['budget', 'email', 'message', 'name', 'siteType'])
})

test('honeypot detection', () => {
  assert.equal(isHoneypotTripped({ website: 'http://spam' }), true)
  assert.equal(isHoneypotTripped({ website: '' }), false)
  assert.equal(isHoneypotTripped({}), false)
  assert.equal(isHoneypotTripped(null), false)
  assert.equal(isHoneypotTripped({ website: 5 }), false)
  assert.equal(isHoneypotTripped([]), false)
  assert.equal(isHoneypotTripped('website'), false)
})
