import { test } from 'node:test'
import assert from 'node:assert/strict'
import { SITE_TYPES, BUDGETS, TIMELINES, SOURCES, LIMITS, labelFor } from './contact-schema.ts'

const lists = { SITE_TYPES, BUDGETS, TIMELINES, SOURCES }

for (const [name, list] of Object.entries(lists)) {
  test(`${name} has unique values and non-empty labels`, () => {
    assert.ok(list.length > 0)
    const values = list.map((c) => c.value)
    assert.equal(new Set(values).size, values.length, 'values must be unique')
    for (const c of list) {
      assert.ok(c.value.length > 0, 'value must not be empty')
      assert.ok(c.label.trim().length > 0, `label for ${c.value} must not be empty`)
    }
  })
}

test('labelFor returns the label for a valid value', () => {
  assert.equal(labelFor(SITE_TYPES, 'webflow'), 'Webflow website')
  assert.equal(labelFor(BUDGETS, '10k-plus'), '$10k+')
  assert.equal(labelFor(SOURCES, 'cubing'), 'The speedcubing community')
})

test('labelFor returns undefined for unknown or missing values', () => {
  assert.equal(labelFor(SITE_TYPES, 'nope'), undefined)
  assert.equal(labelFor(BUDGETS, ''), undefined)
  assert.equal(labelFor(TIMELINES, undefined), undefined)
  assert.equal(labelFor(SOURCES, 'Search'), undefined)
})

test('LIMITS are sane', () => {
  assert.ok(LIMITS.message.min < LIMITS.message.max)
  assert.ok(LIMITS.body > LIMITS.message.max)
})
