import type { ImageData } from '@/lib/types'

/**
 * A real screenshot inside browser chrome. The window is always the dark
 * ramp, so it reads the same on a dark band and on paper. `url` is shown in
 * the address bar.
 */
export default function BrowserFrame({
  image,
  alt,
  url,
  sizes,
  priority = false,
  className = '',
  imageClassName = '',
}: {
  image: ImageData
  alt: string
  url?: string
  sizes: string
  priority?: boolean
  className?: string
  imageClassName?: string
}) {
  return (
    <div className={`on-dark rounded-2xl overflow-hidden bg-d-card border border-d-line-strong shadow-float-dark ${className}`}>
      <div aria-hidden className="h-8 sm:h-10 flex items-center gap-3 px-3 sm:px-4 select-none bg-d-raised border-b border-d-line">
        <div className="w-12 flex gap-1">
          <span className="w-2 h-2 rounded-full bg-d-fg-3/50" />
          <span className="w-2 h-2 rounded-full bg-d-fg-3/50" />
          <span className="w-2 h-2 rounded-full bg-d-fg-3/50" />
        </div>
        {url && (
          <div className="flex-1 min-w-0 max-w-sm mx-auto h-5 sm:h-6 rounded-md bg-d-card flex items-center justify-center gap-2 px-2">
            <svg className="w-3 h-3 text-d-fg-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="font-sans text-xs text-d-fg-2 truncate">{url}</span>
          </div>
        )}
        <span className="w-12" />
      </div>
      <img
        src={image.src}
        srcSet={image.srcSet}
        sizes={sizes}
        width={image.width}
        height={image.height}
        alt={alt}
        decoding="async"
        {...(priority ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })}
        className={`block w-full h-auto bg-d-card ${imageClassName}`}
      />
    </div>
  )
}
