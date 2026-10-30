// The Rubik's cube model behind the contact form's "solve the cube" check.
//
// This is a playful UX layer only, not a security control: it runs entirely in
// the browser, a bot can skip it by posting straight to /api/contact, and the
// server never sees or trusts its result. The real check is Turnstile.
//
// No imports and only erasable TypeScript, so `node --test` can run it as is.

export type FaceName = 'U' | 'R' | 'F' | 'D' | 'L' | 'B'
/** The only faces that ever turn. */
export type TurnFace = 'U' | 'R'
export type ColourName = 'white' | 'yellow' | 'red' | 'orange' | 'green' | 'blue'
/** Which face (U, R, F, D, L, B order) this sticker belongs to when solved. */
export type Sticker = 0 | 1 | 2 | 3 | 4 | 5
/**
 * 54 stickers in the standard Kociemba facelet order: U 0-8, R 9-17, F 18-26,
 * D 27-35, L 36-44, B 45-53. Each face is read row by row as seen from outside
 * the cube, with U at the top for R/F/L/B, B at the top for U and F at the top
 * for D (see FACE_LAYOUT below).
 */
export type CubeState = readonly Sticker[]
export type ColourScheme = Record<FaceName, ColourName>
export interface Scramble {
  /** Applied to SOLVED in order. turns = clockwise quarter turns (1 cw, 2 half, 3 ccw); faces always differ. */
  moves: readonly [{ face: TurnFace; turns: 1 | 2 | 3 }, { face: TurnFace; turns: 1 | 2 | 3 }]
  state: CubeState
  scheme: ColourScheme
}

export const FACES: readonly FaceName[] = ['U', 'R', 'F', 'D', 'L', 'B']

export const SOLVED: CubeState = Array.from({ length: 54 }, (_, i) => Math.floor(i / 9) as Sticker)

/** What one button press does: a quarter turn clockwise. The only place the direction is chosen. */
const PRESS_QUARTER_TURNS = 1

// One clockwise quarter turn (looking at the face from outside) as a facelet
// permutation: next[i] = state[PERM[i]]. These are the standard U and R moves
// for the Kociemba layout; FACELET_GEOMETRY's test re-derives them from 3D.
const PERM: Record<TurnFace, readonly number[]> = {
  U: [
    6, 3, 0, 7, 4, 1, 8, 5, 2, // U face rotates
    45, 46, 47, 12, 13, 14, 15, 16, 17, // R top row <- B top row
    9, 10, 11, 21, 22, 23, 24, 25, 26, // F top row <- R top row
    27, 28, 29, 30, 31, 32, 33, 34, 35, // D untouched
    18, 19, 20, 39, 40, 41, 42, 43, 44, // L top row <- F top row
    36, 37, 38, 48, 49, 50, 51, 52, 53, // B top row <- L top row
  ],
  R: [
    0, 1, 20, 3, 4, 23, 6, 7, 26, // U right column <- F right column
    15, 12, 9, 16, 13, 10, 17, 14, 11, // R face rotates
    18, 19, 29, 21, 22, 32, 24, 25, 35, // F right column <- D right column
    27, 28, 51, 30, 31, 48, 33, 34, 45, // D right column <- B left column (reversed)
    36, 37, 38, 39, 40, 41, 42, 43, 44, // L untouched
    8, 46, 47, 5, 49, 50, 2, 52, 53, // B left column <- U right column (reversed)
  ],
}

// Where each face's stickers sit in 3D, for the renderer. Axes: x right, y up,
// z front (towards the viewer of F). pos(row, col) gives the cubie for the
// sticker at that row/column of the face as listed in CubeState's order.
const FACE_LAYOUT: Record<FaceName, { normal: readonly [number, number, number]; pos: (r: number, c: number) => [number, number, number] }> = {
  U: { normal: [0, 1, 0], pos: (r, c) => [c - 1, 1, r - 1] }, // row 0 at the back
  R: { normal: [1, 0, 0], pos: (r, c) => [1, 1 - r, 1 - c] }, // col 0 at the front
  F: { normal: [0, 0, 1], pos: (r, c) => [c - 1, 1 - r, 1] },
  D: { normal: [0, -1, 0], pos: (r, c) => [c - 1, -1, 1 - r] }, // row 0 at the front
  L: { normal: [-1, 0, 0], pos: (r, c) => [-1, 1 - r, c - 1] }, // col 0 at the back
  B: { normal: [0, 0, -1], pos: (r, c) => [1 - c, 1 - r, -1] }, // col 0 on the right
}

export interface FaceletGeometry {
  face: FaceName
  /** The cubie this sticker is on, each coordinate -1, 0 or 1. */
  pos: readonly [number, number, number]
  /** The direction the sticker faces. */
  normal: readonly [number, number, number]
}

