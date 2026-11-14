'use client'

import { useInsertionEffect, useState } from 'react'
import GoogleAnalytics from './GoogleAnalytics'
import CookieBanner from './CookieBanner'

export default function AnalyticsWrapper() {
  const [consent, setConsent] = useState(false)

  // Marks the moment hydration commits (an insertion effect runs inside the
  // commit itself, so no click can land between the two). The loader that
  // scripts/defer-scripts.mjs adds to each page waits for this attribute
  // before replaying taps and typing from before React was listening.
  useInsertionEffect(() => {
    document.documentElement.setAttribute('data-hydrated', String(performance.now()))
  }, [])

  return (
    <>
      <GoogleAnalytics consent={consent} />
      <CookieBanner onConsent={setConsent} />
    </>
  )
}
