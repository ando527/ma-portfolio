// Renders the 1200×630 share cards with a locally installed Chrome or Edge in
// headless mode, so every share image reads as part of one system:
//
//   npm run og                  all cards
//   npm run og -- sippy-tom     only the named slugs
//
//   assets/og/default.png       from assets/og/default.html (portrait on the maroon block)
//   assets/og/cards/<slug>.png  one per project and article: title, a mono
//                               meta line, and the real screenshot or cover
//                               (a browser window for projects, a plain
//                               frame for articles) on a graphite ground.
//
// `npm run images` turns these PNGs into public/images/og/<slug>.jpg. Run
// `npm run og` first whenever a project or article, its hero image or the
// default card changes, then `npm run images`. Fonts are the local Geist
// files in assets/fonts, so the render needs no network.
//
// Set BROWSER=/path/to/chrome to use a different browser.

import { execFileSync } from 'child_process'
import { existsSync, statSync, mkdtempSync, rmSync } from 'fs'
import { readdir, readFile, writeFile, mkdir } from 'fs/promises'
import { tmpdir } from 'os'
import { fileURLToPath, pathToFileURL } from 'url'
import { join, basename } from 'path'
import matter from 'gray-matter'
import sharp from 'sharp'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC = join(ROOT, 'assets', 'images')
const OG_DIR = join(ROOT, 'assets', 'og')
const CARD_DIR = join(OG_DIR, 'cards')
const FONTS = pathToFileURL(join(ROOT, 'assets', 'fonts')).href
const MARK = await readFile(join(ROOT, 'public', 'images', 'ma-logo-mark.svg'), 'utf8')
const markPaths = MARK.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')

const browser = [
  process.env.BROWSER,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find(p => p && existsSync(p))
if (!browser) throw new Error('No Chrome or Edge found. Set BROWSER to its path.')

const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)

/** The browser can return before its child process has written the
 *  screenshot, so wait until the file exists and has stopped growing. */
function waitForFile(file, timeout = 30000) {
  let last = -1
  for (const start = Date.now(); Date.now() - start < timeout; sleep(250)) {
    const size = existsSync(file) ? statSync(file).size : -1
    if (size > 0 && size === last) return
    last = size
  }
  throw new Error(`Timed out waiting for ${file}`)
}

function render(pageUrl, out) {
  rmSync(out, { force: true })
  // A throwaway profile per run, so the headless browser doesn't hand off to
  // a copy that's already open.
  const profile = mkdtempSync(join(tmpdir(), 'og-'))
  execFileSync(browser, [
    '--headless=new',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--disable-gpu',
    '--hide-scrollbars',
    '--allow-file-access-from-files',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=4000',
    `--screenshot=${out}`,
    pageUrl,
  ], { stdio: 'ignore' })
  waitForFile(out)
  rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 300 })
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Tokens from the design spec (dark ramp).
const CSS = `
  @font-face { font-family: Geist; src: url(${FONTS}/geist-latin.woff2) format('woff2'); font-weight: 100 900; }
  @font-face { font-family: 'Geist Mono'; src: url(${FONTS}/geist-mono-latin.woff2) format('woff2'); font-weight: 100 900; }
  :root { --page:#161513; --card:#1C1A18; --line:rgba(239,233,222,.14); --fg:#EFE9DE; --fg2:#AAA398; --fg3:#918B81; --accent:#7C1D2E; }
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body { position: relative; background: var(--page); color: var(--fg); font-family: Geist, sans-serif; -webkit-font-smoothing: antialiased; }
  .mono { font-family: 'Geist Mono', monospace; font-variant-numeric: tabular-nums; }
`