/** FACELET_GEOMETRY[i] is where sticker i of a CubeState sits on the cube. */
export const FACELET_GEOMETRY: readonly FaceletGeometry[] = FACES.flatMap(face =>
  Array.from({ length: 9 }, (_, k) => ({
    face,
    pos: FACE_LAYOUT[face].pos(Math.floor(k / 3), k % 3),
    normal: FACE_LAYOUT[face].normal,
  })),
)

/** Turns a face by any number of clockwise quarter turns (negative = anticlockwise). */
export function turn(state: CubeState, face: TurnFace, clockwiseQuarterTurns: number): CubeState {
  const n = ((clockwiseQuarterTurns % 4) + 4) % 4
  const perm = PERM[face]
  let s = state
  for (let k = 0; k < n; k++) {
    const prev = s
    s = perm.map(j => prev[j])
  }
  return s === state ? [...state] : s
}

/** What a turn button does. */
export function press(state: CubeState, face: TurnFace): CubeState {
  return turn(state, face, PRESS_QUARTER_TURNS)
}

export function isSolved(state: CubeState): boolean {
  for (let i = 0; i < 54; i++) if (state[i] !== state[i - (i % 9)]) return false
  return true
}

/** A whole number in [0, n), safe even if rand() returns exactly 1. */
function pick(rand: () => number, n: number): number {
  const i = Math.floor(rand() * n)
  return i >= n ? n - 1 : i < 0 ? 0 : i
}

// Each colour's direction on the standard cube (white U, red R, green F, yellow
// D, orange L, blue B), as x/y/z.
const COLOUR_DIR: Record<ColourName, readonly [number, number, number]> = {
  white: [0, 1, 0],
  yellow: [0, -1, 0],
  red: [1, 0, 0],
  orange: [-1, 0, 0],
  green: [0, 0, 1],
  blue: [0, 0, -1],
}
const COLOURS = Object.keys(COLOUR_DIR) as ColourName[]

function colourAt(dir: readonly number[]): ColourName {
  const c = COLOURS.find(name => COLOUR_DIR[name].every((v, i) => v === dir[i]))
  if (!c) throw new Error('not a face direction')
  return c
}

const neg = (v: readonly number[]) => v.map(x => -x || 0)

/**
 * One of the 24 ways to hold a standard cube. Picks the colour on U, then the
 * colour on F from the four next to it. R follows from U x F, which keeps the
 * handedness of a real cube (a mirror image could never be solved).
 */
export function randomScheme(rand: () => number = Math.random): ColourScheme {
  const U = COLOURS[pick(rand, 6)]
  const u = COLOUR_DIR[U]
  const around = COLOURS.filter(c => COLOUR_DIR[c].every((v, i) => v * u[i] === 0))
  const F = around[pick(rand, around.length)]
  const f = COLOUR_DIR[F]
  const r = [u[1] * f[2] - u[2] * f[1], u[2] * f[0] - u[0] * f[2], u[0] * f[1] - u[1] * f[0]]
  return {
    U,
    R: colourAt(r),
    F,
    D: colourAt(neg(u)),
    L: colourAt(neg(r)),
    B: colourAt(neg(f)),
  }
}

/** Two random turns of U and R (in random order) from solved, on a random colour scheme. */
export function makeScramble(rand: () => number = Math.random): Scramble {
  const first: TurnFace = pick(rand, 2) === 0 ? 'U' : 'R'
  const second: TurnFace = first === 'U' ? 'R' : 'U'
  const t0 = (pick(rand, 3) + 1) as 1 | 2 | 3
  const t1 = (pick(rand, 3) + 1) as 1 | 2 | 3
  const moves = [
    { face: first, turns: t0 },
    { face: second, turns: t1 },
  ] as const
  return {
    moves,
    state: turn(turn(SOLVED, first, t0), second, t1),
    scheme: randomScheme(rand),
  }
}

const MAX_DEPTH = 12
let distances: Map<string, number> | null = null

/**
 * Fewest button presses that solve the cube, or null if more than 12. Built
 * once on first use: breadth-first from SOLVED undoing a press (an
 * anticlockwise quarter of U or R) at each step, about 8,000 states.
 */
export function distanceToSolved(state: CubeState): number | null {
  if (!distances) {
    const map = new Map<string, number>([[SOLVED.join(','), 0]])
    let frontier: CubeState[] = [SOLVED]
    for (let depth = 1; depth <= MAX_DEPTH; depth++) {
      const next: CubeState[] = []
      for (const s of frontier) {
        for (const face of ['U', 'R'] as const) {
          const t = turn(s, face, -PRESS_QUARTER_TURNS)
          const key = t.join(',')
          if (!map.has(key)) {
            map.set(key, depth)
            next.push(t)
          }
        }
      }
      frontier = next
    }
    distances = map
  }
  return distances.get(state.join(',')) ?? null
}

/** True when the visitor has wandered more than one press further than their best so far. */
export function needsReset(bestDistance: number, current: CubeState): boolean {
  const d = distanceToSolved(current)
  return d === null || d > bestDistance + 1
}
