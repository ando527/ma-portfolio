'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import ArticleCover from '@/components/ArticleCover'
import type { ArticleCardData } from '@/lib/types'

// Homepage articles. One article gets a wide feature card; two or more become
// a scroll-snap row with previous/next buttons. The row scrolls natively
// (touch, trackpad, keyboard), and the buttons only appear when it overflows.

function Meta({ article }: { article: ArticleCardData }) {
  return (
    <p className="font-sans text-sm text-muted-foreground">
      <time dateTime={article.date}>{article.dateLabel}</time>
      {article.publication && <span className="block">First published in the {article.publication}</span>}
    </p>
  )
}

/** The card's one link. Its ::after covers the whole card, so clicking
 *  anywhere opens the article, and the link text itself is clickable too. */
function ReadLink({ article }: { article: ArticleCardData }) {
  return (
    <Link
      prefetch={false}
      href={`/articles/${article.slug}/`}
      className="mt-auto inline-flex items-center gap-1.5 self-start font-sans text-sm font-semibold text-primary hover:text-maroon-700 after:absolute after:inset-0 after:content-[''] after:rounded-2xl"
    >
      Read the article<span className="sr-only">: {article.title}</span>
      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
    </Link>
  )
}

function FeatureCard({ article }: { article: ArticleCardData }) {
  return (
    <article className="group relative grid md:grid-cols-[1.15fr_1fr] rounded-2xl overflow-hidden border border-maroon-100 bg-card transition-shadow duration-300 hover:shadow-xl">
      <div className="aspect-[16/10] md:aspect-auto md:min-h-[340px]">
        <ArticleCover article={article} sizes="(min-width: 1152px) 560px, (min-width: 768px) 53vw, 100vw" />
      </div>
      <div className="flex flex-col gap-4 p-7 sm:p-10">
        <Meta article={article} />
        <h3 className="font-heading font-bold text-2xl md:text-3xl text-foreground leading-tight tracking-tight">
          <span className="group-hover:text-primary transition-colors duration-200">{article.title}</span>
        </h3>
        <p className="font-sans text-base text-muted-foreground leading-relaxed max-w-prose">{article.summary}</p>
        <ReadLink article={article} />
      </div>
    </article>
  )
}

function SlideCard({ article }: { article: ArticleCardData }) {
  return (
    <article className="group relative flex flex-col h-full rounded-2xl overflow-hidden border border-maroon-100 bg-card transition-shadow duration-300 hover:shadow-xl">
      <div className="aspect-[16/10]">
        <ArticleCover article={article} sizes="(min-width: 640px) 440px, 85vw" />
      </div>
      <div className="flex flex-col gap-3 p-6 flex-1">
        <Meta article={article} />
        <h3 className="font-heading font-bold text-xl text-foreground leading-snug">
          <span className="group-hover:text-primary transition-colors duration-200">{article.title}</span>
        </h3>
        <p className="font-sans text-sm text-muted-foreground leading-relaxed line-clamp-3">{article.summary}</p>
        <ReadLink article={article} />
      </div>
    </article>
  )
}

function ArrowButton({ dir, disabled, onClick }: { dir: 'prev' | 'next'; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? 'Previous articles' : 'Next articles'}
      className="w-11 h-11 rounded-full border border-maroon-200 text-primary flex items-center justify-center transition-colors duration-200 hover:bg-maroon-50 disabled:opacity-35 disabled:hover:bg-transparent disabled:cursor-default"
    >
      <svg aria-hidden className={`w-4 h-4 ${dir === 'prev' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
      </svg>
    </button>
  )
}

export default function ArticleSlider({ articles }: { articles: ArticleCardData[] }) {
  const trackRef = useRef<HTMLUListElement>(null)
  const [edges, setEdges] = useState({ start: true, end: true })

  const update = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setEdges({ start: el.scrollLeft <= 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 })
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [update])

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector('li')
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollBy({ left: dir * step, behavior: reduce ? 'auto' : 'smooth' })
  }

  if (articles.length === 0) return null
  if (articles.length === 1) return <FeatureCard article={articles[0]} />

  const overflowing = !(edges.start && edges.end)

  return (
    <div>
      {overflowing && (
        <div className="flex justify-end gap-2 mb-5">
          <ArrowButton dir="prev" disabled={edges.start} onClick={() => scroll(-1)} />
          <ArrowButton dir="next" disabled={edges.end} onClick={() => scroll(1)} />
        </div>
      )}
      <ul
        ref={trackRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-2 -mx-6 px-6 scroll-px-6"
        aria-label="Articles"
      >
        {articles.map(article => (
          <li key={article.slug} className="snap-start shrink-0 w-[85%] sm:w-[440px]">
            <SlideCard article={article} />
          </li>
        ))}
      </ul>
    </div>
  )
}
