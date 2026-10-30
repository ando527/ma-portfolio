'use client'

import {
  Component,
  useEffect,
  useId,
  useImperativeHandle,
  useReducer,
  useRef,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from 'react'
import { btnPrimary, btnSecondary } from '@/components/ui/button'
import { detectCubeSupport } from '@/lib/cube-support'
import {
  FACELET_GEOMETRY,
  FACES,
  distanceToSolved,
  isSolved,
  makeScramble,
  needsReset,
  press,
  type ButtonTurns,
  type ColourName,
  type ColourScheme,
  type CubeState,
  type Scramble,
  type TurnFace,
} from '@/lib/cube'
import '@/app/cube.css'

// A small Rubik's cube "solve me" step for the contact form. It is a playful
// UX layer, NOT a security control: it runs only in the browser, nothing about
// it is sent to the server, and a bot can skip it. Invisible Turnstile is the
// real check. So whenever the cube can't run (no 3D support, an exception, a
// frustrated visitor) it steps aside and reports 'skipped'.

export type CubeStatus = 'detecting' | 'pending' | 'solved' | 'skipped'

interface Props {
  onStatusChange: (status: CubeStatus) => void
  /** Filled with a handle whose focus() moves focus into the puzzle (first turn button, or the heading while it loads). */
  sendFocusRef?: Ref<{ focus: () => void }>
}

// ── Camera ───────────────────────────────────────────────────────────────────
// True isometric is rotateX(-35.264deg) rotateY(-45deg): top, front-left and
// right faces equally visible, with the U/R/F corner dead centre. Adding the
// offset to both angles orbits the camera a little lower and further round to
// the front, which moves that corner up and to the right of centre. Top and
// right faces stay at about 74% and 90% of their isometric area.
// If the corner ends up on the wrong side, flip the sign of the offset on the
// axis that's wrong (pitch = up/down, yaw = left/right).
const ISO_PITCH_DEG = -35.264
const ISO_YAW_DEG = -45
const VIEW_OFFSET_DEG = 10
const VIEW_PITCH_DEG = ISO_PITCH_DEG + VIEW_OFFSET_DEG
const VIEW_YAW_DEG = ISO_YAW_DEG + VIEW_OFFSET_DEG

/** Length of one animated quarter turn. */
const TURN_MS = 250
/** After this many resets the cube steps aside. */
const MAX_RESETS = 3

const WARN_TEXT = 'That moved the cube further from solved. Press Reset to try again.'

// ── Facelet → cubie mapping ──────────────────────────────────────────────────
// Each of the 27 cubies (x, y, z in -1..1; x right, y up, z front, as in
// cube.ts) has six faces. A face on the outside of the cube shows the sticker
// whose FACELET_GEOMETRY entry has that cubie and normal; inner faces are plain
// black (they show through the gap while a layer turns). `dir` names the CSS
// face transform in cube.css.
const DIRS = [
  { dir: 'px', n: [1, 0, 0] },
  { dir: 'nx', n: [-1, 0, 0] },
  { dir: 'py', n: [0, 1, 0] },
  { dir: 'ny', n: [0, -1, 0] },
  { dir: 'pz', n: [0, 0, 1] },
  { dir: 'nz', n: [0, 0, -1] },
] as const

interface Cubie {
  key: string
  pos: readonly [number, number, number]
  /** Sticker index (into CubeState) for each of DIRS, or -1 for an inner face. */
  stickers: readonly number[]
}

const CUBIES: readonly Cubie[] = (() => {
  const index = new Map(FACELET_GEOMETRY.map((g, i) => [`${g.pos.join()}|${g.normal.join()}`, i]))
  const list: Cubie[] = []
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        const pos = [x, y, z] as const
        list.push({
          key: pos.join(),
          pos,
          stickers: DIRS.map(d => index.get(`${pos.join()}|${d.n.join()}`) ?? -1),
        })
      }
  return list
})()

/** The cubies that move when a face turns. */
const inLayer = (face: TurnFace, pos: readonly number[]) => (face === 'U' ? pos[1] === 1 : pos[0] === 1)

