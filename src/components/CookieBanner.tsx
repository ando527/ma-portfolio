'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { btnLight, btnOnDark } from '@/components/ui/button'

type Props = {
  onConsent: (granted: boolean) => void
}

export default function CookieBanner({ onConsent }: Props) {
  const [visible, setVisible] = useState(false)

  // The stored choice only exists in the browser, so it's read after mount
  // (the static HTML always renders without the banner), and only once.
  useEffect(() => {
    // Storage can throw (blocked, private windows): then the banner shows each visit.
    let stored: string | null = null
    try { stored = localStorage.getItem('cookie_consent') } catch {}
    if (stored === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only value, read after hydration
      setVisible(true)
    } else {
      onConsent(stored === 'true')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps -- run once on load

  const handleChoice = (granted: boolean) => {
    try { localStorage.setItem('cookie_consent', String(granted)) } catch {}
    onConsent(granted)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="toast-in on-dark fixed z-[9999] bottom-3 inset-x-3 sm:bottom-5 sm:left-5 sm:right-auto sm:w-[22rem] rounded-2xl border border-d-line-strong dark:border-d-fg-3/60 bg-d-card p-5 shadow-float-dark"
    >
      <p className="font-sans text-sm text-d-fg-2 leading-5 m-0">
        This site uses cookies to understand traffic via Google Analytics.{' '}
        <Link prefetch={false} href="/privacy/" className="text-d-fg underline underline-offset-2 hover:text-accent-on-dark transition-colors duration-150 ease-spec">
          Privacy policy
        </Link>
      </p>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleChoice(false)}
          className={`${btnOnDark} flex-1 !min-h-10 !py-2 !text-sm cursor-pointer`}
        >
          Decline
        </button>
        <button
          type="button"
          onClick={() => handleChoice(true)}
          className={`${btnLight} flex-1 !min-h-10 !py-2 !text-sm cursor-pointer`}
        >
          Accept
        </button>
      </div>
    </div>
  )
}
