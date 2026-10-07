import { getAllArticles, toArticleCard } from '@/lib/articles'
import { pageMetadata, absoluteUrl } from '@/lib/site'
import { graph, webPageNode, breadcrumbNode, refs } from '@/lib/schema'
import JsonLd from '@/components/JsonLd'
import PageHero from '@/components/PageHero'
import { FeatureCard } from '@/components/ArticleSlider'

// Not in the header nav yet; reached from the footer's Writing column, the
// article breadcrumbs, and by trimming an article URL back to /articles/.

const DESCRIPTION =
  'Articles by Brisbane web developer Mitchell Anderson on Webflow, Shopify, front-end development and running websites that are easy to look after.'

export const metadata = pageMetadata({
  title: 'Articles on Web Development',
  description: DESCRIPTION,
  path: '/articles/',
})

export default function ArticlesPage() {
  const articles = getAllArticles()

  return (
    <div className="bg-background">
      <JsonLd
        data={graph(
          webPageNode('/articles/', {
            type: 'CollectionPage',
            name: 'Articles',
            description: DESCRIPTION,
            author: refs.person,
            breadcrumb: true,
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: articles.map((a, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: absoluteUrl(`/articles/${a.slug}/`),
                name: a.title,
              })),
            },
          }),
          breadcrumbNode('/articles/', [
            { name: 'Home', path: '/' },
            { name: 'Articles', path: '/articles/' },
          ]),
        )}
      />

      <PageHero
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Articles' }]}
        eyebrow="Writing"
        title="Articles"
        intro="Notes on Webflow, Shopify and front-end development, and what I've learned building websites for clients."
      />

      <section className="py-16 md:py-20" aria-label="Articles">
        <ul className="max-w-6xl mx-auto px-6 grid gap-8">
          {articles.map(a => (
            <li key={a.slug}>
              <FeatureCard article={toArticleCard(a)} headingAs="h2" />
            </li>
          ))}
        </ul>
      </section>

    </div>
  )
}
