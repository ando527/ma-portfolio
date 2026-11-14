import Link from 'next/link'
import type { CSSProperties } from 'react'
import { btnPrimary, btnOnDark, btnArrow } from '@/components/ui/button'

// Staggered entrance for the hero copy: each line fades up, 80 ms apart. Pure
// CSS (.enter in globals.css), so the headline paints with the HTML instead of
// waiting for JavaScript, and reduced motion skips it.

const delay = (i: number) => ({ '--enter-delay': `${0.1 + i * 0.08}s` }) as CSSProperties

export default function HeroContent() {
  return (
    <div className="max-w-xl">
      <p className="enter eyebrow mb-4" style={delay(0)}>
        Web developer in Brisbane, QLD
      </p>

      <h1
        className="enter display display-xl text-4xl sm:text-[44px] lg:text-6xl xl:text-7xl text-d-fg mb-6"
        style={delay(1)}
      >
        Mitchell{' '}<br />Anderson
        <span className="sr-only">, web developer in Brisbane</span>
      </h1>

      <p className="enter font-sans text-lg text-d-fg-2 leading-7 mb-8 max-w-md" style={delay(2)}>
        I build Webflow, Shopify and Next.js websites for Brisbane clients, from wireframe to launch
      </p>

      <div className="enter flex flex-wrap gap-3" style={delay(3)}>
        <Link href="/work/" className={btnPrimary}>
          View work
          <span aria-hidden className={btnArrow}>→</span>
        </Link>
        <Link href="/about/" className={btnOnDark}>
          About me
        </Link>
      </div>
    </div>
  )
}
