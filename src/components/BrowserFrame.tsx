import type { ImageData } from '@/lib/types'

/**
 * A screenshot inside browser chrome, matching the homepage mockup. Used as
 * the visual in inner page headers. `url` is shown in the address bar.
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
    <div className={`rounded-xl overflow-hidden bg-[#1e1e1e] ring-1 ring-white/10 shadow-[0_40px_100px_-24px_rgba(0,0,0,0.65)] ${className}`}>
      <div aria-hidden className="h-8 sm:h-9 flex items-center gap-3 px-3 sm:px-4 select-none">
        <div className="flex gap-[5px]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
        </div>
        {url && (
          <div className="flex-1 min-w-0 max-w-sm mx-auto h-5 sm:h-6 rounded-md bg-[#2c2c2e] flex items-center justify-center gap-1.5 px-2">
            <svg className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <span className="font-sans text-xs text-gray-300 truncate">{url}</span>
          </div>
        )}
        <span className="w-[39px]" />
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
        className={`block w-full h-auto bg-maroon-50 ${imageClassName}`}
      />
    </div>
  )
}
