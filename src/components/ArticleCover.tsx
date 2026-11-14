import type { ArticleCardData } from '@/lib/types'

/**
 * An article's cover: the cover text on a flat graphite panel, so a new
 * article never needs artwork to ship. With a coverImage the photo fills the
 * frame and the same panel covers its left side with a hard edge, so the
 * subject belongs on the right. No wash, glow or fade over the photo.
 * A wine band runs along the top edge of every text cover.
 * An article with only a heroImage shows that photo plainly instead.
 */
export default function ArticleCover({
  article,
  sizes,
  className = '',
  priority = false,
}: {
  article: ArticleCardData
  sizes: string
  className?: string
  /** The cover is above the fold on load: fetch it now, not lazily. */
  priority?: boolean
}) {
  const loading = priority ? ({ loading: 'eager', fetchPriority: 'high' } as const) : ({ loading: 'lazy' } as const)
  if (article.image && !article.coverImage) {
    return (
      <img
        src={article.image.src}
        srcSet={article.image.srcSet}
        sizes={sizes}
        width={article.image.width}
        height={article.image.height}
        alt={article.imageAlt}
        {...loading}
        decoding="async"
        className={`zoom w-full h-full object-cover ${className}`}
      />
    )
  }

  const photo = article.coverImage

  return (
    <div
      aria-hidden
      className={`on-dark relative w-full h-full overflow-hidden bg-d-page [container-type:inline-size] ${className}`}
    >
      {photo && (
        <img
          src={photo.src}
          srcSet={photo.srcSet}
          sizes={sizes}
          width={photo.width}
          height={photo.height}
          alt=""
          {...loading}
          decoding="async"
          className="zoom absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: article.coverPosition ?? 'right center' }}
        />
      )}
      {/* Cover text top left on every cover so they line up in a row; the
          publication, if any, sits in the bottom corner. Over a photo the
          text sits on a solid panel that ends in a clean vertical edge. */}
      <div
        className={`absolute inset-y-0 left-0 flex flex-col justify-between bg-d-page p-6 sm:p-8 ${
          photo ? 'w-[44%]' : 'w-full'
        }`}
      >
        <span
          className={`font-heading font-medium text-d-fg leading-[1.05] tracking-[-0.02em] text-balance ${
            photo ? 'text-[clamp(1.125rem,6.5cqw,2.5rem)]' : 'text-[clamp(1.5rem,9cqw,3.25rem)] max-w-[14ch]'
          }`}
        >
          {article.coverText}
        </span>
        {article.publication && <span className="split">{article.publication}</span>}
      </div>
      {/* The brand cue: a band along the whole top edge, over the panel and
          any photo. #B8475C is the accent lightened until it reads on the
          graphite panel (3.6:1 against #161513; the wine itself is 1.8:1).
          The cover is dark in both themes, so it is a fixed colour. */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 sm:h-2 bg-[#B8475C]" />
    </div>
  )
}
