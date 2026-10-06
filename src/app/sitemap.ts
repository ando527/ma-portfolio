import type { MetadataRoute } from 'next'
import { getAllProjects } from '@/lib/projects'
import { getAllServices } from '@/lib/services'
import { getAllArticles } from '@/lib/articles'
import { absoluteUrl } from '@/lib/site'

// Generated at build time from the content folders, so new case studies,
// services and articles are listed automatically. Articles without their full
// text yet are left out (their pages are noindex until then).

export const dynamic = 'force-static'

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

  const newestProject = projects.find(p => p.date)?.date
  const siteUpdated = newestProject ? toDate(newestProject) : new Date()

  return [
    { url: absoluteUrl('/'), lastModified: siteUpdated },
    { url: absoluteUrl('/work/'), lastModified: siteUpdated },
    { url: absoluteUrl('/about/'), lastModified: siteUpdated },
    ...projects.map(p => ({
      url: absoluteUrl(`/work/${p.slug}/`),
      ...(p.date && { lastModified: toDate(p.date) }),
    })),
    ...services.map(s => ({ url: absoluteUrl(`/${s.slug}/`), lastModified: siteUpdated })),
    ...(allArticles.length > 0 ? [{ url: absoluteUrl('/articles/'), lastModified: toDate(allArticles[0].date) }] : []),
    ...articles.map(a => ({ url: absoluteUrl(`/articles/${a.slug}/`), lastModified: toDate(a.date) })),
  ]
}
