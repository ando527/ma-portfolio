import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllProjects, getProjectBySlug, type Project } from '@/lib/projects'
import { getAllServices } from '@/lib/services'
import { renderMarkdown } from '@/lib/markdown'
import { pageMetadata, absoluteUrl } from '@/lib/site'
import { graph, breadcrumbNode, refs } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import PageHero from '@/components/PageHero'
import BrowserFrame from '@/components/BrowserFrame'
import ProjectCard from '@/components/ProjectCard'
import ProseLayout, { OnThisPage, AsideCard } from '@/components/ProseLayout'
import ReducedMotionVideos from '@/components/ReducedMotionVideos'
import { AnimateIn } from '@/components/ui/animate-in'
import { btnOnDark } from '@/components/ui/button'
import '@/app/prose.css'

const BADGE_STYLES: Record<string, string> = {
  SLATE:      'bg-primary text-white',
  Freelance:  'bg-foreground text-background',
  'Pro-bono': 'bg-emerald-700 text-white',
}

const LABEL = 'font-sans text-xs font-semibold tracking-widest uppercase text-muted-foreground'

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
  const otherProjects = getAllProjects().filter(p => p.slug !== slug).slice(0, 3)
  const services = relatedServices(project)
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
        <div className="flex flex-wrap items-end gap-x-10 gap-y-5">
          <dl className="flex flex-wrap gap-x-10 gap-y-4">
            {meta.map(m => (
              <div key={m.label}>
                <dt className="font-sans text-xs font-semibold tracking-widest uppercase text-white/50 mb-1">{m.label}</dt>
                <dd className="font-sans text-sm font-medium text-white">{m.value}</dd>
              </div>
            ))}
          </dl>
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className={btnOnDark}>
              Visit live site
              <span aria-hidden>↗</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
        </div>
      </PageHero>

      {/* ── Deliverables + Stats ─────────────────────────────────── */}
      {(project.deliverables?.length || project.stats?.length) ? (
        <section className="max-w-6xl mx-auto px-6 pt-16 md:pt-24 pb-16 grid md:grid-cols-2 gap-12 md:gap-20 border-b border-maroon-100">
          {project.deliverables && project.deliverables.length > 0 && (
            <AnimateIn>
              <h2 className={`${LABEL} mb-5`}>What I Built</h2>
              <ul className="space-y-2.5">
                {project.deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-3 font-sans text-base text-foreground">
                    <span aria-hidden className="mt-2 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </AnimateIn>
          )}

          {project.stats && project.stats.length > 0 && (
            <AnimateIn delay={0.08}>
              <h2 className={`${LABEL} mb-5`}>Key Outcomes</h2>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-8">
                {project.stats.map((s, i) => (
                  <div key={i} className="flex flex-col-reverse">
                    <dt className="font-sans text-sm text-muted-foreground">{s.label}</dt>
                    <dd className="font-heading font-bold text-4xl text-foreground leading-none mb-2">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </AnimateIn>
          )}
        </section>
      ) : null}

      {/* ── Before / After ───────────────────────────────────────── */}
      {before && hero && (
        <section className="max-w-6xl mx-auto px-6 py-16 border-b border-maroon-100">
          <h2 className={`${LABEL} mb-8`}>Before &amp; After</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { img: before, alt: project.beforeAlt, label: 'Before' },
              { img: hero, alt: project.heroAlt, label: 'After' },
            ].map(({ img, alt, label }) => (
              <figure key={label}>
                <div className="rounded-xl overflow-hidden border border-maroon-100 aspect-video bg-maroon-50">
                  <img
                    src={img.src}
                    srcSet={img.srcSet}
                    sizes="(min-width: 1152px) 540px, (min-width: 768px) 46vw, 100vw"
                    width={img.width}
                    height={img.height}
                    alt={alt}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <figcaption className="mt-3 font-sans text-sm text-muted-foreground text-center">{label}</figcaption>
              </figure>
            ))}
          </div>
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
                    <li key={tag} className="text-xs font-sans font-medium text-primary bg-maroon-50 px-2.5 py-1 rounded-full border border-maroon-200">{tag}</li>
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

      {/* ── Footer CTA ───────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 pb-16 pt-8 border-t border-maroon-100 flex items-center justify-between flex-wrap gap-4">
        <Link
          prefetch={false}
          href="/work/"
          className="inline-flex items-center gap-2 py-2 font-sans text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 group"
        >
          <span aria-hidden className="group-hover:-translate-x-0.5 transition-transform duration-200">←</span>
          All projects
        </Link>
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-sans text-sm font-semibold bg-foreground text-background px-5 py-2.5 rounded-full hover:opacity-80 transition-opacity"
          >
            View live site
            <span aria-hidden>↗</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        )}
      </div>

      {/* ── More Work ────────────────────────────────────────────── */}
      {otherProjects.length > 0 && (
        <section className="bg-maroon-50 border-t border-maroon-100 py-20" aria-labelledby="more-work-heading">
          <div className="max-w-6xl mx-auto px-6">
            <h2 id="more-work-heading" className="font-heading font-bold text-3xl text-foreground mb-10">More work</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {otherProjects.map(p => (
                <li key={p.slug}>
                  <ProjectCard project={{ slug: p.slug, title: p.title, summary: p.summary, tags: p.tags, badge: p.badge, thumb: p.images.thumb }} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
