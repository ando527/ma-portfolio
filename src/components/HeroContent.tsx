import Link from 'next/link'
import type { CSSProperties } from 'react'
import { btnPrimary, btnOnDark, btnArrow } from '@/components/ui/button'

// Staggered entrance for the hero copy: each line fades up with a slight blur,
// 90 ms apart. Pure CSS (.enter in globals.css), so the headline paints with
// the HTML instead of waiting for JavaScript, and reduced motion skips it.

const delay = (i: number) => ({ '--enter-delay': `${0.15 + i * 0.09}s` }) as CSSProperties

export default function HeroContent() {
  return (
    <div className="max-w-xl">
      <p
        className="enter eyebrow flex items-center gap-3 text-maroon-200 mb-6"
        style={delay(0)}
      >
        <span aria-hidden className="h-px w-8 bg-maroon-200/60" />
        Web Developer — Brisbane, QLD
      </p>

      <h1
        className="enter display text-[clamp(2.75rem,14vw,3.4rem)] sm:text-7xl xl:text-8xl text-white leading-[0.92] mb-7"
        style={delay(1)}
      >
        Mitchell{' '}<br />Anderson.
      </h1>

      <p
        className="enter font-sans text-lg md:text-xl text-white/70 leading-relaxed mb-10 max-w-md"
        style={delay(2)}
      >
        I build conversion-focused websites and digital experiences — end-to-end, from UX
        and wireframing through to front-end development and launch.
      </p>

      <div className="enter flex flex-wrap gap-3" style={delay(3)}>
        <Link href="/work/" className={btnPrimary}>
          View Work
          <span aria-hidden className={`text-white/80 ${btnArrow}`}>→</span>
        </Link>
        <Link href="/about/" className={btnOnDark}>
          About Me
        </Link>
      </div>
    </div>
  )
}
