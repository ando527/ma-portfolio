// Thumbnails for the five November 2026 draft posts.
// For each slug it writes two PNGs next to this script:
//   <slug>.png           1600x1000 article cover (visual on the right, left half
//                        empty graphite for the article card's text panel)
//   <slug>-linkedin.png  1200x627 share image (headline left, same visual right)
//
//   node drafts/november-2026/thumbnails/make-thumbnails.mjs
//
// Same look as scripts/make-article-covers.mjs: flat graphite #161513, hairline
// strokes (#EFE9DE at 16%), radius 16, one soft shadow per illustration, burgundy
// accent (#E08A9A on dark), cream text. Illustrations are SVG composited by sharp.
// Text uses Geist (the site's font) via the Geist-Regular.ttf that ships with Next.

import { writeFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { join } from 'path'
import { tmpdir } from 'os'

const BS = String.fromCharCode(92)
const fwd = p => p.split(BS).join('/')
const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const OUT = fileURLToPath(new URL('./', import.meta.url))

// Point fontconfig at Geist before sharp (libvips) loads.
const fcDir = join(tmpdir(), 'ma-thumb-fc')
mkdirSync(fcDir, { recursive: true })
const fontDir = fwd(join(ROOT, 'node_modules', 'next', 'dist', 'compiled', '@vercel', 'og'))
writeFileSync(join(fcDir, 'fonts.conf'), `<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${fontDir}</dir><cachedir>${fwd(fcDir)}</cachedir></fontconfig>`)
process.env.FONTCONFIG_FILE = join(fcDir, 'fonts.conf')
const sharp = (await import('sharp')).default

// ── Palette ─────────────────────────────────────────────────────────────────
const BG = '#161513', CARD = '#1C1A18', CARD2 = '#242220'
const CREAM = '#EFE9DE', ACCENT = '#E08A9A', BURG = '#7C1D2E'
const FONT = "Geist, 'Segoe UI', Arial, sans-serif"

// ── Drawing helpers (all coordinates in a 760-wide illustration box) ────────
const card = (x, y, w, h, { fill = CARD, r = 16, shadow = false, stroke = 0.16 } = {}) =>
  `${shadow ? `<rect x="${x}" y="${y + 18}" width="${w}" height="${h}" rx="${r}" fill="#000" fill-opacity="0.45" filter="url(#sh)"/>` : ''}` +
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>` +
  `<rect x="${x + 0.75}" y="${y + 0.75}" width="${w - 1.5}" height="${h - 1.5}" rx="${r}" fill="none" stroke="${CREAM}" stroke-opacity="${stroke}" stroke-width="1.5"/>`
const bar = (x, y, w, h = 12, o = 0.14, fill = CREAM) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" fill-opacity="${o}"/>`
const text = (x, y, s, size, { fill = CREAM, weight = 400, anchor = 'start', o = 1, ls = 0 } = {}) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" fill-opacity="${o}" text-anchor="${anchor}" letter-spacing="${ls}">${s}</text>`
const dots = (x, y) => [0, 1, 2].map(i => `<circle cx="${x + i * 16}" cy="${y}" r="4.5" fill="${CREAM}" fill-opacity="0.28"/>`).join('')
const tick = (x, y, c = CREAM, w = 3.5) => `<path d="M${x} ${y} l6 6 l11 -12" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`
const pill = (x, y, w, h, fill, label, size = 22, tc = CREAM, weight = 600) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}"/>` + text(x + w / 2, y + h / 2 + size * 0.35, label, size, { fill: tc, weight, anchor: 'middle' })
const defs = `<defs><filter id="sh" x="-30%" y="-30%" width="160%" height="170%"><feGaussianBlur stdDeviation="18"/></filter></defs>`