// ── Puzzle state ─────────────────────────────────────────────────────────────
// The model (`state`) changes the moment a button is pressed, so no press is
// ever lost or applied twice. The animation only decides how it's drawn: while
// `anim` is set, the cube is drawn from `anim.from` (the state before that
// press) with the turning layer rotating towards the new state. A press during
// an animation simply starts a new one from the current model, which snaps the
// old turn to its end.

interface Anim {
  id: number
  face: TurnFace
  /** Which way the layer rotates: the button's quarter turns (1 clockwise, 3 anticlockwise). */
  turns: 1 | 3
  from: CubeState
}

interface Puzzle {
  scramble: Scramble
  startDistance: number
  state: CubeState
  best: number
  warn: boolean
  resets: number
  anim: Anim | null
  /** Counts presses, so every animation gets a fresh id. */
  seq: number
  /** Live-region text; n changes on every announcement so repeats are re-read. */
  announce: { text: string; n: number }
}

type Model = { phase: 'detecting' } | { phase: 'unsupported' } | ({ phase: 'ready' } & Puzzle)

type Action =
  | { type: 'start'; scramble: Scramble }
  | { type: 'unsupported' }
  | { type: 'press'; face: TurnFace; animate: boolean }
  | { type: 'animEnd'; id: number }
  | { type: 'reset' }

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)
const distanceOr = (s: CubeState, buttons: ButtonTurns) => distanceToSolved(s, buttons) ?? Infinity

function reducer(m: Model, a: Action): Model {
  if (a.type === 'start') {
    // Only ever once, so the scramble never changes under the visitor.
    if (m.phase !== 'detecting') return m
    const d = distanceOr(a.scramble.state, a.scramble.buttons)
    return {
      phase: 'ready',
      scramble: a.scramble,
      startDistance: d,
      state: a.scramble.state,
      best: d,
      warn: false,
      resets: 0,
      anim: null,
      seq: 0,
      announce: { text: '', n: 0 },
    }
  }
  if (a.type === 'unsupported') return m.phase === 'detecting' ? { phase: 'unsupported' } : m
  if (m.phase !== 'ready') return m
  const locked = isSolved(m.state) || m.resets >= MAX_RESETS

  switch (a.type) {
    case 'press': {
      if (locked) return m
      const next = press(m.state, a.face, m.scramble.buttons)
      const before = distanceOr(m.state, m.scramble.buttons)
      const after = distanceOr(next, m.scramble.buttons)
      const best = Math.min(m.best, after)
      const solved = isSolved(next)
      // Warn when the press left the cube too far from the visitor's best;
      // a press that gets closer clears it.
      const warn = !solved && after >= before && needsReset(best, next, m.scramble.buttons)
      const turned = `${capitalise(m.scramble.scheme[a.face])} face turned.`
      return {
        ...m,
        state: next,
        best,
        warn,
        seq: m.seq + 1,
        anim: a.animate ? { id: m.seq + 1, face: a.face, turns: m.scramble.buttons[a.face], from: m.state } : null,
        announce: {
          text: solved ? `${turned} Cube solved.` : warn ? `${turned} ${WARN_TEXT}` : turned,
          n: m.announce.n + 1,
        },
      }
    }
    case 'animEnd':
      return m.anim && m.anim.id === a.id ? { ...m, anim: null } : m
    case 'reset':
      if (locked) return m
      return {
        ...m,
        state: m.scramble.state,
        best: m.startDistance,
        warn: false,
        resets: m.resets + 1,
        anim: null,
        announce: { text: 'Cube reset.', n: m.announce.n + 1 },
      }
  }
}

function statusOf(m: Model): CubeStatus {
  if (m.phase === 'detecting') return 'detecting'
  if (m.phase === 'unsupported') return 'skipped'
  if (m.resets >= MAX_RESETS) return 'skipped'
  return isSolved(m.state) ? 'solved' : 'pending'
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  } catch {
    return false
  }
}

// ── Drawing ──────────────────────────────────────────────────────────────────

function CubieView({ cubie, state, scheme }: { cubie: Cubie; state: CubeState; scheme: ColourScheme }) {
  const [x, y, z] = cubie.pos
  // CSS's y axis points down, the model's up.
  const style = { '--x': x, '--y': -y, '--z': z } as CSSProperties
  return (
    <div className="cubie" style={style}>
      {DIRS.map((d, i) => {
        const sticker = cubie.stickers[i]
        return (
          <div key={d.dir} className="cubie-face" data-dir={d.dir}>
            {sticker >= 0 && <div className="cube-sticker" data-c={scheme[FACES[state[sticker]]]} />}
          </div>
        )
      })}
    </div>
  )
}

