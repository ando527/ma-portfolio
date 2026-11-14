import type { ReactNode } from 'react'

/**
 * The heading block that opens a section: an eyebrow with an optional split
 * readout for its number, a heading, an optional intro, and an optional action
 * (a "View all" link) that sits to the right on wide screens.
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
  /** "01", "02"… — shown as a quiet mono readout, hidden from screen readers. */
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
  const titleSize = size === 'lg' ? 'text-[1.75rem] sm:text-[2rem] md:text-4xl' : 'text-[1.75rem] sm:text-[2rem]'
  const muted = dark ? 'text-d-fg-3' : 'text-fg-3'
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className="max-w-2xl min-w-0">
        <p className="flex items-baseline gap-3">
          {index && (
            <span aria-hidden className={`split ${muted}`}>{index}</span>
          )}
          <span className={`eyebrow ${muted}`}>{eyebrow}</span>
        </p>
        <h2
          id={id}
          className={`display-sm mt-3 ${titleSize} ${dark ? 'text-d-fg' : 'text-fg'}`}
        >
          {title}
        </h2>
        {intro && (
          <p className={`mt-4 font-sans max-w-xl ${size === 'lg' ? 'text-lg leading-7' : 'text-base leading-6'} ${dark ? 'text-d-fg-2' : 'text-fg-2'}`}>
            {intro}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
