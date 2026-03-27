import type { Metadata } from 'next'
import fs   from 'fs'
import path from 'path'
import CubingSection from '@/components/CubingSection'
import CollageHero   from '@/components/CollageHero'

export const metadata: Metadata = {
  title: 'About — Mitchell Anderson',
  description: 'Web developer based in Brisbane, QLD. Head of Web Development at SLATE Media.',
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
    return fs
      .readdirSync(dir)
      .filter(f => /\.(jpe?g|png|webp|gif|avif)$/i.test(f))
      .map(f => `/images/collage/${f}`)
  } catch {
    return []
  }
}

export default function AboutPage() {
  const collageImages = getCollageImages()

  return (
    <div className="min-h-screen bg-background">

      {/* ── Hero header with collage ─────────────────────────────── */}
      <section className="relative flex flex-col justify-end border-b border-maroon-100 overflow-hidden" style={{ minHeight: '88vh' }}>

        {/* Animated photo collage (client component) */}
        <CollageHero images={collageImages} />

        {/* Text — sits at the bottom-left, above the gradient */}
        <div className="relative z-20 max-w-5xl mx-auto px-6 pb-16 w-full">
          <p className="font-sans font-semibold text-sm tracking-widest uppercase text-primary mb-4">
            About
          </p>
          <h1 className="font-heading font-bold text-6xl md:text-8xl text-foreground tracking-tight leading-[0.92]">
            Hello.
          </h1>
        </div>

      </section>

      {/* ── Main content ────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6 space-y-16">

          {/* ── Bio ─────────────────────────────────────────────── */}
          <div>
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
          </div>

          {/* ── Skills ──────────────────────────────────────────── */}
          <div>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-5">
              Skills &amp; Tools
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6">
              {skills.map(skill => (
                <div key={skill} className="flex items-center gap-2 font-sans text-sm text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {skill}
                </div>
              ))}
            </div>
          </div>

          {/* ── Experience ──────────────────────────────────────── */}
          <div>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-6">
              Experience
            </h2>
            <div className="space-y-6">
              {experience.map((item, i) => (
                <div key={i} className="flex gap-6 group">
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
                </div>
              ))}
            </div>
          </div>

          {/* ── Speedcubing ─────────────────────────────────────── */}
          <CubingSection />

        </div>
      </section>
    </div>
  )
}
