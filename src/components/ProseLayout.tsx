import type { ReactNode } from 'react'
import type { Heading } from '@/lib/markdown'

/**
 * Long-form content at the site's full width: the text keeps a readable
 * column (~68 characters) and a sticky sidebar uses the rest of the row, so
 * these pages line up with the homepage instead of sitting in a narrow strip.
 */
export default function ProseLayout({ html, aside, children }: { html?: string; aside?: ReactNode; children?: ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 grid gap-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-20">
      <div className="min-w-0 max-w-[680px]">
        {html && <div className="article-content" dangerouslySetInnerHTML={{ __html: html }} />}
        {children}
      </div>
      {aside && (
        <aside className="min-w-0 lg:sticky lg:top-28 self-start grid gap-5">
          {aside}
        </aside>
      )}
    </div>
  )
}

/** "On this page" list built from a document's h2s. */
export function OnThisPage({ headings }: { headings: Heading[] }) {
  if (headings.length < 3) return null
  return (
    <nav aria-label="On this page" className="hidden lg:block">
      <h2 className="font-sans text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">On this page</h2>
      <ol className="border-l border-maroon-100">
        {headings.map(h => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className="block -ml-px border-l border-transparent pl-4 py-1.5 font-sans text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors duration-200"
            >
              {h.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}

/** A bordered box for sidebar content. */
export function AsideCard({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-maroon-100 bg-card p-5">{children}</div>
}
