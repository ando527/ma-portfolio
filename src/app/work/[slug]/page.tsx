import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllProjects, getProjectBySlug, type Project } from '@/lib/projects'
import { getAllServices } from '@/lib/services'
import { getArticlesLinkingTo, toArticleCard } from '@/lib/articles'
import { renderMarkdown } from '@/lib/markdown'
import { pageMetadata, absoluteUrl } from '@/lib/site'
import { graph, breadcrumbNode, refs } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import PageHero from '@/components/PageHero'
import BrowserFrame from '@/components/BrowserFrame'
import ProjectCard from '@/components/ProjectCard'
import { ArticleCard } from '@/components/ArticleSlider'
import ProseLayout, { OnThisPage, AsideCard } from '@/components/ProseLayout'
import ReducedMotionVideos from '@/components/ReducedMotionVideos'
import BeforeAfter from '@/components/BeforeAfter'
import { AnimateIn } from '@/components/ui/animate-in'
import { btnOnDark, btnLight, btnSecondary, btnInk, btnArrow } from '@/components/ui/button'
import '@/app/prose.css'

const BADGE_STYLES: Record<string, string> = {
  SLATE:      'bg-primary text-white',
  Freelance:  'bg-white text-foreground',
  'Pro-bono': 'bg-emerald-700 text-white',
}

