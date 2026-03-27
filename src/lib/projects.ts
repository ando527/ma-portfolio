import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface ProjectStat {
  label: string
  value: string
}

export interface Project {
  slug: string
  title: string
  date: string
  tags: string[]
  thumbnail: string
  heroImage: string
  summary: string
  featured: boolean
  content: string
  // Rich case study fields
  liveUrl?: string
  role?: string
  client?: string
  year?: string
  deliverables?: string[]
  stats?: ProjectStat[]
  beforeImage?: string
  color?: string
}

const projectsDir = path.join(process.cwd(), 'src/content/projects')

export function getAllProjects(): Project[] {
  if (!fs.existsSync(projectsDir)) return []

  const files = fs.readdirSync(projectsDir).filter(f => f.endsWith('.md'))

  return files
    .map(filename => {
      const slug = filename.replace('.md', '')
      const fullPath = path.join(projectsDir, filename)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        slug,
        title: data.title || slug,
        date: data.date || '',
        tags: data.tags || [],
        thumbnail: data.thumbnail || '',
        heroImage: data.heroImage || '',
        summary: data.summary || '',
        featured: data.featured || false,
        content,
        liveUrl: data.liveUrl || '',
        role: data.role || '',
        client: data.client || '',
        year: data.year || '',
        deliverables: data.deliverables || [],
        stats: data.stats || [],
        beforeImage: data.beforeImage || '',
        color: data.color || '',
      } as Project
    })
    .sort((a, b) => {
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })
}

export function getProjectBySlug(slug: string): Project | null {
  try {
    const fullPath = path.join(projectsDir, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug,
      title: data.title || slug,
      date: data.date || '',
      tags: data.tags || [],
      thumbnail: data.thumbnail || '',
      heroImage: data.heroImage || '',
      summary: data.summary || '',
      featured: data.featured || false,
      content,
      liveUrl: data.liveUrl || '',
      role: data.role || '',
      client: data.client || '',
      year: data.year || '',
      deliverables: data.deliverables || [],
      stats: data.stats || [],
      beforeImage: data.beforeImage || '',
      color: data.color || '',
    }
  } catch {
    return null
  }
}
