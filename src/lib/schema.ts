/**
 * schema.org structured data. The Person and WebSite nodes are emitted once
 * per page by the root layout; page-level nodes point at them by @id so search
 * engines read the whole site as one connected graph. The local-business node
 * is emitted on the pages that talk about the service (home, about, contact
 * and the service pages).
 *
 * Only facts already on the site go in here: no phone, street address, prices
 * or ratings, and no Review/AggregateRating markup for the testimonials
 * (self-serving review markup is against Google's guidelines).
 */
import { SITE, absoluteUrl, isoDate, PAGE_UPDATED } from '@/lib/site'
import { getAllServices, type Service } from '@/lib/services'
import type { Article } from '@/lib/articles'
import type { Project } from '@/lib/projects'

export const IDS = {
  person: `${SITE.url}/#person`,
  website: `${SITE.url}/#website`,
  business: `${SITE.url}/#business`,
} as const

const personRef = { '@id': IDS.person }
const websiteRef = { '@id': IDS.website }
const businessRef = { '@id': IDS.business }

const SITE_DESCRIPTION =
  'Web developer in Brisbane building websites in Webflow, Shopify and Next.js, from UX and wireframes through to launch.'

/** Where the work is done for: Brisbane first, Australia-wide. */
const areaServed = () => [
  { '@type': 'City', name: 'Brisbane', containedInPlace: { '@type': 'State', name: 'Queensland' } },
  { '@type': 'Country', name: 'Australia' },
]

export function imageObject(url: string, width?: number, height?: number, caption?: string) {
  return {
    '@type': 'ImageObject',
    url,
    contentUrl: url,
    ...(width && { width }),
    ...(height && { height }),
    ...(caption && { caption }),
  }
}

export function personNode() {
  return {
    '@type': 'Person',
    '@id': IDS.person,
    name: SITE.name,
    url: absoluteUrl('/'),
    image: imageObject(absoluteUrl('/images/hero.webp'), undefined, undefined, 'Mitchell Anderson, web developer in Brisbane'),
    jobTitle: SITE.jobTitle,
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Head of Web Development',
      occupationLocation: { '@type': 'City', name: 'Brisbane' },
    },
    description: SITE_DESCRIPTION,
    worksFor: { '@type': 'Organization', name: SITE.employer.name, url: SITE.employer.url },
    alumniOf: {
      '@type': 'CollegeOrUniversity',
      name: 'The University of Queensland',
      url: 'https://www.uq.edu.au',
    },
    memberOf: { '@type': 'Organization', name: 'World Cube Association', url: 'https://www.worldcubeassociation.org' },
    affiliation: { '@type': 'Organization', name: 'Speedcubing Australia', url: 'https://www.speedcubing.org.au' },
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
    description: SITE_DESCRIPTION,
    inLanguage: SITE.lang,
    publisher: personRef,
    copyrightHolder: personRef,
  }
}

/**
 * The freelance practice as a local-business entity (ProfessionalService).
 * No address beyond the city, no phone and no price range: none is published.
 */
export function businessNode() {
  const services = getAllServices()
  return {
    '@type': 'ProfessionalService',
    '@id': IDS.business,
    name: `${SITE.name}, Web Developer in Brisbane`,
    alternateName: SITE.name,
    url: absoluteUrl('/'),
    description: SITE_DESCRIPTION,
    image: imageObject(absoluteUrl(SITE.defaultOgImage), 1200, 630, SITE.defaultOgAlt),
    logo: imageObject(absoluteUrl('/icons/icon-512.png'), 512, 512),
    founder: personRef,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Brisbane',
      addressRegion: 'QLD',
      addressCountry: 'AU',
    },
    areaServed: areaServed(),
    serviceType: services.map(s => s.name),
    knowsAbout: ['Webflow', 'Shopify', 'Next.js', 'UX design', 'Technical SEO', 'Web accessibility'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'enquiries',
      url: absoluteUrl('/contact/'),
      availableLanguage: 'English',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Web development services',
      itemListElement: services.map(s => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', '@id': `${absoluteUrl(`/${s.slug}/`)}#service`, name: s.name, url: absoluteUrl(`/${s.slug}/`) },
      })),
    },
    sameAs: [SITE.links.linkedin, SITE.links.github],
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
  const standalone = PAGE_UPDATED[path as keyof typeof PAGE_UPDATED]
  return {
    '@type': type,
    '@id': `${absoluteUrl(path)}#webpage`,
    url: absoluteUrl(path),
    isPartOf: websiteRef,
    inLanguage: SITE.lang,
    ...(standalone && { dateModified: standalone }),
    ...(breadcrumb && { breadcrumb: { '@id': `${absoluteUrl(path)}#breadcrumb` } }),
    ...rest,
  }
}

export const refs = { person: personRef, website: websiteRef, business: businessRef }

/**
 * One @graph per page: the site-wide Person and WebSite nodes plus the page's
 * own nodes, de-duplicated by @id so a node is never described twice.
 */
