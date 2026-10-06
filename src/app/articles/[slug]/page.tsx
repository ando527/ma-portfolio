import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAllArticles, getArticleBySlug, formatDate } from '@/lib/articles'
import { getServiceBySlug } from '@/lib/services'
import { renderMarkdown } from '@/lib/markdown'
import { pageMetadata, absoluteUrl, SITE } from '@/lib/site'
import { graph, breadcrumbNode, refs } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import PageHero from '@/components/PageHero'
import ProseLayout, { OnThisPage, AsideCard } from '@/components/ProseLayout'
import '@/app/prose.css'

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
    // Summary-only pages stay out of search until the full text is added.
    noindex: !article.hasBody,
  })
  // A republished article credits the original as canonical.
  if (article.canonicalToOriginal && article.hasBody) {
    meta.alternates = { canonical: article.originalUrl }
  }
  return meta
}

const LABEL = 'font-sans text-xs font-semibold tracking-widest uppercase text-muted-foreground'

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticleBySlug(slug)
  if (!article) notFound()

  const { html, headings } = article.hasBody ? await renderMarkdown(article.content) : { html: '', headings: [] }
  const services = article.relatedServices.map(getServiceBySlug).filter(s => s !== null)
  const url = absoluteUrl(`/articles/${slug}/`)

  const schema = graph(
    {
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: article.title,
      description: article.seoDescription,
      url,
      mainEntityOfPage: article.canonicalToOriginal ? article.originalUrl : url,
      datePublished: article.date,
      inLanguage: SITE.lang,
      author: refs.person,
      isPartOf: refs.website,
      ...(article.ogImage && { image: absoluteUrl(article.ogImage) }),
      ...(article.originalUrl && { isBasedOn: article.originalUrl }),
      keywords: article.tags.join(', '),
    },
    breadcrumbNode(`/articles/${slug}/`, [
      { name: 'Home', path: '/' },
      { name: 'Articles', path: '/articles/' },
      { name: article.title, path: `/articles/${slug}/` },
    ]),
  )

  return (
    <div className="bg-background">
      <JsonLd data={schema} />

      <article>
        <PageHero
          crumbs={[{ name: 'Home', href: '/' }, { name: 'Articles', href: '/articles/' }, { name: article.title }]}
          eyebrow="Article"
          title={article.title}
          intro={article.summary}
          overlap={
            article.image && (
              <img
                src={article.image.src}
                srcSet={article.image.srcSet}
                sizes="(min-width: 1152px) 1104px, calc(100vw - 48px)"
                width={article.image.width}
                height={article.image.height}
                alt={article.heroAlt}
                fetchPriority="high"
                decoding="async"
                className="block w-full h-auto rounded-2xl ring-1 ring-white/10 shadow-[0_40px_100px_-24px_rgba(0,0,0,0.65)]"
              />
            )
          }
        >
          <p className="font-sans text-sm text-white/60 flex flex-col gap-1">
            <time dateTime={article.date} className="font-medium text-white">{formatDate(article.date)}</time>
            {article.publication && (
              <span>
                {article.canonicalToOriginal ? 'First published in the' : 'Adapted from my piece in the'} {article.publication}
                {article.issue && <>, issue {article.issue}</>}
              </span>
            )}
          </p>
        </PageHero>

        <ProseLayout
          html={html || undefined}
          aside={
            <>
              <OnThisPage headings={headings} />
              {article.publication && article.originalUrl && (
                <AsideCard>
                  <h2 className={`${LABEL} mb-2`}>{article.canonicalToOriginal ? 'First published' : 'Originally written for'}</h2>
                  <p className="font-sans text-sm text-muted-foreground">
                    {formatDate(article.date)} in the{' '}
                    <a href={article.originalUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-maroon-700">
                      {article.publication}
                    </a>
                    {article.issue && <>, issue {article.issue}</>}.
                  </p>
                </AsideCard>
              )}
              {services.length > 0 && (
                <AsideCard>
                  <h2 className={`${LABEL} mb-3`}>Related</h2>
                  <ul className="grid gap-2">
                    {services.map(s => (
                      <li key={s.slug}>
                        <Link prefetch={false} href={`/${s.slug}/`} className="font-heading font-bold text-base text-foreground hover:text-primary transition-colors duration-200">
                          {s.name}
                        </Link>
                        <p className="mt-1 font-sans text-sm text-muted-foreground">{s.seoDescription}</p>
                      </li>
                    ))}
                  </ul>
                </AsideCard>
              )}
            </>
          }
        >
          {!article.hasBody && (
            <p className="font-sans text-lg text-muted-foreground leading-relaxed">
              The full article is on its way over from the {article.publication ?? 'original publication'}.
            </p>
          )}
        </ProseLayout>
      </article>
    </div>
  )
}
