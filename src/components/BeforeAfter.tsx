'use client'

import { useRef, useState, type PointerEvent } from 'react'
import type { ImageData } from '@/lib/types'

const SIZES = '(min-width: 1152px) 1104px, calc(100vw - 48px)'

/**
 * Old and new designs stacked, with a handle that wipes between them.
 *
 * - Mouse: press anywhere and drag.
 * - Touch: a horizontal drag moves the handle; a vertical swipe still scrolls
 *   the page (touch-action: pan-y), and a plain tap does nothing.
 * - Keyboard and screen readers: a native range input (arrow keys, Home/End,
 *   Page Up/Down), visually hidden, with its focus ring drawn on the handle.
 */
export default function BeforeAfter({
  before,
  after,
  beforeAlt,
  afterAlt,
}: {
  before: ImageData
  after: ImageData
  beforeAlt: string
  afterAlt: string
}) {
  // Where the divide sits, as a percentage from the left. Left of it shows
  // the old site, right of it the new one.
  const [pos, setPos] = useState(50)
  const frameRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ id: number; x: number; y: number; active: boolean } | null>(null)

  const moveTo = (clientX: number) => {
    const r = frameRef.current?.getBoundingClientRect()
    if (!r || r.width === 0) return
    setPos(Math.round(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)) * 10) / 10)
  }

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    const mouse = e.pointerType === 'mouse'
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, active: mouse }
    if (mouse) {
      e.preventDefault() // no text/image selection while dragging
      e.currentTarget.setPointerCapture(e.pointerId)
      moveTo(e.clientX)
    }
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    if (!d.active) {
      const dx = Math.abs(e.clientX - d.x)
      const dy = Math.abs(e.clientY - d.y)
      if (dx < 6 || dx < dy) return
      d.active = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    moveTo(e.clientX)
  }

  const end = () => { drag.current = null }

  const shownBefore = Math.round(pos)

  return (
    <figure>
      <div
        ref={frameRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
        className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-maroon-50 ring-1 ring-black/[0.06] shadow-[0_30px_60px_-30px_rgba(28,10,14,0.35)] select-none cursor-ew-resize"
        style={{ touchAction: 'pan-y' }}
      >
        <img
          src={before.src}
          srcSet={before.srcSet}
          sizes={SIZES}
          width={before.width}
          height={before.height}
          alt={beforeAlt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <img
          src={after.src}
          srcSet={after.srcSet}
          sizes={SIZES}
          width={after.width}
          height={after.height}
          alt={afterAlt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
        />

        {/* Corner labels, fading as their side is wiped away */}
        <span
          aria-hidden
          className="absolute top-4 left-4 eyebrow px-3 py-1.5 rounded-full bg-ink/80 text-white transition-opacity duration-200"
          style={{ opacity: pos < 12 ? 0 : 1 }}
        >
          Before
        </span>
        <span
          aria-hidden
          className="absolute top-4 right-4 eyebrow px-3 py-1.5 rounded-full bg-primary text-white transition-opacity duration-200"
          style={{ opacity: pos > 88 ? 0 : 1 }}
        >
          After
        </span>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={shownBefore}
          onChange={e => setPos(Number(e.target.value))}
          aria-label="Compare the old and new designs"
          aria-valuetext={`${shownBefore}% old design, ${100 - shownBefore}% new design`}
          className="peer sr-only"
        />

        {/* Divider and handle */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 -translate-x-1/2 w-0.5 bg-white shadow-[0_0_0_1px_rgba(16,4,8,0.15),0_0_24px_rgba(16,4,8,0.35)]"
          style={{ left: `${pos}%` }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white text-ink shadow-[0_8px_24px_rgba(16,4,8,0.35)] flex items-center justify-center gap-0.5 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-white peer-focus-visible:ring-4 peer-focus-visible:ring-secondary"
          style={{ left: `${pos}%` }}
        >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3.5 1.5 8 6 12.5M10 3.5 14.5 8 10 12.5" />
          </svg>
        </div>
      </div>
      <figcaption className="mt-4 font-sans text-sm text-muted-foreground">
        Drag across the screenshot, or focus the slider and use the arrow keys, to compare the old site with the new one.
      </figcaption>
    </figure>
  )
}
