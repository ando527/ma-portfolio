// Builds the composite cover photos for articles that show screenshots of my
// own work. Each is a 1600×1000 PNG on flat graphite (#161513, the cover
// panel's colour) with the screenshots in the right half, so the cover text
// panel on article cards sits over empty space on the left (see ArticleCover).
// Windows and phones use the site's radius and hairline, no glow. Run it again when a source
// screenshot changes, then run `npm run images`:
//
//   npm run covers
//
//   assets/images/articles/launch-checklist-phones.png
//       Two phones cut from the Speedcubing Australia case study's mobile
//       screenshot (assets/images/case-studies/sca-2026-mobile.webp).
//   assets/images/articles/platform-sites.png
//       Browser windows of this site (Next.js), We Got The Chocolates
//       (Shopify) and Sippy Tom (Webflow). This site's screenshot is
//       assets/covers/home.png; refresh it with `npm run screenshot:home`.

import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { join } from 'path'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const IMAGES = join(ROOT, 'assets', 'images')
const OUT = join(IMAGES, 'articles')
const CANVAS = { width: 1600, height: 1000, channels: 4, background: '#161513' }

const svg = s => Buffer.from(s)
const roundedRect = (w, h, r) => svg(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="#fff"/></svg>`)

async function writeCanvas(layers, file) {
  await sharp({ create: CANVAS }).composite(layers).png().toFile(join(OUT, file))
  console.log(`  articles/${file}`)
}

// ── Launch checklist: two phones from the SCA mobile screenshot ─────────────
// The screenshot has three phones on a light background. The middle and right
// ones are cut out along their rounded frames and set on the dark canvas.
async function launchChecklist() {
  const src = join(IMAGES, 'case-studies', 'sca-2026-mobile.webp')
  const PHONE = { top: 56, width: 371, height: 802, radius: 46 } // frame in the source
  const SCALE = 1.1
  const phones = [
    { left: 774, at: [704, 150] },  // competitions list
    { left: 1233, at: [1120, 75] }, // world record page, in front
  ]
  const mask = roundedRect(PHONE.width, PHONE.height, PHONE.radius)
  // A hairline around each phone so the white screens read as objects on graphite.
  const outW = Math.round(PHONE.width * SCALE), outH = Math.round(PHONE.height * SCALE), outR = Math.round(PHONE.radius * SCALE)
  const ring = svg(`<svg width="${outW}" height="${outH}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.75" y="0.75" width="${outW - 1.5}" height="${outH - 1.5}" rx="${outR}" fill="none" stroke="#EFE9DE" stroke-opacity="0.16" stroke-width="1.5"/>
  </svg>`)

  const layers = []
  for (const p of phones) {
    const cut = await sharp(src)
      .extract({ left: p.left, top: PHONE.top, width: PHONE.width, height: PHONE.height })
      .ensureAlpha()
      .composite([{ input: mask, blend: 'dest-in' }])
      .png().toBuffer()
    const sized = await sharp(cut).resize(outW, outH).png().toBuffer()
    layers.push({ input: sized, left: p.at[0], top: p.at[1] })
    layers.push({ input: ring, left: p.at[0], top: p.at[1] })
  }
  await writeCanvas(layers, 'launch-checklist-phones.png')
}

// ── Choosing a platform: three sites as browser windows ─────────────────────
// Windows cascade down to the right, back to front. `crop` trims a screenshot
// before it's fitted to the window; positions keep the middle window's
// headline and the face on the back window clear of the window in front.
async function platformSites() {
  const WIN = 600, BAR = 32, R = 16
  const SHOT_H = Math.round(WIN * 10 / 16)
  const H = BAR + SHOT_H
  const PAD = 60 // room around each window for its shadow

  const sites = [
    { file: join(ROOT, 'assets', 'covers', 'home.png'), crop: { left: 60, top: 0, width: 1380, height: 862 }, at: [740, 40] },
    { file: join(IMAGES, 'case-studies', 'wgtc-hero.jpg'), at: [860, 310] },
    { file: join(IMAGES, 'case-studies', 'sippy-tom-after.jpg'), at: [980, 580] },
  ]

  // Window chrome in the dark ramp: card-coloured bar, dots at the same
  // neutral, a hairline ring, and one soft neutral shadow.
  const frame = svg(`<svg width="${WIN}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${WIN}" height="${H}" rx="${R}" fill="#1C1A18"/>
    ${[0, 1, 2].map(i => `<circle cx="${20 + i * 16}" cy="${BAR / 2}" r="4.5" fill="#EFE9DE" fill-opacity="0.28"/>`).join('')}
  </svg>`)
  const ring = svg(`<svg width="${WIN}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.75" y="0.75" width="${WIN - 1.5}" height="${H - 1.5}" rx="${R}" fill="none" stroke="#EFE9DE" stroke-opacity="0.16" stroke-width="1.5"/>
  </svg>`)
  const shadow = svg(`<svg width="${WIN + PAD * 2}" height="${H + PAD * 2}" xmlns="http://www.w3.org/2000/svg">
    <defs><filter id="b"><feGaussianBlur stdDeviation="18"/></filter></defs>
    <rect x="${PAD}" y="${PAD + 16}" width="${WIN}" height="${H}" rx="${R}" fill="#000" fill-opacity="0.4" filter="url(#b)"/>
  </svg>`)
  const mask = roundedRect(WIN, H, R)

  const layers = []
  for (const site of sites) {
    let image = sharp(site.file)
    if (site.crop) image = sharp(await image.extract(site.crop).toBuffer())
    const shot = await image.resize(WIN, SHOT_H, { fit: 'cover', position: 'centre' }).toBuffer()
    const win = await sharp(frame)
      .composite([{ input: shot, left: 0, top: BAR }, { input: ring, left: 0, top: 0 }])
      .png().toBuffer()
    const rounded = await sharp(win).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer()
    const [x, y] = site.at
    layers.push({ input: shadow, left: x - PAD, top: y - PAD })
    layers.push({ input: rounded, left: x, top: y })
  }
  await writeCanvas(layers, 'platform-sites.png')
}

console.log('\nArticle covers')
await launchChecklist()
await platformSites()
console.log('\nNow run `npm run images` to make the WebP and share images.\n')
