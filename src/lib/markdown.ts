/**
 * Markdown → HTML for case studies and articles, at build time.
 *
 * Images written as ![alt](/images/…) or <img src="/images/…"> are swapped for
 * their optimised WebP with width, height, srcset and lazy loading, so content
 * files can keep pointing at the original filenames. A markdown image with a
 * title — ![alt](/images/x.jpg "Caption") — becomes a <figure> with that caption.
 */
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import { visit } from 'unist-util-visit'
import type { Root, Element, ElementContent } from 'hast'
import { getImage } from '@/lib/images'

/** Prose column width (max-w-2xl, minus padding) for the sizes attribute. */
const PROSE_SIZES = '(min-width: 720px) 624px, calc(100vw - 48px)'

function rehypeSiteImages() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'img') return
      const src = String(node.properties.src ?? '')
      if (!src.startsWith('/images/') || /\.(svg|gif)$/i.test(src)) return

      const img = getImage(src)
      node.properties.src = img.src
      node.properties.srcSet = img.srcSet
      node.properties.sizes = PROSE_SIZES
      node.properties.width = img.width
      node.properties.height = img.height
      node.properties.loading = 'lazy'
      node.properties.decoding = 'async'

      // Markdown title → figure + figcaption
      const title = node.properties.title
      if (title && parent && typeof index === 'number' && parent.type === 'element' && parent.tagName === 'p' && parent.children.length === 1) {
        delete node.properties.title
        const figure: Element = {
          type: 'element',
          tagName: 'figure',
          properties: {},
          children: [
            node,
            { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: String(title) }] },
          ],
        }
        // Replace the wrapping <p> with the figure.
        Object.assign(parent, figure)
      }
    })

    // Videos in content: never preload the whole file before it's needed.
    visit(tree, 'element', (node: Element) => {
      if (node.tagName === 'video' && node.properties.preload === undefined) {
        node.properties.preload = 'metadata'
      }
    })
  }
}

export interface Heading {
  id: string
  text: string
}

const textOf = (node: Element | ElementContent): string =>
  node.type === 'text' ? node.value : 'children' in node ? node.children.map(textOf).join('') : ''

const slugify = (s: string) =>
  s.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/** Gives every h2 an id (for anchor links) and collects them for a contents list. */
function rehypeHeadingIds(headings: Heading[]) {
  return () => (tree: Root) => {
    const used = new Set<string>()
    visit(tree, 'element', (node: Element) => {
      if (node.tagName !== 'h2') return
      const text = textOf(node).trim()
      let id = slugify(text) || 'section'
      for (let n = 2; used.has(id); n++) id = `${slugify(text)}-${n}`
      used.add(id)
      node.properties.id = id
      headings.push({ id, text })
    })
  }
}

export async function renderMarkdown(markdown: string): Promise<{ html: string; headings: Heading[] }> {
  const headings: Heading[] = []
  const file = await unified()
    .use(remarkParse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSiteImages)
    .use(rehypeHeadingIds(headings))
    .use(rehypeStringify)
    .process(markdown)
  return { html: String(file), headings }
}

/** True when markdown has readable text, not just whitespace or comments. */
export function hasBody(markdown: string): boolean {
  return markdown.replace(/<!--[\s\S]*?-->/g, '').trim().length > 0
}

