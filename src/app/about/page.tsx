import type { Metadata } from 'next'
import fs   from 'fs'
import path from 'path'
import CubingSection from '@/components/CubingSection'
import CollageHero   from '@/components/CollageHero'
import { AnimateIn, StaggerIn, FadeItem } from '@/components/ui/animate-in'

export const metadata: Metadata = {
  title: 'About — Mitchell Anderson',
  description: 'Web developer based in Brisbane, QLD. Head of Web Development at SLATE Media.',
  alternates: {
    canonical: 'https://mitchellanderson.com.au/about/',
  },
  openGraph: {
    title: 'About — Mitchell Anderson',
    description: 'Web developer based in Brisbane, QLD. Head of Web Development at SLATE Media.',
    url: 'https://mitchellanderson.com.au/about/',
  },
  twitter: {
    title: 'About — Mitchell Anderson',
    description: 'Web developer based in Brisbane, QLD. Head of Web Development at SLATE Media.',
  },
}

const skills = [
  'Webflow', 'Shopify', 'Next.js',
  'HTML / CSS / JS', 'UX & Wireframing', 'Front-end Development',
  'Performance & Accessibility',
]

const experience = [
  { year: '2021 – 2026', role: 'Head of Web Development', org: 'SLATE Media' },
  { year: '2023 – 2024',   role: 'Graduate Engineer',        org: 'Fulton Hogan' },
  { year: '2024',          role: 'Bachelor of Information Technology', org: 'University of Queensland' },
]

// ── Build-time: read collage images from public/images/collage ──────────────
function getCollageImages(): string[] {
  const dir = path.join(process.cwd(), 'public', 'images', 'collage')
  try {
    const files = fs.readdirSync(dir)
    const webpSet = new Set(files.filter(f => /\.webp$/i.test(f)).map(f => f.replace(/\.webp$/i, '')))
    return files
      .filter(f => /\.(jpe?g|png)$/i.test(f))
      .map(f => {
        const base = f.replace(/\.(jpe?g|png)$/i, '')
        return `/images/collage/${webpSet.has(base) ? base + '.webp' : f}`
      })
  } catch {
    return []
  }
}

export default function AboutPage() {
  const collageImages = getCollageImages()

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero header with collage ─────────────────────────────── */}
      <section className="relative flex flex-col justify-end border-b border-maroon-100 overflow-hidden min-h-[62vh] md:min-h-[88vh]">

        {/* Animated photo collage (client component) */}
        <CollageHero images={collageImages} />

        {/* Text — sits at the bottom-left, above the gradient */}
        <AnimateIn
          className="relative z-20 max-w-5xl mx-auto px-6 pb-16 w-full"
          delay={0.2}
        >
          <p className="font-sans font-semibold text-sm tracking-widest uppercase text-primary mb-4">
            About
          </p>
          <h1 className="font-heading font-bold text-6xl md:text-8xl text-foreground tracking-tight leading-[0.92]">
            Hello.
          </h1>
        </AnimateIn>

      </section>

      {/* ── Main content ────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 space-y-16">

          {/* ── Bio ─────────────────────────────────────────────── */}
          <AnimateIn>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-5">About Me</h2>
            <div className="space-y-4 font-sans text-muted-foreground leading-relaxed text-base max-w-2xl">
              <p>
                I&rsquo;m a web developer based in Brisbane, QLD. At SLATE Media I lead
                client web projects end-to-end — UX, design, and front-end build — working
                primarily in Webflow, Shopify, and Next.js.
              </p>
              <p>
                I hold a Bachelor of Information Technology from the University of Queensland
                and have a background in engineering, having worked on GIS automation tooling
                at Fulton Hogan.
              </p>
              <p>
                Outside of work I&rsquo;m a WCA Delegate for Speedcubing Australia and a
                two-time Rubik&rsquo;s Cube World Championships representative — which keeps
                things interesting.
              </p>
            </div>
          </AnimateIn>

          {/* ── Skills ──────────────────────────────────────────── */}
          <div>
            <AnimateIn>
              <h2 className="font-heading font-bold text-2xl text-foreground mb-5">
                Skills &amp; Tools
              </h2>
            </AnimateIn>
            <StaggerIn
              className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6"
              stagger={0.06}
            >
              {skills.map(skill => (
                <FadeItem key={skill} className="flex items-center gap-2 font-sans text-sm text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {skill}
                </FadeItem>
              ))}
            </StaggerIn>
          </div>

          {/* ── Experience ──────────────────────────────────────── */}
          <div>
            <AnimateIn>
              <h2 className="font-heading font-bold text-2xl text-foreground mb-6">
                Experience
              </h2>
            </AnimateIn>
            <StaggerIn className="space-y-6" stagger={0.1}>
              {experience.map((item, i) => (
                <FadeItem key={i} className="flex gap-6 group">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    {i < experience.length - 1 && (
                      <span className="w-px flex-1 bg-maroon-200" />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className="font-sans text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                      {item.year}
                    </p>
                    <p className="font-heading font-semibold text-foreground text-base">
                      {item.role}
                    </p>
                    <p className="font-sans text-sm text-muted-foreground">{item.org}</p>
                  </div>
                </FadeItem>
              ))}
            </StaggerIn>
          </div>

          {/* ── Speedcubing ─────────────────────────────────────── */}
          <AnimateIn>
            <CubingSection />
          </AnimateIn>

        </div>
      </section>
    </div>
  )
}
