import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Mitchell Anderson | Web Developer in Brisbane',
    short_name: 'Mitchell Anderson',
    description: 'Websites in Webflow, Shopify and Next.js, from wireframe to launch.',
    lang: 'en-AU',
    dir: 'ltr',
    start_url: '/',
    scope: '/',
    display: 'browser',
    background_color: '#F7F4EE',
    theme_color: '#161513',
    categories: ['business', 'portfolio', 'technology'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
