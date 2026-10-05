/**
 * Build-time image lookup. scripts/optimize-images.mjs writes every image's
 * WebP path, size and smaller variants to src/data/images.json; this turns a
 * content path such as "/images/case-studies/venncap-after.jpg" into the
 * attributes an <img> needs. Server-only (the manifest stays out of client JS):
 * resolve here and pass the result to client components as props.
 */
import manifest from '@/data/images.json'
import type { ImageData } from '@/lib/types'

export type { ImageData }

type Entry = {
  src: string
  width: number
  height: number
  variants: { w: number; src: string }[]
}

const entries = manifest as Record<string, Entry>

/** The manifest key for a public image path: no extension. */
function keyFor(path: string) {
  return path.split('?')[0].replace(/\.(png|jpe?g|webp)$/i, '')
}

export function hasImage(path: string): boolean {
  return Boolean(entries[keyFor(path)])
}

/**
 * Resolve an image under /images/. Throws if the image hasn't been run
 * through the optimiser, so a missing file fails the build instead of
 * shipping a broken image.
 */
export function getImage(path: string): ImageData {
  const entry = entries[keyFor(path)]
  if (!entry) {
    throw new Error(
      `Image "${path}" isn't in src/data/images.json. Put the original in assets${keyFor(path)}.(jpg|png|webp) and run "npm run images".`,
    )
  }
  return {
    src: entry.src,
    srcSet: entry.variants.map(v => `${v.src} ${v.w}w`).join(', '),
    width: entry.width,
    height: entry.height,
  }
}

/** getImage() for optional fields: returns undefined when there's no path. */
export function maybeImage(path?: string): ImageData | undefined {
  return path ? getImage(path) : undefined
}

/** All images in one folder, e.g. "/images/collage". */
export function imagesIn(folder: string): ImageData[] {
  const prefix = folder.replace(/\/$/, '') + '/'
  return Object.keys(entries)
    .filter(k => k.startsWith(prefix))
    .sort()
    .map(k => getImage(k))
}
