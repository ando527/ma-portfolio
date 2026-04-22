import type { Metadata } from 'next'
import { Archivo, Space_Grotesk } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import AnalyticsWrapper from '@/components/AnalyticsWrapper'

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

export const metadata: Metadata = {
  metadataBase: new URL('https://mitchellanderson.com.au'),
  title: 'Mitchell Anderson — Web Developer',
  description: 'Web developer based in Brisbane. Webflow, Shopify, Next.js and front-end development.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'Mitchell Anderson',
    title: 'Mitchell Anderson — Web Developer',
    description: 'Web developer based in Brisbane. Webflow, Shopify, Next.js and front-end development.',
    url: 'https://mitchellanderson.com.au/',
    images: [{ url: '/images/hero.png', alt: 'Mitchell Anderson — Web Developer' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mitchell Anderson — Web Developer',
    description: 'Web developer based in Brisbane. Webflow, Shopify, Next.js and front-end development.',
    images: ['/images/hero.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${archivo.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="preload" as="image" href="/images/hero.webp" fetchPriority="high" />
      </head>
      <body className="font-sans bg-background text-foreground min-h-screen flex flex-col">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
        <AnalyticsWrapper />
      </body>
    </html>
  )
}
