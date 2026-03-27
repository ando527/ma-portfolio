'use client'

import { useEffect, useRef, useState } from 'react'

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

// ── Component ─────────────────────────────────────────────────────────────────

export default function CollageHero({ images }: { images: string[] }) {
  const initialAssign = SLOTS.map((_, i) => images[i % images.length])

  const [assigned, setAssigned] = useState<string[]>(initialAssign)
  const [fading,   setFading]   = useState<Set<number>>(new Set())
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check, { passive: true })
    return () => window.removeEventListener('resize', check)
  }, [])

  const swapQueue   = useRef<number[]>([...SLOTS.map((_, i) => i)].sort(() => Math.random() - 0.5))
  const assignedRef = useRef(initialAssign)
  const mouseRefs   = useRef<(HTMLDivElement | null)[]>([])
  const rafRef      = useRef<number>(0)
  const mouse       = useRef({ x: 0, y: 0 })
  const current     = useRef({ x: 0, y: 0 })

  useEffect(() => { assignedRef.current = assigned }, [assigned])

  // ── Image swap loop ────────────────────────────────────────────────────────
  useEffect(() => {
    if (images.length === 0) return
    const timer = setInterval(() => {
      if (swapQueue.current.length === 0)
        swapQueue.current = [...SLOTS.map((_, i) => i)].sort(() => Math.random() - 0.5)

      const slotIdx   = swapQueue.current.pop()!
      const cur       = assignedRef.current[slotIdx]
      const others    = images.filter(img => img !== cur)
      const next      = others.length > 0
        ? others[Math.floor(Math.random() * others.length)]
        : images[(images.indexOf(cur) + 1) % images.length]

      setFading(prev => new Set(prev).add(slotIdx))
      setTimeout(() => {
        setAssigned(prev => { const a = [...prev]; a[slotIdx] = next; return a })
        setFading(prev => { const s = new Set(prev); s.delete(slotIdx); return s })
      }, FADE_DURATION)
    }, SWAP_INTERVAL)
    return () => clearInterval(timer)
  }, [images])

  // ── Mouse parallax loop ────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth  - 0.5) * 2   // -1 → 1
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMove, { passive: true })

    const tick = () => {
      current.current.x += (mouse.current.x - current.current.x) * LERP
      current.current.y += (mouse.current.y - current.current.y) * LERP
      const { x, y } = current.current
      const mag = Math.min(Math.sqrt(x * x + y * y), 1)

      mouseRefs.current.forEach((el, i) => {
        if (!el) return
        const d  = SLOTS[i].depth
        const tx = x * d * 14          // max ~14 px horizontal
        const ty = y * d * 9           // max ~9 px vertical
        const sc = 1 + mag * d * 0.022 // max ~2 % scale
        el.style.transform = `translate(${tx}px, ${ty}px) scale(${sc})`
      })

      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (images.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>

      {/* Gradient: protects the bottom-left text area */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            'linear-gradient(to right, #FDF7F7 0%, rgba(253,247,247,0.82) 22%, rgba(253,247,247,0.35) 48%, rgba(253,247,247,0.08) 80%, transparent 100%)',
        }}
      />
      {/* Bottom fade so "Hello." text pops off cleanly */}
      <div
        className="absolute bottom-0 inset-x-0 z-10 pointer-events-none"
        style={{ height: '30%', background: 'linear-gradient(to top, #FDF7F7 0%, transparent 100%)' }}
      />

      {/* Photo slots */}
      {SLOTS.map((slot, i) => {
        // On mobile use the dedicated mobile layout; hide slots beyond its length
        const mSlot = isMobile ? MOBILE_SLOTS[i] : null
        if (isMobile && !mSlot) return null
        const { top, left, w, rot, aspect, dur, delay } = mSlot ?? slot
        return (
        /* Outer: absolute position + mouse parallax target */
        <div
          key={i}
          ref={el => { mouseRefs.current[i] = el }}
          style={{
            position:   'absolute',
            top:        `${top}%`,
            left:       `${left}%`,
            width:      `${w}%`,
            zIndex:     5,
            willChange: 'transform',
          }}
        >
          {/* Float animation wrapper */}
          <div style={{ animation: `float-y ${dur}s ease-in-out ${delay}s infinite` }}>
            {/* Rotation + cross-fade opacity */}
            <div
              style={{
                transform:    `rotate(${rot}deg)`,
                aspectRatio:  aspect.replace('/', ' / '),
                overflow:     'hidden',
                borderRadius: '0.75rem',
                boxShadow:    '0 8px 32px rgba(0,0,0,0.15)',
                opacity:      fading.has(i) ? 0 : 1,
                transition:   `opacity ${FADE_DURATION}ms ease`,
              }}
            >
              <img
                src={assigned[i]}
                alt=""
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
