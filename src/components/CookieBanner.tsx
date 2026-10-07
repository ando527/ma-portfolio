'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Props = {
  onConsent: (granted: boolean) => void
}

export default function CookieBanner({ onConsent }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('cookie_consent')
    if (stored === null) {
      setVisible(true)
    } else {
      onConsent(stored === 'true')
    }
  }, [])

  const handleChoice = (granted: boolean) => {
    localStorage.setItem('cookie_consent', String(granted))
    onConsent(granted)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="on-dark fixed z-[9999] bottom-3 inset-x-3 sm:bottom-5 sm:left-5 sm:right-auto sm:w-[22rem] rounded-2xl border border-white/10 bg-ink/95 backdrop-blur-md p-5 shadow-[0_24px_60px_-12px_rgba(16,4,8,0.6)]"
    >
      <p className="font-sans text-sm text-white/80 leading-relaxed m-0">
        This site uses cookies to understand traffic via Google Analytics.{' '}
        <Link prefetch={false} href="/privacy/" className="text-maroon-200 underline underline-offset-2 hover:text-white transition-colors">
          Privacy Policy
        </Link>
      </p>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleChoice(false)}
          className="flex-1 h-10 rounded-full border border-white/25 bg-transparent font-sans text-sm font-semibold text-white/90 hover:bg-white/10 hover:border-white/40 transition-colors cursor-pointer"
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => handleChoice(true)}
          className="flex-1 h-10 rounded-full bg-white font-sans text-sm font-semibold text-ink hover:bg-maroon-100 transition-colors cursor-pointer"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
