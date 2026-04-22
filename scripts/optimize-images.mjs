import sharp from 'sharp'
import { readdir, stat } from 'fs/promises'
import { join, extname, basename } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = join(__dirname, '..', 'public', 'images')

async function getImages(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await getImages(full))
    } else if (/\.(png|jpe?g)$/i.test(entry.name)) {
      files.push(full)
    }
  }
  return files
}

async function convert(src) {
  const ext = extname(src)
  const dest = src.slice(0, -ext.length) + '.webp'

  const before = (await stat(src)).size
  await sharp(src).webp({ quality: 90 }).toFile(dest)
  const after = (await stat(dest)).size

  const saved = (((before - after) / before) * 100).toFixed(1)
  const kb = n => (n / 1024).toFixed(0) + ' KB'

  if (after >= before) {
    // WebP ended up larger — delete it and keep the original
    const { unlink } = await import('fs/promises')
    await unlink(dest)
    console.log(`  ${basename(src).padEnd(40)} ${kb(before).padStart(8)}   (kept original — WebP was larger)`)
    return
  }

  console.log(`  ${basename(src).padEnd(40)} ${kb(before).padStart(8)} → ${kb(after).padStart(8)}  (${saved}% smaller)`)
}

const images = await getImages(PUBLIC_DIR)
console.log(`\nConverting ${images.length} images to WebP at quality 90...\n`)
for (const img of images) {
  await convert(img)
}
console.log(`\nDone. WebP files written alongside originals.\n`)