// ── 1. Black Friday readiness: product card + traffic / speed card ──────────
function blackFriday() {
  let s = card(60, 10, 440, 540)
  s += `<rect x="76" y="26" width="408" height="290" rx="10" fill="${CARD2}"/>`
  s += `<rect x="200" y="86" width="160" height="170" rx="22" fill="none" stroke="${CREAM}" stroke-opacity="0.22" stroke-width="2"/>`
  s += `<path d="M236 118 v-12 a44 44 0 0 1 88 0 v12" transform="translate(0 4)" fill="none" stroke="${CREAM}" stroke-opacity="0.22" stroke-width="2"/>`
  s += pill(96, 44, 92, 40, BURG, '-30%', 22)
  s += bar(80, 348, 250, 16, 0.5) + bar(80, 380, 170, 12, 0.14)
  s += text(80, 462, '$89', 44, { weight: 600 }) + text(176, 460, '$127', 24, { o: 0.4 })
  s += `<line x1="176" y1="452" x2="232" y2="452" stroke="${CREAM}" stroke-opacity="0.4" stroke-width="2"/>`
  // front card: traffic + speed
  s += card(300, 400, 430, 300, { shadow: true, fill: CARD })
  s += text(332, 450, 'Traffic', 24, { o: 0.6 })
  const hs = [36, 48, 44, 70, 96, 124, 150]
  hs.forEach((h, i) => { s += `<rect x="${332 + i * 56}" y="${650 - h}" width="38" height="${h}" rx="8" fill="${i === 6 ? ACCENT : CREAM}" fill-opacity="${i === 6 ? 1 : 0.16}"/>` })
  s += `<rect x="574" y="418" width="136" height="44" rx="22" fill="none" stroke="${ACCENT}" stroke-width="2"/>` + tick(590, 442, ACCENT, 3) + text(618, 447, '1.2s', 22, { fill: ACCENT, weight: 600 })
  return { svg: s, h: 700 }
}

// ── 2. AI search: query, answer bubble, cited source ────────────────────────
function aiSearch() {
  let s = card(40, 0, 680, 72, { r: 36 })
  s += `<circle cx="92" cy="34" r="12" fill="none" stroke="${CREAM}" stroke-opacity="0.5" stroke-width="3"/><line x1="101" y1="43" x2="111" y2="53" stroke="${CREAM}" stroke-opacity="0.5" stroke-width="3" stroke-linecap="round"/>`
  s += text(132, 44, 'web designer in Brisbane', 26, { o: 0.75 })
  // answer bubble
  s += card(40, 110, 680, 330, { r: 24 })
  s += `<circle cx="92" cy="166" r="18" fill="${BURG}"/><path d="M92 154 l3.5 8.5 l8.5 3.5 l-8.5 3.5 l-3.5 8.5 l-3.5 -8.5 l-8.5 -3.5 l8.5 -3.5 z" fill="${CREAM}"/>`
  s += text(126, 174, 'Answer', 24, { o: 0.6 })
  s += bar(76, 218, 600, 14, 0.18) + bar(76, 252, 520, 14, 0.18)
  s += `<rect x="76" y="284" width="250" height="30" rx="8" fill="${ACCENT}" fill-opacity="0.22"/>` + bar(86, 292, 230, 14, 0.5, ACCENT)
  s += bar(342, 292, 190, 14, 0.18)
  s += bar(76, 336, 470, 14, 0.18) + bar(76, 370, 340, 14, 0.18)
  s += pill(556, 280, 56, 38, BURG, '1', 22)
  // connector to the cited source
  s += `<path d="M584 318 V470" stroke="${ACCENT}" stroke-opacity="0.8" stroke-width="2.5" fill="none" stroke-dasharray="3 7" stroke-linecap="round"/>`
  // source card
  s += card(260, 470, 460, 200, { shadow: true })
  s += `<rect x="288" y="500" width="40" height="40" rx="10" fill="${BURG}"/>` + text(308, 529, 'Y', 24, { weight: 600, anchor: 'middle' })
  s += text(344, 527, 'yourbusiness.com.au', 24, { o: 0.9 })
  s += bar(288, 570, 360, 14, 0.22) + bar(288, 600, 280, 12, 0.12) + bar(288, 628, 200, 12, 0.12)
  s += `<rect x="574" y="610" width="126" height="40" rx="20" fill="none" stroke="${ACCENT}" stroke-width="2"/>` + text(637, 637, 'Source 1', 20, { fill: ACCENT, weight: 600, anchor: 'middle' })
  return { svg: s, h: 670 }
}

