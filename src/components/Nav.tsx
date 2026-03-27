'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const links = [
  { href: '/', label: 'Home' },
  { href: '/work', label: 'Work' },
  { href: '/about', label: 'About' },
]

const OPAQUE_BG: React.CSSProperties = {
  background:
    'linear-gradient(rgba(155, 35, 53, 0.18), rgba(155, 35, 53, 0.18)), rgba(0, 0, 0, 0.78)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  borderBottom: '1px solid rgba(155, 35, 53, 0.22)',
  boxShadow: '0 8px 32px -4px rgba(16, 4, 8, 0.35)',
}

const TRANSPARENT_BG: React.CSSProperties = {
  background: 'transparent',
  borderBottom: '1px solid transparent',
}

export default function Nav() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!isHome) return
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.85)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [isHome])

  // Inner pages are always opaque; home fades in after the hero
  const opaque = !isHome || scrolled

  return (
    <header
      className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
      style={opaque ? OPAQUE_BG : TRANSPARENT_BG}
    >
      <nav className="px-6 h-16 flex items-center justify-between max-w-6xl mx-auto">

        {/* Logo mark — links home */}
        <Link href="/" aria-label="Mitchell Anderson — Home" className="flex-shrink-0">
          <img
            src="/images/ma-logo-mark.svg"
            alt="MA"
            className="h-8 w-8 opacity-90 hover:opacity-100 transition-opacity duration-200"
            draggable={false}
          />
        </Link>

        <ul className="flex items-center gap-10">
          {links.map(({ href, label }) => {
            const isActive =
              href === '/' ? pathname === '/' : pathname.startsWith(href)

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`relative font-sans text-sm font-medium transition-colors duration-200 group ${
                    isActive ? 'text-white' : 'text-white/55 hover:text-white'
                  }`}
                >
                  {label}
                  {/* Active / hover underline */}
                  <span
                    className={`absolute -bottom-0.5 left-0 h-0.5 rounded-full transition-all duration-200 ${
                      isActive ? 'w-full bg-white' : 'w-0 bg-white/70 group-hover:w-full'
                    }`}
                  />
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Spacer to balance the logo on the left */}
        <div className="w-8 flex-shrink-0" aria-hidden />

      </nav>
    </header>
  )
}
