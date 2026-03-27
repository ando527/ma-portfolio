'use client'

import { useState } from 'react'
import GoogleAnalytics from './GoogleAnalytics'
import CookieBanner from './CookieBanner'

export default function AnalyticsWrapper() {
  const [consent, setConsent] = useState(false)

  return (
    <>
      <GoogleAnalytics consent={consent} />
      <CookieBanner onConsent={setConsent} />
    </>
  )
}
