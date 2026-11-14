import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllProjects, getProjectBySlug, formatMonth, type Project } from '@/lib/projects'
import { getAllServices } from '@/lib/services'
import { getArticlesLinkingTo, toArticleCard } from '@/lib/articles'
import { renderMarkdown } from '@/lib/markdown'
import { pageMetadata } from '@/lib/site'
import { graph, caseStudyNodes } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import PageHero from '@/components/PageHero'
import BrowserFrame from '@/components/BrowserFrame'
import ProjectCard from '@/components/ProjectCard'
import { ArticleCard } from '@/components/ArticleSlider'
import ProseLayout, { OnThisPage, AsideCard } from '@/components/ProseLayout'
import ReducedMotionVideos from '@/components/ReducedMotionVideos'
import BeforeAfter from '@/components/BeforeAfter'
import { AnimateIn } from '@/components/ui/animate-in'
import { btnPrimary, btnSecondary, btnInk, btnArrow } from '@/components/ui/button'
// prose.css is imported once, in src/app/layout.tsx

/** A section title: sentence case, one size for every section on the page. */
const H2 = 'display-sm text-2xl md:text-3xl text-fg'

export const dynamicParams = false

export async function generateStaticParams() {
  return getAllProjects().map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return {}
  return pageMetadata({
    title: project.seoTitle,
    description: project.seoDescription,
    path: `/work/${slug}/`,
    ogImage: project.ogImage,
    ogImageAlt: project.heroAlt,
    type: 'article',
    publishedTime: project.date,
    modifiedTime: project.updated ?? project.date,
    section: 'Case study',
    tags: project.tags,
  })
}

/** Services whose related tags overlap this project's tags. */
function relatedServices(project: Project) {
  const tags = project.tags.map(t => t.toLowerCase())
  return getAllServices().filter(s => s.relatedTags.some(t => tags.includes(t.toLowerCase())))
}