const LABEL = 'eyebrow text-primary'

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
  const url = absoluteUrl(`/work/${slug}/`)

  const schema = graph(
    {
      '@type': 'CreativeWork',
      '@id': `${url}#case-study`,
      name: project.title,
      headline: project.seoTitle,
      description: project.seoDescription,
      url,
      mainEntityOfPage: url,
      inLanguage: 'en-AU',
      isPartOf: refs.website,
      author: refs.person,
      creator: refs.person,
      ...(project.ogImage && { image: absoluteUrl(project.ogImage) }),
      ...(project.date && { dateCreated: project.date }),
      keywords: project.tags.join(', '),
      ...(project.client && {
        about: {
          '@type': 'Organization',
          name: project.client.replace(/\s*[—(].*$/, ''),
          ...(project.liveUrl && { url: project.liveUrl }),
        },
      }),
    },
    breadcrumbNode(`/work/${slug}/`, [
      { name: 'Home', path: '/' },
      { name: 'Work', path: '/work/' },
      { name: project.title, path: `/work/${slug}/` },
    ]),
  )

  const meta = [
    project.client && { label: 'Client', value: project.client },
    project.role && { label: 'Role', value: project.role },
    project.year && { label: 'Year', value: project.year },
  ].filter(Boolean) as { label: string; value: string }[]

  return (
    <div className="bg-background">
      <JsonLd data={schema} />
      <ReducedMotionVideos />
      <div aria-hidden className="scroll-progress" />

      {/* ── Header: dark fold, screenshot straddling the edge ───────── */}
      <PageHero
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Work', href: '/work/' }, { name: project.title }]}
        eyebrow={
          <span className="inline-flex items-center gap-3">
            Case study
            {project.badge && (
              <span className={`text-xs font-bold tracking-wider px-2.5 py-1 rounded-full ${BADGE_STYLES[project.badge] ?? 'bg-white text-foreground'}`}>
                {project.badge}
              </span>
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
              sizes="(min-width: 1152px) 1104px, calc(100vw - 48px)"
              priority
            />
          )
        }
      >
        <div className="flex flex-wrap items-end gap-x-10 gap-y-6 pt-7 border-t border-white/10">
          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            {meta.map(m => (
              <div key={m.label}>
                <dt className="eyebrow text-white/60 mb-1.5">{m.label}</dt>
                <dd className="font-sans text-[15px] font-medium text-white">{m.value}</dd>
              </div>
            ))}
          </dl>
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={btnOnDark}>
              Visit live site
              <span aria-hidden className={btnArrow}>↗</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
        </div>
      </PageHero>

      {/* ── Deliverables + Stats ─────────────────────────────────── */}
      {(project.deliverables?.length || project.stats?.length) ? (
        <section className="max-w-6xl mx-auto px-6 pt-20 md:pt-28 pb-16 md:pb-20 grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] gap-14 lg:gap-20">
          {project.deliverables && project.deliverables.length > 0 && (
            <AnimateIn>
              <h2 className={`${LABEL} mb-6`}>What I Built</h2>
              <ul className="border-t border-maroon-100">
                {project.deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-4 py-3.5 border-b border-maroon-100 font-sans text-base md:text-[17px] text-foreground">
                    <span aria-hidden className="mt-[0.55em] w-2 h-2 rounded-[2px] bg-primary rotate-45 flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </AnimateIn>
          )}

          {project.stats && project.stats.length > 0 && (
            <AnimateIn delay={0.08}>
              <h2 className={`${LABEL} mb-6`}>Key Outcomes</h2>
              {/* Rows of label and value on phones; a 2×2 grid of tiles from md */}
              <dl className="grid md:grid-cols-2 md:gap-4 border-t border-maroon-100 md:border-0">
                {project.stats.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-baseline justify-between gap-6 py-4 border-b border-maroon-100 md:flex-col-reverse md:items-start md:justify-end md:gap-2 md:p-6 md:rounded-2xl md:border md:border-maroon-100 md:bg-card"
                  >
                    <dt className="font-sans text-sm text-muted-foreground">{s.label}</dt>
                    <dd className="display shrink-0 text-2xl md:text-[2.5rem] text-foreground">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </AnimateIn>
          )}
        </section>
      ) : null}

      {/* ── Before / After ───────────────────────────────────────── */}
      {before && hero && (
        <section className="max-w-6xl mx-auto px-6 pt-4 pb-16 md:pb-24" aria-labelledby="before-after-heading">
          <AnimateIn>
            <h2 id="before-after-heading" className={`${LABEL} mb-6`}>Before &amp; After</h2>
            <BeforeAfter before={before} after={hero} beforeAlt={project.beforeAlt} afterAlt={project.heroAlt} />
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
                <h2 className={`${LABEL} mb-3`}>Built with</h2>
                <ul className="flex flex-wrap gap-2" aria-label="Tags">
                  {project.tags.map(tag => (
                    <li key={tag} className="text-xs font-sans font-medium text-primary bg-maroon-50 px-3 py-1.5 rounded-full border border-maroon-200">{tag}</li>
                  ))}
                </ul>
                {services.length > 0 && (
                  <p className="mt-4 font-sans text-sm text-muted-foreground">
                    Want something similar? Read about my{' '}
                    {services.map((s, i) => (
                      <span key={s.slug}>
                        {i > 0 && (i === services.length - 1 ? ' and ' : ', ')}
                        <Link prefetch={false} href={`/${s.slug}/`} className="font-medium text-primary underline underline-offset-2 hover:text-maroon-700">
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
            <h2 id="articles-heading" className={`${LABEL} mb-6`}>
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
        <div className="pt-8 border-t border-maroon-100 flex items-center justify-between flex-wrap gap-4">
          <Link prefetch={false} href="/work/" className={btnSecondary}>
            <span aria-hidden className="text-primary transition-transform duration-200 ease-out-expo group-hover/btn:-translate-x-0.5 motion-reduce:transition-none">←</span>
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

      {/* ── More Work ────────────────────────────────────────────── */}
      {otherProjects.length > 0 && (
        <section className="bg-maroon-50 border-t border-maroon-100 py-20 md:py-24" aria-labelledby="more-work-heading">
          <div className="max-w-6xl mx-auto px-6">
            <h2 id="more-work-heading" className="display text-4xl md:text-5xl text-foreground mb-12">More work</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
              {otherProjects.map(p => (
                <li key={p.slug}>
                  <ProjectCard project={{ slug: p.slug, title: p.title, summary: p.summary, tags: p.tags, badge: p.badge, thumb: p.images.thumb }} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Next case study ──────────────────────────────────────── */}
      {next && (
        <section className="on-dark relative overflow-hidden bg-ink" aria-labelledby="next-project-heading">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(55% 75% at 12% 40%, rgba(124, 29, 46, 0.38), transparent 70%)' }}
          />
          <div className="group relative max-w-6xl mx-auto px-6 pt-20 md:pt-28 grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-10 md:gap-14 items-center">
            <div>
              <p className="eyebrow flex items-center gap-3 text-maroon-200">
                <span aria-hidden className="h-px w-8 bg-maroon-200/60" />
                Next case study
              </p>
              <h2 id="next-project-heading" className="display mt-5 text-[clamp(2.25rem,12.5vw,2.75rem)] sm:text-6xl lg:text-7xl text-white">
                <Link
                  prefetch={false}
                  href={`/work/${next.slug}/`}
                  className="transition-colors duration-200 group-hover:text-maroon-200 focus-visible:outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:rounded-2xl focus-visible:after:outline-maroon-200"
                >
                  {next.title}
                </Link>
              </h2>
              <p className="mt-5 max-w-md font-sans text-lg text-white/70 leading-relaxed line-clamp-3">{next.summary}</p>
              <span aria-hidden className={`mt-8 ${btnLight}`}>
                Read the case study
                <span className={btnArrow}>→</span>
              </span>
            </div>
            {next.images.thumb && (
              <div className="rounded-[1.5rem] overflow-hidden ring-1 ring-white/10 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.8)] aspect-[16/10] bg-maroon-900">
                <img
                  src={next.images.thumb.src}
                  srcSet={next.images.thumb.srcSet}
                  sizes="(min-width: 1152px) 580px, (min-width: 768px) 52vw, calc(100vw - 48px)"
                  width={next.images.thumb.width}
                  height={next.images.thumb.height}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top transition-transform duration-700 ease-out-expo group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  )
}
