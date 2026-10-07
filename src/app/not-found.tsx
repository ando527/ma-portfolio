import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllProjects } from '@/lib/projects'
import HeroBackground from '@/components/HeroBackground'
import { btnPrimary, btnOnDark, btnArrow } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Page not found',
  description: "This page doesn't exist. Head back to the homepage, recent work or the About page.",
}

export default function NotFound() {
  const latest = getAllProjects()[0]

  return (
    <section className="on-dark relative min-h-[90vh] bg-ink flex items-center overflow-hidden">
      <HeroBackground />

      {/* Oversized outlined 404 behind the copy */}
      <p
        aria-hidden
        className="display pointer-events-none select-none absolute -right-[4vw] bottom-[-6vw] text-[42vw] md:text-[30vw] leading-none text-transparent"
        style={{ WebkitTextStroke: '1px rgba(241, 184, 191, 0.14)' }}
      >
        404
      </p>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-36 pb-24 w-full">
        <p className="eyebrow flex items-center gap-3 text-maroon-200 mb-6">
          <span aria-hidden className="h-px w-8 bg-maroon-200/60" />
          404 — Page not found
        </p>
        <h1 className="display text-[clamp(2.25rem,12.5vw,2.75rem)] sm:text-6xl md:text-7xl text-white mb-7 max-w-[14ch]">
          This page doesn&rsquo;t exist.
        </h1>
        <p className="font-sans text-lg md:text-xl text-white/70 leading-relaxed max-w-xl mb-10">
          The link might be old, or the address might have a typo. Here are the places most people are looking for.
        </p>

        <ul className="flex flex-wrap gap-3">
          <li>
            <Link prefetch={false} href="/" className={btnPrimary}>
              Go to the homepage
              <span aria-hidden className={`text-white/80 ${btnArrow}`}>→</span>
            </Link>
          </li>
          <li>
            <Link prefetch={false} href="/work/" className={btnOnDark}>
              See my work
            </Link>
          </li>
          <li>
            <Link prefetch={false} href="/about/" className={btnOnDark}>
              About me
            </Link>
          </li>
        </ul>

        {latest && (
          <p className="mt-12 font-sans text-sm text-white/65">
            Newest case study:{' '}
            <Link prefetch={false} href={`/work/${latest.slug}/`} className="font-medium text-maroon-200 underline underline-offset-[3px] hover:text-white transition-colors duration-200">
              {latest.title}
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}
