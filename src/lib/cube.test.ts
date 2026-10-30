// Tests for the cube model. Run with `npm run test:cube` (node --test).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  SOLVED,
  FACELET_GEOMETRY,
  distanceToSolved,
  isSolved,
  makeScramble,
  needsReset,
  press,
  randomScheme,
  turn,
  type ButtonTurns,
  type CubeState,
  type ColourName,
  type ColourScheme,
  type FaceName,
} from './cube.ts'

/** Small seeded PRNG (mulberry32) so the random tests are repeatable. */
function seeded(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const SAMPLE: CubeState = turn(turn(turn(SOLVED, 'U', 1), 'R', 3), 'U', 2)

test('SOLVED has 9 of each sticker and isSolved(SOLVED)', () => {
  assert.equal(SOLVED.length, 54)
  for (let s = 0; s < 6; s++) {
    assert.equal(SOLVED.filter(x => x === s).length, 9, `sticker ${s}`)
  }
  assert.equal(isSolved(SOLVED), true)
})

test('four turns of either face is the identity', () => {
  assert.deepEqual(turn(SOLVED, 'U', 4), SOLVED)
  assert.deepEqual(turn(SOLVED, 'R', 4), SOLVED)
  assert.deepEqual(turn(SAMPLE, 'U', 1), turn(SAMPLE, 'U', -3))
  assert.deepEqual(turn(SAMPLE, 'R', 1), turn(SAMPLE, 'R', -3))
  assert.deepEqual(turn(SAMPLE, 'U', 2), turn(turn(SAMPLE, 'U', 1), 'U', 1))
  assert.deepEqual(turn(SAMPLE, 'U', 0), SAMPLE)
})

test('U clockwise moves the right face\'s top row onto the front face', () => {
  const s = turn(SOLVED, 'U', 1)
  assert.deepEqual([s[18], s[19], s[20]], [1, 1, 1])
  for (let i = 0; i < 9; i++) assert.equal(s[i], 0)
})

test('R clockwise moves the front face\'s right column onto the top face', () => {
  const s = turn(SOLVED, 'R', 1)
  assert.deepEqual([s[2], s[5], s[8]], [2, 2, 2])
  for (let i = 9; i < 18; i++) assert.equal(s[i], 1)
})

test('press turns the face by the given button quarter turns', () => {
  const buttons: ButtonTurns = { U: 3, R: 1 }
  assert.deepEqual(press(SAMPLE, 'U', buttons), turn(SAMPLE, 'U', 3))
  assert.deepEqual(press(SAMPLE, 'R', buttons), turn(SAMPLE, 'R', 1))
  assert.deepEqual(turn(press(SAMPLE, 'R', buttons), 'R', -1), SAMPLE)
  const flipped: ButtonTurns = { U: 1, R: 3 }
  assert.deepEqual(press(SAMPLE, 'U', flipped), turn(SAMPLE, 'U', 1))
  assert.deepEqual(press(SAMPLE, 'R', flipped), turn(SAMPLE, 'R', 3))
})

test('the sequence U then R has order 105', () => {
  let s: CubeState = SOLVED
  let n = 0
  do {
    s = turn(turn(s, 'U', 1), 'R', 1)
    n++
  } while (!isSolved(s) && n < 1000)
  assert.equal(n, 105)
})

test('isSolved is false after any single turn and true after undoing it', () => {
  for (const face of ['U', 'R'] as const) {
    for (const k of [1, 2, 3]) {
      const s = turn(SOLVED, face, k)
      assert.equal(isSolved(s), false, `${face}${k}`)
      assert.equal(isSolved(turn(s, face, -k)), true, `${face}${k} undone`)
    }
  }
})

test('turn does not mutate its input', () => {
  const before = [...SAMPLE]
  turn(SAMPLE, 'R', 1)
  press(SAMPLE, 'U', { U: 1, R: 1 })
  assert.deepEqual([...SAMPLE], before)
})

// The renderer places stickers using FACELET_GEOMETRY. These checks prove that
// table agrees with the permutation tables: rotating a sticker's cubie and
// normal by a real 3D quarter turn must land it where turn() puts it.
test('FACELET_GEOMETRY matches the turn permutations', () => {
  assert.equal(FACELET_GEOMETRY.length, 54)
  const key = (p: readonly number[], n: readonly number[]) => `${p.join()}|${n.join()}`
  const index = new Map(FACELET_GEOMETRY.map((g, i) => [key(g.pos, g.normal), i]))
  assert.equal(index.size, 54)
  // Clockwise quarter turns as rotations of (x right, y up, z front).
  const rotU = ([x, y, z]: readonly number[]) => [-z, y, x]
  const rotR = ([x, y, z]: readonly number[]) => [x, z, -y]
  for (const [face, rot, inLayer] of [
    ['U', rotU, (p: readonly number[]) => p[1] === 1],
    ['R', rotR, (p: readonly number[]) => p[0] === 1],
  ] as const) {
    // Give every sticker a unique label so the permutation is fully visible.
    const labelled = Array.from({ length: 54 }, (_, i) => i) as unknown as CubeState
    const after = turn(labelled, face, 1)
    FACELET_GEOMETRY.forEach((g, i) => {
      const dest = inLayer(g.pos) ? index.get(key(rot(g.pos), rot(g.normal))) : i
      assert.equal(after[dest!], i, `${face}: sticker ${i}`)
    })
  }
})

const OPPOSITE: Record<ColourName, ColourName> = {
  white: 'yellow', yellow: 'white', red: 'orange', orange: 'red', green: 'blue', blue: 'green',
}
// Each colour's direction in the standard scheme (x right, y up, z front).
const DIR: Record<ColourName, readonly number[]> = {
  white: [0, 1, 0], yellow: [0, -1, 0], red: [1, 0, 0], orange: [-1, 0, 0], green: [0, 0, 1], blue: [0, 0, -1],
}
const cross = (a: readonly number[], b: readonly number[]) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
]

