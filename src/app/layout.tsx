import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
// In the one stylesheet, not its own file: three page types need it, and a
// second render-blocking request costs more than its ~1KB gzipped.
import './prose.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import AnalyticsWrapper from '@/components/AnalyticsWrapper'
import { SITE, FEED } from '@/lib/site'

// Geist for the interface and headings, Geist Mono for the split-time meta
// readouts (.split in globals.css). Nothing else.
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

// Defaults for every page. Pages build their own full set through
// pageMetadata() in src/lib/site.ts, because Next.js replaces nested objects
// like openGraph instead of merging them.
export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: 'Mitchell Anderson | Web Developer in Brisbane',
    template: `%s | ${SITE.name}`,
  },
  description:
    'Mitchell Anderson is a web developer in Brisbane building fast, accessible websites in Webflow, Shopify and Next.js, from UX and wireframes through to launch.',
  applicationName: SITE.name,
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  category: 'technology',
  referrer: 'strict-origin-when-cross-origin',
  formatDetection: { telephone: false, email: false, address: false },
  alternates: { types: { 'application/rss+xml': [{ url: FEED.path, title: FEED.title }] } },
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    locale: SITE.locale,
    images: [{ url: SITE.defaultOgImage, width: 1200, height: 630, alt: SITE.defaultOgAlt }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [{ url: SITE.defaultOgImage, alt: SITE.defaultOgAlt }],
  },
}

// theme-color stays #161513 in both themes: the bar under the status bar is
// that dark graphite in light mode (the home hero sits there) and in dark mode
// (the nav is dark over everything). colorScheme tells the browser the page
// supports both, for native controls and the canvas before the CSS arrives;
// the CSS then pins it to the theme in use (globals.css).
export const viewport: Viewport = {
  themeColor: '#161513',
  colorScheme: 'light dark',
}

// Runs before first paint: sets <html data-theme> from the visitor's saved
// choice, else from the system setting, so the page never flashes the wrong
// theme. Mirrors getStoredTheme/getSystemTheme in src/lib/theme.ts. Storage
// can throw (blocked, private windows), hence the try.
const themeFlag = `(function(){var d=document.documentElement,t;try{t=localStorage.getItem('theme')}catch(e){}if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';d.dataset.theme=t})()`

// Runs before first paint: marks that JavaScript is available, so scroll
// reveals may start hidden. Without JS, nothing on the page is ever hidden.
const jsFlag = `document.documentElement.classList.add('js')`

// Runs once the HTML is parsed, before the app's JavaScript arrives (the
// scripts start after first paint, see scripts/defer-scripts.mjs): reveals
// anything that's on screen at first paint, so above-the-fold content never
// waits for hydration, and keeps revealing as the page scrolls, so a visitor
// who scrolls before hydration finishes never meets blank sections. Uses
// IntersectionObservers (no measuring), so it never blocks the first paint.
// Same thresholds as AnimateIn (.15) and StaggerIn (.1); AnimateIn/StaggerIn
// still handle pages reached by in-app navigation.
const revealInView = `(function(){if(!('IntersectionObserver' in window))return;function watch(sel,t){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.setAttribute('data-revealed','');io.unobserve(e.target)}})},{threshold:t});document.querySelectorAll(sel).forEach(function(el){io.observe(el)})}watch('.reveal',.15);watch('[data-stagger]',.1)})();document.querySelectorAll('[data-theme-toggle]').forEach(function(b){b.setAttribute('aria-pressed',String(document.documentElement.dataset.theme==='dark'))})`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang={SITE.lang}
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeFlag }} />
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body className="font-sans bg-paper text-fg min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-4 focus:py-3 focus:font-medium focus:text-fg focus:shadow-float"
        >
          Skip to content
        </a>
        <Nav />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">{children}</main>
        <Footer />
        <script dangerouslySetInnerHTML={{ __html: revealInView }} />
        <AnalyticsWrapper />
      </body>
    </html>
  )
}
