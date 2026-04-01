'use client'

import { motion, useInView, Variants } from 'framer-motion'
import { useRef } from 'react'

// ── Shared easing curve (expo-out — feels snappy but not abrupt) ──────────────
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const

// ── Shared spring config for interactive elements ─────────────────────────────
export const SPRING_SNAPPY = { type: 'spring', stiffness: 400, damping: 30 } as const

// ── Base fade-up variant ──────────────────────────────────────────────────────
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: EASE_OUT_EXPO },
  },
}

// ── Container variant — staggers children ─────────────────────────────────────
export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
})

// ── AnimateIn: wraps children and reveals on scroll ──────────────────────────
interface AnimateInProps {
  children: React.ReactNode
  className?: string
  /** Delay before the element starts animating (seconds) */
  delay?: number
  /** How much of the element must be in the viewport before triggering */
  threshold?: number
  /** Whether to animate only once or every time it enters the viewport */
  once?: boolean
  as?: React.ElementType
}

export function AnimateIn({
  children,
  className,
  delay = 0,
  threshold = 0.15,
  once = true,
  as: Tag = 'div',
}: AnimateInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: threshold })

  const MotionTag = motion[Tag as keyof typeof motion] as typeof motion.div

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: { opacity: 0, y: 16, filter: 'blur(4px)' },
        visible: {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          transition: { duration: 0.55, ease: EASE_OUT_EXPO, delay },
        },
      }}
    >
      {children}
    </MotionTag>
  )
}

// ── StaggerIn: reveals children with a stagger on scroll ─────────────────────
interface StaggerInProps {
  children: React.ReactNode
  className?: string
  stagger?: number
  delayChildren?: number
  threshold?: number
  once?: boolean
  as?: React.ElementType
}

export function StaggerIn({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0,
  threshold = 0.1,
  once = true,
  as: Tag = 'div',
}: StaggerInProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount: threshold })

  const MotionTag = motion[Tag as keyof typeof motion] as typeof motion.div

  return (
    <MotionTag
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={staggerContainer(stagger, delayChildren)}
    >
      {children}
    </MotionTag>
  )
}

// ── FadeItem: child element inside a StaggerIn container ─────────────────────
interface FadeItemProps {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}

export function FadeItem({ children, className, as: Tag = 'div' }: FadeItemProps) {
  const MotionTag = motion[Tag as keyof typeof motion] as typeof motion.div
  return (
    <MotionTag className={className} variants={fadeUp}>
      {children}
    </MotionTag>
  )
}
