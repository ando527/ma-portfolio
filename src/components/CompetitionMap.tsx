'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Competition } from '@/lib/wca'
import type { Map as LeafletMap, LayerGroup, LatLngExpression, TileLayer } from 'leaflet'

type Leaflet = typeof import('leaflet')

// One accent: the World Championships, in gold. Every other competition is
// neutral graphite, on a grey map, so the gold dots are the ones that matter.
// Gold comes from the `--gold-*` CSS variables (globals.css), so the theme can
// swap it; the values below are only the fallback if a variable is missing.
// Everything on the map is a function of the current theme.
type Theme = 'light' | 'dark'

const getTheme = (): Theme =>
  document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'

// Esri Canvas base maps: the same neutral grey cartography the Webflow site
// uses. Light and dark variants share one URL pattern and attribution.
const TILE_ATTRIBUTION = 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
const tileSource = (theme: Theme) => ({
  url: `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${theme === 'dark' ? 'Dark' : 'Light'}_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
  attribution: TILE_ATTRIBUTION,
  maxZoom: 16, // the last level Esri's Canvas tiles exist for
})

// Markers are drawn by Leaflet (canvas/SVG), so they need real colour values,
// read from the CSS variables at draw time.
const GOLD_FALLBACK: Record<Theme, { fill: string; edge: string }> = {
  light: { fill: '#C9A227', edge: '#4A3800' },
  dark: { fill: '#E3B93C', edge: '#F6E7B0' },
}
const MARKER: Record<Theme, { fill: string; edge: string }> = {
  light: { fill: '#5E554A', edge: '#1F1B16' },
  dark: { fill: '#D8D1C4', edge: '#12110F' },
}
function palette(theme: Theme) {
  const css = getComputedStyle(document.documentElement)
  const gold = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback
  return {
    competition: MARKER[theme],
    worlds: {
      fill: gold('--gold-fill', GOLD_FALLBACK[theme].fill),
      edge: gold('--gold-edge', GOLD_FALLBACK[theme].edge),
    },
  }
}

/** WCA World Championships have ids like "WC2025". */
const isWorlds = (c: Competition) => /^WC\d{4}$/.test(c.id)

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

// ── Off-screen indicators ────────────────────────────────────────────────────
// Competitions outside the visible map are grouped by direction from the
// centre (16 compass sectors). Each group becomes one arrow pinned to the
// map's edge, pointing at them, with a count. Clicking it flies there.

const SECTORS = 16
const INSET = 26 // px from the edge to the arrow's centre

interface Indicator {
  key: number
  x: number
  y: number
  angle: number
  count: number
  worlds: boolean
  points: [number, number][]
}

const COMPASS = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east']
const compassName = (angle: number) => COMPASS[((Math.round(angle / (Math.PI / 4)) % 8) + 8) % 8]

function computeIndicators(map: LeafletMap, competitions: Competition[]): Indicator[] {
  const { x: w, y: h } = map.getSize()
  const cx = w / 2, cy = h / 2
  const groups = new Map<number, { sx: number; sy: number; count: number; worlds: boolean; points: [number, number][] }>()

  for (const c of competitions) {
    if (!c.coordinates) continue
    const { latitude, longitude } = c.coordinates
    const p = map.latLngToContainerPoint([latitude, longitude])
    if (p.x >= 0 && p.x <= w && p.y >= 0 && p.y <= h) continue
    const angle = Math.atan2(p.y - cy, p.x - cx)
    const sector = ((Math.round(angle / ((2 * Math.PI) / SECTORS)) % SECTORS) + SECTORS) % SECTORS
    const g = groups.get(sector) ?? { sx: 0, sy: 0, count: 0, worlds: false, points: [] }
    g.sx += Math.cos(angle)
    g.sy += Math.sin(angle)
    g.count++
    g.worlds ||= isWorlds(c)
    g.points.push([latitude, longitude])
    groups.set(sector, g)
  }

  return [...groups.entries()].map(([key, g]) => {
    const angle = Math.atan2(g.sy, g.sx)
    const dx = Math.cos(angle), dy = Math.sin(angle)
    // Where a ray from the centre at this angle meets the inset edge.
    const t = Math.min(
      Math.abs(dx) > 1e-6 ? (cx - INSET) / Math.abs(dx) : Infinity,
      Math.abs(dy) > 1e-6 ? (cy - INSET) / Math.abs(dy) : Infinity,
    )
    return { key, x: cx + dx * t, y: cy + dy * t, angle, count: g.count, worlds: g.worlds, points: g.points }
  })
}

export default function CompetitionMap({ competitions }: { competitions: Competition[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<LeafletMap | null>(null)
  const layerRef     = useRef<LayerGroup | null>(null)
  const leafletRef   = useRef<Leaflet | null>(null)
  const fittedRef    = useRef(false)
  const tileRef      = useRef<TileLayer | null>(null)
  const themeRef     = useRef<Theme>('light')
  const frameRef     = useRef(0)
  const compsRef     = useRef(competitions)
  const [indicators, setIndicators] = useState<Indicator[]>([])
  const [theme, setTheme] = useState<Theme>('light')

  // Keep the latest list for the map callbacks. Declared before the effects
  // that draw markers, so it's current by the time they run.
  useEffect(() => {
    compsRef.current = competitions
  }, [competitions])

  const refreshIndicators = useCallback(() => {
    if (frameRef.current) return
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = 0
      if (mapRef.current) setIndicators(computeIndicators(mapRef.current, compsRef.current))
    })
  }, [])

  const drawMarkers = useCallback(() => {
    const L = leafletRef.current
    const map = mapRef.current
    const layer = layerRef.current
    if (!L || !map || !layer) return
    layer.clearLayers()

    // True on touch-only devices (phones/tablets) — no fine pointer
    const isTouch = () => window.matchMedia('(hover: none)').matches
    const markers: ReturnType<typeof L.circleMarker>[] = []
    const pal = palette(themeRef.current)

    // Draw World Championships last so they sit on top.
    const ordered = [...compsRef.current].sort((a, b) => Number(isWorlds(a)) - Number(isWorlds(b)))
    for (const comp of ordered) {
      if (!comp.coordinates) continue
      const worlds = isWorlds(comp)
      const colour = worlds ? pal.worlds : pal.competition
      const m = L.circleMarker([comp.coordinates.latitude, comp.coordinates.longitude], {
        color:       colour.edge,
        fillColor:   colour.fill,
        fillOpacity: worlds ? 1 : 0.7,
        weight:      worlds ? 2 : 1,
        radius:      worlds ? 8 : 6,
      }).bindPopup(
        (worlds ? `<span style="display:block;font-size:0.75rem;color:var(--gold-text,#7A5B00)">World Championship</span>` : '') +
        `<strong style="display:block;font-size:0.8125rem;font-weight:500">${escapeHtml(comp.name)}</strong>` +
        `<span style="font-size:0.75rem;color:var(--fg-2)">${escapeHtml(comp.city)}</span>`,
      )

      // Desktop hover — open on enter, close on leave (unless cursor moves into popup)
      m.on('mouseover', () => { if (!isTouch()) m.openPopup() })
      m.on('mouseout', e => {
        if (isTouch()) return
        const related = (e.originalEvent as MouseEvent).relatedTarget as HTMLElement | null
        if (!related?.closest?.('.leaflet-popup')) m.closePopup()
      })

      m.addTo(layer)
      markers.push(m)
    }

    // Fit to competitions once; if they span the globe (zoom < 3), re-centre
    // on Australia where most dots are, at a more legible zoom level.
    if (markers.length > 0 && !fittedRef.current) {
      fittedRef.current = true
      map.fitBounds(L.featureGroup(markers).getBounds().pad(0.05), { animate: false })
      const z = map.getZoom()
      if (z < 3) map.setView([-27, 133], 3, { animate: false })
      else if (z > 12) map.setZoom(12, { animate: false })
    }
    refreshIndicators()
  }, [refreshIndicators])

  // Create the map once.
  useEffect(() => {
    let cancelled = false
    import('leaflet').then(L => {
      if (cancelled || !containerRef.current || mapRef.current) return
      leafletRef.current = L
      const map = L.map(containerRef.current, { zoomControl: true, scrollWheelZoom: false })
      map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>')
      themeRef.current = getTheme()
      const { url, ...tileOptions } = tileSource(themeRef.current)
      tileRef.current = L.tileLayer(url, tileOptions).addTo(map)
      layerRef.current = L.layerGroup().addTo(map)
      mapRef.current = map
      map.on('move zoom resize', refreshIndicators)
      drawMarkers()
    })
    return () => {
      cancelled = true
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
      mapRef.current?.remove()
      mapRef.current = null
      tileRef.current = null
      layerRef.current = null
      fittedRef.current = false
    }
  }, [drawMarkers, refreshIndicators])

  // Follow the site theme (`data-theme` on <html>): swap the base map and
  // repaint the markers. Listens for the `themechange` event and also watches
  // the attribute, so either way of switching theme is picked up.
  useEffect(() => {
    const sync = () => setTheme(getTheme())
    sync()
    window.addEventListener('themechange', sync)
    const observer = new MutationObserver(sync)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => {
      window.removeEventListener('themechange', sync)
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    themeRef.current = theme
    tileRef.current?.setUrl(tileSource(theme).url)
    drawMarkers()
  }, [theme, drawMarkers])

  // Redraw markers when competitions are added after a live check.
  useEffect(() => {
    drawMarkers()
  }, [competitions, drawMarkers])

  const goTo = (ind: Indicator) => {
    const L = leafletRef.current
    const map = mapRef.current
    if (!L || !map) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const bounds = L.latLngBounds(ind.points as LatLngExpression[])
    map.flyToBounds(bounds.pad(0.2), { maxZoom: 6, animate: !reduce, duration: 1.2 })
  }

  const located = competitions.filter(c => c.coordinates)
  const worldsCount = located.filter(isWorlds).length

  return (
    <div>
      {/* The Esri grey base map is neutral, so the markers are the only colour on it. */}
      <div className="relative overflow-hidden rounded-2xl border border-line [&_.leaflet-control-attribution]:!bg-card/90 [&_.leaflet-control-attribution]:text-fg-2 [&_.leaflet-control-attribution_a]:text-fg-2 [&_.leaflet-control-attribution_a]:underline">
        <div
          ref={containerRef}
          role="region"
          aria-label={`Map of ${located.length} competitions attended`}
          className="h-96 w-full"
        />
        {/* Arrows to competitions off the edge of the map */}
        <div className="pointer-events-none absolute inset-0 z-[450] overflow-hidden rounded-2xl">
          {indicators.map(ind => {
            const label = `${ind.count} ${ind.count === 1 ? 'competition' : 'competitions'} to the ${compassName(ind.angle)}${ind.worlds ? ', including a World Championship' : ''}. Show on map`
            return (
              <button
                key={ind.key}
                type="button"
                onClick={() => goTo(ind)}
                aria-label={label}
                title={label.replace('. Show on map', '')}
                className="pointer-events-auto absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-control bg-card shadow-soft transition-colors duration-150 ease-spec hover:bg-raised motion-reduce:transition-none"
                style={{ left: ind.x, top: ind.y }}
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className={`h-5 w-5 ${ind.worlds ? 'text-gold-text' : 'text-fg-2'}`}
                  style={{ transform: `rotate(${ind.angle}rad)` }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
                <span
                  aria-hidden
                  className={`absolute -right-1.5 -top-1.5 h-5 min-w-5 rounded-md px-1 text-center font-mono text-xs leading-5 tabular-nums ${ind.worlds ? 'bg-gold text-gold-on' : 'bg-fg text-card'}`}
                >
                  {ind.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm text-fg-2">
        <li className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 rounded-full" style={{ background: MARKER[theme].fill, boxShadow: `0 0 0 1px ${MARKER[theme].edge}` }} />
          Competition <span className="split">{located.length - worldsCount}</span>
        </li>
        {worldsCount > 0 && (
          <li className="flex items-center gap-2">
            <span aria-hidden className="h-3 w-3 rounded-full bg-gold ring-2 ring-gold-edge" />
            World Championships <span className="split">{worldsCount}</span>
          </li>
        )}
        <li className="flex items-center gap-2">
          <span aria-hidden className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-control bg-card">
            <svg viewBox="0 0 24 24" className="h-3 w-3 text-fg-2" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
          Off the map: click to go there
        </li>
      </ul>
    </div>
  )
}
