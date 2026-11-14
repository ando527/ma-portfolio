import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllArticles, getArticleBySlug, formatDate } from '@/lib/articles'
import { getServiceBySlug } from '@/lib/services'
import { renderMarkdown } from '@/lib/markdown'
import { pageMetadata } from '@/lib/site'
import { graph, articleNodes } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import ProseLayout, { OnThisPage, AsideCard } from '@/components/ProseLayout'
// prose.css is imported once, in src/app/layout.tsx

export const dynamicParams = false

export async function generateStaticParams() {
  return getAllArticles().map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) return {}
  const meta = pageMetadata({
    title: article.seoTitle,
    description: article.seoDescription,
    path: `/articles/${slug}/`,
    ogImage: article.ogImage,
    ogImageAlt: article.heroAlt || undefined,
    type: 'article',
    publishedTime: article.date,
    modifiedTime: article.updated ?? article.date,
    section: article.tags[0],
    tags: article.tags,
    // A republished article credits the original as canonical.
    ...(article.canonicalToOriginal && article.hasBody && { canonical: article.originalUrl }),
    // Summary-only pages stay out of search until the full text is added.
    noindex: !article.hasBody,
  })
  return meta
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const { html, headings } = article.hasBody ? await renderMarkdown(article.content) : { html: '', headings: [] }
  const services = article.relatedServices.map(getServiceBySlug).filter(s => s !== null)
  // About 220 words a minute, counted from the markdown source.
  const readMinutes = article.hasBody ? Math.max(1, Math.round(article.content.split(/\s+/).filter(Boolean).length / 220)) : 0

  const schema = graph(...articleNodes(article, readMinutes))

  const crumbs = [
    { name: 'Home', href: '/' },
    { name: 'Articles', href: '/articles/' },
    { name: article.title, href: undefined as string | undefined },
  ]

  return (
    <div className="bg-paper">
      <JsonLd data={schema} />
      {article.hasBody && <div aria-hidden className="scroll-progress" />}

      <article>
        {/* Reading page: a light header with the title at page-title size. */}
        <header className={`max-w-6xl mx-auto px-6 pt-28 md:pt-36 ${article.image ? 'pb-10 md:pb-12' : 'pb-0'}`}>
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-sans text-sm text-fg-2">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-2 min-w-0">
                  {i > 0 && (
                    <svg aria-hidden className="w-3 h-3 text-fg-3 flex-shrink-0" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4.5 2.5 8 6l-3.5 3.5" />
                    </svg>
                  )}
                  {c.href ? (
                    <Link prefetch={false} href={c.href} className="py-1 hover:text-fg underline-offset-4 hover:underline transition-colors duration-150 ease-spec">
                      {c.name}
                    </Link>
                  ) : (
                    <span aria-current="page" className="text-fg truncate">{c.name}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          <div className="max-w-3xl">
            <p className="split flex flex-wrap items-baseline gap-x-3">
              <time dateTime={article.date}>{formatDate(article.date)}</time>
              {readMinutes > 0 && (
                <>
                  <span aria-hidden>/</span>
                  <span>{readMinutes} min read</span>
                </>
              )}
            </p>
            <h1 className="display mt-4 text-[2rem] sm:text-4xl md:text-[2.75rem] text-fg">{article.title}</h1>
            {article.summary && (
              <p className="mt-4 font-sans text-lg md:text-xl leading-7 md:leading-8 text-fg-2">{article.summary}</p>
            )}
            {article.publication && (
              <p className="mt-6 font-sans text-sm text-fg-3">
                {article.canonicalToOriginal ? 'First published in the' : 'Adapted from my piece in the'} {article.publication}
                {article.issue && <>, issue {article.issue}</>}
              </p>
            )}
          </div>
        </header>

        {article.image && (
          <div className="max-w-6xl mx-auto px-6">
            <img
              src={article.image.src}
              srcSet={article.image.srcSet}
              sizes="(min-width: 1152px) 1104px, calc(100vw - 48px)"
              width={article.image.width}
              height={article.image.height}
              alt={article.heroAlt}
              fetchPriority="high"
              decoding="async"
              className="block w-full h-auto rounded-2xl border border-line shadow-soft"
            />
          </div>
        )}

        <ProseLayout
          html={html || undefined}
          aside={
            <>
              <OnThisPage headings={headings} />
              {article.publication && article.originalUrl && (
                <AsideCard>
                  <h2 className="eyebrow mb-2">{article.canonicalToOriginal ? 'First published' : 'Originally written for'}</h2>
                  <p className="font-sans text-sm text-fg-2">
                    {formatDate(article.date)} in the{' '}
                    <a href={article.originalUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline underline-offset-4 hover:text-accent-hover">
                      {article.publication}
                    </a>
                    {article.issue && <>, issue {article.issue}</>}.
                  </p>
                </AsideCard>
              )}
              {services.length > 0 && (
                <AsideCard>
                  <h2 className="eyebrow mb-3">Related</h2>
                  <ul className="grid gap-4">
                    {services.map(s => (
                      <li key={s.slug}>
                        <Link prefetch={false} href={`/${s.slug}/`} className="font-heading font-medium text-base text-fg hover:text-accent transition-colors duration-150 ease-spec">
                          {s.name}
                        </Link>
                        <p className="mt-1 font-sans text-sm text-fg-2">{s.seoDescription}</p>
                      </li>
                    ))}
                  </ul>
                </AsideCard>
              )}
            </>
          }
        >
          {!article.hasBody && (
            <p className="font-sans text-lg text-fg-2 leading-7">
              The full article is on its way over from the {article.publication ?? 'original publication'}.
            </p>
          )}
        </ProseLayout>
      </article>
    </div>
  )
}
