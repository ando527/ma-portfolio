import Link from 'next/link'
import { getAllProjects, getPreviewSections, formatMonth } from '@/lib/projects'
import { getAllArticles, toArticleCard } from '@/lib/articles'
import { getImage } from '@/lib/images'
import { pageMetadata } from '@/lib/site'
import { graph, webPageNode, refs } from '@/lib/schema'
import type { ArticleCardData, FeaturedProject } from '@/lib/types'
import JsonLd from '@/components/JsonLd'
import HeroBackground from '@/components/HeroBackground'
import BrowserWindow from '@/components/BrowserWindow'
import HeroContent from '@/components/HeroContent'
import ArticleSlider from '@/components/ArticleSlider'
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
const HERO_SIZES = '92vh'

const EXPERTISE = [
  {
    title: 'Webflow Development',
    body: 'End-to-end Webflow builds optimised for CMS flexibility, editor experience and client handoff.',
    href: '/webflow-development/',
    linkLabel: 'Webflow development',
    icon: 'M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0 1 15 18.257V17.25m6-12V15a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 15V5.25m18 0A2.25 2.25 0 0 0 18.75 3H5.25A2.25 2.25 0 0 0 3 5.25m18 0H3',
  },
  {
    title: 'Shopify & E-commerce',
    body: 'Custom Shopify themes and e-commerce experiences designed to convert and built to scale.',
    href: '/shopify-development/',
    linkLabel: 'Shopify development',
    icon: 'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z',
  },
  {
    title: 'Front-End Engineering',
    body: 'Bridging creative vision and performant code with Next.js — accessible, fast and built to last.',
    href: '/nextjs-development/',
    linkLabel: 'Next.js development',
    icon: 'M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5',
  },
  {
    title: 'UX & Strategy',
    body: 'Discovery, wireframing and information architecture that turns business goals into intuitive interfaces.',
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
      sections: getPreviewSections(p.content),
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
            primaryImageOfPage: { '@type': 'ImageObject', url: `https://mitchellanderson.com.au${HERO.src}` },
          }),
        )}
      />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="on-dark sticky top-0 z-0 h-screen w-full overflow-hidden bg-ink">

        <HeroBackground />

        {/* Photo + bottom fade — treated as one unit */}
        <div className="absolute bottom-0 right-0 h-[92%] w-screen z-[10] select-none pointer-events-none flex justify-end">
          <img
            src={HERO.src}
            srcSet={HERO.srcSet}
            sizes={HERO_SIZES}
            width={HERO.width}
            height={HERO.height}
            alt="Mitchell Anderson, web developer in Brisbane"
            className="h-full w-auto object-cover object-top"
            fetchPriority="high"
            decoding="async"
            draggable={false}
          />
          {/* Gradient lives inside so it always travels with the image */}
          <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-[#100408]/90 to-transparent pointer-events-none" />
        </div>

        {/* Mobile-only overlay: subtle dark wash so text stays legible over the photo */}
        <div
          className="md:hidden absolute inset-0 z-20 pointer-events-none"
          style={{ background: 'linear-gradient(160deg, rgba(16,4,8,0.72) 45%, rgba(16,4,8,0.25) 80%, transparent 100%)' }}
        />

        {/* Text — bottom-aligned, left column */}
        <div className="relative z-30 h-full flex flex-col justify-end pb-24 md:pb-28 px-6 sm:px-10 md:px-16 lg:px-24">
          <HeroContent />
        </div>

        {/* Scroll nudge */}
        <div aria-hidden className="absolute bottom-10 left-6 sm:left-10 md:left-16 lg:left-24 z-30 hidden sm:flex items-center gap-3 text-white/50">
          <span className="w-8 h-px bg-current" />
          <span className="eyebrow">Scroll</span>
        </div>

      </section>

      {/* ── Featured Work ─────────────────────────────────────────────
          A light sheet with rounded top corners that slides up over the
          sticky hero as the page scrolls. */}
      {featured.length > 0 && (
        <section
          className="relative z-10 pt-20 md:pt-28 pb-24 bg-card rounded-t-[2rem] md:rounded-t-[2.75rem] shadow-[0_-24px_60px_-24px_rgba(0,0,0,0.55)]"
          aria-labelledby="featured-heading"
        >
          <div className="max-w-6xl mx-auto px-6">
            <AnimateIn className="mb-12 md:mb-14">
              <SectionHeading
                id="featured-heading"
                index="01"
                eyebrow="Selected work"
                title="Featured Projects"
                intro="Recent client builds. Flick between them, then open the full case study."
                action={
                  <Link prefetch={false} href="/work/" className={`hidden sm:inline-flex ${btnSecondary}`}>
                    View all work
                    <span aria-hidden className={`text-primary ${btnArrow}`}>→</span>
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
                    <Link prefetch={false} href={`/work/${p.slug}/`} className="inline-flex py-1 font-sans text-sm font-semibold text-primary underline underline-offset-[3px]">
                      {p.title} case study
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-8 sm:hidden">
              <Link prefetch={false} href="/work/" className={btnSecondary}>
                View all work
                <span aria-hidden className={`text-primary ${btnArrow}`}>→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Articles ──────────────────────────────────────────────── */}
      {articles.length > 0 && (
        <section className="relative z-10 py-24 md:py-28 bg-background border-t border-maroon-100" aria-labelledby="articles-heading">
          <div className="max-w-6xl mx-auto px-6">
            <AnimateIn className="mb-12 md:mb-14">
              <SectionHeading
                id="articles-heading"
                index="02"
                eyebrow="Writing"
                title="Articles"
                intro="Notes on Webflow, Shopify and front-end development, from building sites for clients."
                action={
                  <Link prefetch={false} href="/articles/" className={btnSecondary}>
                    All articles
                    <span aria-hidden className={`text-primary ${btnArrow}`}>→</span>
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

      {/* ── Expertise ─────────────────────────────────────────────── */}
      <section className="on-dark relative z-10 py-24 md:py-32 bg-ink overflow-hidden" aria-labelledby="expertise-heading">
        {/* Soft wine glow behind the grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(60% 70% at 85% 30%, rgba(124, 29, 46, 0.28), transparent 70%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.7fr] gap-14 lg:gap-16 items-start">

            {/* Left — heading block */}
            <AnimateIn className="lg:sticky lg:top-32">
              <SectionHeading
                id="expertise-heading"
                index="03"
                eyebrow="Expertise"
                tone="dark"
                size="md"
                title={<>Building digital{' '}<br />experiences.</>}
                intro="End-to-end across design, development and strategy — from the first wireframe through to launch."
              />
            </AnimateIn>

            {/* Right — 2×2 service grid. Only cards with a page react to hover. */}
            <StaggerIn
              className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/[0.08] rounded-3xl overflow-hidden ring-1 ring-white/[0.08]"
              stagger={0.1}
              delayChildren={0.05}
            >
              {EXPERTISE.map((item, i) => (
                <FadeItem
                  key={item.title}
                  className={`relative flex flex-col bg-ink p-8 md:p-9 min-h-[16rem] ${'href' in item ? 'group hover:bg-[#1a070c] transition-colors duration-300' : ''}`}
                >
                  {/* Accent line that draws across the top on hover */}
                  {'href' in item && (
                    <span aria-hidden className="absolute top-0 left-0 h-px w-0 bg-maroon-200 transition-[width] duration-500 ease-out-expo group-hover:w-full motion-reduce:transition-none" />
                  )}
                  <div className="flex items-start justify-between mb-8">
                    <span aria-hidden className="w-12 h-12 rounded-2xl bg-white/[0.05] ring-1 ring-white/10 flex items-center justify-center text-maroon-200 transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                    </span>
                    <span aria-hidden className="font-heading font-semibold text-sm text-white/55 tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-xl text-white mb-2.5">{item.title}</h3>
                  <p className="font-sans text-[15px] text-white/65 leading-relaxed">{item.body}</p>
                  {'href' in item && (
                    <Link
                      prefetch={false}
                      href={item.href}
                      className="mt-auto pt-6 inline-flex items-center gap-1.5 self-start font-sans text-sm font-semibold text-maroon-200 after:absolute after:inset-0 after:content-[''] group-hover:text-white transition-colors duration-200"
                    >
                      {item.linkLabel}
                      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">→</span>
                    </Link>
                  )}
                </FadeItem>
              ))}
            </StaggerIn>
          </div>
        </div>
      </section>

    </>
  )
}
