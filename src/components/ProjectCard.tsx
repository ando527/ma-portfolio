import Link from 'next/link'
import type { ProjectCardData } from '@/lib/types'

const BADGE_STYLES: Record<string, string> = {
  SLATE:     'bg-primary text-white',
  Freelance: 'bg-foreground text-white',
  'Pro-bono':'bg-emerald-700 text-white',
}

/** Image widths for each layout: 'lg' is two to a row, 'md' three to a row. */
const SIZES = {
  lg: '(min-width: 1152px) 536px, (min-width: 768px) calc(50vw - 40px), calc(100vw - 48px)',
  md: '(min-width: 1152px) 352px, (min-width: 1024px) calc(33vw - 32px), (min-width: 768px) calc(50vw - 40px), calc(100vw - 48px)',
}

/**
 * A case study card. The title is the card's one link; its ::after stretches
 * over the whole card, so clicking anywhere opens the project and a screen
 * reader hears just the project's name. Keyboard focus outlines the card.
 */
export default function ProjectCard({
  project,
  headingLevel = 3,
  size = 'md',
}: {
  project: ProjectCardData
  headingLevel?: 2 | 3
  size?: 'lg' | 'md'
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <article className="group relative h-full flex flex-col">
      {/* Thumbnail — decorative: the title below names the project */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-maroon-50 ring-1 ring-black/[0.06] shadow-[0_1px_2px_rgba(28,10,14,0.06)] transition-shadow duration-500 group-hover:shadow-[0_30px_60px_-30px_rgba(124,29,46,0.45)]">
        {project.thumb ? (
          <img
            src={project.thumb.src}
            srcSet={project.thumb.srcSet}
            sizes={SIZES[size]}
            width={project.thumb.width}
            height={project.thumb.height}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover object-top transition-transform duration-700 ease-out-expo group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="display text-6xl text-primary/30">{project.title.charAt(0)}</span>
          </div>
        )}

        {project.badge && (
          <span className={`absolute top-4 left-4 z-10 text-xs font-sans font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm ${BADGE_STYLES[project.badge] ?? 'bg-foreground text-white'}`}>
            {project.badge}
          </span>
        )}

        {/* Arrow that rises into the corner on hover */}
        <span
          aria-hidden
          className="absolute top-4 right-4 z-10 w-11 h-11 rounded-full bg-white text-ink shadow-lg flex items-center justify-center opacity-0 translate-y-1.5 transition-[opacity,transform] duration-300 ease-out-expo group-hover:opacity-100 group-hover:translate-y-0 motion-reduce:transition-none"
        >
          <svg className="w-4 h-4 -rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </span>
      </div>

      <div className={`flex flex-col flex-1 ${size === 'lg' ? 'pt-6' : 'pt-5'}`}>
        {project.tags.length > 0 && (
          <ul className="flex flex-wrap gap-x-3 gap-y-1 mb-2.5" aria-label="Tags">
            {project.tags.slice(0, 3).map((tag, i) => (
              <li key={tag} className="eyebrow text-primary flex items-center gap-3">
                {i > 0 && <span aria-hidden className="w-1 h-1 rounded-full bg-primary/40" />}
                {tag}
              </li>
            ))}
          </ul>
        )}

        <Heading className={`font-heading font-bold text-foreground tracking-tight ${size === 'lg' ? 'text-2xl md:text-[1.75rem] leading-tight' : 'text-xl leading-snug'}`}>
          <Link
            prefetch={false}
            href={`/work/${project.slug}/`}
            className="transition-colors duration-200 group-hover:text-primary focus-visible:outline-none after:absolute after:inset-0 after:content-[''] after:rounded-[1.5rem] focus-visible:after:outline focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-secondary"
          >
            {project.title}
          </Link>
        </Heading>
        <p className={`mt-2 font-sans text-muted-foreground leading-relaxed line-clamp-2 ${size === 'lg' ? 'text-base' : 'text-sm'}`}>
          {project.summary}
        </p>
      </div>
    </article>
  )
}
