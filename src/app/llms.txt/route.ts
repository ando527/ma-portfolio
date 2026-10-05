import { getAllProjects } from '@/lib/projects'
import { getAllServices } from '@/lib/services'
import { getAllArticles } from '@/lib/articles'
import { SITE, absoluteUrl } from '@/lib/site'

// /llms.txt: a plain-text guide to the site for AI assistants and search tools
// (https://llmstxt.org). Built from the same content as the pages, so it
// can't drift out of date.

export const dynamic = 'force-static'

export function GET() {
  const projects = getAllProjects()
  const services = getAllServices()
  const articles = getAllArticles()

  const lines = [
    `# ${SITE.name}`,
    '',
    `> Web developer in Brisbane, Australia, building websites in Webflow, Shopify and Next.js, from UX and wireframes through to front-end development and launch. Head of Web Development at ${SITE.employer.name}.`,
    '',
    'Mitchell leads client web projects end to end at SLATE Media, a Brisbane agency, and takes on freelance and pro-bono work. He holds a Bachelor of Information Technology from the University of Queensland, and is a WCA Delegate and Website Coordinator for Speedcubing Australia.',
    '',
    '## Pages',
    '',
    `- [Home](${absoluteUrl('/')}): introduction, featured projects and services`,
    `- [Work](${absoluteUrl('/work/')}): every case study`,
    `- [About](${absoluteUrl('/about/')}): background, experience and speedcubing results`,
    '',
    '## Services',
    '',
    ...services.map(s => `- [${s.name}](${absoluteUrl(`/${s.slug}/`)}): ${s.seoDescription}`),
    '',
    '## Case studies',
    '',
    ...projects.map(p => `- [${p.title}](${absoluteUrl(`/work/${p.slug}/`)}): ${p.summary}`),
    '',
    ...(articles.length
      ? [
          '## Articles',
          '',
          ...articles.map(a => {
            const url = a.hasBody && !a.canonicalToOriginal ? absoluteUrl(`/articles/${a.slug}/`) : a.originalUrl ?? absoluteUrl(`/articles/${a.slug}/`)
            return `- [${a.title}](${url}): ${a.summary}`
          }),
          '',
        ]
      : []),
    '## Contact',
    '',
    `- LinkedIn: ${SITE.links.linkedin}`,
    `- GitHub: ${SITE.links.github}`,
    '- Location: Brisbane, Queensland, Australia',
    '- Available for freelance projects and collaborations',
    '',
  ]

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
