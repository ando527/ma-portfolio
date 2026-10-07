import type { CSSProperties } from 'react'
import Link from 'next/link'
import CubingSection from '@/components/CubingSection'
import CollageHero   from '@/components/CollageHero'
import JsonLd from '@/components/JsonLd'
import SectionHeading from '@/components/SectionHeading'
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

const link = 'font-medium text-primary underline underline-offset-[3px] decoration-1 decoration-maroon-300 hover:decoration-primary transition-colors duration-200'
const enterDelay = (s: number) => ({ '--enter-delay': `${s}s` }) as CSSProperties

/** One section of the page: its heading in a narrow left column, content to the right. */
const ROW = 'grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)] lg:gap-20'

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
      <section className="relative flex flex-col justify-end border-b border-maroon-100 overflow-hidden min-h-[86vh] md:min-h-[88vh]">

        {/* Text — sits at the bottom-left, above the gradient */}
        <div className="relative z-20 max-w-6xl mx-auto px-6 pb-24 md:pb-20 w-full">
          <div aria-hidden className="collage-scrim pointer-events-none absolute -z-10 -inset-x-6 md:-inset-x-24 -top-8 md:-top-20 -bottom-4" />
          <p className="enter eyebrow flex items-center gap-3 text-primary mb-5" style={enterDelay(0.15)}>
            <span aria-hidden className="h-px w-8 bg-primary/50" />
            About
          </p>
          <h1
            className="enter display text-[3.25rem] sm:text-7xl md:text-8xl text-foreground leading-[0.92]"
            style={enterDelay(0.24)}
          >
            Hi, I&rsquo;m Mitchell<span className="sr-only"> Anderson, a web developer in Brisbane</span>.
          </h1>
          <p className="enter mt-6 max-w-xl font-sans text-lg md:text-xl text-muted-foreground leading-relaxed" style={enterDelay(0.33)}>
            I build websites in Brisbane. On weekends I solve Rubik&rsquo;s Cubes against the clock, with an official best of 8.87&nbsp;seconds.
          </p>
        </div>

        {/* Animated photo collage (client component), after the text so its
            pause button comes after the heading in the tab order */}
        <CollageHero images={collageImages} />

      </section>

      {/* ── Main content ────────────────────────────────────────── */}
      <section className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 grid gap-20 md:gap-28">

          {/* ── Bio ─────────────────────────────────────────────── */}
          <div className={ROW}>
            <AnimateIn className="lg:sticky lg:top-32 self-start">
              <SectionHeading index="01" eyebrow="Background" title="About Me" size="md" />
            </AnimateIn>
            <AnimateIn delay={0.05} className="space-y-5 font-sans text-[var(--prose-body)] leading-relaxed text-lg max-w-2xl">
              <p className="text-xl md:text-2xl leading-snug md:leading-snug text-foreground">
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
            </AnimateIn>
          </div>

          {/* ── Skills ──────────────────────────────────────────── */}
          <div className={ROW}>
            <AnimateIn className="lg:sticky lg:top-32 self-start">
              <SectionHeading index="02" eyebrow="Toolkit" title={<>Skills &amp; Tools</>} size="md" />
            </AnimateIn>
            <StaggerIn
              as="ul"
              className="flex flex-wrap gap-3 content-start"
              stagger={0.05}
            >
              {skills.map(skill => (
                <FadeItem
                  as="li"
                  key={skill}
                  className="inline-flex items-center gap-2.5 rounded-full border border-maroon-200 bg-card pl-4 pr-5 py-2.5 font-sans text-[15px] font-medium text-foreground shadow-[0_1px_2px_rgba(28,10,14,0.05)]"
                >
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  {skill}
                </FadeItem>
              ))}
            </StaggerIn>
          </div>

          {/* ── Experience ──────────────────────────────────────── */}
          <div className={ROW}>
            <AnimateIn className="lg:sticky lg:top-32 self-start">
              <SectionHeading index="03" eyebrow="Career" title="Experience" size="md" />
            </AnimateIn>
            <StaggerIn as="ol" className="border-t border-maroon-100" stagger={0.08}>
              {experience.map((item, i) => (
                <FadeItem
                  as="li"
                  key={i}
                  className="grid sm:grid-cols-[9.5rem_minmax(0,1fr)] gap-x-8 gap-y-1.5 py-6 md:py-7 border-b border-maroon-100"
                >
                  <p className="eyebrow text-primary sm:pt-1.5 tabular-nums">{item.year}</p>
                  <div>
                    <h3 className="font-heading font-bold text-foreground text-xl tracking-tight">
                      {item.role}
                    </h3>
                    <p className="mt-1 font-sans text-base text-muted-foreground">{item.org}</p>
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
