import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllProjects } from '@/lib/projects'
import { btnPrimary, btnSecondary } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Page not found',
  description: "This page doesn't exist. Head back to the homepage, recent work or the About page.",
}

export default function NotFound() {
  const latest = getAllProjects()[0]

  return (
    <div className="min-h-[80vh] bg-background flex items-center">
      <div className="max-w-5xl mx-auto px-6 pt-32 pb-24 w-full">
        <p className="font-sans font-semibold text-sm tracking-widest uppercase text-primary mb-4">
          404
        </p>
        <h1 className="font-heading font-bold text-5xl md:text-7xl text-foreground tracking-tight leading-[0.95] mb-6 max-w-[14ch]">
          This page doesn&rsquo;t exist.
        </h1>
        <p className="font-sans text-lg text-muted-foreground leading-relaxed max-w-xl mb-10">
          The link might be old, or the address might have a typo. Here are the places most people are looking for.
        </p>

        <ul className="flex flex-wrap gap-3">
          <li>
            <Link prefetch={false}
              href="/"
              className={btnPrimary}
            >
              Go to the homepage
            </Link>
          </li>
          <li>
            <Link prefetch={false}
              href="/work/"
              className={btnSecondary}
            >
              See my work
            </Link>
          </li>
          <li>
            <Link prefetch={false}
              href="/about/"
              className={btnSecondary}
            >
              About me
            </Link>
          </li>
        </ul>

        {latest && (
          <p className="mt-10 font-sans text-sm text-muted-foreground">
            Newest case study:{' '}
            <Link prefetch={false} href={`/work/${latest.slug}/`} className="font-medium text-primary underline underline-offset-2 hover:opacity-70 transition-opacity">
              {latest.title}
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
