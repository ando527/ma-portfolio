import type { ArticleCardData } from '@/lib/types'

/**
 * An article's cover: the cover text on a panel in the hero's colours, over
 * coverImage when there is one, so a new article never needs artwork to ship.
 * An article with only a heroImage shows that photo plainly instead.
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
  if (article.image && !article.coverImage) {
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

  const glow = 'radial-gradient(120% 90% at 18% 22%, rgba(155, 35, 53, 0.55), transparent 62%)'
  const photo = article.coverImage

  return (
    <div
      aria-hidden
      className={`relative w-full h-full overflow-hidden bg-[#100408] [container-type:inline-size] ${className}`}
      style={photo ? undefined : { backgroundImage: glow }}
    >
      {/* A cover photo sits under a gradient that's solid behind the text on
          the left and clears to the right, so the subject belongs on the right. */}
      {photo && (
        <>
          <img
            src={photo.src}
            srcSet={photo.srcSet}
            sizes={sizes}
            width={photo.width}
            height={photo.height}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: article.coverPosition ?? 'right center' }}
          />
          <div
            className="absolute inset-0"
            style={{
              // Glow as on the plain covers, a left-to-right fade behind the
              // text, and a light wash overall so bright photos still sit
              // with the other dark covers.
              backgroundImage: [
                glow,
                'linear-gradient(90deg, #100408 0%, rgba(16, 4, 8, 0.94) 30%, rgba(16, 4, 8, 0.7) 50%, rgba(16, 4, 8, 0.25) 75%, rgba(16, 4, 8, 0) 100%)',
                'linear-gradient(rgba(16, 4, 8, 0.3), rgba(16, 4, 8, 0.3))',
              ].join(', '),
            }}
          />
        </>
      )}
      {/* Cover text top left on every cover so they line up in a row; the
          publication, if any, sits in the bottom corner. */}
      <div className="absolute inset-0 flex flex-col justify-between p-7 sm:p-9">
        {/* Narrower over a photo, so the text stays in the left part of the
            frame and clear of the subject. */}
        <span
          className={`font-heading font-extrabold text-white tracking-tight leading-[0.95] ${
            photo ? 'text-[clamp(1.5rem,9cqw,3.25rem)] max-w-[8ch]' : 'text-[clamp(1.75rem,11cqw,3.75rem)] max-w-[11ch]'
          }`}
        >
          {article.coverText}
        </span>
        {article.publication && (
          <span className="font-sans text-sm text-maroon-200">{article.publication}</span>
        )}
      </div>
    </div>
  )
}
