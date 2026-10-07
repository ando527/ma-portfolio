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
import SectionHeading from '@/components/SectionHeading'
import { AnimateIn } from '@/components/ui/animate-in'
import { btnPrimary, btnOnDark, btnSecondary, btnArrow } from '@/components/ui/button'
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
    ...(service.faqs.length > 0
      ? [{
          '@type': 'FAQPage',
          '@id': `${url}#faq`,
          mainEntity: service.faqs.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: { '@type': 'Answer', text: f.answer },
          })),
        }]
      : []),
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
              <span aria-hidden className="text-white/80 transition-transform duration-200 ease-out-expo group-hover/btn:translate-y-0.5 motion-reduce:transition-none">↓</span>
            </a>
          )}
          <a href={SITE.links.linkedin} target="_blank" rel="noopener noreferrer" className={btnOnDark}>
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
                <p className="eyebrow text-primary mb-4">Related article</p>
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
                <p className="eyebrow text-primary mb-4">Case studies</p>
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
        <section id="case-studies" className="scroll-mt-24 bg-card border-t border-maroon-100 py-20 md:py-28" aria-labelledby="case-studies-heading">
          <div className="max-w-6xl mx-auto px-6">
            <AnimateIn className="mb-12 md:mb-14">
              <SectionHeading
                id="case-studies-heading"
                index="01"
                eyebrow={service.name}
                title="Case studies"
                action={
                  <Link prefetch={false} href="/work/" className={btnSecondary}>
                    All work
                    <span aria-hidden className={`text-primary ${btnArrow}`}>→</span>
                  </Link>
                }
              />
            </AnimateIn>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
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

      {/* ── FAQs ─────────────────────────────────────────────────── */}
      {service.faqs.length > 0 && (
        <section id="faq" className="scroll-mt-24 bg-background border-t border-maroon-100 py-20 md:py-28" aria-labelledby="faq-heading">
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
            <AnimateIn className="grid gap-3">
              {service.faqs.map(f => (
                <details
                  key={f.question}
                  className="faq-item group rounded-2xl border border-maroon-100 bg-card transition-[border-color,box-shadow] duration-300 open:border-maroon-200 open:shadow-[0_20px_40px_-28px_rgba(124,29,46,0.45)]"
                >
                  <summary className="flex items-center justify-between gap-6 px-5 sm:px-7 py-5 cursor-pointer list-none rounded-2xl [&::-webkit-details-marker]:hidden">
                    <h3 className="font-heading font-bold text-[17px] sm:text-lg leading-snug text-foreground group-hover:text-primary transition-colors duration-200">
                      {f.question}
                    </h3>
                    <span aria-hidden className="w-9 h-9 shrink-0 rounded-full bg-maroon-50 text-primary flex items-center justify-center transition-[transform,background-color,color] duration-300 group-open:rotate-45 group-open:bg-primary group-open:text-white motion-reduce:transition-none">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </span>
                  </summary>
                  <p className="px-5 sm:px-7 pb-6 sm:pr-20 font-sans text-base text-[var(--prose-body)] leading-relaxed max-w-[68ch]">
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
