import type { Metadata } from 'next'
import { getAllProjects } from '@/lib/projects'
import WorkGrid from '@/components/WorkGrid'
import { AnimateIn } from '@/components/ui/animate-in'

export const metadata: Metadata = {
  title: 'Work — Mitchell Anderson',
  description: 'A selection of client work and personal projects by Mitchell Anderson — spanning Webflow, Shopify, Next.js and front-end development.',
  alternates: {
    canonical: 'https://mitchellanderson.com.au/work/',
  },
  openGraph: {
    title: 'Work — Mitchell Anderson',
    description: 'A selection of client work and personal projects — Webflow, Shopify, Next.js and front-end development.',
    url: 'https://mitchellanderson.com.au/work/',
  },
  twitter: {
    title: 'Work — Mitchell Anderson',
    description: 'A selection of client work and personal projects — Webflow, Shopify, Next.js and front-end development.',
  },
}

export default function WorkPage() {
  const projects = getAllProjects()

  return (
    <div className="min-h-screen bg-background">
      {/* ── Page header ─────────────────────────────────────────── */}
      <section className="py-20 border-b border-maroon-100 mt-20">
        <AnimateIn className="max-w-6xl mx-auto px-6">
          <p className="font-sans font-semibold text-sm tracking-widest uppercase text-primary mb-3">
            Portfolio
          </p>
          <h1 className="font-heading font-bold text-6xl md:text-7xl text-foreground tracking-tight mb-5">
            Work
          </h1>
          <p className="font-sans text-lg text-muted-foreground max-w-xl leading-relaxed">
            A selection of client work and personal projects — spanning Webflow,
            Shopify, Next.js and front-end development.
          </p>
        </AnimateIn>
      </section>

      {/* ── Projects grid ───────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <WorkGrid projects={projects} />
        </div>
      </section>
    </div>
  )
}
