import Link from 'next/link'
import type { ProjectCardData } from '@/lib/types'

/** Image widths for each layout: 'xl' is a lead card across the full row, 'lg' two to a row, 'md' three to a row. */
const SIZES = {
  xl: '(min-width: 1152px) 640px, (min-width: 768px) 56vw, calc(100vw - 48px)',
  lg: '(min-width: 1152px) 540px, (min-width: 768px) calc(50vw - 40px), calc(100vw - 48px)',
  md: '(min-width: 1152px) 360px, (min-width: 1024px) calc(33vw - 32px), (min-width: 768px) calc(50vw - 40px), calc(100vw - 48px)',
}

/**
 * A case study card. The title is the card's one link; its ::after stretches
 * over the whole card, so clicking anywhere opens the project and a screen
 * reader hears just the project's name. Keyboard focus outlines the card.
 * Hover steps the border and surface, lifts the card 3px and zooms the
 * thumbnail (globals.css, pointer devices with motion allowed). The wrapper
 * does not move, so the hover target stays put while the card rises.
 */
export default function ProjectCard({
  project,
  headingLevel = 3,
  size = 'md',
  priority = false,
}: {
  project: ProjectCardData & { date?: string }
  headingLevel?: 2 | 3
  size?: 'xl' | 'lg' | 'md'
  /** For cards in the first view: load the thumbnail now instead of lazily. */
  priority?: boolean
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  const year = project.date?.slice(0, 4)
  const meta = [project.badge, ...project.tags.slice(0, 3)].filter(Boolean)
  const lead = size === 'xl'

  return (
    <div className="lift-host h-full">
    <article
      className={`lift group relative h-full overflow-hidden rounded-2xl border border-line bg-card transition-[background-color,border-color] duration-150 ease-spec hover:border-line-strong hover:bg-raised/50 motion-reduce:transition-none ${
        lead ? 'grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]' : 'flex flex-col'
      }`}
    >
      {/* Thumbnail: decorative, the title names the project */}
      <div className={`relative aspect-[16/10] overflow-hidden bg-raised ${lead ? 'border-b border-line md:border-b-0 md:border-r' : 'border-b border-line'}`}>
        {project.thumb ? (
          <img
            src={project.thumb.src}
            srcSet={project.thumb.srcSet}
            sizes={SIZES[size]}
            width={project.thumb.width}
            height={project.thumb.height}
            alt=""
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : undefined}
            decoding="async"
            className="zoom w-full h-full object-cover object-top"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="display text-5xl text-fg-3">{project.title.charAt(0)}</span>
          </div>
        )}
      </div>

      <div className={`flex flex-col flex-1 gap-3 p-6 ${lead ? 'md:p-8 md:justify-center' : ''}`}>
        {(meta.length > 0 || year) && (
          <div className="flex items-baseline justify-between gap-4">
            {meta.length > 0 && (
              <ul className="flex flex-wrap gap-x-3 gap-y-1" aria-label="Tags">
                {meta.map((tag, i) => (
                  <li key={tag} className="split flex items-baseline gap-3">
                    {tag}
                    {i < meta.length - 1 && <span aria-hidden>/</span>}
                  </li>
                ))}
              </ul>
            )}
            {year && <span className="split shrink-0">{year}</span>}
          </div>
        )}

        <Heading className={`font-heading font-medium text-fg ${lead ? 'text-2xl md:text-3xl leading-tight' : size === 'lg' ? 'text-2xl leading-8' : 'text-xl leading-7'}`}>
          <Link
            prefetch={false}
            href={`/work/${project.slug}/`}
            className="focus-visible:outline-none after:absolute after:inset-0 after:content-[''] after:rounded-2xl focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-accent"
          >
            {project.title}
          </Link>
        </Heading>
        <p className={`font-sans text-fg-2 ${lead ? 'line-clamp-3' : 'line-clamp-2'} ${size === 'md' ? 'text-sm leading-5' : 'text-base leading-6'}`}>
          {project.summary}
        </p>
        <span
          aria-hidden
          className="mt-auto pt-1 font-sans text-sm text-fg-3 transition-colors duration-150 ease-spec group-hover:text-accent motion-reduce:transition-none"
        >
          Read the case study
          <span className="arrow-nudge ml-2">→</span>
        </span>
      </div>
    </article>
    </div>
  )
}
