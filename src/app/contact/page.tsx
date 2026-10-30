import JsonLd from '@/components/JsonLd'
import PageHero from '@/components/PageHero'
import ContactForm from '@/components/ContactForm'
import { AnimateIn } from '@/components/ui/animate-in'
import { pageMetadata, SITE } from '@/lib/site'
import { graph, webPageNode, breadcrumbNode, refs } from '@/lib/schema'

const DESCRIPTION =
  'Get in touch with Mitchell Anderson, a Brisbane web developer, about a Webflow, Shopify or Next.js project.'

export const metadata = pageMetadata({
  title: 'Contact',
  description: DESCRIPTION,
  path: '/contact/',
})

const NEXT_STEPS = [
  'I read every message myself.',
  "If it’s a fit, I’ll reply by email to set up a quick chat.",
]

const link =
  'font-medium text-primary underline underline-offset-[3px] decoration-1 decoration-maroon-300 hover:decoration-primary transition-colors duration-200'

export default function ContactPage() {
  return (
    <div className="bg-background">
      <JsonLd
        data={graph(
          webPageNode('/contact/', {
            type: 'ContactPage',
            name: 'Contact Mitchell Anderson',
            description: DESCRIPTION,
            about: refs.person,
            breadcrumb: true,
          }),
          breadcrumbNode('/contact/', [
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact/' },
          ]),
        )}
      />

      <PageHero
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Contact' }]}
        eyebrow="Contact"
        title="Let’s talk."
        intro="I’m available for freelance work and collaborations. Tell me a bit about your project and where you’re at."
      />

      <section className="py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-14">
          <div className="min-w-0 rounded-3xl border border-maroon-100 bg-card p-5 shadow-[0_1px_2px_rgba(28,10,14,0.05),0_28px_64px_-36px_rgba(124,29,46,0.3)] sm:p-8 md:p-10">
            <ContactForm />
          </div>

          <AnimateIn as="aside" className="space-y-9 lg:sticky lg:top-28">
            <div>
              <h2 className="eyebrow mb-3 text-primary">Prefer LinkedIn?</h2>
              <p className="font-sans text-base leading-relaxed text-[var(--prose-body)]">
                You can{' '}
                <a href={SITE.links.linkedin} target="_blank" rel="noopener noreferrer" className={link}>
                  message me on LinkedIn
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>{' '}
                instead.
              </p>
            </div>

            <div>
              <h2 className="eyebrow mb-3 text-primary">Based in</h2>
              <p className="font-sans text-base leading-relaxed text-[var(--prose-body)]">
                Brisbane, QLD
              </p>
            </div>

            <div>
              <h2 className="eyebrow mb-3 text-primary">What happens next</h2>
              <ol className="space-y-4">
                {NEXT_STEPS.map((step, i) => (
                  <li key={step} className="flex gap-4 font-sans text-base leading-relaxed text-[var(--prose-body)]">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-maroon-200 bg-card text-xs font-semibold tabular-nums text-primary"
                    >
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </AnimateIn>
        </div>
      </section>
    </div>
  )
}
