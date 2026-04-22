import { getAllProjects, getProjectBySlug, type Project } from '@/lib/projects'
import { toWebP } from '@/lib/image-utils'

const BADGE_STYLES: Record<string, string> = {
  SLATE:      'bg-primary text-white',
  Freelance:  'bg-foreground text-background',
  'Pro-bono': 'bg-emerald-700 text-white',
}
import { notFound } from 'next/navigation'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import Link from 'next/link'

export async function generateStaticParams() {
  const projects = getAllProjects()
  return projects.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return {}
  const ogImages = project.heroImage
    ? [{ url: project.heroImage, alt: project.title }]
    : undefined
  return {
    title: `${project.title} — Mitchell Anderson`,
    description: project.summary,
    alternates: {
      canonical: `https://mitchellanderson.com.au/work/${slug}/`,
    },
    openGraph: {
      title: `${project.title} — Mitchell Anderson`,
      description: project.summary,
      url: `https://mitchellanderson.com.au/work/${slug}/`,
      images: ogImages,
    },
    twitter: {
      title: `${project.title} — Mitchell Anderson`,
      description: project.summary,
      images: project.heroImage ? [project.heroImage] : undefined,
    },
  }
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(project.content)
  const contentHtml = processedContent.toString()

  const accentColor = project.color || '#7C1D2E'
  const otherProjects = getAllProjects().filter(p => p.slug !== slug).slice(0, 3)

  const projectSchema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    url: `https://mitchellanderson.com.au/work/${slug}/`,
    author: {
      '@type': 'Person',
      name: 'Mitchell Anderson',
      url: 'https://mitchellanderson.com.au',
    },
    ...(project.heroImage && { image: `https://mitchellanderson.com.au${project.heroImage}` }),
    ...(project.year && { dateCreated: project.year }),
  }

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(projectSchema) }} />

      


      {/* ── Hero image (after) ────────────────────────────────────── */}
      {project.heroImage && (
        <div className="w-full border-y border-maroon-100 bg-maroon-50">
          <img
            src={toWebP(project.heroImage)}
            alt={`${project.title} — live site`}
            className="w-full object-cover max-h-[70vh]"
            fetchPriority="high"
          />
        </div>
      )}

      {/* ── Back nav ─────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pt-10 pb-4">
        <Link
          href="/work/"
          className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform duration-200">←</span>
          Back to Work
        </Link>
      </div>

      {/* ── Header ───────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-10">
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {project.tags.map(tag => (
              <span
                key={tag}
                className="text-xs font-sans font-medium text-primary bg-maroon-50 px-3 py-1 rounded-full border border-maroon-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h1 className="font-heading font-bold text-4xl md:text-6xl text-foreground tracking-tight leading-tight mb-5">
          {project.title}
        </h1>
        <p className="font-sans text-xl text-muted-foreground max-w-2xl leading-relaxed mb-8">
          {project.summary}
        </p>

        {/* Meta strip */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-b border-maroon-100 py-4">
          {project.client && (
            <div>
              <p className="font-sans text-xs font-semibold tracking-widest uppercase text-muted-foreground/60 mb-0.5">Client</p>
              <p className="font-sans text-sm font-medium text-foreground">{project.client}</p>
            </div>
          )}
          {project.role && (
            <div>
              <p className="font-sans text-xs font-semibold tracking-widest uppercase text-muted-foreground/60 mb-0.5">Role</p>
              <p className="font-sans text-sm font-medium text-foreground">{project.role}</p>
            </div>
          )}
          {project.year && (
            <div>
              <p className="font-sans text-xs font-semibold tracking-widest uppercase text-muted-foreground/60 mb-0.5">Year</p>
              <p className="font-sans text-sm font-medium text-foreground">{project.year}</p>
            </div>
          )}
          {project.badge && (
            <div>
              <p className="font-sans text-xs font-semibold tracking-widest uppercase text-muted-foreground/60 mb-1.5">Context</p>
              <span className={`text-[10px] font-sans font-bold tracking-widest uppercase px-2.5 py-1 rounded-full ${BADGE_STYLES[project.badge] ?? 'bg-foreground text-background'}`}>
                {project.badge}
              </span>
            </div>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1.5 font-sans text-sm font-medium text-primary hover:opacity-70 transition-opacity"
            >
              Visit Live Site
              <span className="text-xs">↗</span>
            </a>
          )}
        </div>
      </section>

      

      {/* ── Deliverables + Stats ─────────────────────────────────── */}
      {(project.deliverables?.length || project.stats?.length) ? (
        <section className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 border-b border-maroon-100">

          {project.deliverables && project.deliverables.length > 0 && (
            <div>
              <p className="font-sans text-xs font-semibold tracking-widest uppercase text-muted-foreground/60 mb-5">What I Built</p>
              <ul className="space-y-2.5">
                {project.deliverables.map((d, i) => (
                  <li key={i} className="flex items-start gap-3 font-sans text-sm text-foreground">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {project.stats && project.stats.length > 0 && (
            <div>
              <p className="font-sans text-xs font-semibold tracking-widest uppercase text-muted-foreground/60 mb-5">Key Outcomes</p>
              <div className="grid grid-cols-2 gap-6">
                {project.stats.map((s, i) => (
                  <div key={i}>
                    <p className="font-heading font-bold text-3xl text-foreground leading-none mb-1">{s.value}</p>
                    <p className="font-sans text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </section>
      ) : null}

      {/* ── Before / After ───────────────────────────────────────── */}
      {project.beforeImage && project.heroImage && (
        <section className="max-w-5xl mx-auto px-6 py-16 border-b border-maroon-100">
          <p className="font-sans text-xs font-semibold tracking-widest uppercase text-muted-foreground/60 mb-8">Before & After</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="rounded-xl overflow-hidden border border-maroon-100 aspect-video bg-maroon-50">
                <img
                  src={toWebP(project.beforeImage)}
                  alt={`${project.title} — before redesign`}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 font-sans text-xs text-muted-foreground text-center">Before</p>
            </div>
            <div>
              <div className="rounded-xl overflow-hidden border border-maroon-100 aspect-video bg-maroon-50">
                <img
                  src={toWebP(project.heroImage)}
                  alt={`${project.title} — after redesign`}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
              </div>
              <p className="mt-3 font-sans text-xs text-muted-foreground text-center">After</p>
            </div>
          </div>
        </section>
      )}

      {/* ── Markdown body ────────────────────────────────────────── */}
      {contentHtml && contentHtml.replace(/<[^>]*>/g, '').trim() && (
        <article className="max-w-2xl mx-auto px-6 py-16">
          <div
            className="prose prose-lg max-w-none prose-headings:font-heading prose-headings:font-bold prose-headings:text-foreground prose-p:text-muted-foreground prose-p:leading-relaxed prose-a:text-primary prose-strong:text-foreground prose-img:w-full prose-img:rounded-xl prose-img:my-8"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>
      )}

      {/* ── Footer CTA ───────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-6 pb-16 pt-8 border-t border-maroon-100 flex items-center justify-between flex-wrap gap-4">
        <Link
          href="/work/"
          className="inline-flex items-center gap-2 font-sans text-sm font-medium text-muted-foreground hover:text-foreground transition-colors duration-200 group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform duration-200">←</span>
          All projects
        </Link>
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-sans text-sm font-semibold bg-foreground text-background px-5 py-2.5 rounded-full hover:opacity-80 transition-opacity"
          >
            View Live Site
            <span>↗</span>
          </a>
        )}
      </div>

      {/* ── More Work ────────────────────────────────────────────── */}
      {otherProjects.length > 0 && (
        <section className="bg-maroon-50 border-t border-maroon-100 py-16">
          <div className="max-w-5xl mx-auto px-6">
            <p className="font-sans text-xs font-semibold tracking-widest uppercase text-muted-foreground/60 mb-8">More Work</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {otherProjects.map((p: Project) => (
                <Link
                  key={p.slug}
                  href={`/work/${p.slug}/`}
                  className="group block rounded-xl overflow-hidden border border-maroon-100 bg-white hover:shadow-md transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div className="aspect-video overflow-hidden bg-maroon-50">
                    {p.thumbnail && (
                      <img
                        src={p.thumbnail}
                        alt={p.title}
                        className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {p.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="text-[10px] font-sans font-medium text-primary bg-maroon-50 px-2 py-0.5 rounded-full border border-maroon-200">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <h3 className="font-heading font-bold text-base text-foreground mb-1 group-hover:text-primary transition-colors duration-200">
                      {p.title}
                    </h3>
                    <p className="font-sans text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {p.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
