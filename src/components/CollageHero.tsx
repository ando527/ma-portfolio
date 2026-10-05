'use client'

import { useEffect, useRef, useState } from 'react'
import type { ImageData } from '@/lib/types'

// ── Slot definitions ──────────────────────────────────────────────────────────
// Spread across the full width (left 0–86%).
// depth controls how strongly the slot reacts to mouse parallax.

const SLOTS = [
  // Far-left column
  { top:  4, left:  0, w: 14, rot: -4, dur:  9, delay: 0.0, aspect: '3/4', depth: 0.6 },
  { top: 52, left:  1, w: 12, rot:  3, dur: 11, delay: 2.5, aspect: '4/3', depth: 0.4 },
  // Left-centre column
  { top:  6, left: 17, w: 13, rot: -2, dur:  8, delay: 1.2, aspect: '4/3', depth: 0.9 },
  { top: 55, left: 16, w: 15, rot:  2, dur: 10, delay: 3.4, aspect: '3/4', depth: 0.7 },
  // Centre-left column
  { top:  2, left: 33, w: 14, rot:  3, dur: 12, delay: 0.8, aspect: '3/4', depth: 1.0 },
  { top: 50, left: 32, w: 13, rot: -3, dur:  9, delay: 4.1, aspect: '4/3', depth: 1.2 },
  // Centre column
  { top:  8, left: 49, w: 15, rot: -1, dur:  8, delay: 1.6, aspect: '3/4', depth: 0.8 },
  { top: 57, left: 48, w: 13, rot:  2, dur: 11, delay: 2.0, aspect: '4/3', depth: 0.5 },
  // Centre-right column
  { top:  3, left: 65, w: 14, rot:  4, dur: 10, delay: 0.4, aspect: '3/4', depth: 1.1 },
  { top: 50, left: 64, w: 15, rot: -2, dur:  9, delay: 3.0, aspect: '4/3', depth: 0.9 },
  // Far-right column
  { top:  6, left: 81, w: 13, rot:  2, dur: 11, delay: 1.8, aspect: '3/4', depth: 0.7 },
  { top: 54, left: 82, w: 12, rot: -3, dur:  8, delay: 2.8, aspect: '4/3', depth: 0.6 },
] as const

// Mobile: 8 slots in 2 rows × 4 columns, each bigger, spread across the section height
const MOBILE_SLOTS = [
  // Row 1 — upper band
  { top: 12, left:  2, w: 24, rot: -3, dur:  9, delay: 0.0, aspect: '3/4', depth: 0.6 },
  { top: 11, left: 27, w: 24, rot:  2, dur: 11, delay: 1.5, aspect: '4/3', depth: 0.7 },
  { top: 13, left: 53, w: 23, rot: -2, dur:  8, delay: 0.8, aspect: '3/4', depth: 0.8 },
  { top: 10, left: 74, w: 24, rot:  3, dur: 10, delay: 2.0, aspect: '4/3', depth: 0.9 },
  // Row 2 — lower band
  { top: 44, left:  3, w: 24, rot:  3, dur: 10, delay: 2.5, aspect: '4/3', depth: 0.7 },
  { top: 42, left: 29, w: 24, rot: -3, dur:  9, delay: 3.5, aspect: '3/4', depth: 0.8 },
  { top: 45, left: 55, w: 23, rot:  2, dur: 11, delay: 1.0, aspect: '4/3', depth: 0.6 },
  { top: 43, left: 75, w: 23, rot: -2, dur:  8, delay: 2.8, aspect: '3/4', depth: 0.9 },
] as const

const SWAP_INTERVAL = 2800
const FADE_DURATION = 700
const LERP          = 0.055   // smoothness of parallax follow
const SETTLED       = 0.001   // stop the parallax loop once this close to the target
// Slots are 12–15% of the viewport on desktop, ~24% on phones.
const SIZES         = '(min-width: 768px) 15vw, 25vw'

// ── Component ─────────────────────────────────────────────────────────────────