function CubeView({
  state,
  anim,
  scheme,
  onAnimEnd,
}: {
  state: CubeState
  anim: Anim | null
  scheme: ColourScheme
  onAnimEnd: (id: number) => void
}) {
  const shown = anim ? anim.from : state
  const still = anim ? CUBIES.filter(c => !inLayer(anim.face, c.pos)) : CUBIES
  const turning = anim ? CUBIES.filter(c => inLayer(anim.face, c.pos)) : []
  const camera = { transform: `rotateX(${VIEW_PITCH_DEG}deg) rotateY(${VIEW_YAW_DEG}deg)` }
  return (
    <div className="cube-model" style={camera}>
      {still.map(c => (
        <CubieView key={c.key} cubie={c} state={shown} scheme={scheme} />
      ))}
      {anim && (
        <div
          key={anim.id}
          className="cube-layer"
          data-face={anim.face}
          data-turns={anim.turns}
          onAnimationEnd={e => {
            if (e.target === e.currentTarget) onAnimEnd(anim.id)
          }}
        >
          {turning.map(c => (
            <CubieView key={c.key} cubie={c} state={shown} scheme={scheme} />
          ))}
        </div>
      )}
    </div>
  )
}

function ResetIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="w-4 h-4 flex-none" fill="none" stroke="currentColor" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

// Turn buttons: the shared secondary style, a little tighter so two fit side
// by side in a narrow form. Reset is quieter until the cube needs it.
const turnBtn = `${btnSecondary.replace('px-6', 'px-4')} w-full aria-disabled:opacity-50 aria-disabled:cursor-not-allowed`
const resetQuiet =
  'inline-flex items-center justify-center gap-2 h-12 px-4 rounded-full font-sans font-semibold text-[15px] leading-6 text-muted-foreground hover:text-primary hover:bg-maroon-50 transition-colors duration-200 aria-disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:hover:bg-transparent'

// ── The puzzle ───────────────────────────────────────────────────────────────

