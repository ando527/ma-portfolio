/**
 * schema.org structured data. The Person and WebSite nodes are emitted once
 * per page by the root layout; page-level nodes point at them by @id so search
 * engines read the whole site as one connected graph.
 */
import { SITE, absoluteUrl } from '@/lib/site'

export const IDS = {
  person: `${SITE.url}/#person`,
  website: `${SITE.url}/#website`,
} as const

const personRef = { '@id': IDS.person }
const websiteRef = { '@id': IDS.website }

export function personNode() {
  return {
    '@type': 'Person',
    '@id': IDS.person,
    name: SITE.name,
    url: absoluteUrl('/'),
    image: absoluteUrl('/images/hero.webp'),
    jobTitle: SITE.jobTitle,
    description:
      'Web developer in Brisbane building websites in Webflow, Shopify and Next.js, from UX and wireframes through to launch.',
    worksFor: { '@type': 'Organization', name: SITE.employer.name, url: SITE.employer.url },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'The University of Queensland',
      url: 'https://www.uq.edu.au',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Brisbane',
      addressRegion: 'QLD',
      addressCountry: 'AU',
    },
    sameAs: [SITE.links.linkedin, SITE.links.github, SITE.links.wca],
    knowsAbout: ['Webflow', 'Shopify', 'Next.js', 'Front-end development', 'UX design', 'Technical SEO', 'Web accessibility'],
  }
}

export function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': IDS.website,
    name: SITE.name,
    url: absoluteUrl('/'),
    inLanguage: SITE.lang,
    publisher: personRef,
  }
}

export function breadcrumbNode(path: string, items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${absoluteUrl(path)}#breadcrumb`,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  }
}

/** A WebPage (or subtype) node for the page at `path`. */
export function webPageNode(
  path: string,
  fields: { type?: string; name: string; description: string; breadcrumb?: boolean; [key: string]: unknown },
) {
  const { type = 'WebPage', breadcrumb, ...rest } = fields
  return {
    '@type': type,
    '@id': `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    isPartOf: websiteRef,
    inLanguage: SITE.lang,
    ...(breadcrumb && { breadcrumb: { '@id': `${absoluteUrl(path)}#breadcrumb` } }),
    ...rest,
  }
}

export const refs = { person: personRef, website: websiteRef }

export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes }
}
