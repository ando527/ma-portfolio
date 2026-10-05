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
      <section className={`on-dark relative overflow-hidden bg-[#100408] ${overlap ? 'pb-36 sm:pb-48 lg:pb-64' : 'pb-16 md:pb-24'}`}>
        <HeroBackground />
        <div
          className={`relative z-10 max-w-6xl mx-auto px-6 pt-32 md:pt-40 grid gap-12 ${
            visual ? 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center' : ''
          }`}
        >
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="enter mb-8" style={delay(0)}>
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-sm text-white/60">
                {crumbs.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 min-w-0">
                    {i > 0 && <span aria-hidden className="text-white/30">/</span>}
                    {c.href ? (
                      <Link prefetch={false} href={c.href} className="py-1 hover:text-white transition-colors duration-200">
                        {c.name}
                      </Link>
                    ) : (
                      <span aria-current="page" className="text-white/85 truncate">{c.name}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            {eyebrow && (
              <div className="enter mb-4 font-sans font-semibold text-sm tracking-widest uppercase text-maroon-200" style={delay(1)}>
                {eyebrow}
              </div>
            )}
            <h1
              className="enter font-heading font-bold text-white tracking-tight leading-[0.98] text-5xl md:text-6xl xl:text-7xl max-w-[16ch]"
              style={delay(2)}
            >
              {title}
            </h1>
            {intro && (
              <div className="enter mt-6 font-sans text-lg md:text-xl text-white/65 leading-relaxed max-w-2xl" style={delay(3)}>
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
