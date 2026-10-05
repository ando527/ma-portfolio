// Serves the static export in out/ the way a static host would, so a build
// can be checked locally before it's pushed. Applies the rules in
// out/_headers and out/_redirects (Cloudflare Pages / Netlify syntax), and
// serves out/404.html with a 404 status for unknown paths.
//
//   npm run build && npm run serve        → http://localhost:4173

import { createServer } from 'http'
import { readFile, stat } from 'fs/promises'
import { existsSync, readFileSync } from 'fs'
import { join, extname, normalize } from 'path'
import { gzipSync } from 'zlib'
import { fileURLToPath } from 'url'

const ROOT = fileURLToPath(new URL('../out/', import.meta.url))
const PORT = Number(process.env.PORT) || 4173

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
}

// ── _headers: blocks of "path pattern" followed by indented "Name: value" ──
function parseHeaders(text) {
  const rules = []
  let current = null
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue
    if (!/^\s/.test(raw)) {
      current = { pattern: raw.trim(), headers: [] }
      rules.push(current)
    } else if (current) {
      const i = raw.indexOf(':')
      if (i > 0) current.headers.push([raw.slice(0, i).trim(), raw.slice(i + 1).trim()])
    }
  }
  return rules
}

// ── _redirects: "from to [status]" per line ──
function parseRedirects(text) {
  return text.split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(l => {
      const [from, to, status = '301'] = l.split(/\s+/)
      return { from, to, status: Number(status.replace('!', '')) }
    })
}

function toRegex(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
  return new RegExp(`^${escaped}$`)
}

const headerRules = existsSync(join(ROOT, '_headers'))
  ? parseHeaders(readFileSync(join(ROOT, '_headers'), 'utf8'))
  : []
const redirectRules = existsSync(join(ROOT, '_redirects'))
  ? parseRedirects(readFileSync(join(ROOT, '_redirects'), 'utf8'))
  : []

function headersFor(pathname) {
  const out = {}
  for (const rule of headerRules) {
    if (toRegex(rule.pattern).test(pathname)) {
      for (const [k, v] of rule.headers) out[k] = v
    }
  }
  return out
}

// Next's client asks for segment prefetch files as one dotted name
// (/work/__next.work.__PAGE__.txt) but the export writes them as folders
// (/work/__next.work/__PAGE__.txt). DigitalOcean resolves this; mirror it.
function segmentPath(pathname) {
  const m = pathname.match(/^(.*\/)(__next\.[^/]+)\.txt$/)
  if (!m) return null
  const [first, ...rest] = m[2].split('.').slice(1)
  if (!rest.length) return null
  return `${m[1]}__next.${first}/${rest.join('/')}.txt`
}

async function resolveFile(pathname) {
  const safe = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '')
  const seg = segmentPath(decodeURIComponent(pathname))
  const candidates = pathname.endsWith('/')
    ? [join(ROOT, safe, 'index.html')]
    : [join(ROOT, safe), join(ROOT, safe + '.html'), join(ROOT, safe, 'index.html'), ...(seg ? [join(ROOT, normalize(seg))] : [])]
  for (const file of candidates) {
    try {
      if ((await stat(file)).isFile()) return file
    } catch {}
  }
  return null
}

createServer((req, res) => {
  handle(req, res).catch(err => {
    console.error(`${req.url}: ${err.message}`)
    if (!res.headersSent) res.writeHead(500)
    res.end()
  })
}).listen(PORT, () => {
  console.log(`Serving out/ at http://localhost:${PORT}`)
  console.log(`${headerRules.length} header rules, ${redirectRules.length} redirects loaded`)
})

async function handle(req, res) {
  // Collapse leading slashes so "//path" isn't read as a protocol-relative URL.
  const url = new URL(req.url.replace(/^\/{2,}/, '/'), `http://localhost:${PORT}`)
  const { pathname } = url

  for (const r of redirectRules) {
    if (r.from === pathname) {
      res.writeHead(r.status, { Location: r.to })
      return res.end()
    }
  }

  // Trailing-slash URLs are canonical (next.config.js trailingSlash: true).
  if (!pathname.endsWith('/') && !extname(pathname) && existsSync(join(ROOT, pathname, 'index.html'))) {
    res.writeHead(308, { Location: pathname + '/' + url.search })
    return res.end()
  }

  const file = await resolveFile(pathname)
  const status = file ? 200 : 404
  const served = file ?? join(ROOT, '404.html')
  let body = await readFile(served)
  const type = TYPES[extname(served)] ?? 'application/octet-stream'
  // Compress text like a real host does, so local timings are realistic.
  const compress = /text|javascript|json|xml|svg|manifest/.test(type) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '')
  if (compress) body = gzipSync(body)
  res.writeHead(status, {
    'Content-Type': type,
    ...(compress && { 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' }),
    ...headersFor(pathname),
  })
  res.end(body)
}
