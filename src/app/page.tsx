import Link from 'next/link'
import { getAllProjects, formatMonth } from '@/lib/projects'
import { getAllArticles, toArticleCard } from '@/lib/articles'
import { getImage } from '@/lib/images'
import { pageMetadata, absoluteUrl } from '@/lib/site'
import { graph, webPageNode, businessNode, imageObject, refs } from '@/lib/schema'
import type { ArticleCardData, FeaturedProject } from '@/lib/types'
import JsonLd from '@/components/JsonLd'
import HeroBackground from '@/components/HeroBackground'
import BrowserWindow from '@/components/BrowserWindow'
import HeroContent from '@/components/HeroContent'
import ArticleSlider from '@/components/ArticleSlider'
import Testimonials from '@/components/Testimonials'
import SectionHeading from '@/components/SectionHeading'
import { AnimateIn, StaggerIn, FadeItem } from '@/components/ui/animate-in'
import { btnSecondary, btnArrow } from '@/components/ui/button'

const DESCRIPTION =
  'Mitchell Anderson is a web developer in Brisbane building fast, accessible websites in Webflow, Shopify and Next.js, from UX and wireframes through to launch.'

export const metadata = pageMetadata({
  absoluteTitle: 'Mitchell Anderson | Web Developer in Brisbane',
  description: DESCRIPTION,
  path: '/',
})

const HERO = getImage('/images/hero.png')
const HERO_SIZES = '(min-width: 1024px) 800px, 88vw'

const SERVICES = [
  {
    title: 'Webflow development',
    body: 'End-to-end Webflow builds optimised for CMS flexibility, editor experience and client handoff',
    href: '/webflow-development/',
    linkLabel: 'Webflow development',
    icon: 'M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3',
  },
  {
    title: 'Shopify and e-commerce',
    body: 'Custom Shopify themes and online stores designed to convert and built to scale',
    href: '/shopify-development/',
    linkLabel: 'Shopify development',
    icon: 'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z',
  },
  {
    title: 'Front-end engineering',
    body: 'Bridging creative vision and performant code with Next.js: accessible, fast and built to last',
    href: '/nextjs-development/',
    linkLabel: 'Next.js development',
    icon: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5',
  },
  {
    title: 'UX and strategy',
    body: 'Discovery, wireframing and information architecture that turn business goals into intuitive interfaces',
    icon: 'M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.648l3.876-5.814a1.151 1.151 0 0 0-1.597-1.597L14.146 6.32a15.996 15.996 0 0 0-4.649 4.763m3.42 3.42a6.776 6.776 0 0 0-3.42-3.42',
  },
] as const

