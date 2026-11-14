'use client'

import { Children, cloneElement, isValidElement, useEffect, useRef, type CSSProperties, type ElementType, type ReactElement, type ReactNode } from 'react'

// Scroll reveals, done in CSS (see .reveal in globals.css). The element renders
// visible in the HTML; an inline script adds `js` to <html> before first paint
// so it starts hidden only when JavaScript will run to reveal it. Reduced
// motion shows everything immediately. Fade plus a 12px rise, no blur.

// ── The one easing curve (matches --ease in globals.css) ─────────────────────
// Kept under its old name for any framer-motion code that still imports it.
export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const
export const EASE = EASE_OUT_EXPO

// Tween used by framer-motion code: 450ms entrance, 150ms feedback.
export const ENTER_TRANSITION = { duration: 0.45, ease: EASE } as const
export const FEEDBACK_TRANSITION = { duration: 0.15, ease: EASE } as const

/** Sets data-revealed on the element once enough of it is on screen. */
function useReveal<T extends HTMLElement>(threshold: number, once: boolean) {
  const ref = useRef<T>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      el.setAttribute('data-revealed', '')
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute('data-revealed', '')
          if (once) io.disconnect()
        } else if (!once) {
          el.removeAttribute('data-revealed')
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, once])
  return ref
}

// ── AnimateIn: wraps children and reveals on scroll ──────────────────────────
interface AnimateInProps {
  children: ReactNode
  className?: string
  /** Delay before the element starts animating (seconds) */
  delay?: number
  /** How much of the element must be in the viewport before triggering */
  threshold?: number
  /** Whether to animate only once or every time it enters the viewport */
  once?: boolean
  as?: ElementType
}

export function AnimateIn({
  children,
  className,
  delay = 0,
  threshold = 0.15,
  once = true,
  as: Tag = 'div',
}: AnimateInProps) {
  const ref = useReveal<HTMLElement>(threshold, once)
  const style = delay ? ({ '--reveal-delay': `${delay}s` } as CSSProperties) : undefined
  return (
    <Tag ref={ref} className={className ? `reveal ${className}` : 'reveal'} style={style} suppressHydrationWarning>
      {children}
    </Tag>
  )
}

// ── StaggerIn: reveals children with a stagger on scroll ─────────────────────
// 50ms between items, and only the first six step: later ones share the
// sixth item's delay, so a long list never trails.
const MAX_STAGGERED = 6

interface StaggerInProps {
  children: ReactNode
  className?: string
  /** Seconds between items. 0.04 to 0.06 reads best. */
  stagger?: number
  delayChildren?: number
  threshold?: number
  once?: boolean
  as?: ElementType
}

export function StaggerIn({
  children,
  className,
  stagger = 0.05,
  delayChildren = 0,
  threshold = 0.1,
  once = true,
  as: Tag = 'div',
}: StaggerInProps) {
  const ref = useReveal<HTMLElement>(threshold, once)
  let i = 0
  const items = Children.map(children, child => {
    if (!isValidElement(child)) return child
    const delay = delayChildren + stagger * Math.min(i++, MAX_STAGGERED - 1)
    const el = child as ReactElement<{ style?: CSSProperties }>
    return cloneElement(el, {
      style: { ...el.props.style, '--reveal-delay': `${delay.toFixed(2)}s` } as CSSProperties,
    })
  })
  return (
    <Tag ref={ref} className={className} data-stagger="" suppressHydrationWarning>
      {items}
    </Tag>
  )
}

// ── FadeItem: child element inside a StaggerIn container ─────────────────────
interface FadeItemProps {
  children: ReactNode
  className?: string
  style?: CSSProperties
  as?: ElementType
}

export function FadeItem({ children, className, style, as: Tag = 'div' }: FadeItemProps) {
  return (
    <Tag className={className ? `reveal-item ${className}` : 'reveal-item'} style={style}>
      {children}
    </Tag>
  )
}
