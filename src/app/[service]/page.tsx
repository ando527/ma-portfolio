import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllServices, getServiceBySlug } from '@/lib/services'
import { getProjectsByTag, type Project } from '@/lib/projects'
import { getArticleBySlug, formatDate } from '@/lib/articles'
import { renderMarkdown } from '@/lib/markdown'
import { pageMetadata, SITE } from '@/lib/site'
import { graph, serviceNodes, businessNode } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import PageHero from '@/components/PageHero'
import FrameStack from '@/components/FrameStack'
import ProjectCard from '@/components/ProjectCard'
import ProseLayout, { AsideCard } from '@/components/ProseLayout'
import SectionHeading from '@/components/SectionHeading'
import { AnimateIn } from '@/components/ui/animate-in'
import { btnPrimary, btnSecondary, btnArrow } from '@/components/ui/button'
// prose.css is imported once, in src/app/layout.tsx

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

  const schema = graph(...serviceNodes(service), businessNode())

  const stack = projects.filter(p => p.images.hero).map(p => ({ image: p.images.hero!, url: hostOf(p.liveUrl) }))

  return (
    <div className="bg-paper">
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
              <span aria-hidden className="arrow-nudge-down arrow-nudge text-on-accent/80 dark:text-on-accent">↓</span>
            </a>
          )}
          <a href={SITE.links.linkedin} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
            Talk about a project
            <span aria-hidden className={btnArrow}>↗</span>
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
                <p className="eyebrow mb-4">Related article</p>
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
                    className="w-full h-auto rounded-lg mb-4 border border-line"
                  />
                )}
                <Link prefetch={false} href={`/articles/${a.slug}/`} className="font-heading font-medium text-base text-fg hover:text-accent transition-colors duration-150 ease-spec">
                  {a.title}
                </Link>
                <p className="split mt-1">{formatDate(a.date)}</p>
              </AsideCard>
            ))}
            {projects.length > 0 && (
              <AsideCard>
                <p className="eyebrow mb-4">Case studies</p>
                <ul className="grid gap-2">
                  {projects.map(p => (
                    <li key={p.slug}>
                      <Link prefetch={false} href={`/work/${p.slug}/`} className="inline-flex py-1 font-sans text-sm text-fg hover:text-accent underline underline-offset-4 decoration-line-strong hover:decoration-current transition-colors duration-150 ease-spec">
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
        <section id="case-studies" className="scroll-mt-24 border-t border-line py-20 md:py-24" aria-labelledby="case-studies-heading">
          <div className="max-w-6xl mx-auto px-6">
            <AnimateIn className="mb-12">
              <SectionHeading
                id="case-studies-heading"
                index="01"
                eyebrow={service.name}
                title="Case studies"
                action={
                  <Link prefetch={false} href="/work/" className={btnSecondary}>
                    All work
                    <span aria-hidden className={`text-fg-3 ${btnArrow}`}>→</span>
                  </Link>
                }
              />
            </AnimateIn>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {projects.map(p => (
                <li key={p.slug}>
                  <ProjectCard
                    project={{ slug: p.slug, title: p.title, summary: p.summary, tags: p.tags, badge: p.badge, thumb: p.images.thumb, date: p.date }}
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── FAQs ─────────────────────────────────────────────────── */}
      {service.faqs.length > 0 && (
        <section id="faq" className="scroll-mt-24 border-t border-line py-20 md:py-24" aria-labelledby="faq-heading">
          <div className="max-w-6xl mx-auto px-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)] lg:gap-20 items-start">
            <AnimateIn className="lg:sticky lg:top-32">
              <SectionHeading
                id="faq-heading"
                index={projects.length > 0 ? '02' : '01'}
                eyebrow="FAQs"
                title="Common questions"
                size="md"
              />
            </AnimateIn>
            <AnimateIn className="grid gap-2">
              {service.faqs.map(f => (
                <details
                  key={f.question}
                  className="faq-item group rounded-xl border border-line bg-card transition-[border-color,background-color] duration-150 ease-spec hover:border-line-strong open:border-line-strong motion-reduce:transition-none"
                >
                  <summary className="flex items-center justify-between gap-6 px-5 py-4 cursor-pointer list-none rounded-xl [&::-webkit-details-marker]:hidden">
                    <h3 className="font-heading font-medium text-base sm:text-lg leading-7 text-fg">
                      {f.question}
                    </h3>
                    <span aria-hidden className="w-8 h-8 shrink-0 rounded-lg bg-raised text-fg-2 flex items-center justify-center">
                      <svg className="w-4 h-4 transition-transform duration-150 ease-spec group-open:rotate-45 motion-reduce:transition-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </span>
                  </summary>
                  <p className="px-5 pb-5 pr-12 font-sans text-base leading-7 text-fg-2 max-w-[68ch]">
                    {f.answer}
                  </p>
                </details>
              ))}
            </AnimateIn>
          </div>
        </section>
      )}

    </div>
  )
}
