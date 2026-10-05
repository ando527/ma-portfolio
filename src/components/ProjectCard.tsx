import Link from 'next/link'
import type { ProjectCardData } from '@/lib/types'

const BADGE_STYLES: Record<string, string> = {
  SLATE:     'bg-primary text-white',
  Freelance: 'bg-foreground text-background',
  'Pro-bono':'bg-emerald-700 text-white',
}

/** Card thumbnails are about a third of the content width on desktop. */
const THUMB_SIZES = '(min-width: 1024px) 352px, (min-width: 768px) 50vw, 100vw'

export default function ProjectCard({ project, headingLevel = 3 }: { project: ProjectCardData; headingLevel?: 2 | 3 }) {
  const Heading = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <div className="h-full transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:scale-[1.015] motion-reduce:transition-none motion-reduce:hover:transform-none">
      <Link prefetch={false} href={`/work/${project.slug}/`} className="group block h-full rounded-2xl">
        <article className="h-full bg-card rounded-2xl overflow-hidden border border-maroon-100 hover:border-primary/40 hover:shadow-xl transition-[border-color,box-shadow] duration-300">
          {/* Thumbnail — decorative: the title below names the project */}
          <div className="aspect-[4/3] bg-maroon-50 relative overflow-hidden">
            {project.thumb ? (
              <img
                src={project.thumb.src}
                srcSet={project.thumb.srcSet}
                sizes={THUMB_SIZES}
                width={project.thumb.width}
                height={project.thumb.height}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center border border-primary/20">
                  <span className="font-heading font-bold text-2xl text-primary">
                    {project.title.charAt(0)}
                  </span>
                </div>
              </div>
            )}

            {/* Badge */}
            {project.badge && (
              <div className="absolute top-3 right-3 z-10">
                <span className={`text-xs font-sans font-bold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-sm ${BADGE_STYLES[project.badge] ?? 'bg-foreground text-background'}`}>
                  {project.badge}
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            {project.tags.length > 0 && (
              <ul className="flex flex-wrap gap-2 mb-3" aria-label="Tags">
                {project.tags.slice(0, 3).map(tag => (
                  <li
                    key={tag}
                    className="text-xs font-sans font-medium text-primary bg-maroon-50 px-2.5 py-1 rounded-full border border-maroon-200"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}

            <Heading className="font-heading font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
              {project.title}
            </Heading>
            <p className="font-sans text-sm text-muted-foreground leading-relaxed line-clamp-2">
              {project.summary}
            </p>

            {/* Arrow link */}
            <div className="mt-4 flex items-center gap-1.5 font-sans text-sm font-medium text-primary group-hover:gap-2.5 transition-[gap] duration-200">
              View project
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
            </div>
          </div>
        </article>
      </Link>
    </div>
  )
}