function Puzzle({ onStatusChange, sendFocusRef }: Props) {
  const [model, dispatch] = useReducer(reducer, { phase: 'detecting' } as Model)
  const headingId = useId()
  const hintId = useId()
  const headingRef = useRef<HTMLParagraphElement>(null)
  const firstTurnRef = useRef<HTMLButtonElement>(null)
  const doneRef = useRef<HTMLParagraphElement>(null)

  // The caller may pass a new function every render; keep the latest in a ref
  // so it never re-triggers the effects below. (Declared first: effects run in
  // order, so it's current before the status effect uses it.)
  const onStatusRef = useRef(onStatusChange)
  useEffect(() => {
    onStatusRef.current = onStatusChange
  })

  // Feature check and scramble happen after mount, never during render, so the
  // static HTML and the first client render match.
  useEffect(() => {
    dispatch(detectCubeSupport() ? { type: 'start', scramble: makeScramble() } : { type: 'unsupported' })
  }, [])

  const status = statusOf(model)
  useEffect(() => {
    onStatusRef.current(status)
  }, [status])

  // The 3rd reset replaces the puzzle (and the focused Reset button) with a
  // one-line message; move focus there rather than losing it to <body>.
  const escaped = status === 'skipped' && model.phase === 'ready'
  useEffect(() => {
    if (!escaped) return
    const active = document.activeElement
    if (!active || active === document.body) doneRef.current?.focus()
  }, [escaped])

  // Fallback in case animationend never fires (hidden tab, animation blocked).
  const animId = model.phase === 'ready' ? model.anim?.id : undefined
  useEffect(() => {
    if (animId === undefined) return
    const t = window.setTimeout(() => dispatch({ type: 'animEnd', id: animId }), TURN_MS + 150)
    return () => window.clearTimeout(t)
  }, [animId])

  useImperativeHandle(
    sendFocusRef,
    () => ({
      focus() {
        const target = firstTurnRef.current ?? doneRef.current ?? headingRef.current
        target?.focus()
      },
    }),
    [],
  )

  if (model.phase === 'unsupported') return null

  const live = (
    <p key="live" className="sr-only" aria-live="polite" aria-atomic="true">
      {model.phase === 'ready' && model.announce.text}
      {/* An invisible change so the same words twice in a row are re-announced. */}
      {model.phase === 'ready' && model.announce.n % 2 === 1 ? ' ' : ''}
    </p>
  )

  if (escaped) {
    return (
      <div className="cube-captcha">
        <p ref={doneRef} tabIndex={-1} className="font-sans text-[15px] text-foreground">
          All good, you can send your message.
        </p>
        {live}
      </div>
    )
  }

  const ready = model.phase === 'ready' ? model : null
  const solved = ready ? isSolved(ready.state) : false
  const faces: TurnFace[] = ['U', 'R'] // top face's button first, right face's second
  const colourOf = (face: TurnFace): ColourName => (ready ? ready.scramble.scheme[face] : 'white')

  return (
    <div className="cube-captcha" role="group" aria-labelledby={headingId} aria-describedby={hintId}>
      <p id={headingId} ref={headingRef} tabIndex={-1} className="font-heading font-bold text-lg leading-snug text-foreground">
        Verify you&apos;re human: solve the cube
      </p>
      <p id={hintId} className="mt-1 font-sans text-[15px] leading-6 text-muted-foreground">
        Turn the faces until each side is a single colour.
      </p>

      <div className="cube-body mt-5">
        <div className="cube-stage" aria-hidden="true" style={{ '--cube-turn-ms': `${TURN_MS}ms` } as CSSProperties}>
          {ready && (
            <CubeView
              state={ready.state}
              anim={ready.anim}
              scheme={ready.scramble.scheme}
              onAnimEnd={id => dispatch({ type: 'animEnd', id })}
            />
          )}
        </div>

        <div className="cube-controls">
          {ready ? (
            <>
              <div className="cube-turns">
                {faces.map((face, i) => {
                  const colour = colourOf(face)
                  return (
                    <button
                      key={face}
                      ref={i === 0 ? firstTurnRef : undefined}
                      type="button"
                      className={turnBtn}
                      aria-disabled={solved || undefined}
                      onClick={() => dispatch({ type: 'press', face, animate: !prefersReducedMotion() })}
                    >
                      <span className="cube-swatch" data-c={colour} aria-hidden />
                      <span>Turn {colour} face</span>
                    </button>
                  )
                })}
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  className={ready.warn ? btnPrimary : resetQuiet}
                  aria-disabled={solved || undefined}
                  onClick={() => dispatch({ type: 'reset' })}
                >
                  <ResetIcon />
                  Reset
                </button>
              </div>
            </>
          ) : (
            // Same heights as the real controls, so nothing moves when they appear.
            <div aria-hidden="true">
              <div className="cube-turns">
                <div className="h-12" />
                <div className="h-12" />
              </div>
              <div className="mt-3 h-12" />
            </div>
          )}
          <p className="mt-2 min-h-12 font-sans text-[15px] leading-6">
            {solved ? (
              <span className="font-semibold text-[#166534]">Solved. You&apos;re verified.</span>
            ) : ready?.warn ? (
              <span className="text-primary">{WARN_TEXT}</span>
            ) : null}
          </p>
        </div>
      </div>
      {live}
    </div>
  )
}

// ── Error boundary ───────────────────────────────────────────────────────────
// Anything that throws inside the cube removes it and reports 'skipped', so the
// form around it keeps working.

class CubeErrorBoundary extends Component<{ children: ReactNode; onStatusChange: Props['onStatusChange'] }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    try {
      this.props.onStatusChange('skipped')
    } catch {
      // The form's own handler failing must not take the page down either.
    }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * The contact form's "solve the cube" step. Reports its status through
 * onStatusChange: 'detecting' until it knows whether it can run, then
 * 'pending', and finally 'solved' or 'skipped' (no 3D support, an error, or
 * three resets). Purely cosmetic; never send its result to the server.
 */
export default function RubiksCaptcha({ onStatusChange, sendFocusRef }: Props) {
  return (
    <CubeErrorBoundary onStatusChange={onStatusChange}>
      <Puzzle onStatusChange={onStatusChange} sendFocusRef={sendFocusRef} />
    </CubeErrorBoundary>
  )
}
