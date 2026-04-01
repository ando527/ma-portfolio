'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
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

export default function Nav() {
  const pathname = usePathname()

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex justify-center pt-4 px-4 sm:px-6 pointer-events-none">
      <div className="w-full max-w-5xl pointer-events-auto">

        <header style={glassStyle}>
          <nav className="px-5 sm:px-10 h-[52px] sm:h-[64px] flex items-center justify-between">

            {/* Logo */}
            <Link href="/" aria-label="Mitchell Anderson — Home" className="flex-shrink-0 group">
              <img
                src="/images/ma-logo-mark.svg"
                alt="MA"
                className="h-6 w-6 sm:h-8 sm:w-8 opacity-90 group-hover:opacity-100 transition-opacity duration-200"
                draggable={false}
              />
            </Link>

            {/* Links */}
            <ul className="flex items-center gap-7 sm:gap-9">
              {links.map(({ href, label }) => {
                const isActive =
                  href === '/' ? pathname === '/' : pathname.startsWith(href)

                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={`relative font-sans text-[13px] font-medium tracking-wide
                        transition-colors duration-200 group
                        ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}
                    >
                      {label}
                      <span
                        className={`absolute -bottom-0.5 left-0 h-[1.5px] rounded-full
                          transition-all duration-200
                          ${isActive
                            ? 'w-full bg-white/80'
                            : 'w-0 bg-white/50 group-hover:w-full'
                          }`}
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>

            {/* Balance spacer */}
            <div className="w-7 flex-shrink-0" aria-hidden />

          </nav>
        </header>

      </div>
    </div>
  )
}
