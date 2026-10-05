import type { CSSProperties } from 'react'
import Link from 'next/link'
import CubingSection from '@/components/CubingSection'
import CollageHero   from '@/components/CollageHero'
import JsonLd from '@/components/JsonLd'
import { AnimateIn, StaggerIn, FadeItem } from '@/components/ui/animate-in'
import { imagesIn } from '@/lib/images'
import { pageMetadata, SITE } from '@/lib/site'
import { graph, webPageNode, breadcrumbNode, refs } from '@/lib/schema'
import { toStats, type Competition } from '@/lib/wca'
import cachedPerson from '@/data/wca/person.json'
import cachedCompetitions from '@/data/wca/competitions.json'

const DESCRIPTION =
  "Brisbane web developer and Head of Web Development at SLATE Media. UQ IT graduate, WCA Delegate and two-time Rubik's Cube World Championships competitor."

export const metadata = pageMetadata({
  absoluteTitle: 'About Mitchell Anderson | Brisbane Web Developer',
  description: DESCRIPTION,
  path: '/about/',
  type: 'profile',
})

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

const link = 'text-primary underline underline-offset-2 decoration-maroon-200 hover:decoration-primary transition-colors duration-200'
const enterDelay = (s: number) => ({ '--enter-delay': `${s}s` }) as CSSProperties

export default function AboutPage() {
  const collageImages = imagesIn('/images/collage')
  const competitions = cachedCompetitions as Competition[]

  return (
    <div className="min-h-screen bg-background">
      <JsonLd
        data={graph(
          webPageNode('/about/', {
            type: 'ProfilePage',
            name: 'About Mitchell Anderson',
            description: DESCRIPTION,
            mainEntity: refs.person,
            breadcrumb: true,
          }),
          breadcrumbNode('/about/', [
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about/' },
          ]),
        )}
      />

      {/* ── Hero header with collage ─────────────────────────────── */}
      <section className="relative flex flex-col justify-end border-b border-maroon-100 overflow-hidden min-h-[62vh] md:min-h-[88vh]">

        {/* Animated photo collage (client component) */}
        <CollageHero images={collageImages} />

        {/* Text — sits at the bottom-left, above the gradient */}
        <div className="relative z-20 max-w-6xl mx-auto px-6 pb-16 w-full">
          <p className="enter font-sans font-semibold text-sm tracking-widest uppercase text-primary mb-4" style={enterDelay(0.15)}>
            About
          </p>
          <h1
            className="enter font-heading font-bold text-6xl md:text-8xl text-foreground tracking-tight leading-[0.92]"
            style={enterDelay(0.24)}
          >
            Hi, I&rsquo;m Mitchell<span className="sr-only"> Anderson, a web developer in Brisbane</span>.
          </h1>
          <p className="enter mt-5 max-w-xl font-sans text-lg md:text-xl text-muted-foreground leading-relaxed" style={enterDelay(0.33)}>
            I build websites in Brisbane. On weekends I solve Rubik&rsquo;s Cubes against the clock, with an official best of 8.87&nbsp;seconds.
          </p>
        </div>

      </section>

      {/* ── Main content ────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6 space-y-16">

          {/* ── Bio ─────────────────────────────────────────────── */}
          <AnimateIn>
            <h2 className="font-heading font-bold text-2xl text-foreground mb-5">About Me</h2>
            <div className="space-y-4 font-sans text-muted-foreground leading-relaxed text-base max-w-2xl">
              <p>
                I&rsquo;m a web developer based in Brisbane, QLD. At{' '}
                <a href={SITE.employer.url} target="_blank" rel="noopener noreferrer" className={link}>SLATE Media</a>{' '}
                I lead client web projects end-to-end — UX, design, and front-end build — working
                primarily in <Link prefetch={false} href="/webflow-development/" className={link}>Webflow</Link>,{' '}
                <Link prefetch={false} href="/shopify-development/" className={link}>Shopify</Link>, and{' '}
                <Link prefetch={false} href="/nextjs-development/" className={link}>Next.js</Link>. Recent projects include{' '}
                <Link prefetch={false} href="/work/sippy-tom/" className={link}>Sippy Tom</Link>,{' '}
                <Link prefetch={false} href="/work/venncap/" className={link}>VennCap Real Estate</Link> and{' '}
                <Link prefetch={false} href="/work/we-got-the-chocolates/" className={link}>We Got The Chocolates</Link>.
              </p>
              <p>
                I hold a Bachelor of Information Technology from the University of Queensland
                and have a background in engineering, having worked on GIS automation tooling
                at Fulton Hogan.
              </p>
              <p>
                Outside of work I&rsquo;m a WCA Delegate for{' '}
                <Link prefetch={false} href="/work/speedcubing-australia/" className={link}>Speedcubing Australia</Link>{' '}
                (I build their website too) and a
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
              as="ul"
              className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-6"
              stagger={0.06}
            >
              {skills.map(skill => (
                <FadeItem as="li" key={skill} className="flex items-center gap-2 font-sans text-sm text-foreground">
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
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
            <StaggerIn as="ol" className="space-y-6" stagger={0.1}>
              {experience.map((item, i) => (
                <FadeItem as="li" key={i} className="flex gap-6 group">
                  <div aria-hidden className="flex flex-col items-center gap-1 pt-1">
                    <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    {i < experience.length - 1 && (
                      <span className="w-px flex-1 bg-maroon-200" />
                    )}
                  </div>
                  <div className="pb-6">
                    <p className="font-sans text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                      {item.year}
                    </p>
                    <h3 className="font-heading font-semibold text-foreground text-base">
                      {item.role}
                    </h3>
                    <p className="font-sans text-sm text-muted-foreground">{item.org}</p>
                  </div>
                </FadeItem>
              ))}
            </StaggerIn>
          </div>

          {/* ── Speedcubing ─────────────────────────────────────── */}
          <AnimateIn>
            <CubingSection
              initialStats={toStats(cachedPerson)}
              initialCompetitions={competitions.filter(c => c.coordinates)}
              knownIds={competitions.map(c => c.id)}
            />
          </AnimateIn>

        </div>
      </section>
    </div>
  )
}
