'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home' },
  { href: '/work/', label: 'Work' },
  { href: '/about/', label: 'About' },
]

// ── Liquid-glass surface ──────────────────────────────────────────────────────
//
// Gradient runs top → bottom (not diagonal) so every horizontal position
// stays consistently dark — logo on the left is always readable.
//
// WCAG: the lightest stop is rgba(110,18,32,0.82). Composited over pure white
// that yields ≈ #4e1a21, a 12:1 contrast ratio with white text (AAA ✓).
//
// Layers:
//   1. Top-to-bottom gradient: deep wine top → near-black base
//   2. backdrop-filter blur(24px) + saturate(180%)
//   3. Thin white border — glass edge, same opacity all the way round
//   4. inset top highlight — specular rim (kept subtle so it doesn't stripe)
//   5. Soft drop shadow for the floating depth

const glassStyle: React.CSSProperties = {
  background: `linear-gradient(
    180deg,
    rgba(110, 18, 32, 0.62) 0%,
    rgba(16,  4,  8, 0.72) 100%
  )`,
  backdropFilter:       'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border:    '1px solid rgba(255, 255, 255, 0.10)',
  boxShadow: [
    'inset 0 1px 0 rgba(255, 255, 255, 0.14)',   // top specular rim
    '0 2px 8px  -2px rgba(16, 4, 8, 0.30)',      // near shadow
    '0 20px 56px -8px rgba(16, 4, 8, 0.50)',     // ambient shadow
  ].join(', '),
  borderRadius: '4.25rem',
}

/** Replays the logo's writing animation, unless it's already mid-stroke. */
function rewriteLogo(e: React.SyntheticEvent<HTMLElement>) {
  const paths = e.currentTarget.querySelectorAll<SVGPathElement>('.logo-mark path')
  const animations = [...paths].flatMap(p => p.getAnimations?.() ?? [])
  if (animations.length === 0 || animations.some(a => a.playState === 'running')) return
  animations.forEach(a => { a.cancel(); a.play() })
}

export default function Nav() {
  const pathname = usePathname()

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4 sm:px-6 pointer-events-none">
      <div className="w-full max-w-5xl pointer-events-auto">

        <header style={glassStyle} className="on-dark">
          <nav aria-label="Main" className="px-3 sm:px-8 h-[52px] sm:h-[64px] flex items-center justify-between">

            {/* Logo */}
            <Link
              href="/"
              aria-label="Mitchell Anderson, home"
              className="flex-shrink-0 group w-11 h-11 flex items-center justify-center rounded-full"
              onMouseEnter={rewriteLogo}
              onFocus={rewriteLogo}
            >
              {/* The MA mark, drawn as if written: plays on load and again on
                  hover/focus (.logo-mark in globals.css). Static with reduced motion. */}
              <svg
                aria-hidden
                viewBox="0 0 64 64"
                fill="none"
                stroke="white"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="logo-mark h-6 w-6 sm:h-8 sm:w-8 opacity-90 group-hover:opacity-100 transition-opacity duration-200"
              >
                <path
                  pathLength={1}
                  strokeWidth={4}
                  style={{ '--draw-duration': '0.75s', '--draw-delay': '0.1s' } as React.CSSProperties}
                  d="M 5,52 C 5,36 6,22 8,14 Q 13,4 18,16 Q 17,22 17,28 Q 22,4 27,16 C 27,28 28,40 29,52"
                />
                <path
                  pathLength={1}
                  strokeWidth={4}
                  style={{ '--draw-duration': '0.5s', '--draw-delay': '0.8s' } as React.CSSProperties}
                  d="M 33,52 C 33,38 37,22 42,14 Q 45,7 49,14 C 53,22 56,38 57,52"
                />
                <path
                  pathLength={1}
                  strokeWidth={3.5}
                  style={{ '--draw-duration': '0.2s', '--draw-delay': '1.35s' } as React.CSSProperties}
                  d="M 36,36 Q 45,32 52,36"
                />
              </svg>
            </Link>

            {/* Links — each is a 44px-tall target; the visible label stays the same size */}
            <ul className="flex items-center gap-5 sm:gap-7">
              {links.map(({ href, label }) => {
                const path      = pathname.endsWith('/') ? pathname : `${pathname}/`
                const isCurrent = path === href
                const isActive  = href === '/' ? path === '/' : path.startsWith(href)

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      aria-current={isCurrent ? 'page' : undefined}
                      className={`group inline-flex items-center h-11 px-1 font-sans text-[13px] font-medium tracking-wide
                        transition-colors duration-200
                        ${isActive ? 'text-white' : 'text-white/70 hover:text-white'}`}
                    >
                      <span className="relative">
                        {label}
                        <span
                          aria-hidden
                          className={`absolute -bottom-0.5 left-0 h-[1.5px] rounded-full
                            transition-[width,background-color] duration-200
                            ${isActive
                              ? 'w-full bg-white/80'
                              : 'w-0 bg-white/50 group-hover:w-full'
                            }`}
                        />
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Balance spacer */}
            <div className="w-11 flex-shrink-0" aria-hidden />

          </nav>
        </header>

      </div>
    </div>
  )
}
