import Link from 'next/link'
import { getAllProjects } from '@/lib/projects'
import { getAllServices } from '@/lib/services'
import { getAllArticles } from '@/lib/articles'
import { SITE } from '@/lib/site'
import { btnLight, btnOnDark, btnArrow } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'

const linkClass =
  'link-wipe inline-flex py-1.5 font-sans text-sm text-d-fg-2 hover:text-d-fg transition-colors duration-150 ease-spec'
const allLinkClass =
  'link-wipe inline-flex py-1.5 font-sans text-sm font-medium text-d-fg hover:text-accent-on-dark transition-colors duration-150 ease-spec'
const headingClass = 'eyebrow mb-3'

function Column({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <nav aria-label={title} className="min-w-0">
      <h2 className={headingClass}>{title}</h2>
      <ul>{children}</ul>
    </nav>
  )
}

function External({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${linkClass} items-center gap-1`}>
        {children}
        <span aria-hidden className="text-xs text-d-fg-3">↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </li>
  )
}

/** "Let's talk": the contact panel at the top of the footer, on every page.
 *  Keeps id="contact" so older #contact links still land here. */
function ContactPanel() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-24 max-w-6xl mx-auto px-6 pt-20 md:pt-32">
      <div className="rounded-2xl border border-d-line bg-d-card px-6 py-12 sm:px-12 sm:py-16 md:px-16 md:py-20">
        <div className="max-w-2xl">
          <p className="eyebrow flex items-center gap-2">
            <span aria-hidden className="pulse-dot w-2 h-2 rounded-full bg-positive-dark text-positive-dark" />
            Available for freelance work
          </p>
          <h2 id="contact-heading" className="display mt-4 text-4xl sm:text-5xl md:text-6xl text-d-fg">
            Let&rsquo;s talk
          </h2>
          <p className="mt-5 max-w-lg font-sans text-lg text-d-fg-2 leading-7">
            I&rsquo;m available for freelance work and collaborations
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link prefetch={false} href="/contact/" className={btnLight}>
              Send me a message
              <span aria-hidden className={btnArrow}>→</span>
            </Link>
            <a href={SITE.links.linkedin} target="_blank" rel="noopener noreferrer" className={btnOnDark}>
              Reach out on LinkedIn
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function Footer() {
  const projects = getAllProjects()
  const services = getAllServices()
  const articles = getAllArticles()

  return (
    <footer className="on-dark relative z-10 bg-d-deep">
      <ContactPanel />

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.3fr_1fr_1fr_1fr_0.8fr] gap-x-8 gap-y-10">

          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link prefetch={false} href="/" className="inline-flex py-1 font-heading font-medium text-lg text-d-fg hover:text-accent-on-dark transition-colors duration-150 ease-spec">
              Mitchell Anderson
            </Link>
            <p className="mt-2 max-w-[28ch] font-sans text-sm text-d-fg-2 leading-5">
              Web developer in Brisbane, building in Webflow, Shopify and Next.js
            </p>
          </div>

          <Column title="Work">
            {projects.map(p => (
              <li key={p.slug}>
                <Link prefetch={false} href={`/work/${p.slug}/`} className={linkClass}>{p.title}</Link>
              </li>
            ))}
            <li>
              <Link prefetch={false} href="/work/" className={allLinkClass}>
                All work
              </Link>
            </li>
          </Column>

          <Column title="Services">
            {services.map(s => (
              <li key={s.slug}>
                <Link prefetch={false} href={`/${s.slug}/`} className={linkClass}>{s.name}</Link>
              </li>
            ))}
          </Column>

          {articles.length > 0 && (
            <Column title="Writing">
              {articles.map(a => (
                <li key={a.slug}>
                  <Link prefetch={false} href={`/articles/${a.slug}/`} className={linkClass}>{a.title}</Link>
                </li>
              ))}
              <li>
                <Link prefetch={false} href="/articles/" className={allLinkClass}>
                  All articles
                </Link>
              </li>
            </Column>
          )}

          <Column title="About">
            <li><Link prefetch={false} href="/about/" className={linkClass}>About me</Link></li>
            <li><Link prefetch={false} href="/contact/" className={linkClass}>Contact</Link></li>
            <External href={SITE.links.linkedin}>LinkedIn</External>
            <External href={SITE.links.github}>GitHub</External>
            <External href={SITE.links.wca}>WCA profile</External>
          </Column>
        </div>

        <div className="mt-16 pt-6 border-t border-d-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="font-sans text-[13px] leading-5 text-d-fg-3">
            © {new Date().getFullYear()} Mitchell Anderson. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
            <ThemeToggle variant="switch" className={linkClass} />
            <Link prefetch={false} href="/privacy/" className={linkClass}>Privacy policy</Link>
            <a href="#main" className={`${linkClass} items-center gap-1.5`}>
              Back to top <span aria-hidden>↑</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
