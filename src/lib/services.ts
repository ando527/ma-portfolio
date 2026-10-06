import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

/**
 * Service pages live in src/content/services/<slug>.md and publish at
 * /<slug>/ (e.g. /webflow-development/). Each one links to the case studies
 * that share one of its relatedTags and to its related articles. Questions in
 * the faqs list render as an FAQ section with FAQPage structured data.
 */
export interface Faq {
  question: string
  answer: string
}

export interface Service {
  slug: string
  /** Page heading */
  title: string
  /** Short name for links, e.g. "Webflow development" */
  name: string
  seoTitle: string
  seoDescription: string
  intro: string
  relatedTags: string[]
  relatedArticles: string[]
  faqs: Faq[]
  order: number
  content: string
}

const dir = path.join(process.cwd(), 'src/content/services')

function parse(slug: string, raw: string): Service {
  const { data, content } = matter(raw)
  return {
    slug,
    title: data.title || slug,
    name: data.name || data.title || slug,
    seoTitle: data.seoTitle || data.title || slug,
    seoDescription: data.seoDescription || '',
    intro: data.intro || '',
    relatedTags: data.relatedTags || [],
    relatedArticles: data.relatedArticles || [],
    faqs: data.faqs || [],
    order: data.order ?? 99,
    content,
  }
}

export function getAllServices(): Service[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md'))
    .map(f => parse(f.replace(/\.md$/, ''), fs.readFileSync(path.join(dir, f), 'utf8')))
    .sort((a, b) => a.order - b.order)
}

export function getServiceBySlug(slug: string): Service | null {
  const file = path.join(dir, `${slug}.md`)
  return fs.existsSync(file) ? parse(slug, fs.readFileSync(file, 'utf8')) : null
}
