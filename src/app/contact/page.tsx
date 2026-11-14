import JsonLd from '@/components/JsonLd'
import PageHero from '@/components/PageHero'
import ContactForm from '@/components/ContactForm'
import { AnimateIn } from '@/components/ui/animate-in'
import { pageMetadata, SITE } from '@/lib/site'
import { graph, webPageNode, breadcrumbNode, businessNode, refs } from '@/lib/schema'

const DESCRIPTION =
  'Get in touch with Mitchell Anderson, a Brisbane web developer, about a Webflow, Shopify or Next.js project. I read every message and reply if it’s a fit.'

export const metadata = pageMetadata({
  title: 'Contact a Brisbane Web Developer',
  description: DESCRIPTION,
  path: '/contact/',
})

const NEXT_STEPS = [
  'I read every message myself.',
  "If it’s a fit, I’ll reply by email to set up a quick chat.",
]

const link =
  'font-medium text-fg underline underline-offset-4 decoration-1 decoration-fg-3 hover:decoration-accent transition-colors duration-150 ease-spec'

export default function ContactPage() {
  return (
    <div className="bg-paper">
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
          businessNode(),
        )}
      />

      <PageHero
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Contact' }]}
        eyebrow="Contact"
        title="Let’s talk"
        intro="I’m available for freelance work and collaborations. Tell me a bit about your project and where you’re at."
      />

      <section className="py-16 md:py-20">
        <div className="mx-auto grid max-w-6xl items-start gap-12 px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16 lg:px-8">
          <div className="min-w-0 rounded-2xl border border-line bg-card p-6 shadow-soft sm:p-8 md:p-10">
            <ContactForm />
          </div>

          <AnimateIn as="aside" className="space-y-8 lg:sticky lg:top-24">
            <div>
              <h2 className="mb-2 font-sans text-sm font-medium text-fg">Prefer LinkedIn?</h2>
              <p className="font-sans text-base leading-6 text-fg-2">
                You can{' '}
                <a href={SITE.links.linkedin} target="_blank" rel="noopener noreferrer" className={link}>
                  message me on LinkedIn
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>{' '}
                instead.
              </p>
            </div>

            <div>
              <h2 className="mb-2 font-sans text-sm font-medium text-fg">Based in</h2>
              <p className="font-sans text-base leading-6 text-fg-2">
                Brisbane, QLD
              </p>
            </div>

            <div>
              <h2 className="mb-2 font-sans text-sm font-medium text-fg">What happens next</h2>
              <ol className="space-y-3">
                {NEXT_STEPS.map((step, i) => (
                  <li key={step} className="flex gap-3 font-sans text-base leading-6 text-fg-2">
                    <span aria-hidden className="split w-5 flex-shrink-0 pt-1">
                      {String(i + 1).padStart(2, '0')}
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