test('randomScheme: 24 distinct schemes, all proper rotations', () => {
  const rand = seeded(1)
  const seen = new Map<string, ColourScheme>()
  for (let i = 0; i < 10000 && seen.size < 24; i++) {
    const s = randomScheme(rand)
    seen.set(JSON.stringify(s), s)
  }
  assert.equal(seen.size, 24)
  for (const s of seen.values()) {
    const faces: FaceName[] = ['U', 'R', 'F', 'D', 'L', 'B']
    assert.equal(new Set(faces.map(f => s[f])).size, 6)
    assert.equal(s.D, OPPOSITE[s.U])
    assert.equal(s.L, OPPOSITE[s.R])
    assert.equal(s.B, OPPOSITE[s.F])
    // Proper rotation (not a mirror image): R = U x F, as in the solved cube.
    assert.deepEqual(cross(DIR[s.U], DIR[s.F]).map(v => v + 0), [...DIR[s.R]])
  }
  const find = (u: ColourName, f: ColourName) =>
    [...seen.values()].find(s => s.U === u && s.F === f)
  assert.equal(find('white', 'green')?.R, 'red')
  assert.equal(find('white', 'red')?.R, 'blue')
  assert.equal(find('yellow', 'green')?.R, 'orange')
})

test('randomScheme survives rand() returning exactly 0 or 1', () => {
  assert.equal(new Set(Object.values(randomScheme(() => 0))).size, 6)
  assert.equal(new Set(Object.values(randomScheme(() => 1))).size, 6)
  assert.equal(new Set(Object.values(randomScheme(() => 0.999999999))).size, 6)
})

test('makeScramble is deterministic for a given rand', () => {
  assert.deepEqual(makeScramble(seeded(42)), makeScramble(seeded(42)))
})

