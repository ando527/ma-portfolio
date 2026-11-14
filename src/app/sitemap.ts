import type { MetadataRoute } from 'next'
import { getAllProjects } from '@/lib/projects'
import { getAllServices } from '@/lib/services'
import { getAllArticles } from '@/lib/articles'
import { absoluteUrl, isoDate, PAGE_UPDATED } from '@/lib/site'

// Generated at build time from the content folders, so new case studies,
// services and articles are listed automatically. Articles without their full
// text yet, and republished ones whose canonical points at the original, are
// left out (the first kind is noindex, the second isn't ours to rank).
//
// lastmod is when a page's content last changed, so it's written by hand:
// bump `updated` in a case study, service or article's frontmatter, or the
// date in PAGE_UPDATED (src/lib/site.ts) for a page that isn't in the content
// folders, whenever its content changes. (Not read from git, since a shallow
// clone on the build server has no history.)

export const dynamic = 'force-static'

type Entry = MetadataRoute.Sitemap[number]

/** "2026-10" → a Date for the first of that month. */
const toDate = (d: string) => new Date(`${isoDate(d)}T00:00:00Z`)

const img = (path?: string) => (path ? [absoluteUrl(path)] : undefined)

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getAllProjects()
  const allArticles = getAllArticles()
  const articles = allArticles.filter(a => a.hasBody && !a.canonicalToOriginal)
  const services = getAllServices()

  const entries: Entry[] = [
    { url: absoluteUrl('/'), lastModified: toDate(PAGE_UPDATED['/']), changeFrequency: 'monthly', priority: 1, images: img('/images/og/default.jpg') },
    ...services.map<Entry>(s => ({
      url: absoluteUrl(`/${s.slug}/`),
      ...(s.updated && { lastModified: toDate(s.updated) }),
      changeFrequency: 'monthly',
      priority: 0.9,
    })),
    { url: absoluteUrl('/work/'), lastModified: toDate(PAGE_UPDATED['/work/']), changeFrequency: 'monthly', priority: 0.8 },
    ...projects.map<Entry>(p => ({
      url: absoluteUrl(`/work/${p.slug}/`),
      ...((p.updated ?? p.date) && { lastModified: toDate(p.updated ?? p.date) }),
      changeFrequency: 'yearly',
      priority: 0.7,
      images: img(p.ogImage),
    })),
    ...(allArticles.length > 0
      ? [{ url: absoluteUrl('/articles/'), lastModified: toDate(PAGE_UPDATED['/articles/']), changeFrequency: 'monthly', priority: 0.7 } as Entry]
      : []),
    ...articles.map<Entry>(a => ({
      url: absoluteUrl(`/articles/${a.slug}/`),
      lastModified: toDate(a.updated ?? a.date),
      changeFrequency: 'yearly',
      priority: 0.6,
      images: img(a.ogImage),
    })),
    { url: absoluteUrl('/about/'), lastModified: toDate(PAGE_UPDATED['/about/']), changeFrequency: 'yearly', priority: 0.6 },
    { url: absoluteUrl('/contact/'), lastModified: toDate(PAGE_UPDATED['/contact/']), changeFrequency: 'yearly', priority: 0.5 },
  ]
  return entries
}
