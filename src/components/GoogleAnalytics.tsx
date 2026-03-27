'use client'

import Script from 'next/script'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'

const GA_ID = 'G-BSPW1R5L30'

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
    dataLayer: unknown[]
  }
}

export default function GoogleAnalytics({ consent }: { consent: boolean }) {
  const pathname = usePathname()

  useEffect(() => {
    if (!consent || !window.gtag) return
    window.gtag('event', 'page_view', { page_path: pathname })
  }, [pathname, consent])

  if (!consent) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${GA_ID}', { send_page_view: false });
      `}</Script>
    </>
  )
}
