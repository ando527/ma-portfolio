import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'
import HeroBackground from '@/components/HeroBackground'

export interface Crumb {
  name: string
  href?: string
}

const delay = (i: number) => ({ '--enter-delay': `${0.05 + i * 0.08}s` }) as CSSProperties

/**
 * The dark header used by inner pages (Work, case studies, services,
 * articles): the homepage hero's maroon glow and grain, a breadcrumb trail,
 * a large headline, and a visual. `visual` sits beside the text on wide
 * screens; `overlap` is a full-width visual that straddles the edge into the
 * light page below.
 */
export default function PageHero({
  crumbs,
  eyebrow,
  title,
  intro,
  children,
  visual,
  overlap,
}: {
  crumbs: Crumb[]
  eyebrow?: ReactNode
  title: ReactNode
  intro?: ReactNode
  children?: ReactNode
  visual?: ReactNode
  overlap?: ReactNode
}) {
  return (
    <>
      <section className={`on-dark relative overflow-hidden bg-ink ${overlap ? 'pb-36 sm:pb-48 lg:pb-64' : 'pb-16 md:pb-24'}`}>
        <HeroBackground />
        {/* Hairline grid fading out from the top-right: a quiet blueprint texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '72px 72px',
            maskImage: 'radial-gradient(80% 70% at 85% 0%, #000, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(80% 70% at 85% 0%, #000, transparent 75%)',
          }}
        />
        <div
          className={`relative z-10 max-w-6xl mx-auto px-6 pt-32 md:pt-40 grid gap-12 ${
            visual ? 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center' : ''
          }`}
        >
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="enter mb-8" style={delay(0)}>
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-sm text-white/65">
                {crumbs.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 min-w-0">
                    {i > 0 && (
                      <svg aria-hidden className="w-3 h-3 text-white/35 flex-shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4.5 2.5 8 6l-3.5 3.5" />
                      </svg>
                    )}
                    {c.href ? (
                      <Link prefetch={false} href={c.href} className="py-1 hover:text-white underline-offset-4 hover:underline transition-colors duration-200">
                        {c.name}
                      </Link>
                    ) : (
                      <span aria-current="page" className="text-white/90 truncate">{c.name}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            {eyebrow && (
              <div className="enter eyebrow mb-5 flex items-center gap-3 text-maroon-200" style={delay(1)}>
                <span aria-hidden className="h-px w-8 bg-maroon-200/60" />
                {eyebrow}
              </div>
            )}
            <h1
              className="enter display text-white text-[clamp(2.25rem,12.5vw,2.75rem)] sm:text-5xl md:text-6xl xl:text-7xl max-w-[16ch]"
              style={delay(2)}
            >
              {title}
            </h1>
            {intro && (
              <div className="enter mt-7 font-sans text-lg md:text-xl text-white/70 leading-relaxed max-w-2xl" style={delay(3)}>
                {intro}
              </div>
            )}
            {children && (
              <div className="enter mt-8" style={delay(4)}>
                {children}
              </div>
            )}
          </div>
          {visual && (
            <div className="enter min-w-0" style={delay(4)}>
              {visual}
            </div>
          )}
        </div>
      </section>
      {overlap && (
        <div className="relative z-10 max-w-6xl mx-auto px-6 -mt-28 sm:-mt-40 lg:-mt-52">
          <div className="enter" style={delay(5)}>{overlap}</div>
        </div>
      )}
    </>
  )
}
