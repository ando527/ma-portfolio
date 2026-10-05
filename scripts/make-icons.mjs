// Generates the PNG and ICO icons from the MA logo mark. Run it again only if
// the logo changes:  node scripts/make-icons.mjs
//
//   src/app/favicon.ico        16, 32 and 48px (for browsers that ask for /favicon.ico)
//   src/app/apple-icon.png     180px, square — iOS rounds the corners itself
//   public/icons/icon-192.png  web app manifest
//   public/icons/icon-512.png  web app manifest, and Google's search-result favicon

import sharp from 'sharp'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { fileURLToPath } from 'url'
import { join } from 'path'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const BG = '#100408'

const mark = await readFile(join(ROOT, 'public', 'images', 'ma-logo-mark.svg'), 'utf8')
const paths = mark.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')

/** The mark on a dark square; `pad` is the share of the icon left as margin. */
function iconSvg({ rounded, pad }) {
  const scale = 1 - pad * 2
  const offset = 64 * pad
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect width="64" height="64" ${rounded ? 'rx="13"' : ''} fill="${BG}"/>
    <g transform="translate(${offset} ${offset}) scale(${scale})">${paths}</g>
  </svg>`
}

const png = (svg, size) => sharp(Buffer.from(svg), { density: 600 }).resize(size, size).png().toBuffer()

// ICO container holding PNG images (supported by every current browser).
function ico(images) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0)
  header.writeUInt16LE(1, 2)
  header.writeUInt16LE(images.length, 4)
  let offset = 6 + images.length * 16
  const entries = images.map(({ size, data }) => {
    const e = Buffer.alloc(16)
    e.writeUInt8(size >= 256 ? 0 : size, 0)
    e.writeUInt8(size >= 256 ? 0 : size, 1)
    e.writeUInt8(0, 2)
    e.writeUInt8(0, 3)
    e.writeUInt16LE(1, 4)
    e.writeUInt16LE(32, 6)
    e.writeUInt32LE(data.length, 8)
    e.writeUInt32LE(offset, 12)
    offset += data.length
    return e
  })
  return Buffer.concat([header, ...entries, ...images.map(i => i.data)])
}

const favicon = iconSvg({ rounded: true, pad: 0.04 })
const square = iconSvg({ rounded: false, pad: 0.14 })

await mkdir(join(ROOT, 'public', 'icons'), { recursive: true })
await writeFile(
  join(ROOT, 'src', 'app', 'favicon.ico'),
  ico(await Promise.all([16, 32, 48].map(async size => ({ size, data: await png(favicon, size) })))),
)
await writeFile(join(ROOT, 'src', 'app', 'apple-icon.png'), await png(square, 180))
await writeFile(join(ROOT, 'public', 'icons', 'icon-192.png'), await png(square, 192))
await writeFile(join(ROOT, 'public', 'icons', 'icon-512.png'), await png(square, 512))
console.log('Icons written.')