export default function CollageHero({ images }: { images: ImageData[] }) {
  const initialAssign = SLOTS.map((_, i) => images[i % images.length])

  const [assigned, setAssigned] = useState<ImageData[]>(initialAssign)
  const [fading,   setFading]   = useState<Set<number>>(new Set())

  const rootRef     = useRef<HTMLDivElement>(null)
  const swapQueue   = useRef<number[]>([])
  const assignedRef = useRef(initialAssign)
  const mouseRefs   = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => { assignedRef.current = assigned }, [assigned])

  // ── Image swap loop: only while on screen, the tab is visible, and the
  //    visitor hasn't asked for reduced motion ────────────────────────────────
  useEffect(() => {
    const root = rootRef.current
    if (!root || images.length <= SLOTS.length / 2) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')

    let timer: ReturnType<typeof setInterval> | undefined
    let onScreen = false
    const timeouts = new Set<ReturnType<typeof setTimeout>>()

    const swapOne = () => {
      if (swapQueue.current.length === 0) {
        // Only swap slots that are showing at this screen size.
        const visible = window.matchMedia('(min-width: 768px)').matches ? SLOTS.length : MOBILE_SLOTS.length
        swapQueue.current = Array.from({ length: visible }, (_, i) => i).sort(() => Math.random() - 0.5)
      }

      const slotIdx = swapQueue.current.pop()!
      const current = assignedRef.current
      const others  = images.filter(img => !current.includes(img))
      const next    = others.length > 0
        ? others[Math.floor(Math.random() * others.length)]
        : images[(images.indexOf(current[slotIdx]) + 1) % images.length]

      // Start loading the next photo while the old one fades out, and only
      // swap once it's decoded, so it never pops in half-loaded.
      const pre = new Image()
      pre.sizes = SIZES
      if (next.srcSet) pre.srcset = next.srcSet
      pre.src = next.src
      const ready = pre.decode().catch(() => undefined)

      setFading(prev => new Set(prev).add(slotIdx))
      const t = setTimeout(async () => {
        timeouts.delete(t)
        await ready
        setAssigned(prev => { const a = [...prev]; a[slotIdx] = next; return a })
        setFading(prev => { const s = new Set(prev); s.delete(slotIdx); return s })
      }, FADE_DURATION)
      timeouts.add(t)
    }

    const sync = () => {
      const run = onScreen && document.visibilityState === 'visible' && !reduce.matches
      if (run && !timer) timer = setInterval(swapOne, SWAP_INTERVAL)
      if (!run && timer) { clearInterval(timer); timer = undefined }
    }

    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync() })
    io.observe(root)
    document.addEventListener('visibilitychange', sync)
    reduce.addEventListener('change', sync)

    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
      reduce.removeEventListener('change', sync)
      if (timer) clearInterval(timer)
      timeouts.forEach(clearTimeout)
    }
  }, [images])

  // ── Mouse parallax: runs only while the photos are catching up to the
  //    cursor, and not at all on touch screens or with reduced motion ────────
  useEffect(() => {
    const fine   = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduce.matches) return

    const mouse   = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let raf = 0

    const tick = () => {
      current.x += (mouse.x - current.x) * LERP
      current.y += (mouse.y - current.y) * LERP
      const { x, y } = current
      const mag = Math.min(Math.sqrt(x * x + y * y), 1)

      mouseRefs.current.forEach((el, i) => {
        if (!el) return
        const d  = SLOTS[i].depth
        const tx = x * d * 14          // max ~14 px horizontal
        const ty = y * d * 9           // max ~9 px vertical
        const sc = 1 + mag * d * 0.022 // max ~2 % scale
        el.style.transform = `translate(${tx}px, ${ty}px) scale(${sc})`
      })

      const settled = Math.abs(mouse.x - current.x) < SETTLED && Math.abs(mouse.y - current.y) < SETTLED
      raf = settled ? 0 : requestAnimationFrame(tick)
    }

    const onMove = (e: MouseEvent) => {
      mouse.x = (e.clientX / window.innerWidth  - 0.5) * 2   // -1 → 1
      mouse.y = (e.clientY / window.innerHeight - 0.5) * 2
      if (!raf) raf = requestAnimationFrame(tick)
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  if (images.length === 0) return null

  return (
    <div ref={rootRef} className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>

      {/* Gradient: protects the bottom-left text area */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, #FDF7F7 0%, rgba(253,247,247,0.82) 22%, rgba(253,247,247,0.35) 48%, rgba(253,247,247,0.08) 80%, transparent 100%)',
        }}
      />
      {/* Bottom fade so the heading pops off cleanly */}
      <div
        className="absolute bottom-0 inset-x-0 z-10 pointer-events-none"
        style={{ height: '30%', background: 'linear-gradient(to top, #FDF7F7 0%, transparent 100%)' }}
      />

      {/* Photo slots. Desktop and mobile positions are both set as CSS
          variables and chosen by a media query (.collage-slot in
          globals.css), so the layout is right from the first paint and
          nothing jumps when JavaScript loads. */}
      {SLOTS.map((slot, i) => {
        const m = MOBILE_SLOTS[i] as (typeof MOBILE_SLOTS)[number] | undefined
        const img = assigned[i]
        const vars = {
          '--top-d': `${slot.top}%`, '--left-d': `${slot.left}%`, '--w-d': `${slot.w}%`,
          '--rot-d': `${slot.rot}deg`, '--aspect-d': slot.aspect.replace('/', ' / '),
          '--dur-d': `${slot.dur}s`, '--delay-d': `${slot.delay}s`,
          ...(m && {
            '--top-m': `${m.top}%`, '--left-m': `${m.left}%`, '--w-m': `${m.w}%`,
            '--rot-m': `${m.rot}deg`, '--aspect-m': m.aspect.replace('/', ' / '),
            '--dur-m': `${m.dur}s`, '--delay-m': `${m.delay}s`,
          }),
        } as React.CSSProperties
        return (
        /* Outer: absolute position + mouse parallax target */
        <div
          key={i}
          ref={el => { mouseRefs.current[i] = el }}
          className={`collage-slot ${m ? '' : 'collage-desktop-only'}`}
          style={vars}
        >
          {/* Float animation wrapper */}
          <div className="motion-float collage-float">
            {/* Rotation + cross-fade opacity */}
            <div
              className="collage-frame"
              style={{
                opacity:      fading.has(i) ? 0 : 1,
                transition:   `opacity ${FADE_DURATION}ms ease`,
              }}
            >
              <img
                src={img.src}
                srcSet={img.srcSet}
                sizes={SIZES}
                width={img.width}
                height={img.height}
                alt=""
                decoding="async"
                // Desktop-only slots are display:none on phones; lazy keeps
                // phones from downloading them.
                loading={m ? undefined : 'lazy'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                draggable={false}
              />
            </div>
          </div>
        </div>
        )
      })}
    </div>
  )
}
