import { getAllArticles } from '@/lib/articles'
import { SITE, FEED, absoluteUrl, isoDate } from '@/lib/site'

// /feed.xml: an RSS 2.0 feed of the articles (title, summary and a link, not
// the full text). Built at build time, so new articles appear automatically.
// Like the sitemap, it lists only articles that are ours to rank: published
// with a full body and not republished from elsewhere. Dates come from the
// content's own dates, never the build time, so the feed only changes when an
// article does.

export const dynamic = 'force-static'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

/** RFC 822 date at midnight UTC, as RSS wants, from "2026-10" or "2026-10-08". */
const rfc822 = (date: string) => new Date(`${isoDate(date)}T00:00:00Z`).toUTCString()

export function GET() {
  const articles = getAllArticles().filter(a => a.hasBody && !a.canonicalToOriginal)
  const latest = articles.map(a => a.updated ?? a.date).sort().at(-1)

  const items = articles.map(a => {
    const url = absoluteUrl(`/articles/${a.slug}/`)
    return [
      '    <item>',
      `      <title>${esc(a.title)}</title>`,
      `      <link>${url}</link>`,
      `      <guid isPermaLink="true">${url}</guid>`,
      `      <pubDate>${rfc822(a.date)}</pubDate>`,
      `      <dc:creator>${esc(SITE.name)}</dc:creator>`,
      ...a.tags.map(t => `      <category>${esc(t)}</category>`),
      `      <description>${esc(a.summary)}</description>`,
      '    </item>',
    ].join('\n')
  })

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '  <channel>',
    `    <title>${esc(FEED.title)}</title>`,
    `    <link>${absoluteUrl('/articles/')}</link>`,
    `    <atom:link href="${absoluteUrl(FEED.path)}" rel="self" type="application/rss+xml" />`,
    '    <description>Notes on Webflow, Shopify and front-end development, and what I have learned building websites for clients.</description>',
    `    <language>${SITE.lang.toLowerCase()}</language>`,
    ...(latest ? [`    <lastBuildDate>${rfc822(latest)}</lastBuildDate>`] : []),
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')

  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
