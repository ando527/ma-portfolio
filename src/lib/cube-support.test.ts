// Tests for the cube's browser capability check. Run with `npm run test:cube`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { cubeSupportFromFacts, detectCubeSupport, type CubeSupportFacts } from './cube-support.ts'

const ALL: CubeSupportFacts = { preserve3d: true, perspective: true, backfaceHidden: true, transform3dApplied: true }

test('all facts true → true', () => {
  assert.equal(cubeSupportFromFacts(ALL), true)
})

for (const key of ['preserve3d', 'perspective', 'backfaceHidden', 'transform3dApplied'] as const) {
  test(`${key} false on its own → false`, () => {
    assert.equal(cubeSupportFromFacts({ ...ALL, [key]: false }), false)
  })
}

test('deviceMemoryGB below 1 → false, 1 or undefined → true', () => {
  assert.equal(cubeSupportFromFacts({ ...ALL, deviceMemoryGB: 0.5 }), false)
  assert.equal(cubeSupportFromFacts({ ...ALL, deviceMemoryGB: 1 }), true)
  assert.equal(cubeSupportFromFacts({ ...ALL, deviceMemoryGB: undefined }), true)
})

test('detectCubeSupport is false outside a browser', () => {
  assert.equal(detectCubeSupport(), false)
})
