'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { EASE_OUT_EXPO } from '@/components/ui/animate-in'

// Staggered entrance for the hero copy.
// Each child fades up with a slight blur, staggered at 90 ms intervals.

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
}

const item = {
  hidden:  { opacity: 0, y: 20, filter: 'blur(6px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: EASE_OUT_EXPO },
  },
}

export default function HeroContent() {
  return (
    <motion.div
      className="max-w-lg"
      initial="hidden"
      animate="visible"
      variants={container}
    >
      <motion.p
        variants={item}
        className="font-sans font-semibold text-sm tracking-widest uppercase text-maroon-200 mb-5"
      >
        Web Developer — Brisbane, QLD
      </motion.p>

      <motion.h1
        variants={item}
        className="font-heading font-bold text-6xl md:text-7xl xl:text-8xl text-white leading-[0.95] tracking-tight mb-6"
      >
        Mitchell<br />Anderson.
      </motion.h1>

      <motion.p
        variants={item}
        className="font-sans text-lg text-white/60 leading-relaxed mb-10 max-w-md"
      >
        I build conversion-focused websites and digital experiences — end-to-end, from UX
        and wireframing through to front-end development and launch.
      </motion.p>

      <motion.div variants={item} className="flex flex-wrap gap-4">
        <Link
          href="/work"
          className="inline-flex items-center gap-2 bg-primary hover:bg-maroon-700 text-white font-sans font-semibold px-7 py-3.5 rounded-xl transition-colors duration-200 shadow-sm"
        >
          View Work
          <span aria-hidden className="text-white/80">→</span>
        </Link>
        <Link
          href="/about"
          className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-sans font-semibold px-7 py-3.5 rounded-xl transition-all duration-200"
        >
          About Me
        </Link>
      </motion.div>
    </motion.div>
  )
}
