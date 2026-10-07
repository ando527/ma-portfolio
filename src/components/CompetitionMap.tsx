'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Competition } from '@/lib/wca'
import type { Map as LeafletMap, LayerGroup, LatLngExpression } from 'leaflet'

type Leaflet = typeof import('leaflet')

const COLOURS = {
  competition: '#7C1D2E',
  worlds: '#D99A00',
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
  const frameRef     = useRef(0)
  const compsRef     = useRef(competitions)
  const [indicators, setIndicators] = useState<Indicator[]>([])

  compsRef.current = competitions

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

    // Draw World Championships last so they sit on top.
    const ordered = [...compsRef.current].sort((a, b) => Number(isWorlds(a)) - Number(isWorlds(b)))
    for (const comp of ordered) {
      if (!comp.coordinates) continue
      const worlds = isWorlds(comp)
      const colour = worlds ? COLOURS.worlds : COLOURS.competition
      const m = L.circleMarker([comp.coordinates.latitude, comp.coordinates.longitude], {
        color:       worlds ? '#5c3b00' : colour,
        fillColor:   colour,
        fillOpacity: worlds ? 0.95 : 0.75,
        weight:      worlds ? 2 : 1.5,
        radius:      worlds ? 8 : 6,
      }).bindPopup(
        (worlds ? `<span style="display:block;font-size:0.7rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:#8a5a00">World Championship</span>` : '') +
        `<strong style="display:block;font-size:0.8rem">${escapeHtml(comp.name)}</strong>` +
        `<span style="font-size:0.75rem;color:#555">${escapeHtml(comp.city)}</span>`,
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
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)
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
      layerRef.current = null
      fittedRef.current = false
    }
  }, [drawMarkers, refreshIndicators])

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
      <div className="relative rounded-[1.25rem] ring-1 ring-maroon-100">
        <div
          ref={containerRef}
          role="region"
          aria-label={`Map of ${located.length} competitions attended`}
          style={{ height: '380px', width: '100%', borderRadius: '1.25rem' }}
        />
        {/* Arrows to competitions off the edge of the map */}
        <div className="pointer-events-none absolute inset-0 z-[450] overflow-hidden rounded-[1.25rem]">
          {indicators.map(ind => {
            const label = `${ind.count} ${ind.count === 1 ? 'competition' : 'competitions'} to the ${compassName(ind.angle)}${ind.worlds ? ', including a World Championship' : ''}. Show on map`
            return (
              <button
                key={ind.key}
                type="button"
                onClick={() => goTo(ind)}
                aria-label={label}
                title={label.replace('. Show on map', '')}
                className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-md ring-1 ring-black/10 flex items-center justify-center hover:scale-110 motion-reduce:hover:scale-100 transition-transform duration-150"
                style={{ left: ind.x, top: ind.y }}
              >
                <svg
                  aria-hidden
                  viewBox="0 0 24 24"
                  className="w-5 h-5"
                  style={{ transform: `rotate(${ind.angle}rad)`, color: ind.worlds ? COLOURS.worlds : COLOURS.competition }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
                <span
                  aria-hidden
                  className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 px-1 rounded-full text-xs leading-5 font-sans font-bold text-white text-center tabular-nums"
                  style={{ background: ind.worlds ? '#8a5a00' : COLOURS.competition }}
                >
                  {ind.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <span aria-hidden className="w-3 h-3 rounded-full" style={{ background: COLOURS.competition }} />
          Competition ({located.length - worldsCount})
        </li>
        {worldsCount > 0 && (
          <li className="flex items-center gap-2">
            <span aria-hidden className="w-3.5 h-3.5 rounded-full ring-2 ring-[#5c3b00]/60" style={{ background: COLOURS.worlds }} />
            World Championships ({worldsCount})
          </li>
        )}
        <li className="flex items-center gap-2">
          <span aria-hidden className="inline-flex w-5 h-5 rounded-full bg-white ring-1 ring-black/10 items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke={COLOURS.competition} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </span>
          Off the map: click to go there
        </li>
      </ul>
    </div>
  )
}
