import Link from 'next/link'
import CubingSection from '@/components/CubingSection'
import JsonLd from '@/components/JsonLd'
import SectionHeading from '@/components/SectionHeading'
import { AnimateIn, StaggerIn, FadeItem } from '@/components/ui/animate-in'
import { pageMetadata, SITE } from '@/lib/site'
import { graph, webPageNode, breadcrumbNode, businessNode, refs } from '@/lib/schema'
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
  'HTML / CSS / JS', 'UX & wireframing', 'Front-end development',
  'Performance & accessibility',
]

const experience = [
  { year: '2021–present', role: 'Head of Web Development', org: 'SLATE Media' },
  { year: '2023–2024', role: 'Graduate Engineer', org: 'Fulton Hogan' },
  { year: '2024', role: 'Bachelor of Information Technology', org: 'University of Queensland' },
]

const link = 'font-medium text-fg underline underline-offset-4 decoration-1 decoration-fg-3 hover:decoration-accent transition-colors duration-150 ease-spec'

/** One section of the page: its heading in a narrow left column, content to the right. */
const ROW = 'grid gap-8 lg:grid-cols-3 lg:gap-16'

export default function AboutPage() {
  const competitions = cachedCompetitions as Competition[]

  return (
    <div className="min-h-screen bg-paper">
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
          businessNode(),
        )}
      />

      {/* Header: the introduction on calm paper, a hairline under it. */}
      <section className="border-b border-line">
        <div className="mx-auto max-w-6xl px-6 pb-16 pt-24 md:pb-20 lg:px-8">
          <p className="eyebrow mb-4">About</p>
          {/* Headline and intro don't animate in: they're the largest contentful paint. */}
          <h1 className="display-xl max-w-3xl text-4xl text-fg sm:text-5xl md:text-6xl">
            Hi, I&rsquo;m Mitchell<span className="sr-only"> Anderson, a web developer in Brisbane</span>
          </h1>
          <p className="mt-6 max-w-xl font-sans text-lg leading-7 text-fg-2 md:text-xl md:leading-8">
            I build websites in Brisbane. On weekends I solve Rubik&rsquo;s Cubes against the clock, with an official best of 8.87&nbsp;seconds.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-20 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-20 px-6 md:gap-24 lg:px-8">

          {/* Bio */}
          <div className={ROW}>
            <AnimateIn className="self-start lg:sticky lg:top-24">
              <SectionHeading index="01" eyebrow="Background" title="About me" size="md" />
            </AnimateIn>
            <AnimateIn delay={0.05} className="max-w-2xl space-y-5 font-sans text-base leading-6 text-fg-2 lg:col-span-2">
              <p className="text-lg leading-7 text-fg md:text-xl">
                I&rsquo;m a web developer based in Brisbane, QLD. At{' '}
                <a href={SITE.employer.url} target="_blank" rel="noopener noreferrer" className={link}>SLATE Media</a>{' '}
                I lead client web projects end-to-end (UX, design, and front-end build), working
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
                two-time Rubik&rsquo;s Cube World Championships representative, which keeps
                things interesting.
              </p>
            </AnimateIn>
          </div>

          {/* Skills */}
          <div className={ROW}>
            <AnimateIn className="self-start lg:sticky lg:top-24">
              <SectionHeading index="02" eyebrow="Toolkit" title="Skills and tools" size="md" />
            </AnimateIn>
            <StaggerIn
              as="ul"
              className="flex flex-wrap content-start gap-2 lg:col-span-2"
              stagger={0.05}
            >
              {skills.map(skill => (
                <FadeItem
                  as="li"
                  key={skill}
                  className="inline-flex h-9 items-center rounded-md border border-line-strong bg-raised px-3 font-sans text-sm text-fg"
                >
                  {skill}
                </FadeItem>
              ))}
            </StaggerIn>
          </div>

          {/* Experience */}
          <div className={ROW}>
            <AnimateIn className="self-start lg:sticky lg:top-24">
              <SectionHeading index="03" eyebrow="Career" title="Experience" size="md" />
            </AnimateIn>
            <StaggerIn as="ol" className="border-t border-line lg:col-span-2" stagger={0.08}>
              {experience.map((item, i) => (
                <FadeItem
                  as="li"
                  key={i}
                  className="grid gap-x-8 gap-y-1 border-b border-line py-6 sm:grid-cols-4"
                >
                  <p className="split pt-1 sm:col-span-1">{item.year}</p>
                  <div className="sm:col-span-3">
                    <h3 className="font-sans text-lg font-medium text-fg">
                      {item.role}
                    </h3>
                    <p className="mt-1 font-sans text-base text-fg-2">{item.org}</p>
                  </div>
                </FadeItem>
              ))}
            </StaggerIn>
          </div>

          {/* Speedcubing */}
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
