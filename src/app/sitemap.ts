import type { MetadataRoute } from 'next'
import { getAllProjects } from '@/lib/projects'
import { getAllServices } from '@/lib/services'
import { getAllArticles } from '@/lib/articles'
import { absoluteUrl } from '@/lib/site'

// Generated at build time from the content folders, so new case studies,
// services and articles are listed automatically. Articles without their full
// text yet are left out (their pages are noindex until then).
//
// lastmod is when a page's content last changed, so it's written by hand:
// bump `updated` in a case study, service or article's frontmatter, or the
// date below for a page that isn't in the content folders, whenever its
// content changes. (Not read from git, since a shallow clone on the build
// server has no history.)

export const dynamic = 'force-static'

/** When each standalone page's content last changed, "YYYY-MM-DD". */
const PAGE_UPDATED = {
  '/': '2026-10-26',
  '/work/': '2026-10-16',
  '/about/': '2026-10-26',
  '/contact/': '2026-10-30',
  '/articles/': '2026-10-08',
} as const

/** "2026-10" → a Date for the first of that month. */
const toDate = (d: string) => {
  const [y, m = 1, day = 1] = d.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, day))
}

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getAllProjects()
  const allArticles = getAllArticles()
  const articles = allArticles.filter(a => a.hasBody && !a.canonicalToOriginal)
  const services = getAllServices()

  return [
    { url: absoluteUrl('/'), lastModified: toDate(PAGE_UPDATED['/']) },
    { url: absoluteUrl('/work/'), lastModified: toDate(PAGE_UPDATED['/work/']) },
    { url: absoluteUrl('/about/'), lastModified: toDate(PAGE_UPDATED['/about/']) },
    { url: absoluteUrl('/contact/'), lastModified: toDate(PAGE_UPDATED['/contact/']) },
    ...projects.map(p => ({
      url: absoluteUrl(`/work/${p.slug}/`),
      ...((p.updated ?? p.date) && { lastModified: toDate(p.updated ?? p.date) }),
    })),
    ...services.map(s => ({
      url: absoluteUrl(`/${s.slug}/`),
      ...(s.updated && { lastModified: toDate(s.updated) }),
    })),
    ...(allArticles.length > 0 ? [{ url: absoluteUrl('/articles/'), lastModified: toDate(PAGE_UPDATED['/articles/']) }] : []),
    ...articles.map(a => ({ url: absoluteUrl(`/articles/${a.slug}/`), lastModified: toDate(a.updated ?? a.date) })),
  ]
}
