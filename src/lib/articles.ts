import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { maybeImage, type ImageData } from '@/lib/images'
import { hasBody } from '@/lib/markdown'

/**
 * Articles live in src/content/articles/<slug>.md and publish at
 * /articles/<slug>/. An article with no body yet still gets a page, which
 * shows the summary and links to where it was first published; that page is
 * kept out of search results and the sitemap until the full text is added.
 */
export interface Article {
  slug: string
  title: string
  /** "2025-04" or "2025-04-07" */
  date: string
  summary: string
  seoTitle: string
  seoDescription: string
  /** Where it first appeared, e.g. "SLATE Media newsletter" */
  publication?: string
  issue?: number
  originalUrl?: string
  /** Point the canonical tag at originalUrl (for republished pieces). */
  canonicalToOriginal: boolean
  tags: string[]
  /** Big type on the generated cover, used until a hero image is added. */
  coverText: string
  heroImage?: string
  heroAlt: string
  image?: ImageData
  ogImage?: string
  relatedServices: string[]
  content: string
  hasBody: boolean
}

const dir = path.join(process.cwd(), 'src/content/articles')

function parse(slug: string, raw: string): Article {
  const { data, content } = matter(raw)
  const ogFile = path.join(process.cwd(), 'public', 'images', 'og', `${slug}.jpg`)
  return {
    slug,
    title: data.title || slug,
    date: String(data.date || ''),
    summary: data.summary || '',
    seoTitle: data.seoTitle || data.title || slug,
    seoDescription: data.seoDescription || data.summary || '',
    publication: data.publication || undefined,
    issue: data.issue || undefined,
    originalUrl: data.originalUrl || undefined,
    canonicalToOriginal: Boolean(data.canonicalToOriginal && data.originalUrl),
    tags: data.tags || [],
    coverText: data.coverText || data.title || slug,
    heroImage: data.heroImage || undefined,
    heroAlt: data.heroAlt || '',
    image: maybeImage(data.heroImage),
    ogImage: fs.existsSync(ogFile) ? `/images/og/${slug}.jpg` : undefined,
    relatedServices: data.relatedServices || [],
    content,
    hasBody: hasBody(content),
  }
}

export function getAllArticles(): Article[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => parse(f.replace(/\.md$/, ''), fs.readFileSync(path.join(dir, f), 'utf8')))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function getArticleBySlug(slug: string): Article | null {
  const file = path.join(dir, `${slug}.md`)
  return fs.existsSync(file) ? parse(slug, fs.readFileSync(file, 'utf8')) : null
}

/** "2025-04" → "April 2025"; "2025-04-07" → "7 April 2025" (en-AU). */
export function formatDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  if (!y || !m) return date
  const value = new Date(Date.UTC(y, m - 1, d || 1))
  return new Intl.DateTimeFormat('en-AU', {
    ...(d ? { day: 'numeric' } : {}),
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(value)
}
