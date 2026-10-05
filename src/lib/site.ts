import type { Metadata } from 'next'

/** Facts about the site and its owner, used by metadata, schema and llms.txt. */
export const SITE = {
  url: 'https://mitchellanderson.com.au',
  name: 'Mitchell Anderson',
  locale: 'en_AU',
  lang: 'en-AU',
  jobTitle: 'Web Developer',
  location: 'Brisbane, QLD',
  defaultOgImage: '/images/og/default.jpg',
  defaultOgAlt: 'Mitchell Anderson, web developer in Brisbane',
  links: {
    linkedin: 'https://www.linkedin.com/in/mitchell-anderson-527au/',
    github: 'https://github.com/ando527',
    wca: 'https://www.worldcubeassociation.org/persons/2022ANDE01',
  },
  employer: { name: 'SLATE Media', url: 'https://www.slatemedia.com.au' },
} as const

export const absoluteUrl = (path = '/') => new URL(path, SITE.url).toString()

interface PageMetaInput {
  /** Short title; the layout appends " | Mitchell Anderson". */
  title?: string
  /** Full title used as-is (homepage). */
  absoluteTitle?: string
  description: string
  /** Path with trailing slash, e.g. "/work/". */
  path: string
  /** Share image under /images/og/. Defaults to the site card. */
  ogImage?: string
  ogImageAlt?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  noindex?: boolean
}

/**
 * Builds a page's full metadata. Next.js replaces nested objects such as
 * openGraph wholesale when a page sets them, so every page goes through here
 * to keep the image, type, site name and locale on every share card.
 */
export function pageMetadata(input: PageMetaInput): Metadata {
  const fullTitle = input.absoluteTitle ?? `${input.title} | ${SITE.name}`
  const url = absoluteUrl(input.path)
  const image = input.ogImage ?? SITE.defaultOgImage
  const imageAlt = input.ogImageAlt ?? SITE.defaultOgAlt

  return {
    title: input.absoluteTitle ? { absolute: input.absoluteTitle } : input.title,
    description: input.description,
    alternates: { canonical: url },
    ...(input.noindex && { robots: { index: false, follow: true } }),
    openGraph: {
      type: input.type ?? 'website',
      siteName: SITE.name,
      locale: SITE.locale,
      url,
      title: fullTitle,
      description: input.description,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
      ...(input.type === 'article' && {
        publishedTime: input.publishedTime,
        modifiedTime: input.modifiedTime,
        authors: [SITE.url + '/about/'],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: input.description,
      images: [{ url: image, alt: imageAlt }],
    },
  }
}
