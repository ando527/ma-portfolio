'use client'

import { StaggerIn, FadeItem } from '@/components/ui/animate-in'
import ProjectCard from '@/components/ProjectCard'
import type { Project } from '@/lib/projects'

export default function WorkGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="py-32 text-center">
        <div className="w-16 h-16 rounded-full bg-maroon-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">✦</span>
        </div>
        <p className="font-sans text-muted-foreground">Projects coming soon.</p>
      </div>
    )
  }

  return (
    <StaggerIn
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      stagger={0.07}
      delayChildren={0.05}
      threshold={0.05}
    >
      {projects.map(project => (
        <FadeItem key={project.slug}>
          <ProjectCard project={project} />
        </FadeItem>
      ))}
    </StaggerIn>
  )
}
