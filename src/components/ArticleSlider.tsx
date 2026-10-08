'use client'

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import Link from 'next/link'
import ArticleCover from '@/components/ArticleCover'
import type { ArticleCardData } from '@/lib/types'

// Homepage articles. One article gets a wide feature card; two or more become
// a scroll-snap row with previous/next buttons. The row scrolls natively
// (touch, trackpad, keyboard), can be dragged with a mouse, and the buttons
// only appear when it overflows.

function Meta({ article }: { article: ArticleCardData }) {
  return (
    <p className="font-sans text-sm text-muted-foreground">
      <time dateTime={article.date} className="eyebrow text-primary">{article.dateLabel}</time>
      {article.publication && <span className="block mt-1.5">First published in the {article.publication}</span>}
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
      className="mt-auto inline-flex items-center gap-1.5 self-start pt-2 font-sans text-sm font-semibold text-primary hover:text-maroon-700 after:absolute after:inset-0 after:content-[''] after:rounded-[1.75rem]"
    >
      Read the article<span className="sr-only">: {article.title}</span>
      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none">→</span>
    </Link>
  )
}

const CARD =
  'group relative rounded-[1.75rem] overflow-hidden border border-maroon-100 bg-card transition-[box-shadow,border-color] duration-500 hover:border-maroon-200 hover:shadow-[0_30px_60px_-30px_rgba(124,29,46,0.4)]'
const COVER_ZOOM =
  'h-full overflow-hidden [&>*]:transition-transform [&>*]:duration-700 [&>*]:ease-out-expo group-hover:[&>*]:scale-[1.03] motion-reduce:[&>*]:transition-none motion-reduce:group-hover:[&>*]:scale-100'

/** A wide card for one article. Also used for each row on /articles/, where
 *  the title is an h2 rather than sitting under a section's h2. */
export function FeatureCard({ article, headingAs: Heading = 'h3' }: { article: ArticleCardData; headingAs?: 'h2' | 'h3' }) {
  return (
    <article className={`${CARD} grid md:grid-cols-[1.15fr_1fr]`}>
      <div className="aspect-[16/10] md:aspect-auto md:min-h-[360px]">
        <div className={COVER_ZOOM}>
          <ArticleCover article={article} sizes="(min-width: 1152px) 560px, (min-width: 768px) 53vw, 100vw" />
        </div>
      </div>
      <div className="flex flex-col gap-4 p-7 sm:p-10 lg:p-12">
        <Meta article={article} />
        <Heading className="font-heading font-bold text-2xl md:text-[2rem] text-foreground leading-[1.1] tracking-tight [font-stretch:106%]">
          <span className="group-hover:text-primary transition-colors duration-200">{article.title}</span>
        </Heading>
        <p className="font-sans text-base text-muted-foreground leading-relaxed max-w-prose">{article.summary}</p>
        <ReadLink article={article} />
      </div>
    </article>
  )
}

/** A tall card for the slider, also used in case studies' article lists. */
export function ArticleCard({ article }: { article: ArticleCardData }) {
  return (
    <article className={`${CARD} flex flex-col h-full`}>
      <div className="aspect-[16/10]">
        <div className={COVER_ZOOM}>
          <ArticleCover article={article} sizes="(min-width: 640px) 440px, 85vw" />
        </div>
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

  const behavior = (): ScrollBehavior =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

  const scroll = (dir: 1 | -1) => {
    const el = trackRef.current
    if (!el) return
    const card = el.querySelector('li')
    const step = card ? card.getBoundingClientRect().width + 24 : el.clientWidth * 0.8
    el.scrollBy({ left: dir * step, behavior: behavior() })
  }

  // Mouse dragging. Touch and trackpads already scroll natively, so only a
  // mouse is handled here. Snapping is off while dragging, and on release the
  // row settles on the nearest card, nudged one card in the direction of a
  // decent drag so a short flick still moves on.
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const [dragging, setDragging] = useState(false)

  const onPointerDown = (e: PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false }
  }

  const onPointerMove = (e: PointerEvent<HTMLUListElement>) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (!d.moved) {
      if (Math.abs(dx) < 6) return
      d.moved = true
      setDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    e.currentTarget.scrollLeft = d.left - dx
  }

  const endDrag = (e: PointerEvent<HTMLUListElement>) => {
    const d = drag.current
    drag.current = null
    if (!d?.moved) return
    const el = e.currentTarget
    suppressClick.current = true
    setTimeout(() => { suppressClick.current = false }, 0)

    const edge = el.getBoundingClientRect().left + 24
    const stops = Array.from(el.querySelectorAll('li'), li => el.scrollLeft + li.getBoundingClientRect().left - edge)
    const dx = d.left - el.scrollLeft
    let i = stops.reduce((best, s, n) => (Math.abs(s - el.scrollLeft) < Math.abs(stops[best] - el.scrollLeft) ? n : best), 0)
    if (Math.abs(dx) > 40) {
      const startIndex = stops.reduce((best, s, n) => (Math.abs(s - d.left) < Math.abs(stops[best] - d.left) ? n : best), 0)
      if (i === startIndex) i = Math.min(Math.max(i + (dx < 0 ? -1 : 1), 0), stops.length - 1)
    }
    const max = el.scrollWidth - el.clientWidth
    el.scrollTo({ left: Math.min(Math.max(stops[i], 0), max), behavior: behavior() })
    setDragging(false)
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
      {/* The track has to clip horizontally to scroll, which clips vertically
          too, so the bottom padding leaves room for the cards' hover shadow
          and the negative margin takes that space back out of the layout. */}
      <ul
        ref={trackRef}
        className={`flex gap-6 overflow-x-auto scrollbar-none pb-16 -mb-14 -mx-6 px-6 scroll-px-6 ${
          dragging ? 'snap-none select-none cursor-grabbing [&_*]:cursor-grabbing' : 'snap-x snap-mandatory'
        } ${overflowing && !dragging ? 'cursor-grab' : ''}`}
        aria-label="Articles"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDragStart={e => e.preventDefault()}
        onClickCapture={e => {
          if (suppressClick.current) {
            e.preventDefault()
            e.stopPropagation()
          }
        }}
      >
        {articles.map(article => (
          <li key={article.slug} className="snap-start shrink-0 w-[85%] sm:w-[440px]">
            <ArticleCard article={article} />
          </li>
        ))}
      </ul>
    </div>
  )
}