// ── 3. AI builder vs developer: prompt box beside a hand-built wireframe ────
function builderVsDev() {
  let s = card(0, 40, 340, 400)
  s += text(28, 92, 'Prompt', 22, { o: 0.55 })
  s += `<rect x="24" y="112" width="292" height="170" rx="12" fill="${CARD2}"/>`
  s += bar(44, 140, 240, 14, 0.5) + bar(44, 172, 200, 14, 0.5) + bar(44, 204, 150, 14, 0.5)
  s += `<rect x="198" y="198" width="3" height="26" fill="${ACCENT}"/>`
  s += `<rect x="24" y="334" width="292" height="60" rx="30" fill="${BURG}"/>` + text(170, 372, 'Generate', 24, { weight: 600, anchor: 'middle' })
  s += card(420, 40, 340, 400, { shadow: true })
  s += dots(444, 72) + `<line x1="420" y1="98" x2="760" y2="98" stroke="${CREAM}" stroke-opacity="0.12" stroke-width="1.5"/>`
  s += bar(444, 120, 60, 12, 0.5) + bar(640, 120, 30, 10, 0.2) + bar(682, 120, 50, 10, 0.2)
  s += `<rect x="444" y="152" width="292" height="108" rx="10" fill="${CARD2}"/>` + bar(464, 176, 150, 16, 0.55) + bar(464, 208, 110, 10, 0.2) + `<rect x="464" y="228" width="84" height="22" rx="11" fill="${BURG}"/>`
  ;[0, 1, 2].forEach(i => { s += `<rect x="${444 + i * 102}" y="280" width="88" height="110" rx="10" fill="${CARD2}"/>` + bar(456 + i * 102, 352, 54, 10, 0.2) })
  // hand-placed alignment guides
  s += `<line x1="444" y1="140" x2="444" y2="410" stroke="${ACCENT}" stroke-opacity="0.7" stroke-width="1.5" stroke-dasharray="4 6"/><line x1="736" y1="140" x2="736" y2="410" stroke="${ACCENT}" stroke-opacity="0.7" stroke-width="1.5" stroke-dasharray="4 6"/>`
  s += `<circle cx="380" cy="240" r="26" fill="${BG}" stroke="${CREAM}" stroke-opacity="0.16" stroke-width="1.5"/>` + text(380, 247, 'vs', 20, { o: 0.7, anchor: 'middle', weight: 600 })
  s += text(170, 486, 'AI builder', 24, { o: 0.6, anchor: 'middle' }) + text(590, 486, 'Developer', 24, { o: 0.6, anchor: 'middle' })
  return { svg: s, h: 500 }
}

// ── 4. Accessibility: focus ring, contrast ratio chip, labelled field ───────
function accessibility() {
  let s = card(60, 10, 600, 640)
  s += dots(92, 48) + `<line x1="60" y1="76" x2="660" y2="76" stroke="${CREAM}" stroke-opacity="0.12" stroke-width="1.5"/>`
  s += bar(92, 112, 300, 20, 0.5) + bar(92, 148, 220, 12, 0.16)
  s += text(92, 252, 'Email address', 26, { o: 0.9 })
  s += `<rect x="92" y="280" width="536" height="76" rx="12" fill="${CARD2}"/>`
  s += `<rect x="92" y="280" width="536" height="76" rx="12" fill="none" stroke="${CREAM}" stroke-opacity="0.35" stroke-width="2"/>`
  s += `<rect x="84" y="272" width="552" height="92" rx="18" fill="none" stroke="${ACCENT}" stroke-width="4"/>`
  s += text(116, 328, 'name@example.com', 26, { o: 0.45 })
  s += `<rect x="92" y="412" width="190" height="62" rx="31" fill="${BURG}"/>` + text(187, 451, 'Send', 24, { weight: 600, anchor: 'middle' })
  s += bar(92, 520, 250, 12, 0.14) + bar(92, 548, 170, 12, 0.14)
  // Tab key cap
  s += `<rect x="470" y="388" width="120" height="64" rx="12" fill="${CARD2}" stroke="${CREAM}" stroke-opacity="0.2" stroke-width="1.5"/>` + text(530, 430, 'Tab', 24, { weight: 600, anchor: 'middle' })
  // contrast chip
  s += card(380, 520, 340, 150, { shadow: true })
  s += `<rect x="404" y="548" width="92" height="92" rx="14" fill="${CREAM}"/>` + text(450, 608, 'Aa', 42, { fill: BG, weight: 600, anchor: 'middle' })
  s += text(522, 594, '4.5:1', 44, { weight: 600 }) + text(522, 630, 'Contrast', 22, { o: 0.55 })
  return { svg: s, h: 670 }
}

