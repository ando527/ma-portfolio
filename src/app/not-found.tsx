import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllProjects } from '@/lib/projects'
import { btnPrimary, btnSecondary, btnArrow } from '@/components/ui/button'
import JsonLd from '@/components/JsonLd'
import { graph } from '@/lib/schema'

export const metadata: Metadata = {
  title: 'Page not found',
  description: "This page doesn't exist. Head back to the homepage, recent work or the About page.",
}

export default function NotFound() {
  const latest = getAllProjects()[0]

  return (
    <section className="bg-paper">
      <JsonLd data={graph()} />
      <div className="max-w-6xl mx-auto px-6 sm:px-8 pt-28 sm:pt-32 pb-24 md:pb-32">
        <p className="flex items-baseline gap-3 mb-4">
          <span className="split">404</span>
          <span className="eyebrow">Page not found</span>
        </p>
        <h1 className="display text-4xl sm:text-[44px] text-fg mb-4 max-w-xl">
          This page doesn&rsquo;t exist
        </h1>
        <p className="font-sans text-lg text-fg-2 leading-7 max-w-xl mb-8">
          The link might be old, or the address might have a typo. Here are the places most people are looking for.
        </p>

        <ul className="flex flex-wrap gap-3">
          <li>
            <Link prefetch={false} href="/" className={btnPrimary}>
              Go to the homepage
              <span aria-hidden className={btnArrow}>→</span>
            </Link>
          </li>
          <li>
            <Link prefetch={false} href="/work/" className={btnSecondary}>
              See my work
            </Link>
          </li>
          <li>
            <Link prefetch={false} href="/about/" className={btnSecondary}>
              About me
            </Link>
          </li>
        </ul>

        {latest && (
          <p className="mt-12 pt-6 border-t border-line max-w-xl font-sans text-sm text-fg-2">
            Newest case study:{' '}
            <Link prefetch={false} href={`/work/${latest.slug}/`} className="font-medium text-accent underline underline-offset-4 hover:text-accent-hover transition-colors duration-150 ease-spec motion-reduce:transition-none">
              {latest.title}
            </Link>
          </p>
        )}
      </div>
    </section>
  )
}
