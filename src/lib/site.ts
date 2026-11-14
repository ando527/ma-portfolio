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
  /**
   * Public site key of the Cloudflare Turnstile widget on the contact page
   * (an Invisible widget; the secret half lives in the Worker as
   * TURNSTILE_SECRET_KEY). Site keys are public by design. For local testing
   * with Cloudflare's dummy secret, set NEXT_PUBLIC_TURNSTILE_SITE_KEY to the
   * dummy key 1x00000000000000000000BB (docs/contact-form-setup.md).
   */
  turnstileSiteKey: '0x4AAAAAAFsBws4CbZjdDzGe',
} as const

export const absoluteUrl = (path = '/') => new URL(path, SITE.url).toString()

/** The RSS feed of articles (src/app/feed.xml/route.ts). */
export const FEED = { path: '/feed.xml', title: 'Mitchell Anderson: Articles on web development' } as const

/**
 * When each standalone page's content last changed, "YYYY-MM-DD". Feeds the
 * sitemap's lastmod and the pages' dateModified. Bump an entry whenever that
 * page's content changes (case studies, services and articles use their own
 * `updated` frontmatter instead).
 */
export const PAGE_UPDATED = {
  '/': '2026-11-09',
  '/work/': '2026-11-09',
  '/about/': '2026-11-09',
  '/contact/': '2026-11-09',
  '/articles/': '2026-11-09',
} as const

/**
 * "2025-04" → "2025-04-01"; full dates and datetimes pass through. Search
 * engines want a full ISO 8601 date, but content frontmatter often only knows
 * the month.
 */
export function isoDate(date: string): string {
  if (/^\d{4}$/.test(date)) return `${date}-01-01`
  if (/^\d{4}-\d{2}$/.test(date)) return `${date}-01`
  return date
}

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
  /** article:section, for type "article". */
  section?: string
  /** article:tag values, for type "article". */
  tags?: string[]
  /** Canonical URL when it isn't this page (a republished article). */
  canonical?: string
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
    alternates: {
      canonical: input.canonical ?? url,
      // One language and region: a self-referencing en-AU entry plus x-default.
      // Left out for a page whose canonical is elsewhere.
      ...(!input.canonical && { languages: { [SITE.lang]: url, 'x-default': url } }),
      types: { 'application/rss+xml': [{ url: FEED.path, title: FEED.title }] },
    },
    // Set per page rather than in the layout so the 404 page, which Next.js
    // marks noindex itself, doesn't also get an "index" directive.
    robots: input.noindex
      ? { index: false, follow: true }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
        },
    openGraph: {
      type: input.type ?? 'website',
      siteName: SITE.name,
      locale: SITE.locale,
      url,
      title: fullTitle,
      description: input.description,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt, type: 'image/jpeg' }],
      ...(input.type === 'article' && {
        ...(input.publishedTime && { publishedTime: isoDate(input.publishedTime) }),
        ...(input.modifiedTime && { modifiedTime: isoDate(input.modifiedTime) }),
        authors: [absoluteUrl('/about/')],
        ...(input.section && { section: input.section }),
        ...(input.tags?.length && { tags: input.tags }),
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
