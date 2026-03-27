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
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-foreground border-t border-maroon-700 px-5 py-3 flex items-center justify-between flex-wrap gap-3">
      <p className="text-[13px] text-background/80 leading-relaxed m-0 max-w-xl">
        This site uses cookies to understand traffic via Google Analytics.{' '}
        <Link href="/privacy" className="text-background/50 underline underline-offset-2 hover:text-background/80 transition-colors">
          Privacy Policy
        </Link>
      </p>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => handleChoice(false)}
          className="text-[13px] px-4 py-1.5 rounded border border-maroon-700 text-background/50 hover:text-background/80 hover:border-maroon-500 transition-colors cursor-pointer bg-transparent"
        >
          Decline
        </button>
        <button
          onClick={() => handleChoice(true)}
          className="text-[13px] px-4 py-1.5 rounded bg-background text-foreground font-semibold hover:bg-background/90 transition-colors cursor-pointer"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
