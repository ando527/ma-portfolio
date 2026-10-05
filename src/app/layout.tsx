import type { Metadata, Viewport } from 'next'
import { Archivo, Space_Grotesk } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import AnalyticsWrapper from '@/components/AnalyticsWrapper'
import JsonLd from '@/components/JsonLd'
import { SITE } from '@/lib/site'
import { graph, personNode, websiteNode } from '@/lib/schema'

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
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
  formatDetection: { telephone: false },
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

export const viewport: Viewport = {
  themeColor: '#100408',
}

// Runs before first paint: marks that JavaScript is available, so scroll
// reveals may start hidden. Without JS, nothing on the page is ever hidden.
const jsFlag = `document.documentElement.classList.add('js')`

// Runs once the HTML is parsed, before the app's JavaScript arrives: reveals
// anything that's on screen at first paint, so above-the-fold content never
// waits for hydration. Uses an IntersectionObserver (one callback, then it
// disconnects) rather than measuring, so it never blocks the first paint.
// Below-the-fold content still reveals on scroll via AnimateIn/StaggerIn.
const revealInView = `(function(){if(!('IntersectionObserver' in window))return;var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)e.target.setAttribute('data-revealed','')});io.disconnect()});document.querySelectorAll('.reveal,[data-stagger]').forEach(function(el){io.observe(el)})})()`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang={SITE.lang}
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlag }} />
      </head>
      <body className="font-sans bg-background text-foreground min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-3 focus:font-semibold focus:text-foreground focus:shadow-lg"
        >
          Skip to content
        </a>
        <JsonLd data={graph(personNode(), websiteNode())} />
        <Nav />
        <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">{children}</main>
        <Footer />
        <script dangerouslySetInnerHTML={{ __html: revealInView }} />
        <AnalyticsWrapper />
      </body>
    </html>
  )
}
