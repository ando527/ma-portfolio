// Takes a 1440×900 screenshot of this site's homepage for the platform
// article's cover (see make-article-covers.mjs), using headless Chrome or
// Edge. Serve a fresh build first, then run it and rebuild the covers:
//
//   npm run build && npm run serve        (in another terminal)
//   npm run screenshot:home && npm run covers && npm run images
//
// Writes assets/covers/home.png. Set CHROME_PATH if Chrome isn't found, or
// SITE_URL to screenshot somewhere other than http://localhost:4173.
//
// The cookie banner is skipped by declining it first: a throwaway page in
// out/ sets the stored choice in a temporary browser profile, and both are
// removed afterwards.

import { execFileSync } from 'child_process'
import { existsSync } from 'fs'
import { mkdtemp, rm, writeFile, mkdir } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { fileURLToPath } from 'url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SITE = (process.env.SITE_URL || 'http://localhost:4173').replace(/\/$/, '')
const OUT_FILE = join(ROOT, 'assets', 'covers', 'home.png')
const HELPER = '__cover-consent.html'

const candidates = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean)
const chrome = candidates.find(p => existsSync(p))
if (!chrome) {
  console.error('Chrome or Edge not found. Set CHROME_PATH to its executable.')
  process.exit(1)
}

try {
  await fetch(SITE)
} catch {
  console.error(`Nothing is serving ${SITE}. Run \`npm run build && npm run serve\` first.`)
  process.exit(1)
}

const profile = await mkdtemp(join(tmpdir(), 'cover-shot-'))
const helper = join(ROOT, 'out', HELPER)
const run = args => execFileSync(chrome, ['--headless=new', '--disable-gpu', `--user-data-dir=${profile}`, ...args], { stdio: 'ignore' })

try {
  await writeFile(helper, "<script>localStorage.setItem('cookie_consent', 'false')</script>")
  run(['--virtual-time-budget=2000', '--dump-dom', `${SITE}/${HELPER}`])

  await mkdir(join(ROOT, 'assets', 'covers'), { recursive: true })
  run([
    '--hide-scrollbars',
    '--window-size=1440,900',
    '--force-device-scale-factor=1',
    '--virtual-time-budget=6000',
    `--screenshot=${OUT_FILE}`,
    `${SITE}/`,
  ])
  console.log(`  assets/covers/home.png`)
} finally {
  await rm(helper, { force: true })
  await rm(profile, { recursive: true, force: true })
}