function cardHtml({ title, kind, date, image, frame }) {
  const size = title.length <= 12 ? 76 : title.length <= 21 ? 56 : 48
  const screen = frame === 'window'
    ? `<div class="win">
         <div class="bar"><i></i><i></i><i></i></div>
         <img src="${image}" alt="">
       </div>`
    : `<div class="win ${frame}"><img src="${image}" alt=""></div>`
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}
  .text { position: absolute; z-index: 2; left: 72px; top: 72px; bottom: 72px; width: 400px; display: flex; flex-direction: column; }
  .meta { display: flex; gap: 16px; font-size: 20px; line-height: 28px; color: var(--fg2); }
  .meta span + span { color: var(--fg3); }
  h1 { margin: 24px 0 0; font-weight: 500; font-size: ${size}px; line-height: 1.06; letter-spacing: -0.03em; text-wrap: balance; }
  .foot { margin-top: auto; display: flex; align-items: center; gap: 16px; font-size: 20px; line-height: 28px; color: var(--fg3); }
  .tile { width: 40px; height: 40px; border-radius: 10px; background: var(--accent); display: grid; place-items: center; }
  .tile svg { width: 28px; height: 28px; }
  /* Project: a browser window bleeding off the right and bottom edges. */
  .win { position: absolute; left: 508px; top: 136px; width: 740px; height: 536px; border-radius: 16px; overflow: hidden;
         background: var(--card); box-shadow: 0 24px 48px rgba(0,0,0,.35); }
  .win::after { content: ''; position: absolute; inset: 0; border-radius: 16px; box-shadow: inset 0 0 0 1px var(--line); pointer-events: none; }
  /* Article: the cover in a plain frame, 72px from the right edge. */
  .win.plain { left: 520px; top: 125px; width: 608px; height: 380px; box-shadow: none; background: var(--page); }
  /* A cover composited on the same graphite runs out to the edge, no frame. */
  .win.bare { left: 300px; top: 68px; width: 900px; height: 562px; border-radius: 0; box-shadow: none; background: var(--page); }
  .win.bare::after { display: none; }
  .bar { height: 36px; display: flex; align-items: center; gap: 8px; padding-left: 16px; background: var(--card); border-bottom: 1px solid var(--line); box-sizing: border-box; }
  .bar i { width: 10px; height: 10px; border-radius: 50%; background: rgba(239,233,222,.28); }
  .win img { display: block; width: 100%; height: 470px; object-fit: cover; object-position: center top; }
  .win.plain img, .win.bare img { height: 100%; object-position: center; }
</style></head><body>
  <div class="text">
    <div class="meta mono"><span>${esc(kind)}</span><span>${esc(date)}</span></div>
    <h1>${esc(title)}</h1>
    <div class="foot mono">
      <div class="tile"><svg viewBox="0 0 64 64" fill="none">${markPaths}</svg></div>
      <span>mitchellanderson.com.au</span>
    </div>
  </div>
  ${screen}
</body></html>`
}

function findSource(publicPath) {
  const rel = publicPath.replace(/^\/images\//, '').replace(/\.(png|jpe?g|webp)$/i, '')
  for (const ext of ['.png', '.jpg', '.jpeg', '.webp']) {
    const p = join(SRC, rel + ext)
    if (existsSync(p)) return p
  }
  return null
}

const only = process.argv.slice(2).filter(a => !a.startsWith('-'))
const wanted = slug => only.length === 0 || only.includes(slug)

await mkdir(CARD_DIR, { recursive: true })
const work = mkdtempSync(join(tmpdir(), 'og-pages-'))

try {
  if (wanted('default')) {
    render(pathToFileURL(join(OG_DIR, 'default.html')).href, join(OG_DIR, 'default.png'))
    console.log('  og/default.png')
  }

  const kinds = [
    { dir: join(ROOT, 'src', 'content', 'projects'), kind: 'Case study', frame: 'window' },
    { dir: join(ROOT, 'src', 'content', 'articles'), kind: 'Article', frame: 'plain' },
  ]
  for (const { dir, kind, frame } of kinds) {
    if (!existsSync(dir)) continue
    for (const f of (await readdir(dir)).filter(f => f.endsWith('.md'))) {
      const slug = basename(f, '.md')
      if (!wanted(slug)) continue
      const { data } = matter(await readFile(join(dir, f), 'utf8'))
      const hero = data.ogImage || data.heroImage || data.coverImage
      const source = hero && findSource(hero)
      if (!source) { console.warn(`  ! ${f}: no original found for ${hero}`); continue }
      // An article cover composited on the graphite ground has no visible edge.
      let cardFrame = frame
      if (frame === 'plain') {
        const { data: px } = await sharp(source).extract({ left: 0, top: 0, width: 1, height: 1 }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
        if (Math.abs(px[0] - 0x16) < 6 && Math.abs(px[1] - 0x15) < 6 && Math.abs(px[2] - 0x13) < 6) cardFrame = 'bare'
      }
      const page = join(work, `${slug}.html`)
      await writeFile(page, cardHtml({
        title: frame === 'plain' ? data.coverText || data.title : data.title,
        kind,
        date: String(data.date),
        image: pathToFileURL(source).href,
        frame: cardFrame,
      }))
      render(pathToFileURL(page).href, join(CARD_DIR, `${slug}.png`))
      console.log(`  og/cards/${slug}.png`)
    }
  }
} finally {
  rmSync(work, { recursive: true, force: true })
}
console.log('\nNow run `npm run images` to make the share JPGs.\n')