const hostOf = (url?: string) => (url ? url.replace(/^https?:\/\//, '').replace(/\/$/, '') : undefined)

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const { html, headings } = await renderMarkdown(project.content)
  // "Next case study" is the next one down the Work page's newest-first
  // list, wrapping round; "More work" shows three others besides that one.
  const all = getAllProjects()
  const index = all.findIndex(p => p.slug === slug)
  const next = all.length > 1 ? all[(index + 1) % all.length] : undefined
  const otherProjects = all.filter(p => p.slug !== slug && p.slug !== next?.slug).slice(0, 3)
  const services = relatedServices(project)
  const articles = getArticlesLinkingTo(`/work/${slug}/`).map(toArticleCard)
  const { hero, before } = project.images
  const testimonials = project.testimonials ?? []
  const multiple = testimonials.length > 1

  const schema = graph(...caseStudyNodes(project))

  const meta = [
    project.client && { label: 'Client', value: project.client },
    project.role && { label: 'Role', value: project.role },
    project.year && { label: 'Year', value: project.year },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="bg-paper">
      <JsonLd data={schema} />
      <ReducedMotionVideos />
      <div aria-hidden className="scroll-progress" />

      {/* ── Header: paper, screenshot straddling the hairline onto a raised band ── */}
      <PageHero
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Work', href: '/work/' }, { name: project.title }]}
        eyebrow={
          <span className="inline-flex items-center gap-3">
            Case study
            {project.badge && (
              <>
                <span aria-hidden>/</span>
                <span>{project.badge}</span>
              </>
            )}
          </span>
        }
        title={project.title}
        intro={project.summary}
        overlap={
          hero && (
            <BrowserFrame
              image={hero}
              alt={project.heroAlt}
              url={hostOf(project.liveUrl)}
              sizes="(min-width: 1152px) 1088px, (min-width: 640px) calc(100vw - 64px), calc(100vw - 48px)"
              priority
            />
          )
        }
      >
        <div className="flex flex-wrap items-end gap-x-10 gap-y-6 pt-8 border-t border-line">
          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            {meta.map(m => (
              <div key={m.label}>
                <dt className="eyebrow mb-1">{m.label}</dt>
                <dd className="font-sans text-base font-medium text-fg tabular-nums">{m.value}</dd>
              </div>
            ))}
          </dl>
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
              Visit live site
              <span aria-hidden className={btnArrow}>↗</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
        </div>
      </PageHero>

      {/* ── Deliverables + Stats ─────────────────────────────────── */}
      {(project.deliverables?.length || project.stats?.length) ? (
        <section className="max-w-6xl mx-auto px-6 pt-20 md:pt-24 pb-16 md:pb-20 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-12 lg:gap-20">
          {project.deliverables && project.deliverables.length > 0 && (
            <AnimateIn>
              <h2 className={`${H2} mb-6`}>What I built</h2>
              <ol className="border-t border-line">
                {project.deliverables.map((d, i) => (
                  <li key={i} className="flex items-baseline gap-4 py-3 border-b border-line font-sans text-base text-fg">
                    <span aria-hidden className="split w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    {d}
                  </li>
                ))}
              </ol>
            </AnimateIn>
          )}

          {project.stats && project.stats.length > 0 && (
            <AnimateIn delay={0.08}>
              <h2 className={`${H2} mb-6`}>Key outcomes</h2>
              {/* Rows of label and value on phones; a 2×2 grid of tiles from md */}
              <dl className="grid md:grid-cols-2 md:gap-4 border-t border-line md:border-0">
                {project.stats.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-baseline justify-between gap-6 py-4 border-b border-line md:flex-col-reverse md:items-start md:justify-end md:gap-2 md:p-6 md:rounded-2xl md:border md:border-line md:bg-card"
                  >
                    <dt className="font-sans text-sm text-fg-2">{s.label}</dt>
                    <dd className="display shrink-0 text-2xl md:text-3xl text-fg tabular-nums">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </AnimateIn>
          )}
        </section>
      ) : null}

      {/* ── Before / After ───────────────────────────────────────── */}
      {before && hero && (
        <section className="max-w-6xl mx-auto px-6 pb-16 md:pb-24" aria-labelledby="before-after-heading">
          <AnimateIn>
            <h2 id="before-after-heading" className={`${H2} mb-6`}>Before and after</h2>
            <BeforeAfter before={before} after={hero} beforeAlt={project.beforeAlt} afterAlt={project.heroAlt} />
          </AnimateIn>
        </section>
      )}

      {/* ── Testimonials ─────────────────────────────────────────────
          Between the before/after and the write-up, so skimmers see it.
          No bottom padding: the write-up brings its own top padding. */}
      {testimonials.length > 0 && (
        <section className="max-w-6xl mx-auto px-6" aria-labelledby="testimonial-heading">
          <AnimateIn>
            <h2 id="testimonial-heading" className={`${H2} mb-6`}>What the client said</h2>
            {/* One review fills the width; two or more sit side by side from md. */}
            <div className={multiple ? 'grid gap-6 md:grid-cols-2 md:gap-8' : undefined}>
              {testimonials.map((t, i) => (
                <figure key={i} className={`flex flex-col rounded-2xl border border-line bg-card p-6 ${multiple ? 'lg:p-8' : 'md:p-8'}`}>
                  {t.rating ? (
                    <div
                      role="img"
                      aria-label={`Rated ${t.rating} out of 5`}
                      className="mb-6 flex gap-1"
                    >
                      {[1, 2, 3, 4, 5].map(n => (
                        <svg
                          key={n}
                          aria-hidden
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={`h-4 w-4 ${n <= t.rating! ? 'text-accent' : 'text-line-strong'}`}
                        >
                          <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L1.4 7.8l6-.8L10 1.5z" />
                        </svg>
                      ))}
                    </div>
                  ) : null}
                  <blockquote className={`mb-8 max-w-3xl space-y-4 font-heading font-medium text-fg ${multiple ? 'text-lg leading-7' : 'text-lg leading-7 md:text-xl md:leading-8'}`}>
                    {t.quote.map((paragraph, j) => (
                      <p key={j}>{paragraph}</p>
                    ))}
                  </blockquote>
                  <figcaption className="mt-auto border-t border-line pt-5 font-sans">
                    <p className="font-medium text-fg">
                      {t.name}
                      {(t.role || t.company) && (
                        <span className="font-normal text-fg-2">, {[t.role, t.company].filter(Boolean).join(', ')}</span>
                      )}
                    </p>
                    {(t.source || t.date) && (
                      <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-sm text-fg-3">
                        {t.source}
                        {t.source && t.date && <span aria-hidden>/</span>}
                        {t.date && (
                          <time dateTime={t.date} className="split">{formatMonth(t.date)}</time>
                        )}
                      </p>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </AnimateIn>
        </section>
      )}

      {/* ── The write-up, with a sticky sidebar ──────────────────── */}
      {html.replace(/<[^>]*>/g, '').trim() && (
        <ProseLayout
          html={html}
          aside={
            <>
              <OnThisPage headings={headings} />
              <AsideCard>
                <h2 className="eyebrow mb-3">Built with</h2>
                <ul className="flex flex-wrap gap-2" aria-label="Tags">
                  {project.tags.map(tag => (
                    <li key={tag} className="split rounded-md bg-raised border border-line px-2 py-1">{tag}</li>
                  ))}
                </ul>
                {services.length > 0 && (
                  <p className="mt-4 font-sans text-sm text-fg-2">
                    Want something similar? Read about my{' '}
                    {services.map((s, i) => (
                      <span key={s.slug}>
                        {i > 0 && (i === services.length - 1 ? ' and ' : ', ')}
                        <Link prefetch={false} href={`/${s.slug}/`} className="font-medium text-accent underline underline-offset-4 hover:text-accent-hover">
                          {s.name}
                        </Link>
                      </span>
                    ))}
                    {' '}work.
                  </p>
                )}
              </AsideCard>
            </>
          }
        />
      )}

      {/* ── Articles that link to this case study ───────────────── */}
      {articles.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 pt-12 md:pt-16 pb-8" aria-labelledby="articles-heading">
          <AnimateIn>
            <h2 id="articles-heading" className={`${H2} mb-6`}>
              {articles.length === 1 ? 'An article' : 'Articles'} featuring {project.title}
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(a => (
                <li key={a.slug}>
                  <ArticleCard article={a} />
                </li>
              ))}
            </ul>
          </AnimateIn>
        </section>
      )}

      {/* ── Footer CTA ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pb-20 pt-8">
        <div className="pt-8 border-t border-line flex items-center justify-between flex-wrap gap-4">
          <Link prefetch={false} href="/work/" className={btnSecondary}>
            <span aria-hidden className="arrow-nudge-back arrow-nudge text-fg-3">←</span>
            All projects
          </Link>
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={btnInk}>
              View live site
              <span aria-hidden className={btnArrow}>↗</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>

      {/* ── More work ────────────────────────────────────────────── */}
      {otherProjects.length > 0 && (
        <section className="border-t border-line py-20 md:py-24" aria-labelledby="more-work-heading">
          <div className="max-w-6xl mx-auto px-6">
            <h2 id="more-work-heading" className="display-sm text-3xl md:text-4xl text-fg mb-12">More work</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {otherProjects.map(p => (
                <li key={p.slug}>
                  <ProjectCard project={{ slug: p.slug, title: p.title, summary: p.summary, tags: p.tags, badge: p.badge, thumb: p.images.thumb, date: p.date }} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Next case study ──────────────────────────────────────── */}
      {next && (
        <section className="border-t border-line bg-raised" aria-labelledby="next-project-heading">
          <div className="group relative max-w-6xl mx-auto px-6 py-20 md:py-24 grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-10 md:gap-16 items-center">
            <div>
              <p className="eyebrow">Next case study</p>
              <h2 id="next-project-heading" className="display mt-4 text-4xl sm:text-5xl lg:text-6xl text-fg">
                <Link
                  prefetch={false}
                  href={`/work/${next.slug}/`}
                  className="transition-colors duration-150 ease-spec group-hover:text-accent focus-visible:outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:rounded-2xl focus-visible:after:outline-accent"
                >
                  {next.title}
                </Link>
              </h2>
              <p className="mt-4 max-w-md font-sans text-lg leading-7 text-fg-2 line-clamp-3">{next.summary}</p>
              <span aria-hidden className={`mt-8 ${btnPrimary}`}>
                Read the case study
                <span className={btnArrow}>→</span>
              </span>
            </div>
            {next.images.thumb && (
              <div className="rounded-2xl overflow-hidden border border-line bg-card shadow-soft aspect-[16/10]">
                <img
                  src={next.images.thumb.src}
                  srcSet={next.images.thumb.srcSet}
                  sizes="(min-width: 1152px) 580px, (min-width: 768px) 52vw, calc(100vw - 48px)"
                  width={next.images.thumb.width}
                  height={next.images.thumb.height}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
