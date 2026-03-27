'use client'

import { useRef, useEffect } from 'react'
import 'leaflet/dist/leaflet.css'

export interface Competition {
  id: string
  name: string
  city: string
  country: string
  coordinates: { latitude: number; longitude: number }
}

export default function CompetitionMap({ competitions }: { competitions: Competition[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<ReturnType<typeof import('leaflet')['map']> | null>(null)

  useEffect(() => {
    if (mapRef.current || !containerRef.current || competitions.length === 0) return

    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return

      const map = L.map(containerRef.current, { zoomControl: true })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map)

      // True on touch-only devices (phones/tablets) — no fine pointer
      const isTouch = () => window.matchMedia('(hover: none)').matches

      const markers: ReturnType<typeof L.circleMarker>[] = []

      competitions.forEach(comp => {
        const { latitude, longitude } = comp.coordinates
        const m = L.circleMarker([latitude, longitude], {
          color:       '#7C1D2E',
          fillColor:   '#7C1D2E',
          fillOpacity: 0.75,
          weight:      1.5,
          radius:      6,
        }).bindPopup(
          `<strong style="display:block;font-size:0.8rem">${comp.name}</strong>` +
          `<span style="font-size:0.7rem;color:#666">${comp.city}</span>`
        )

        // Desktop hover — open on enter, close on leave (unless cursor moves into popup)
        m.on('mouseover', () => {
          if (!isTouch()) m.openPopup()
        })
        m.on('mouseout', (e: L.LeafletMouseEvent) => {
          if (!isTouch()) {
            const related = (e.originalEvent as MouseEvent).relatedTarget as HTMLElement | null
            if (!related?.closest?.('.leaflet-popup')) {
              m.closePopup()
            }
          }
        })

        m.addTo(map)
        markers.push(m)
      })

      // Fit competitions; if they span the globe (zoom < 3), re-centre on
      // Australia where the bulk of dots live, at a more legible zoom level.
      if (markers.length > 0) {
        const group = L.featureGroup(markers)
        map.fitBounds(group.getBounds().pad(0.05), { animate: false })
        const z = map.getZoom()
        if (z < 3) {
          map.setView([-27, 133], 3, { animate: false })
        } else if (z > 12) {
          map.setZoom(12, { animate: false })
        }
      }

      mapRef.current = map
    })

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div
      ref={containerRef}
      style={{ height: '380px', width: '100%', borderRadius: '0.75rem' }}
    />
  )
}
