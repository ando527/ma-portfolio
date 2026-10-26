import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { getImage, maybeImage, type ImageData } from '@/lib/images'

export interface ProjectStat {
  label: string
  value: string
}

export interface ProjectPreviewSection {
  heading: string
  body: string
}

export interface Project {
  slug: string
  title: string
  date: string
  /** Last content change, "YYYY-MM-DD", for the sitemap's lastmod. Bump it when the page's content changes. */
  updated?: string
  tags: string[]
  thumbnail: string
  heroImage: string
  summary: string
  /**
   * A longer summary for the homepage project browser only, written apart
   * from the case study so the homepage doesn't duplicate its copy. Never
   * shown on the case study page.
   */
  preview: ProjectPreviewSection[]
  featured: boolean
  /** 0–100: how involved the project was. Drives the "Most involved" sort. */
  effort: number
  content: string
  // SEO overrides — fall back to title / summary
  seoTitle: string
  seoDescription: string
  heroAlt: string
  beforeAlt: string
  // Rich case study fields
  liveUrl?: string
  role?: string
  client?: string
  year?: string
  deliverables?: string[]
  stats?: ProjectStat[]
  beforeImage?: string
  color?: string
  favicon?: string
  badge?: 'Freelance' | 'Pro-bono' | 'SLATE'
  /** Optimised images, resolved at build time for client components. */
  images: {
    hero?: ImageData
    thumb?: ImageData
    before?: ImageData
  }
  /** 1200×630 share image written by scripts/optimize-images.mjs. */
  ogImage?: string
}

const projectsDir = path.join(process.cwd(), 'src/content/projects')

function parseProject(slug: string, fileContents: string): Project {
  const { data, content } = matter(fileContents)
  const heroImage: string = data.heroImage || ''
  const thumbnail: string = data.thumbnail || heroImage
  const beforeImage: string = data.beforeImage || ''
  const ogFile = path.join(process.cwd(), 'public', 'images', 'og', `${slug}.jpg`)

  return {
    slug,
    title: data.title || slug,
    date: data.date || '',
    updated: data.updated ? String(data.updated) : undefined,
    tags: data.tags || [],
    thumbnail,
    heroImage,
    summary: data.summary || '',
    preview: data.preview || [],
    featured: data.featured || false,
    effort: Number(data.effort) || 0,
    content,
    seoTitle: data.seoTitle || data.title || slug,
    seoDescription: data.seoDescription || data.summary || '',
    heroAlt: data.heroAlt || `${data.title} website`,
    beforeAlt: data.beforeAlt || `${data.title} website before the redesign`,
    liveUrl: data.liveUrl || '',
    role: data.role || '',
    client: data.client || '',
    year: data.year || '',
    deliverables: data.deliverables || [],
    stats: data.stats || [],
    beforeImage,
    color: data.color || '',
    favicon: data.favicon || '',
    badge: data.badge || undefined,
    images: {
      hero: maybeImage(heroImage),
      thumb: thumbnail ? getImage(thumbnail) : undefined,
      before: maybeImage(beforeImage),
    },
    ogImage: fs.existsSync(ogFile) ? `/images/og/${slug}.jpg` : undefined,
  }
}

export function getAllProjects(): Project[] {
  if (!fs.existsSync(projectsDir)) return []

  return fs.readdirSync(projectsDir)
    .filter(f => f.endsWith('.md'))
    .map(filename => {
      const slug = filename.replace(/\.md$/, '')
      return parseProject(slug, fs.readFileSync(path.join(projectsDir, filename), 'utf8'))
    })
    .sort((a, b) => {
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
}

export function getProjectBySlug(slug: string): Project | null {
  const fullPath = path.join(projectsDir, `${slug}.md`)
  if (!fs.existsSync(fullPath)) return null
  return parseProject(slug, fs.readFileSync(fullPath, 'utf8'))
}

/** "2026-10" → "October 2026" */
export function formatMonth(date: string): string {
  const [y, m] = date.split('-').map(Number)
  if (!y || !m) return date
  return new Intl.DateTimeFormat('en-AU', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m - 1, 1)))
}

/** Case studies that use a given tag (e.g. "Webflow"), newest first. */
export function getProjectsByTag(tag: string): Project[] {
  return getAllProjects().filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()))
}
