// Turns the original images in assets/images/ into the files the site serves.
//
//   npm run images            only re-encodes images that changed
//   npm run images -- --force re-encodes everything
//
// For every original (png, jpg or webp) it writes, under public/images/:
//   name.webp           full size, capped at 1920px wide
//   name-480w.webp …    smaller widths for srcset, only where the original is wider
// For every project and article hero it also writes a 1200×630 JPG share image
// to public/images/og/<slug>.jpg, and assets/og/default.png becomes
// public/images/og/default.jpg.
//
// It records each image's size and variants in src/data/images.json, which
// the site reads at build time for width/height and srcset. Add a new image
// to assets/images/, run this script, and commit both folders and the JSON.

import sharp from 'sharp'
import matter from 'gray-matter'
import { readdir, readFile, writeFile, mkdir, stat, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import { join, relative, dirname, basename, sep } from 'path'
import { fileURLToPath } from 'url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC = join(ROOT, 'assets', 'images')
const OUT = join(ROOT, 'public', 'images')
const OG_OUT = join(OUT, 'og')
const MANIFEST = join(ROOT, 'src', 'data', 'images.json')
const CONTENT = [join(ROOT, 'src', 'content', 'projects'), join(ROOT, 'src', 'content', 'articles')]

const WIDTHS = [480, 960, 1600]
const MAX_WIDTH = 1920
// Folders whose images never show large: cap the full-size file lower.
const MAX_WIDTH_BY_DIR = { collage: 960 }
const QUALITY = 78
// Photos people look at closely get more quality: the homepage portrait (the
// largest image on the site) and the About page collage. Matched against the
// image's path under assets/images, without extension.
const QUALITY_BY_PATH = { hero: 92, 'collage/': 86 }
const qualityFor = rel =>
  Object.entries(QUALITY_BY_PATH).find(([p]) => (p.endsWith('/') ? rel.startsWith(p) : rel === p))?.[1] ?? QUALITY
const OG = { width: 1200, height: 630, quality: 82 }
// Managed output folders: stale .webp/.jpg files in these get removed.
const MANAGED = ['', 'case-studies', 'collage', 'articles', 'og']

const force = process.argv.includes('--force')
const kb = n => `${(n / 1024).toFixed(0)} KB`.padStart(8)
const toPosix = p => p.split(sep).join('/')

async function walk(dir) {
  if (!existsSync(dir)) return []
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    const full = join(dir, e.name)
    if (e.isDirectory()) files.push(...await walk(full))
    else if (/\.(png|jpe?g|webp)$/i.test(e.name)) files.push(full)
  }
  return files
}

async function isFresh(src, out) {
  if (force || !existsSync(out)) return false
  return (await stat(out)).mtimeMs >= (await stat(src)).mtimeMs
}

const previous = existsSync(MANIFEST) ? JSON.parse(await readFile(MANIFEST, 'utf8')) : {}
const manifest = {}
const written = new Set()
let before = 0, after = 0, encoded = 0

for (const src of (await walk(SRC)).sort()) {
  const rel = toPosix(relative(SRC, src)).replace(/\.(png|jpe?g|webp)$/i, '')
  const key = `/images/${rel}`
  const meta = await sharp(src).metadata()
  const cap = MAX_WIDTH_BY_DIR[rel.split('/')[0]] ?? MAX_WIDTH
  const width = Math.min(meta.width, cap)
  const height = Math.round(meta.height * (width / meta.width))

  const full = join(OUT, `${rel}.webp`)
  const targets = [{ w: width, file: full }]
  for (const w of WIDTHS) if (w < width) targets.push({ w, file: join(OUT, `${rel}-${w}w.webp`) })

  const quality = qualityFor(rel)
  const srcSize = (await stat(src)).size
  before += srcSize
  for (const t of targets) {
    written.add(t.file)
    if (await isFresh(src, t.file) && previous[key]?.quality === quality && previous[key]?.width === width) continue
    await mkdir(dirname(t.file), { recursive: true })
    await sharp(src)
      .resize({ width: t.w, withoutEnlargement: true })
      // smartSubsample keeps colour edges (skin, fabric, red/blue detail) crisper in high-quality photos
      .webp({ quality, effort: 6, smartSubsample: quality > QUALITY })
      .toFile(t.file)
    encoded++
  }
  const fullSize = (await stat(full)).size
  after += fullSize
  console.log(`  ${rel.padEnd(42)} ${kb(srcSize)} → ${kb(fullSize)}  ${width}×${height}  +${targets.length - 1} sizes`)

  manifest[key] = {
    src: `/images/${rel}.webp`,
    width,
    height,
    quality,
    variants: targets.map(t => ({ w: t.w, src: `/images/${toPosix(relative(OUT, t.file))}` })).sort((a, b) => a.w - b.w),
  }
}

// ── Share images ────────────────────────────────────────────────────────────
async function writeOg(input, slug) {
  const file = join(OG_OUT, `${slug}.jpg`)
  written.add(file)
  if (await isFresh(input, file)) return
  await mkdir(OG_OUT, { recursive: true })
  await sharp(input)
    .resize(OG.width, OG.height, { fit: 'cover', position: 'top' })
    .jpeg({ quality: OG.quality, mozjpeg: true })
    .toFile(file)
  console.log(`  og/${slug}.jpg`)
}

function findSource(publicPath) {
  const rel = publicPath.replace(/^\/images\//, '').replace(/\.(png|jpe?g|webp)$/i, '')
  for (const ext of ['.png', '.jpg', '.jpeg', '.webp']) {
    const p = join(SRC, rel + ext)
    if (existsSync(p)) return p
  }
  return null
}

console.log('\nShare images')
const defaultOg = join(ROOT, 'assets', 'og', 'default.png')
if (existsSync(defaultOg)) await writeOg(defaultOg, 'default')
for (const dir of CONTENT) {
  if (!existsSync(dir)) continue
  for (const f of (await readdir(dir)).filter(f => f.endsWith('.md'))) {
    const { data } = matter(await readFile(join(dir, f), 'utf8'))
    const hero = data.ogImage || data.heroImage || data.coverImage
    if (!hero) continue
    const source = findSource(hero)
    if (!source) { console.warn(`  ! ${f}: no original found for ${hero}`); continue }
    await writeOg(source, basename(f, '.md'))
  }
}

// ── Remove outputs whose original is gone ───────────────────────────────────
for (const sub of MANAGED) {
  const dir = join(OUT, sub)
  if (!existsSync(dir)) continue
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (!e.isFile() || !/\.(webp|jpe?g|png)$/i.test(e.name)) continue
    const file = join(dir, e.name)
    if (!written.has(file)) {
      await unlink(file)
      console.log(`  removed stale ${toPosix(relative(OUT, file))}`)
    }
  }
}

await mkdir(dirname(MANIFEST), { recursive: true })
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
console.log(`\n${Object.keys(manifest).length} images (${encoded} files encoded). Originals ${kb(before).trim()} → full-size WebP ${kb(after).trim()}.`)
console.log(`Manifest: ${toPosix(relative(ROOT, MANIFEST))}\n`)
