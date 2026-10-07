'use client'

import { useEffect, useState } from 'react'
import type { Heading } from '@/lib/markdown'

/**
 * "On this page" links, with the section being read highlighted. Uses an
 * IntersectionObserver on the h2s (a band near the top of the viewport), so
 * nothing runs on scroll. Without JavaScript it's a plain list of links.
 */
export default function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const els = headings
      .map(h => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null)
    if (els.length === 0 || typeof IntersectionObserver === 'undefined') return

    const visible = new Set<string>()
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(e => (e.isIntersecting ? visible.add(e.target.id) : visible.delete(e.target.id)))
        if (visible.size > 0) {
          // The first heading (in document order) inside the band wins.
          setActive(headings.find(h => visible.has(h.id))?.id ?? null)
        } else {
          // Between headings: keep the last one that's scrolled above the band.
          const above = els.filter(el => el.getBoundingClientRect().top < window.innerHeight * 0.2)
          setActive(above.length ? above[above.length - 1].id : null)
        }
      },
      { rootMargin: '-15% 0px -70% 0px' },
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [headings])

  return (
    <nav aria-label="On this page" className="hidden lg:block">
      <h2 className="eyebrow text-muted-foreground mb-4">On this page</h2>
      <ol className="border-l border-maroon-100">
        {headings.map(h => {
          const current = h.id === active
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={current ? 'location' : undefined}
                className={`block -ml-px border-l-2 pl-4 py-1.5 font-sans text-sm transition-colors duration-200 ${
                  current
                    ? 'border-primary text-foreground font-medium'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-maroon-200'
                }`}
              >
                {h.text}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
