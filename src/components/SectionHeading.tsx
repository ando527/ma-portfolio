import type { ReactNode } from 'react'

/**
 * The heading block that opens a section: a numbered eyebrow, a display
 * heading, an optional intro, and an optional action (a "View all" link)
 * that sits to the right on wide screens.
 */
export default function SectionHeading({
  id,
  index,
  eyebrow,
  title,
  intro,
  action,
  tone = 'light',
  size = 'lg',
  className = '',
}: {
  /** id for the h2, so the section can be labelled by it. */
  id?: string
  /** "01", "02"… — decorative, hidden from screen readers. */
  index?: string
  eyebrow: string
  title: ReactNode
  intro?: ReactNode
  action?: ReactNode
  tone?: 'light' | 'dark'
  /** 'md' for headings in a narrow column. */
  size?: 'lg' | 'md'
  className?: string
}) {
  const dark = tone === 'dark'
  const titleSize = size === 'lg' ? 'text-[clamp(2.25rem,11vw,2.5rem)] sm:text-5xl md:text-6xl' : 'text-[clamp(2rem,10vw,2.25rem)] sm:text-5xl'
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className="max-w-2xl min-w-0">
        <p className={`eyebrow flex items-center gap-3 ${dark ? 'text-maroon-200' : 'text-primary'}`}>
          {index && (
            <>
              <span aria-hidden className="tabular-nums">{index}</span>
              <span aria-hidden className={`h-px w-8 ${dark ? 'bg-maroon-200/50' : 'bg-primary/40'}`} />
            </>
          )}
          {eyebrow}
        </p>
        <h2
          id={id}
          className={`display mt-4 ${titleSize} ${dark ? 'text-white' : 'text-foreground'}`}
        >
          {title}
        </h2>
        {intro && (
          <p className={`mt-5 font-sans leading-relaxed max-w-xl ${size === 'lg' ? 'text-lg' : 'text-base'} ${dark ? 'text-white/65' : 'text-muted-foreground'}`}>
            {intro}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
