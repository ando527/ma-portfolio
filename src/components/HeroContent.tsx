import Link from 'next/link'
import type { CSSProperties } from 'react'
import { btnPrimary, btnOnDark } from '@/components/ui/button'

// Staggered entrance for the hero copy: each line fades up with a slight blur,
// 90 ms apart. Pure CSS (.enter in globals.css), so the headline paints with
// the HTML instead of waiting for JavaScript, and reduced motion skips it.

const delay = (i: number) => ({ '--enter-delay': `${0.15 + i * 0.09}s` }) as CSSProperties

export default function HeroContent() {
  return (
    <div className="max-w-lg">
      <p
        className="enter font-sans font-semibold text-sm tracking-widest uppercase text-maroon-200 mb-5"
        style={delay(0)}
      >
        Web Developer — Brisbane, QLD
      </p>

      <h1
        className="enter font-heading font-bold text-6xl md:text-7xl xl:text-8xl text-white leading-[0.95] tracking-tight mb-6"
        style={delay(1)}
      >
        Mitchell{' '}<br />Anderson.
      </h1>

      <p
        className="enter font-sans text-lg text-white/60 leading-relaxed mb-10 max-w-md"
        style={delay(2)}
      >
        I build conversion-focused websites and digital experiences — end-to-end, from UX
        and wireframing through to front-end development and launch.
      </p>

      <div className="enter flex flex-wrap gap-4" style={delay(3)}>
        <Link href="/work/" className={btnPrimary}>
          View Work
          <span aria-hidden className="text-white/80">→</span>
        </Link>
        <Link href="/about/" className={btnOnDark}>
          About Me
        </Link>
      </div>
    </div>
  )
}