export function graph(...nodes: object[]) {
  const seen = new Set<string>()
  const all = [personNode(), websiteNode(), ...nodes].filter(n => {
    const id = (n as { '@id'?: string })['@id']
    if (!id) return true
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
  return { '@context': 'https://schema.org', '@graph': all }
}

/** Whole words in a markdown source, ignoring link targets and markup. */
function countWords(markdown: string): number {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`|~-]+/g, ' ')
    .split(/\s+/)
    .filter(w => /[\p{L}\p{N}]/u.test(w)).length
}

/** WebPage + BlogPosting + breadcrumb for an article page. */
export function articleNodes(article: Article, readMinutes: number) {
  const path = `/articles/${article.slug}/`
  const url = absoluteUrl(path)
  const hero = article.image
  const images = [
    ...(article.ogImage ? [imageObject(absoluteUrl(article.ogImage), 1200, 630, article.heroAlt || undefined)] : []),
    ...(hero ? [imageObject(absoluteUrl(hero.src), hero.width, hero.height, article.heroAlt || undefined)] : []),
  ]
  const published = isoDate(article.date)
  const modified = isoDate(article.updated ?? article.date)
  const original = article.canonicalToOriginal ? article.originalUrl : undefined

  return [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: article.title,
      description: article.seoDescription,
      isPartOf: websiteRef,
      inLanguage: SITE.lang,
      datePublished: published,
      dateModified: modified,
      breadcrumb: { '@id': `${url}#breadcrumb` },
      mainEntity: { '@id': `${url}#article` },
      ...(images[0] && { primaryImageOfPage: images[0] }),
    },
    {
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      headline: article.title,
      description: article.seoDescription,
      url,
      mainEntityOfPage: original ?? { '@id': `${url}#webpage` },
      datePublished: published,
      dateModified: modified,
      inLanguage: SITE.lang,
      author: personRef,
      publisher: personRef,
      isPartOf: websiteRef,
      isAccessibleForFree: true,
      ...(images.length && { image: images }),
      ...(article.originalUrl && { isBasedOn: article.originalUrl }),
      ...(article.hasBody && { wordCount: countWords(article.content), timeRequired: `PT${readMinutes}M` }),
      ...(article.tags.length && { keywords: article.tags.join(', '), articleSection: article.tags[0] }),
    },
    breadcrumbNode(path, [
      { name: 'Home', path: '/' },
      { name: 'Articles', path: '/articles/' },
      { name: article.title, path },
    ]),
  ]
}

/** WebPage + CreativeWork (the case study) + breadcrumb for a project page. */
export function caseStudyNodes(project: Project) {
  const path = `/work/${project.slug}/`
  const url = absoluteUrl(path)
  const hero = project.images.hero
  const images = [
    ...(project.ogImage ? [imageObject(absoluteUrl(project.ogImage), 1200, 630, project.heroAlt)] : []),
    ...(hero ? [imageObject(absoluteUrl(hero.src), hero.width, hero.height, project.heroAlt)] : []),
  ]
  const created = project.date ? isoDate(project.date) : undefined
  const modified = isoDate(project.updated ?? project.date)

  return [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: project.seoTitle,
      description: project.seoDescription,
      isPartOf: websiteRef,
      inLanguage: SITE.lang,
      ...(created && { datePublished: created }),
      ...(modified && { dateModified: modified }),
      breadcrumb: { '@id': `${url}#breadcrumb` },
      mainEntity: { '@id': `${url}#case-study` },
      ...(images[0] && { primaryImageOfPage: images[0] }),
    },
    {
      '@type': 'CreativeWork',
      '@id': `${url}#case-study`,
      name: project.title,
      headline: project.seoTitle,
      description: project.seoDescription,
      ...(project.summary && { abstract: project.summary }),
      genre: 'Case study',
      url,
      mainEntityOfPage: { '@id': `${url}#webpage` },
      inLanguage: SITE.lang,
      isPartOf: websiteRef,
      author: personRef,
      creator: personRef,
      publisher: personRef,
      ...(images.length && { image: images }),
      ...(created && { dateCreated: created, datePublished: created }),
      ...(modified && { dateModified: modified }),
      keywords: project.tags.join(', '),
      ...(project.client && {
        about: {
          '@type': 'Organization',
          name: project.client.replace(/\s*[—(].*$/, ''),
          ...(project.liveUrl && { url: project.liveUrl }),
        },
      }),
    },
    breadcrumbNode(path, [
      { name: 'Home', path: '/' },
      { name: 'Work', path: '/work/' },
      { name: project.title, path },
    ]),
  ]
}

/** WebPage + Service + breadcrumb (+ FAQPage when the page shows FAQs) for a service page. */
export function serviceNodes(service: Service) {
  const path = `/${service.slug}/`
  const url = absoluteUrl(path)
  return [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: service.seoTitle,
      description: service.seoDescription,
      isPartOf: websiteRef,
      inLanguage: SITE.lang,
      ...(service.updated && { dateModified: service.updated }),
      about: { '@id': `${url}#service` },
      mainEntity: { '@id': `${url}#service` },
      breadcrumb: { '@id': `${url}#breadcrumb` },
    },
    {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: service.name,
      serviceType: service.name,
      category: 'Web development',
      description: service.seoDescription,
      url,
      mainEntityOfPage: { '@id': `${url}#webpage` },
      provider: businessRef,
      areaServed: areaServed(),
      availableChannel: {
        '@type': 'ServiceChannel',
        serviceUrl: absoluteUrl('/contact/'),
        availableLanguage: 'English',
      },
    },
    breadcrumbNode(path, [
      { name: 'Home', path: '/' },
      { name: service.name, path },
    ]),
    ...(service.faqs.length > 0
      ? [
          {
            '@type': 'FAQPage',
            '@id': `${url}#faq`,
            url,
            inLanguage: SITE.lang,
            isPartOf: { '@id': `${url}#webpage` },
            mainEntity: service.faqs.map(f => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          },
        ]
      : []),
  ]
}
