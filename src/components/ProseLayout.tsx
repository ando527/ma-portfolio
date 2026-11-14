import type { ReactNode } from 'react'
import type { Heading } from '@/lib/markdown'
import TableOfContents from '@/components/TableOfContents'

/**
 * Long-form content at the site's full width: the text keeps a readable
 * column (~65 characters) and a sticky sidebar uses the rest of the row, so
 * these pages line up with the homepage instead of sitting in a narrow strip.
 */
export default function ProseLayout({ html, aside, children }: { html?: string; aside?: ReactNode; children?: ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid gap-12 lg:grid-cols-[minmax(0,1fr)_304px] lg:gap-20">
      <div className="min-w-0 max-w-[42rem]">
        {html && <div className="article-content" dangerouslySetInnerHTML={{ __html: html }} />}
        {children}
      </div>
      {aside && (
        <aside className="min-w-0 lg:sticky lg:top-28 self-start grid gap-6">
          {aside}
        </aside>
      )}
    </div>
  )
}

/** "On this page" list built from a document's h2s. */
export function OnThisPage({ headings }: { headings: Heading[] }) {
  if (headings.length < 3) return null
  return <TableOfContents headings={headings} />
}

/** A bordered box for sidebar content. */
export function AsideCard({ children }: { children: ReactNode }) {
  return <div className="rounded-2xl border border-line bg-card p-6 shadow-soft">{children}</div>
}
