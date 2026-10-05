import Link from 'next/link'
import { getAllProjects } from '@/lib/projects'
import { getAllServices } from '@/lib/services'
import { getAllArticles } from '@/lib/articles'
import { SITE } from '@/lib/site'

const linkClass =
  'inline-flex py-1.5 font-sans text-sm text-white/60 hover:text-white transition-colors duration-200'
const headingClass = 'font-sans text-xs font-semibold tracking-widest uppercase text-maroon-200 mb-3'

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
      <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </li>
  )
}

export default function Footer() {
  const projects = getAllProjects()
  const services = getAllServices()
  const articles = getAllArticles()

  return (
    <footer className="on-dark relative z-10 bg-[#100408] pt-16 pb-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.3fr_1fr_1fr_1fr_0.8fr] gap-x-8 gap-y-10">

          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link prefetch={false} href="/" className="font-heading font-bold text-lg text-white hover:text-maroon-200 transition-colors duration-200">
              Mitchell Anderson
            </Link>
            <p className="mt-2 max-w-[28ch] font-sans text-sm text-white/60 leading-relaxed">
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
              <Link prefetch={false} href="/work/" className="inline-flex py-1.5 font-sans text-sm font-medium text-maroon-200 hover:text-white transition-colors duration-200">
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
            </Column>
          )}

          <Column title="About">
            <li><Link prefetch={false} href="/about/" className={linkClass}>About me</Link></li>
            <External href={SITE.links.linkedin}>LinkedIn</External>
            <External href={SITE.links.github}>GitHub</External>
            <External href={SITE.links.wca}>WCA profile</External>
          </Column>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <p className="font-sans text-sm text-white/50">
            © {new Date().getFullYear()} Mitchell Anderson. All rights reserved.
          </p>
          <Link prefetch={false} href="/privacy/" className={linkClass}>Privacy policy</Link>
        </div>
      </div>
    </footer>
  )
}
