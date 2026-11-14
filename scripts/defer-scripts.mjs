// Runs after `next build` (package.json "postbuild"). Rewrites the exported HTML
// in out/ so the app's JavaScript starts downloading once the page has painted
// (its largest element is on screen and the load event has fired) instead of in
// parallel with the first paint.
//
// Why: every page is fully rendered HTML, and the scripts are only needed to
// hydrate it (menus, tabs, filters, reveal-on-scroll). Loaded in parallel they
// share the connection with the hero image and fonts, which pushes Largest
// Contentful Paint back on slow mobile networks. The visible result is the same
// page, painted sooner; hydration starts about 100ms after the last paint
// candidate instead of during it.
//
// Safety:
//  - Scripts are injected in their original order with their original
//    attributes (async scripts, so ordering never mattered).
//  - Any user input (touch, key, wheel, scroll, pointer) loads them at once.
//  - A 3s timer loads them anyway (hidden tabs, browsers without the observer).
//  - Taps and typing that land before React is listening are not lost: the
//    loader records them and replays them once hydration has committed (see
//    `early` below). Links, <details> and everything else the browser handles
//    itself are left to the browser.
//  - Idempotent, and a page with nothing to rewrite is left untouched.
//  - `noModule` fallback scripts are left alone (modern browsers skip them).
//
//   node scripts/defer-scripts.mjs [outDir]

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT = process.argv[2] || fileURLToPath(new URL('../out/', import.meta.url))
const MARK = 'data-deferred-bootstrap'

// Input that arrives after first paint but before React has hydrated has no
// handler to run: React cannot replay an event it never saw, and hydrating
// controlled inputs resets what was typed or ticked. This records those
// events (capture phase, trusted only) and replays them once the app marks
// hydration committed (<html data-hydrated>, set by AnalyticsWrapper in an
// insertion effect, i.e. inside the commit):
//   - click on a non-native target: re-dispatched on the same element if it,
//     or an ancestor, now has a React onClick;
//   - typed text / chosen radio or option: written back and announced to React
//     with an input/click/change event;
//   - submit: cancelled (it would reload the page with a POST), then replayed
//     with requestSubmit().
// Anchors, <summary>, <label> and form controls keep their native behaviour.
// Gives up after 60s. The source is minified by dropping comment lines and indentation.
function early() {
  var H = document.documentElement, Q = [], C = [], X = [], P = 0, end = Date.now() + 60000
  var NATIVE = 'a[href],summary,label,input,select,textarea,option,video,audio,iframe'
  function live() { return H.hasAttribute('data-hydrated') }
  function props(n) {
    var a = Object.keys(n)
    for (var i = 0; i < a.length; i++) if (a[i].indexOf('__reactProps$') === 0) return n[a[i]]
  }
  function poll() {
    if (P) return
    P = 1
    ;(function t() {
      if (live()) return run()
      if (Date.now() < end) setTimeout(t, 40)
    })()
  }
  // React compares the DOM against the value it last saw and fires onChange
  // only on a difference; after hydration that memory can equal what was typed
  // while its state is still empty. Resetting through the element's own setter
  // (which updates that memory) and then writing/clicking again makes the
  // change visible, so state catches up and later re-renders keep the input.
  function restore(c) {
    var t = c.t
    if (!t.isConnected) return
    if (t.type === 'radio') {
      if (c.c) {
        t.checked = false
        t.click()
      }
    } else if (t.type === 'checkbox') {
      if (t.checked === c.c) t.checked = !c.c
      t.click()
    } else if (c.v !== '') {
      if (t.tagName !== 'SELECT') t.value = ''
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(t), 'value').set.call(t, c.v)
      t.dispatchEvent(new Event(t.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }))
    }
  }
  function replay(q) {
    var t = q.t
    if (!t.isConnected) return
    for (var n = t; n && n !== document.body; n = n.parentElement) {
      var p = props(n)
      if (p && typeof p.onClick === 'function') {
        t.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, composed: true, view: window, clientX: q.x, clientY: q.y }))
        return
      }
    }
  }
  function run() {
    C.forEach(restore)
    setTimeout(function () {
      Q.forEach(replay)
      X.forEach(function (f) { if (f.isConnected) f.requestSubmit() })
    }, 30)
  }
  addEventListener('click', function (e) {
    var t = e.target
    if (!e.isTrusted || live() || !t || !t.closest || t.closest(NATIVE)) return
    var b = t.closest('button')
    if (b && b.type === 'submit' && b.form) return
    Q = Q.filter(function (q) { return q.t !== t })
    if (Q.length < 5) Q.push({ t: t, x: e.clientX, y: e.clientY })
    poll()
  }, true)
  function control(e) {
    var t = e.target
    if (!e.isTrusted || live() || !t || !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
    C = C.filter(function (c) { return c.t !== t })
    C.push({ t: t, v: t.value, c: t.checked })
    poll()
  }
  addEventListener('input', control, true)
  addEventListener('change', control, true)
  addEventListener('submit', function (e) {
    var f = e.target
    if (!e.isTrusted || live() || !f.requestSubmit) return
    e.preventDefault()
    if (X.indexOf(f) < 0) X.push(f)
    poll()
  }, true)
}
const EARLY = `(${early})()`
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('//'))
  .join('\n')

