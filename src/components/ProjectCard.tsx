import Link from 'next/link'
import type { Project } from '@/lib/projects'

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/work/${project.slug}/`} className="group block">
      <article className="bg-card rounded-2xl overflow-hidden border border-maroon-100 hover:border-primary/40 hover:shadow-xl transition-all duration-300">
        {/* Thumbnail */}
        <div className="aspect-[4/3] bg-maroon-50 relative overflow-hidden">
          {project.thumbnail ? (
            <img
              src={project.thumbnail}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {/* Placeholder: amber initial */}
              <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center border border-primary/20">
                <span className="font-heading font-bold text-2xl text-primary">
                  {project.title.charAt(0)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {project.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="text-xs font-sans font-medium text-primary bg-maroon-50 px-2.5 py-1 rounded-full border border-maroon-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <h3 className="font-heading font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
            {project.title}
          </h3>
          <p className="font-sans text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {project.summary}
          </p>

          {/* Arrow link */}
          <div className="mt-4 flex items-center gap-1.5 font-sans text-sm font-medium text-accent group-hover:gap-2.5 transition-all duration-200">
            View project
            <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </div>
        </div>
      </article>
    </Link>
  )
}
