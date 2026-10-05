'use client'

import { useEffect, useRef } from 'react'

// Soft glow that follows the mouse, plus a static film grain. The animation
// loop only runs while the glow is catching up to the cursor: once it settles,
// or on touch screens, or with reduced motion, nothing runs.

const glowAt = (x: number, y: number) =>
  `radial-gradient(580px circle at ${x.toFixed(2)}% ${y.toFixed(2)}%, rgba(155, 35, 53, 0.18), transparent 68%)`

export default function HeroBackground() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const glowRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const section = wrapperRef.current?.closest('section') as HTMLElement | null
    const glow    = glowRef.current
    if (!section || !glow) return

    let targetX = 30, targetY = 50
    let currentX = 30, currentY = 50
    let rafId = 0
    glow.style.background = glowAt(currentX, currentY)

    const fine   = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduce.matches) return

    const tick = () => {
      // Lerp toward target — gives a smooth, slightly lagging feel
      currentX += (targetX - currentX) * 0.06
      currentY += (targetY - currentY) * 0.06
      glow.style.background = glowAt(currentX, currentY)
      const settled = Math.abs(targetX - currentX) < 0.05 && Math.abs(targetY - currentY) < 0.05
      rafId = settled ? 0 : requestAnimationFrame(tick)
    }

    const onMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect()
      targetX = ((e.clientX - rect.left) / rect.width)  * 100
      targetY = ((e.clientY - rect.top)  / rect.height) * 100
      if (!rafId) rafId = requestAnimationFrame(tick)
    }

    section.addEventListener('mousemove', onMove, { passive: true })

    return () => {
      section.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div ref={wrapperRef} aria-hidden className="absolute inset-0 pointer-events-none z-[1]">

      {/* Mouse glow — sits below grain */}
      <div ref={glowRef} className="absolute inset-0 z-0" />

      {/* Film grain — very subtle, unifies bg + photo */}
      <svg
        className="absolute inset-0 w-full h-full z-[1] opacity-[0.055]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="hero-grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.68"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#hero-grain)" />
      </svg>

    </div>
  )
}