// The loader that replaces the script tags. One line, no dependencies.
// `L` is [[attrs...]] per script: [src, id|null, attrsObject].
const loader = (list) =>
  `<script ${MARK}>(function(){var L=${JSON.stringify(list)},d=0,t,l=document.readyState==='complete',s=!window.PerformanceObserver;` +
  `function go(){if(d)return;d=1;clearTimeout(t);L.forEach(function(a){var e=document.createElement('script');` +
  `for(var k in a)e.setAttribute(k,a[k]);e.async=true;document.body.appendChild(e)})}` +
  `function bump(){clearTimeout(t);if(l&&s)t=setTimeout(go,100)}` +
  `if(!l)addEventListener('load',function(){l=true;bump()},{once:true});` +
  `try{new PerformanceObserver(function(){s=true;bump()}).observe({type:'largest-contentful-paint',buffered:true})}catch(e){s=true}` +
  `['pointerdown','keydown','touchstart','wheel','scroll'].forEach(function(n){addEventListener(n,go,{once:true,passive:true})});` +
  `setTimeout(go,3000);bump()})();${EARLY}</script>`

const SCRIPT_RE = /<script\b([^>]*)><\/script>/g
const ATTR_RE = /([^\s=/>]+)(?:="([^"]*)")?/g

function parseAttrs(raw) {
  const attrs = {}
  for (const m of raw.matchAll(ATTR_RE)) attrs[m[1]] = m[2] ?? ''
  return attrs
}

function rewrite(html) {
  if (html.includes(MARK)) return null
  const list = []
  let out = html.replace(SCRIPT_RE, (whole, raw) => {
    const a = parseAttrs(raw)
    if (!a.src || !('async' in a)) return whole
    if ('noModule' in a || 'nomodule' in a || a.type === 'module') return whole
    const keep = {}
    for (const [k, v] of Object.entries(a)) if (k !== 'async') keep[k] = v
    list.push(keep)
    return ''
  })
  if (list.length === 0) return null
  // The browser would otherwise fetch these early, defeating the point.
  out = out.replace(/<link rel="preload" as="script"[^>]*\/>/g, '')
  const at = out.lastIndexOf('</body>')
  if (at === -1) return null
  return out.slice(0, at) + loader(list) + out.slice(at)
}

let changed = 0
let total = 0
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) {
      if (name === '_next') continue
      walk(p)
    } else if (name.endsWith('.html')) {
      total++
      const html = readFileSync(p, 'utf8')
      const next = rewrite(html)
      if (next) {
        writeFileSync(p, next)
        changed++
      }
    }
  }
}

walk(OUT)
console.log(`[defer-scripts] ${changed}/${total} pages rewritten`)