// ── 5. Year-end audit: ticked checklist, calendar strip ending in January ───
function yearEnd() {
  let s = card(20, 0, 520, 470)
  s += text(56, 56, 'Audit', 26, { o: 0.6 })
  const rows = [['Speed', 1], ['Links', 1], ['Forms', 1], ['Backups', 0], ['Content', 0]]
  rows.forEach(([label, done], i) => {
    const y = 94 + i * 70
    s += done
      ? `<rect x="56" y="${y}" width="40" height="40" rx="10" fill="${BURG}"/>` + tick(66, y + 22, CREAM, 4)
      : `<rect x="57" y="${y + 1}" width="38" height="38" rx="10" fill="none" stroke="${CREAM}" stroke-opacity="0.3" stroke-width="2"/>`
    s += text(120, y + 30, label, 28, { o: done ? 0.95 : 0.55 })
    s += bar(380, y + 14, 120, 12, done ? 0.18 : 0.1)
  })
  // calendar strip
  s += card(180, 500, 560, 170, { shadow: true })
  const months = ['Nov', 'Dec', 'Jan']
  months.forEach((m, i) => {
    const x = 204 + i * 172, last = i === 2
    s += `<rect x="${x}" y="526" width="152" height="118" rx="14" fill="${last ? BURG : CARD2}"/>`
    if (!last) s += `<rect x="${x + 0.75}" y="526.75" width="150.5" height="116.5" rx="14" fill="none" stroke="${CREAM}" stroke-opacity="0.16" stroke-width="1.5"/>`
    s += text(x + 76, 590, m, 36, { weight: 600, anchor: 'middle', o: last ? 1 : 0.7 })
    s += bar(x + 46, 612, 60, 8, last ? 0.5 : 0.16)
  })
  return { svg: s, h: 670 }
}

const POSTS = [
  { slug: 'black-friday-website-readiness', lines: ['Black Friday', 'readiness'], visual: blackFriday },
  { slug: 'showing-up-in-ai-search', lines: ['Showing up', 'in AI search'], visual: aiSearch },
  { slug: 'ai-website-builders-vs-a-developer', lines: ['AI builder', 'or developer?'], visual: builderVsDev },
  { slug: 'accessibility-for-small-business-2026', lines: ['Accessibility,', 'plainly'], visual: accessibility },
  { slug: 'year-end-website-audit', lines: ['The year-end', 'audit'], visual: yearEnd },
]

// Compose a canvas SVG: background, headline (optional), illustration group.
const group = (v, cx, cy, scale) =>
  `<g transform="translate(${cx - 380 * scale} ${cy - (v.h / 2) * scale}) scale(${scale})">${v.svg}</g>`

function cover(post) {
  const v = post.visual()
  return `<svg width="1600" height="1000" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="1600" height="1000" fill="${BG}"/>${group(v, 1160, 500, 1)}</svg>`
}

function linkedin(post) {
  const v = post.visual()
  const size = 76
  const y0 = 313 - ((post.lines.length - 1) * size * 1.08) / 2 + size * 0.3
  const head = post.lines.map((l, i) => text(72, y0 + i * size * 1.08, l, size, { weight: 700, ls: -1.5 })).join('')
  const barEl = `<rect x="72" y="${y0 - size - 34}" width="64" height="7" rx="3.5" fill="${BURG}"/>`
  return `<svg width="1200" height="627" xmlns="http://www.w3.org/2000/svg">${defs}<rect width="1200" height="627" fill="${BG}"/>${barEl}${head}${group(v, 912, 313, 0.64)}</svg>`
}

for (const post of POSTS) {
  await sharp(Buffer.from(cover(post))).png().toFile(join(OUT, `${post.slug}.png`))
  await sharp(Buffer.from(linkedin(post))).png().toFile(join(OUT, `${post.slug}-linkedin.png`))
  console.log(`  ${post.slug}.png + -linkedin.png`)
}
