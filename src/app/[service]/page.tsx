import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllServices, getServiceBySlug } from '@/lib/services'
import { getProjectsByTag, type Project } from '@/lib/projects'
import { getArticleBySlug, formatDate } from '@/lib/articles'
import { renderMarkdown } from '@/lib/markdown'
import { pageMetadata, absoluteUrl, SITE } from '@/lib/site'
import { graph, webPageNode, breadcrumbNode, refs } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import PageHero from '@/components/PageHero'
import FrameStack from '@/components/FrameStack'
import ProjectCard from '@/components/ProjectCard'
import ProseLayout, { AsideCard } from '@/components/ProseLayout'
import ContactStrip from '@/components/ContactStrip'
import { AnimateIn } from '@/components/ui/animate-in'
import { btnPrimary, btnOnDark } from '@/components/ui/button'
import '@/app/prose.css'

// Service pages: /webflow-development/, /shopify-development/, … from
// src/content/services/*.md. Any other top-level path 404s.
export const dynamicParams = false

export async function generateStaticParams() {
  return getAllServices().map(s => ({ service: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }) {
  const { service: slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) return {}
  return pageMetadata({
    title: service.seoTitle,
    description: service.seoDescription,
    path: `/${slug}/`,
  })
}

const hostOf = (url?: string) => (url ? url.replace(/^https?:\/\//, '').replace(/\/$/, '') : undefined)

export default async function ServicePage({ params }: { params: Promise<{ service: string }> }) {
  const { service: slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) notFound()

  const { html } = await renderMarkdown(service.content)

  // Case studies sharing any related tag, newest first, no duplicates.
  const seen = new Set<string>()
  const projects: Project[] = service.relatedTags
    .flatMap(tag => getProjectsByTag(tag))
    .filter(p => (seen.has(p.slug) ? false : (seen.add(p.slug), true)))
  const articles = service.relatedArticles.map(getArticleBySlug).filter(a => a !== null)

  const url = absoluteUrl(`/${slug}/`)
  const schema = graph(
    webPageNode(`/${slug}/`, {
      name: service.seoTitle,
      description: service.seoDescription,
      about: { '@id': `${url}#service` },
      breadcrumb: true,
    }),
    {
      '@type': 'Service',
      '@id': `${url}#service`,
      name: service.name,
      serviceType: service.name,
      description: service.seoDescription,
      url,
      provider: refs.person,
      areaServed: [
        { '@type': 'City', name: 'Brisbane' },
        { '@type': 'Country', name: 'Australia' },
      ],
    },
    breadcrumbNode(`/${slug}/`, [
      { name: 'Home', path: '/' },
      { name: service.name, path: `/${slug}/` },
    ]),
  )

  const stack = projects.filter(p => p.images.hero).map(p => ({ image: p.images.hero!, url: hostOf(p.liveUrl) }))

  return (
    <div className="bg-background">
      <JsonLd data={schema} />

      <PageHero
        crumbs={[{ name: 'Home', href: '/' }, { name: service.name }]}
        eyebrow="Services"
        title={service.title}
        intro={service.intro}
        visual={stack.length > 0 ? <FrameStack items={stack} /> : undefined}
      >
        <div className="flex flex-wrap gap-3">
          {projects.length > 0 && (
            <a href="#case-studies" className={btnPrimary}>
              See {projects.length === 1 ? 'the case study' : `${projects.length} case studies`}
            </a>
          )}
          <a href={SITE.links.linkedin} target="_blank" rel="noopener noreferrer" className={btnOnDark}>
            Talk about a project
            <span className="sr-only">(opens LinkedIn in a new tab)</span>
          </a>
        </div>
      </PageHero>

      {/* ── Body ───────────────────────────────────────────────── */}
      <ProseLayout
        html={html}
        aside={
          <>
            {articles.map(a => (
              <AsideCard key={a.slug}>
                <p className="font-sans text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Related article</p>
                {a.image && (
                  <img
                    src={a.image.src}
                    srcSet={a.image.srcSet}
                    sizes="300px"
                    width={a.image.width}
                    height={a.image.height}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto rounded-lg mb-4 border border-maroon-100"
                  />
                )}
                <Link prefetch={false} href={`/articles/${a.slug}/`} className="font-heading font-bold text-base text-foreground hover:text-primary transition-colors duration-200">
                  {a.title}
                </Link>
                <p className="mt-1 font-sans text-sm text-muted-foreground">{formatDate(a.date)}</p>
              </AsideCard>
            ))}
            {projects.length > 0 && (
              <AsideCard>
                <p className="font-sans text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">Case studies</p>
                <ul className="grid gap-1.5">
                  {projects.map(p => (
                    <li key={p.slug}>
                      <Link prefetch={false} href={`/work/${p.slug}/`} className="inline-flex py-0.5 font-sans text-sm text-primary hover:text-maroon-700 underline-offset-2 hover:underline">
                        {p.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </AsideCard>
            )}
          </>
        }
      />

      {/* ── Related case studies ─────────────────────────────────── */}
      {projects.length > 0 && (
        <section id="case-studies" className="scroll-mt-24 bg-card border-t border-maroon-100 py-20" aria-labelledby="case-studies-heading">
          <div className="max-w-6xl mx-auto px-6">
            <AnimateIn className="mb-10">
              <h2 id="case-studies-heading" className="font-heading font-bold text-3xl md:text-4xl text-foreground">
                Case studies
              </h2>
            </AnimateIn>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map(p => (
                <li key={p.slug}>
                  <ProjectCard
                    project={{ slug: p.slug, title: p.title, summary: p.summary, tags: p.tags, badge: p.badge, thumb: p.images.thumb }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <ContactStrip />
    </div>
  )
}
