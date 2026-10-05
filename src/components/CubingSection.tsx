'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import YouTubeLite from '@/components/YouTubeLite'
import { WCA_BASE, WCA_ID, WCA_PROFILE, toStats, type CubingStats, type Competition } from '@/lib/wca'

const CompetitionMap = dynamic(() => import('./CompetitionMap'), { ssr: false })

/** centiseconds — only show video if PR still matches */
const PR_VIDEO_CS = 887
const PR_VIDEO_ID = 'dkkchjre3A8'
const BATCH = 8

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(cs: number): string {
  if (cs <= 0) return '—'
  const total = cs / 100
  const mins  = Math.floor(total / 60)
  const secs  = total % 60
  if (mins > 0) return `${mins}:${secs.toFixed(2).padStart(5, '0')}`
  return secs.toFixed(2)
}

const fmt = (n: number) => new Intl.NumberFormat('en-AU').format(n)

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-maroon-50 ring-1 ring-maroon-100 rounded-xl p-5">
      <p className="font-sans text-xs font-semibold text-primary uppercase tracking-widest mb-2">{label}</p>
      <p className="font-heading font-bold text-2xl text-foreground tabular-nums">{value}</p>
      {sub && <p className="font-sans text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

function MedalRow({ gold, silver, bronze }: { gold: number; silver: number; bronze: number }) {
  return (
    <div className="bg-maroon-50 ring-1 ring-maroon-100 rounded-xl p-5">
      <p className="font-sans text-xs font-semibold text-primary uppercase tracking-widest mb-3">Medals</p>
      <ul className="flex flex-wrap gap-5">
        {([
          { label: 'Gold',   count: gold,   color: '#B8860B' },
          { label: 'Silver', count: silver, color: '#71717A' },
          { label: 'Bronze', count: bronze, color: '#92400E' },
        ] as const).map(m => (
          <li key={m.label} className="flex items-center gap-2">
            <span aria-hidden className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
            <span className="font-heading font-bold text-xl text-foreground tabular-nums">{m.count}</span>
            <span className="font-sans text-xs text-muted-foreground">{m.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function WCALogo({ className }: { className?: string }) {
  return (
    <svg aria-hidden className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {[2, 15, 27].flatMap(y => [2, 15, 27].map(x => (
        <rect key={`${x}-${y}`} x={x} y={y} width="11" height="11" rx="2" fill="currentColor" />
      )))}
    </svg>
  )
}

/** Mounts children once the placeholder is within a screen of the viewport. */
function WhenNear({ children, placeholder }: { children: React.ReactNode; placeholder: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || near) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect() } }, { rootMargin: '100% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [near])
  return <div ref={ref}>{near ? children : placeholder}</div>
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * Starts from the stats and competition list cached at build time
 * (scripts/update-wca-cache.mjs), so it renders complete in the HTML. In the
 * browser it re-checks the live profile and fetches only competitions that
 * aren't in the cache yet.
 */
export default function CubingSection({
  initialStats,
  initialCompetitions,
  knownIds,
}: {
  initialStats: CubingStats | null
  initialCompetitions: Competition[]
  /** Every cached competition id, including ones without a location. */
  knownIds: string[]
}) {
  const [stats, setStats]               = useState(initialStats)
  const [competitions, setCompetitions] = useState(initialCompetitions)

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function refresh() {
      try {
        const live = toStats(await fetch(`${WCA_BASE}/persons/${WCA_ID}.json`, { signal }).then(r => {
          if (!r.ok) throw new Error(r.statusText)
          return r.json()
        }))
        setStats(live)

        const known = new Set(knownIds)
        const missing = live.competitionIds.filter(id => !known.has(id))
        const added: Competition[] = []
        for (let i = 0; i < missing.length; i += BATCH) {
          const settled = await Promise.allSettled(
            missing.slice(i, i + BATCH).map(id =>
              fetch(`${WCA_BASE}/competitions/${id}.json`, { signal })
                .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json() })
                .then(d => ({
                  id:          d.id   ?? id,
                  name:        d.name ?? id,
                  city:        d.city ?? '',
                  country:     d.country ?? '',
                  coordinates: d.venue?.coordinates?.latitude ? d.venue.coordinates : null,
                } as Competition)),
            ),
          )
          settled.forEach(r => { if (r.status === 'fulfilled' && r.value.coordinates) added.push(r.value) })
        }
        if (added.length) setCompetitions(prev => [...prev, ...added])
      } catch {
        // Offline or rate-limited: the cached numbers stay on screen.
      }
    }

    refresh()
    return () => controller.abort()
  }, [knownIds])

  const single  = stats?.single333
  const average = stats?.average333
  const showVideo = single?.best === PR_VIDEO_CS

  return (
    <div>

      {/* ── Section header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-bold text-2xl text-foreground">Speedcubing</h2>
        <a
          href={WCA_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 py-2 text-muted-foreground hover:text-primary transition-colors duration-200 group"
        >
          <WCALogo className="w-5 h-5" />
          <span className="font-sans text-xs font-medium tracking-wide">WCA Profile</span>
          <span aria-hidden className="font-sans text-xs opacity-70 group-hover:opacity-100 transition-opacity duration-200">↗</span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>

      {!stats ? (
        <p className="font-sans text-sm text-muted-foreground">
          Results are on my <a href={WCA_PROFILE} className="text-primary underline underline-offset-2">WCA profile</a>.
        </p>
      ) : (
        <div className="space-y-4">

          {/* ── PR Hero ─────────────────────────────────────────── */}
          {single && (
            <div className="bg-maroon-50 ring-1 ring-maroon-100 rounded-2xl overflow-hidden">
              <div className={`grid grid-cols-1 ${showVideo ? 'sm:grid-cols-[1fr_1.6fr]' : ''}`}>

                {/* Stat side */}
                <div className="p-6 flex flex-col justify-center">
                  <p className="font-sans text-xs font-semibold text-primary uppercase tracking-widest mb-3">
                    3×3 Personal Record — Single
                  </p>
                  <p className="font-heading font-bold text-[5rem] leading-none text-foreground mb-2 tabular-nums">
                    {formatTime(single.best)}
                  </p>
                  <p className="font-sans text-sm text-muted-foreground">
                    #{fmt(single.rank.country)} in Australia &nbsp;·&nbsp; #{fmt(single.rank.world)} World
                  </p>
                  {average && (
                    <p className="font-sans text-xs text-muted-foreground mt-1">
                      Average: {formatTime(average.best)} &nbsp;(#{fmt(average.rank.country)} AU)
                    </p>
                  )}
                </div>

                {/* Video side — only if PR still matches */}
                {showVideo && (
                  <div className="bg-black aspect-video">
                    <YouTubeLite id={PR_VIDEO_ID} title="8.87 official solve — Mitchell Anderson" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Stats grid ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatBox
              label="Competitions"
              value={String(stats.numberOfCompetitions)}
              sub="attended"
            />
            <StatBox
              label="World Champs"
              value="2× Rep."
              sub="WCA Worlds 2023 & 2025"
            />
            <StatBox
              label="Best Achievement"
              value="Silver 🥈"
              sub="QLD State Champs — FMC"
            />
          </div>

          {/* ── Medals ──────────────────────────────────────────── */}
          <MedalRow {...stats.medals} />

          {/* ── Competition map ──────────────────────────────────── */}
          {competitions.length > 0 && (
            <div>
              <p className="font-sans text-xs font-semibold text-primary uppercase tracking-widest mb-3">
                Competition Locations
              </p>
              <WhenNear
                placeholder={
                  <div className="h-[380px] bg-maroon-50 ring-1 ring-maroon-100 rounded-xl flex items-center justify-center">
                    <p className="font-sans text-xs text-muted-foreground">Loading map…</p>
                  </div>
                }
              >
                <CompetitionMap competitions={competitions} />
              </WhenNear>
            </div>
          )}

        </div>
      )}

    </div>
  )
}
