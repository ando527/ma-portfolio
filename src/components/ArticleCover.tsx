import type { ArticleCardData } from '@/lib/types'

/**
 * An article's cover: its hero image when it has one, otherwise a type-only
 * panel in the hero's colours so a new article never needs artwork to ship.
 */
export default function ArticleCover({
  article,
  sizes,
  className = '',
}: {
  article: ArticleCardData
  sizes: string
  className?: string
}) {
  if (article.image) {
    return (
      <img
        src={article.image.src}
        srcSet={article.image.srcSet}
        sizes={sizes}
        width={article.image.width}
        height={article.image.height}
        alt={article.imageAlt}
        loading="lazy"
        decoding="async"
        className={`w-full h-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      aria-hidden
      className={`relative w-full h-full overflow-hidden bg-[#100408] ${className}`}
      style={{ backgroundImage: 'radial-gradient(120% 90% at 18% 22%, rgba(155, 35, 53, 0.55), transparent 62%)' }}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-7 sm:p-9">
        {article.publication && (
          <span className="font-sans text-sm text-maroon-200">{article.publication}</span>
        )}
        <span className="font-heading font-extrabold text-white tracking-tight leading-[0.95] text-[clamp(2.25rem,5vw,3.75rem)] max-w-[11ch]">
          {article.coverText}
        </span>
      </div>
    </div>
  )
}
