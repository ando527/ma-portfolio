'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { btnNav, btnNavOnDark } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'

// Home is hidden below `sm`: the logo is the home link, and four links plus
// the Contact button do not fit a phone.
const links = [
  { href: '/', label: 'Home', hideOnPhone: true },
  { href: '/work/', label: 'Work', hideOnPhone: false },
  { href: '/about/', label: 'About', hideOnPhone: false },
  { href: '/articles/', label: 'Articles', hideOnPhone: false },
]

// ── A flat bar ───────────────────────────────────────────────────────────────
//
// Over a dark band the bar is the dark page colour with the dark ramp's text;
// over a light band it is paper with a hairline, and the text flips to the
// light ramp. Colour and border only; nothing floats.

/** The point under the bar that decides its tone: its vertical centre. */
const SAMPLE_Y = 28

// Only the home page opens on a dark band (its hero); every inner page opens on
// paper, so the first paint is already right (avoids a dark flash before the
// first measurement).
const opensLight = (path: string) => path !== '/'

export default function Nav() {
  const pathname = usePathname()
  const path     = pathname.endsWith('/') ? pathname : `${pathname}/`

  // The bar follows whatever is directly under it: over a full-width `.on-dark`
  // band (the home hero, the footer) it is dark, anywhere else it is paper.
  // The header is excluded from the hit test.
  const [dark, setDark] = useState(() => !opensLight(path))
  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      const x = Math.round(window.innerWidth * 0.25)
      const under = document
        .elementsFromPoint(x, SAMPLE_Y)
        .find((el) => !el.closest('header'))
      // Only a full-width dark band counts. A dark object inside a light page
      // (a browser frame, an article cover) must not turn the bar dark.
      const band = under?.closest('.on-dark')
      setDark(Boolean(band && band.getBoundingClientRect().width >= window.innerWidth * 0.9))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure)
    }
    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [path])

  const barClass = dark
    ? 'on-dark bg-d-page border-d-line text-d-fg'
    : 'bg-paper border-line text-fg'
  const linkIdle = dark ? 'text-d-fg-2 hover:text-d-fg' : 'text-fg-2 hover:text-fg'
  const linkOn   = dark ? 'text-d-fg' : 'text-fg'

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 h-14 sm:h-16 border-b transition-[background-color,border-color,color] duration-200 ease-spec motion-reduce:transition-none ${barClass}`}
    >
      <nav
        aria-label="Main"
        className="max-w-6xl mx-auto h-full px-4 min-[375px]:px-6 sm:px-8 flex items-center justify-between"
      >

        {/* Logo */}
        <Link
          href="/"
          aria-label="Mitchell Anderson, home"
          className="group flex-shrink-0 w-11 h-11 -ml-2 flex items-center justify-center rounded-lg"
        >
          {/* The MA mark, drawn as if written once on load (.logo-mark in
              globals.css). Static with reduced motion. */}
          <svg
            aria-hidden
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="logo-mark h-7 w-7 opacity-90 group-hover:opacity-100 transition-opacity duration-150 ease-spec"
          >
            <path
              pathLength={1}
              strokeWidth={4}
              style={{ '--draw-duration': '0.5s', '--draw-delay': '0.1s' } as React.CSSProperties}
              d="M 5,52 C 5,36 6,22 8,14 Q 13,4 18,16 Q 17,22 17,28 Q 22,4 27,16 C 27,28 28,40 29,52"
            />
            <path
              pathLength={1}
              strokeWidth={4}
              style={{ '--draw-duration': '0.35s', '--draw-delay': '0.55s' } as React.CSSProperties}
              d="M 33,52 C 33,38 37,22 42,14 Q 45,7 49,14 C 53,22 56,38 57,52"
            />
            <path
              pathLength={1}
              strokeWidth={3.5}
              style={{ '--draw-duration': '0.15s', '--draw-delay': '0.9s' } as React.CSSProperties}
              d="M 36,36 Q 45,32 52,36"
            />
          </svg>
        </Link>

        {/* Links: each is a 44px-tall target; the current page gets a 1px underline */}
        <ul className="flex items-center gap-0.5 sm:gap-2">
          {links.map(({ href, label, hideOnPhone }) => {
            const isCurrent = path === href
            const isActive  = href === '/' ? path === '/' : path.startsWith(href)

            return (
              <li key={href} className={hideOnPhone ? 'max-sm:hidden' : undefined}>
                <Link
                  href={href}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`inline-flex items-center h-11 px-1 min-[375px]:px-1.5 sm:px-2 rounded-lg font-sans text-[14px] leading-5 font-medium transition-colors duration-150 ease-spec motion-reduce:transition-none
                    ${isActive ? linkOn : linkIdle}`}
                >
                  <span className="nav-ind-host relative">
                    {label}
                    <span
                      aria-hidden
                      data-on={isActive ? '' : undefined}
                      className="nav-ind absolute inset-x-0 -bottom-1 h-px bg-current"
                    />
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Theme toggle, then Contact: the contact page. Icon-only below 360px. */}
        <div className="flex flex-shrink-0 items-center gap-0.5 sm:gap-1">
          <ThemeToggle className={linkIdle} />
          <Link
            href="/contact/"
            prefetch={false}
            aria-current={path === '/contact/' ? 'page' : undefined}
            className={`flex-shrink-0 ${dark ? btnNavOnDark : btnNav} max-[359px]:w-9 max-[359px]:px-0`}
          >
            <svg aria-hidden className="w-4 h-4 min-[360px]:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
            </svg>
            <span className="sr-only min-[360px]:not-sr-only">Contact</span>
          </Link>
        </div>

      </nav>
    </header>
  )
}
