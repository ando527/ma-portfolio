/**
 * Returns the WebP path for an image if it exists alongside the original.
 * Falls back to the original path when no WebP counterpart was generated
 * (e.g. when the original was already smaller than WebP would be).
 * Runs at build time — zero browser cost.
 */
import fs from 'fs'
import path from 'path'

export function toWebP(src: string): string {
  const webpSrc = src.replace(/\.(png|jpe?g)$/i, '.webp')
  if (webpSrc === src) return src // not a convertible format
  // Check the file exists in public/
  const fullPath = path.join(process.cwd(), 'public', webpSrc)
  return fs.existsSync(fullPath) ? webpSrc : src
}
