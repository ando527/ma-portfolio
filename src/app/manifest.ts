import type { MetadataRoute } from 'next'

export const dynamic = 'force-static'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Mitchell Anderson | Web Developer in Brisbane',
    short_name: 'Mitchell Anderson',
    description: 'Websites in Webflow, Shopify and Next.js, from wireframe to launch.',
    start_url: '/',
    display: 'browser',
    background_color: '#FDF7F7',
    theme_color: '#100408',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
