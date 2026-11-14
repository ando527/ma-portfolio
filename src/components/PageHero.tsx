import type { CSSProperties, ReactNode } from 'react'
import Link from 'next/link'

export interface Crumb {
  name: string
  href?: string
}

const delay = (i: number) => ({ '--enter-delay': `${0.05 + i * 0.08}s` }) as CSSProperties

/**
 * The header used by inner pages (Work, case studies, services, articles,
 * contact, privacy): a flat paper surface with a hairline along its bottom
 * edge, a breadcrumb trail, a headline, and an optional visual. `visual` sits
 * beside the text on wide screens; `overlap` is a full-width visual that
 * straddles the hairline: its top sits on the hero, the rest on a raised band
 * below, so the object reads against a different surface on each side.
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
      <section
        className={`relative bg-paper border-b border-line ${
          overlap ? 'pb-28 sm:pb-36 lg:pb-44' : 'pb-12 md:pb-16'
        }`}
      >
        <div
          className={`max-w-6xl mx-auto px-6 sm:px-8 pt-20 sm:pt-24 grid gap-12 ${
            visual ? 'lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center' : ''
          }`}
        >
          <div className="min-w-0">
            <nav aria-label="Breadcrumb" className="enter mb-6" style={delay(0)}>
              <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-sm text-fg-2">
                {crumbs.map((c, i) => (
                  <li key={i} className="flex items-center gap-2 min-w-0">
                    {i > 0 && (
                      <svg aria-hidden className="w-3 h-3 text-fg-3 flex-shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4.5 2.5 8 6l-3.5 3.5" />
                      </svg>
                    )}
                    {c.href ? (
                      <Link prefetch={false} href={c.href} className="py-1 hover:text-fg underline-offset-4 hover:underline transition-colors duration-150 ease-spec motion-reduce:transition-none">
                        {c.name}
                      </Link>
                    ) : (
                      <span aria-current="page" className="text-fg truncate">{c.name}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            {eyebrow && (
              <div className="enter eyebrow mb-3" style={delay(1)}>
                {eyebrow}
              </div>
            )}
            {/* The headline and intro don't animate in: they're the page's largest
                contentful paint, and a fade would hold that back. */}
            <h1 className="display text-fg text-4xl sm:text-[44px] max-w-2xl">
              {title}
            </h1>
            {intro && (
              <div className="mt-4 font-sans text-lg text-fg-2 leading-7 max-w-xl">
                {intro}
              </div>
            )}
            {children && (
              <div className="enter mt-8" style={delay(2)}>
                {children}
              </div>
            )}
          </div>
          {visual && (
            <div className="enter min-w-0" style={delay(2)}>
              {visual}
            </div>
          )}
        </div>
      </section>
      {overlap && (
        // flow-root keeps the frame's negative margin from dragging this band
        // up with it, so the raised surface starts exactly at the hairline.
        <div className="flow-root bg-raised border-b border-line">
          <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 pb-12 md:pb-16 -mt-16 sm:-mt-24 lg:-mt-32">
            <div className="enter" style={delay(3)}>{overlap}</div>
          </div>
        </div>
      )}
    </>
  )
}