test('makeScramble: 2,000 scrambles are unsolved and exactly two presses from solved', () => {
  const rand = seeded(7)
  const turnsSeen = new Set<number>()
  const ordersSeen = new Set<string>()
  for (let i = 0; i < 2000; i++) {
    const { moves, state, scheme, buttons } = makeScramble(rand)
    assert.notEqual(moves[0].face, moves[1].face, 'move faces differ')
    assert.ok(moves.every(m => m.turns === 1 || m.turns === 3), 'quarter turns only')
    assert.equal(isSolved(state), false)
    assert.equal(Object.keys(scheme).length, 6)
    // state is exactly the two moves applied to SOLVED.
    assert.deepEqual(state, turn(turn(SOLVED, moves[0].face, moves[0].turns), moves[1].face, moves[1].turns))
    // Each button undoes its face's scramble move.
    for (const m of moves) assert.equal(buttons[m.face], 4 - m.turns, `button ${m.face}`)
    assert.equal(distanceToSolved(state, buttons), 2)
    turnsSeen.add(moves[0].turns).add(moves[1].turns)
    ordersSeen.add(moves[0].face + moves[1].face)
    // Solution: the second move's face first, then the first move's face.
    const afterFirst = press(state, moves[1].face, buttons)
    assert.equal(distanceToSolved(afterFirst, buttons), 1)
    assert.equal(needsReset(2, afterFirst, buttons), false)
    assert.equal(isSolved(press(afterFirst, moves[0].face, buttons)), true)
    // Wrong order: U and R don't commute, so this moves further away.
    const wrong = press(state, moves[0].face, buttons)
    const dWrong = distanceToSolved(wrong, buttons)
    assert.ok(dWrong === null || dWrong > 2, `wrong-order distance ${dWrong}`)
    assert.equal(needsReset(2, wrong, buttons), true)
  }
  assert.deepEqual([...turnsSeen].sort(), [1, 3])
  assert.deepEqual([...ordersSeen].sort(), ['RU', 'UR'])
})

test('makeScramble produces all four button combinations', () => {
  const rand = seeded(11)
  const seen = new Set<string>()
  for (let i = 0; i < 500; i++) {
    const { buttons } = makeScramble(rand)
    seen.add(`${buttons.U}${buttons.R}`)
  }
  assert.deepEqual([...seen].sort(), ['11', '13', '31', '33'])
})

test('distanceToSolved: SOLVED is 0, one press away is 1, a state deeper than 12 is null', () => {
  for (const buttons of [{ U: 1, R: 1 }, { U: 1, R: 3 }, { U: 3, R: 1 }, { U: 3, R: 3 }] as const) {
    assert.equal(distanceToSolved(SOLVED, buttons), 0)
    // Undoing one press (the opposite quarter turn) leaves one press to go.
    assert.equal(distanceToSolved(turn(SOLVED, 'U', -buttons.U), buttons), 1)
    assert.equal(distanceToSolved(turn(SOLVED, 'R', -buttons.R), buttons), 1)
  }
  // Pressing the other way round takes three presses.
  assert.equal(distanceToSolved(turn(SOLVED, 'R', 1), { U: 3, R: 3 }), 1)
  assert.equal(distanceToSolved(turn(SOLVED, 'R', 1), { U: 3, R: 1 }), 3)
  let deep: CubeState = SOLVED
  for (let i = 0; i < 10; i++) deep = turn(turn(deep, 'U', 1), 'R', 2)
  assert.equal(distanceToSolved(deep, { U: 3, R: 1 }), null)
})

test('needsReset follows the best distance', () => {
  const buttons: ButtonTurns = { U: 3, R: 1 }
  // Scramble: U clockwise then R anticlockwise. The buttons (U anticlockwise, R clockwise) undo it.
  const start = turn(turn(SOLVED, 'U', 1), 'R', 3)
  assert.equal(distanceToSolved(start, buttons), 2)
  assert.equal(needsReset(2, start, buttons), false)

  // Right order: R first gets closer, then U solves.
  const right1 = press(start, 'R', buttons)
  assert.equal(distanceToSolved(right1, buttons), 1)
  assert.equal(needsReset(2, right1, buttons), false)
  assert.equal(isSolved(press(right1, 'U', buttons)), true)

  // Wrong first press (U) moves further away.
  const wrong1 = press(start, 'U', buttons)
  assert.equal(needsReset(2, wrong1, buttons), true)

  // A state deeper than the BFS limit always needs a reset.
  let deep: CubeState = SOLVED
  for (let i = 0; i < 10; i++) deep = turn(turn(deep, 'U', 1), 'R', 2)
  assert.equal(needsReset(6, deep, buttons), true)
})
