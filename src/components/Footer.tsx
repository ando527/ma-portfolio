import Link from 'next/link'
import { getAllProjects } from '@/lib/projects'
import { getAllServices } from '@/lib/services'
import { getAllArticles } from '@/lib/articles'
import { SITE } from '@/lib/site'
import { btnLight, btnOnDark, btnArrow } from '@/components/ui/button'

const linkClass =
  'inline-flex py-1.5 font-sans text-sm text-white/65 hover:text-white transition-colors duration-200'
const allLinkClass =
  'inline-flex py-1.5 font-sans text-sm font-medium text-maroon-200 hover:text-white transition-colors duration-200'
const headingClass = 'eyebrow text-maroon-200 mb-3'

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
        <span aria-hidden className="text-xs opacity-60">↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </li>
  )
}

/** "Let's talk." — the contact panel at the top of the footer, on every page.
 *  The nav's Contact link jumps here (#contact). */
function ContactPanel() {
  return (
    <section id="contact" aria-labelledby="contact-heading" className="scroll-mt-24 max-w-6xl mx-auto px-6 pt-20 md:pt-28">
      <div
        className="relative overflow-hidden rounded-[2rem] border border-white/10 px-7 py-14 sm:px-12 sm:py-16 md:px-16 md:py-20"
        style={{
          backgroundColor: '#24080E',
          backgroundImage:
            'radial-gradient(90% 120% at 100% 0%, rgba(155, 35, 53, 0.55), transparent 60%), radial-gradient(60% 80% at 0% 100%, rgba(124, 29, 46, 0.35), transparent 70%)',
        }}
      >
        {/* The MA mark, oversized and faint, bleeding off the panel's edge */}
        <svg
          aria-hidden
          viewBox="0 0 64 64"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute -right-10 -bottom-16 w-[22rem] h-[22rem] md:w-[30rem] md:h-[30rem] text-white/[0.05]"
        >
          <path strokeWidth={4} d="M 5,52 C 5,36 6,22 8,14 Q 13,4 18,16 Q 17,22 17,28 Q 22,4 27,16 C 27,28 28,40 29,52" />
          <path strokeWidth={4} d="M 33,52 C 33,38 37,22 42,14 Q 45,7 49,14 C 53,22 56,38 57,52" />
          <path strokeWidth={3.5} d="M 36,36 Q 45,32 52,36" />
        </svg>

        <div className="relative max-w-2xl">
          <p className="eyebrow text-maroon-200 flex items-center gap-3">
            <span aria-hidden className="pulse-dot w-2 h-2 rounded-full bg-maroon-200 text-maroon-200" />
            Available for freelance work
          </p>
          <h2 id="contact-heading" className="display mt-5 text-[3.25rem] sm:text-7xl md:text-8xl text-white">
            Let&rsquo;s talk.
          </h2>
          <p className="mt-6 max-w-lg font-sans text-lg md:text-xl text-white/70 leading-relaxed">
            I&rsquo;m available for freelance work and collaborations.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <a href={SITE.links.linkedin} target="_blank" rel="noopener noreferrer" className={btnLight}>
              Reach out on LinkedIn
              <span aria-hidden className={btnArrow}>→</span>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            <Link prefetch={false} href="/work/" className={btnOnDark}>
              See my work
            </Link>
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
    <footer className="on-dark relative z-10 bg-ink overflow-hidden">
      <ContactPanel />

      <div className="max-w-6xl mx-auto px-6 pt-20 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.3fr_1fr_1fr_1fr_0.8fr] gap-x-8 gap-y-10">

          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link prefetch={false} href="/" className="inline-flex py-1 font-heading font-bold text-lg text-white hover:text-maroon-200 transition-colors duration-200">
              Mitchell Anderson
            </Link>
            <p className="mt-2 max-w-[28ch] font-sans text-sm text-white/65 leading-relaxed">
              Web developer in Brisbane, building in Webflow, Shopify and Next.js.
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
            <External href={SITE.links.linkedin}>LinkedIn</External>
            <External href={SITE.links.github}>GitHub</External>
            <External href={SITE.links.wca}>WCA profile</External>
          </Column>
        </div>

        {/* Oversized wordmark — decorative; the name is already linked above */}
        <p
          aria-hidden
          className="display mt-20 select-none whitespace-nowrap text-[calc((100vw-48px)/9.5)] lg:text-[7.4rem] leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/[0.16] to-white/[0.02]"
        >
          Mitchell Anderson
        </p>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="font-sans text-sm text-white/55">
            © {new Date().getFullYear()} Mitchell Anderson. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
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
