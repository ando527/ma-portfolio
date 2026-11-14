import { getAllProjects } from '@/lib/projects'
import { pageMetadata, absoluteUrl } from '@/lib/site'
import { graph, webPageNode, breadcrumbNode, refs } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import PageHero from '@/components/PageHero'
import FrameStack from '@/components/FrameStack'
import WorkExplorer from '@/components/WorkExplorer'
import type { WorkItem } from '@/lib/types'

const DESCRIPTION =
  'Case studies of Webflow and Shopify websites built by Brisbane web developer Mitchell Anderson, from cafes and podcasts to a national sports body.'

export const metadata = pageMetadata({
  title: 'Brisbane Web Developer Portfolio',
  description: DESCRIPTION,
  path: '/work/',
})

const hostOf = (url?: string) => (url ? url.replace(/^https?:\/\//, '').replace(/\/$/, '') : undefined)

export default function WorkPage() {
  const projects = getAllProjects()
  const items: WorkItem[] = projects.map(p => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    tags: p.tags,
    badge: p.badge,
    thumb: p.images.thumb,
    date: p.date,
    effort: p.effort,
  }))

  const years = projects.map(p => Number(p.year || p.date.slice(0, 4))).filter(Boolean)
  const platforms = ['Webflow', 'Shopify'].filter(t => projects.some(p => p.tags.includes(t)))
  const stack = projects
    .filter(p => p.featured && p.images.hero)
    .slice(0, 3)
    .map(p => ({ image: p.images.hero!, url: hostOf(p.liveUrl) }))

  return (
    <div className="bg-paper">
      <JsonLd
        data={graph(
          webPageNode('/work/', {
            type: 'CollectionPage',
            name: 'Brisbane Web Developer Portfolio',
            description: DESCRIPTION,
            author: refs.person,
            breadcrumb: true,
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: projects.length,
              itemListElement: projects.map((p, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: absoluteUrl(`/work/${p.slug}/`),
                name: p.title,
              })),
            },
          }),
          breadcrumbNode('/work/', [
            { name: 'Home', path: '/' },
            { name: 'Work', path: '/work/' },
          ]),
        )}
      />

      <PageHero
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Work' }]}
        eyebrow="Portfolio"
        title="Work"
        intro="Client work and personal projects in Webflow, Shopify, Next.js and front-end development"
        visual={stack.length > 0 ? <FrameStack items={stack} /> : undefined}
      >
        <dl className="flex flex-wrap gap-x-8 gap-y-6 pt-8 border-t border-line">
          <div className="flex flex-col-reverse gap-1">
            <dt className="eyebrow">Case studies</dt>
            <dd className="display text-3xl text-fg tabular-nums">{projects.length}</dd>
          </div>
          {years.length > 0 && (
            <div className="flex flex-col-reverse gap-1">
              <dt className="eyebrow">Years</dt>
              <dd className="display text-3xl text-fg tabular-nums">
                {Math.min(...years)}–{Math.max(...years)}
              </dd>
            </div>
          )}
          {platforms.length > 0 && (
            <div className="flex flex-col-reverse gap-1">
              <dt className="eyebrow">Platforms</dt>
              <dd className="display text-3xl text-fg">{platforms.join(' & ')}</dd>
            </div>
          )}
        </dl>
      </PageHero>

      <section className="py-16 md:py-24" aria-label="Projects">
        <div className="max-w-6xl mx-auto px-6">
          <WorkExplorer projects={items} />
        </div>
      </section>
    </div>
  )
}