export default function Home() {
  const featured: FeaturedProject[] = getAllProjects()
    .filter(p => p.featured)
    .slice(0, 4)
    .map(p => ({
      slug: p.slug,
      title: p.title,
      dateLabel: formatMonth(p.date),
      tags: p.tags,
      summary: p.summary,
      favicon: p.favicon || '',
      hero: p.images.hero,
      preview: p.preview,
    }))

  const articles: ArticleCardData[] = getAllArticles().map(toArticleCard)

  return (
    <>
      <JsonLd
        data={graph(
          webPageNode('/', {
            type: 'WebPage',
            name: 'Mitchell Anderson | Web Developer in Brisbane',
            description: DESCRIPTION,
            about: refs.person,
            primaryImageOfPage: imageObject(absoluteUrl(HERO.src), HERO.width, HERO.height, 'Mitchell Anderson, web developer in Brisbane'),
          }),
          businessNode(),
        )}
      />

      {/* ── Hero ───────────────────────────────────────────────────
          Flat dark surface, shorter than the screen so the top of the next
          section shows underneath and invites a scroll. The portrait is a cutout
          that sits straight on the surface, anchored bottom-right and cropped by
          the section edge: no box, no wash. */}
      <section className="on-dark sticky top-0 z-0 flex h-[clamp(36rem,calc(100svh-5rem),60rem)] w-full flex-col overflow-hidden bg-d-page lg:block lg:h-[clamp(36rem,calc(100svh-8rem),60rem)]">
        <HeroBackground />

        <div className="relative z-10 mx-auto w-full max-w-6xl px-6 sm:px-8 lg:grid lg:h-full lg:grid-cols-2 lg:gap-x-12">
          {/* Text: upper-middle of the calm space on desktop, under the nav on mobile */}
          <div className="flex flex-col justify-start pt-20 sm:pt-28 lg:justify-center lg:pb-16 lg:pt-16">
            <HeroContent />
          </div>
        </div>

        {/* Portrait: on desktop as tall as the section (the file is square, so
            its width follows); on mobile it fills what is left under the text. */}
        <div className="pointer-events-none relative z-[1] min-h-0 flex-1 select-none lg:absolute lg:inset-0 lg:flex-none">
          <img
            src={HERO.src}
            srcSet={HERO.srcSet}
            sizes={HERO_SIZES}
            width={HERO.width}
            height={HERO.height}
            alt="Mitchell Anderson, web developer in Brisbane"
            className="absolute bottom-0 left-1/2 h-full max-h-[115vw] w-auto max-w-none -translate-x-1/2 lg:left-auto lg:right-[max(0px,calc((100vw_-_1920px)/2.5))] lg:h-[94%] lg:max-h-none lg:translate-x-0"
            fetchPriority="high"
            decoding="async"
            draggable={false}
          />
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────
          A light sheet with rounded top corners that slides up over the
          sticky hero as the page scrolls. */}
      <Testimonials />

      {/* ── Services ──────────────────────────────────────────────────
          A light band of its own, one step darker than the paper around it, so
          it reads as the strongest section under the hero. */}
      <section
        className="relative z-10 border-t border-line-strong bg-raised py-24 md:py-32"
        aria-labelledby="services-heading"
      >
        <div className="mx-auto max-w-6xl px-6 sm:px-8">
          <AnimateIn className="mb-12 grid gap-6 md:mb-16 lg:grid-cols-12 lg:items-end lg:gap-x-12">
            <div className="lg:col-span-8">
              <p className="flex items-baseline gap-3">
                <span aria-hidden className="split">01</span>
                <span className="eyebrow">Services</span>
              </p>
              <h2
                id="services-heading"
                className="display-sm mt-3 max-w-[26ch] text-balance text-4xl text-fg sm:text-[2.5rem] md:text-[2.75rem] md:leading-[1.1]"
              >
                Webflow, Shopify and Next.js, from wireframe to launch
              </h2>
            </div>
            <p className="font-sans text-lg leading-7 text-fg-2 lg:col-span-4 lg:pb-1">
              Design, development and strategy handled end to end
            </p>
          </AnimateIn>

          {/* Three cards with a page, then one wide card without. Only cards with a page react to hover. */}
          <StaggerIn className="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3" stagger={0.06}>
            {SERVICES.map(item => {
              const linked = 'href' in item
              return (
                <FadeItem key={item.title} className={`h-full ${linked ? 'lift-host' : 'lg:col-span-3'}`}>
                  <div
                    className={`relative h-full rounded-2xl border border-line bg-card p-8 transition-[background-color,border-color] duration-150 ease-spec motion-reduce:transition-none ${
                      linked ? 'lift ' : ''
                    }${
                      linked
                        ? 'group flex flex-col hover:border-line-strong hover:bg-paper'
                        : 'lg:grid lg:grid-cols-3 lg:gap-x-6'
                    }`}
                  >
                    <div className={linked ? undefined : 'lg:col-span-1'}>
                      <span aria-hidden className={`mb-8 flex h-6 w-6 text-fg ${linked ? 'icon-lift' : ''}`}>
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                      </span>
                      <h3 className="font-heading text-2xl font-medium leading-8 text-fg">{item.title}</h3>
                    </div>
                    <p className={`font-sans text-base leading-6 text-fg-2 ${linked ? 'mt-3' : 'mt-3 lg:col-span-2 lg:mt-14 lg:max-w-[52ch]'}`}>
                      {item.body}
                    </p>
                    {linked && (
                      <Link
                        prefetch={false}
                        href={item.href}
                        className="mt-auto inline-flex items-center gap-2 self-start pt-8 font-sans text-base font-medium text-accent transition-colors duration-150 ease-spec after:absolute after:inset-0 after:content-[''] group-hover:text-accent-hover motion-reduce:transition-none"
                      >
                        <span className="py-2 underline decoration-1 underline-offset-4">{item.linkLabel}</span>
                        <span aria-hidden className="arrow-nudge">→</span>
                      </Link>
                    )}
                  </div>
                </FadeItem>
              )
            })}
          </StaggerIn>
        </div>
      </section>

      {/* ── Featured work ─────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section
          className="relative z-10 py-20 md:py-28 bg-card border-t border-line"
          aria-labelledby="featured-heading"
        >
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <AnimateIn className="mb-12 md:mb-16">
              <SectionHeading
                id="featured-heading"
                index="02"
                eyebrow="Case studies"
                title="Featured projects"
                intro="Recent client builds. Flick between them, then open the full case study."
                action={
                  <Link prefetch={false} href="/work/" className={`hidden sm:inline-flex ${btnSecondary}`}>
                    View all work
                    <span aria-hidden className={btnArrow}>→</span>
                  </Link>
                }
              />
            </AnimateIn>
            <AnimateIn delay={0.1}>
              <BrowserWindow projects={featured} />
            </AnimateIn>
            {/* The mockup switches projects with tabs; these are plain links
                to each case study for keyboard, screen reader and crawler use.
                Hidden until a keyboard user tabs into them, so focus is never invisible. */}
            <nav aria-label="Featured case studies" className="sr-only focus-within:not-sr-only focus-within:block focus-within:mt-8">
              <ul className="flex flex-wrap gap-x-6 gap-y-2">
                {featured.map(p => (
                  <li key={p.slug}>
                    <Link prefetch={false} href={`/work/${p.slug}/`} className="inline-flex py-1 font-sans text-sm font-medium text-accent underline underline-offset-4">
                      {p.title} case study
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-8 sm:hidden">
              <Link prefetch={false} href="/work/" className={btnSecondary}>
                View all work
                <span aria-hidden className={btnArrow}>→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Articles ──────────────────────────────────────────────── */}
      {articles.length > 0 && (
        <section className="relative z-10 py-20 md:py-28 bg-paper border-t border-line" aria-labelledby="articles-heading">
          <div className="max-w-6xl mx-auto px-6 sm:px-8">
            <AnimateIn className="mb-12 md:mb-16">
              <SectionHeading
                id="articles-heading"
                index="03"
                eyebrow="Writing"
                title="Articles"
                intro="Notes on Webflow, Shopify and front-end development, from building sites for clients."
                action={
                  <Link prefetch={false} href="/articles/" className={btnSecondary}>
                    All articles
                    <span aria-hidden className={btnArrow}>→</span>
                  </Link>
                }
              />
            </AnimateIn>
            <AnimateIn delay={0.1}>
              <ArticleSlider articles={articles} />
            </AnimateIn>
          </div>
        </section>
      )}

    </>
  )
}
