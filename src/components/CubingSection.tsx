'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import YouTubeLite from '@/components/YouTubeLite'
import SectionHeading from '@/components/SectionHeading'
import { btnSecondary, btnArrow } from '@/components/ui/button'
import { WCA_BASE, WCA_ID, WCA_PROFILE, toStats, type CubingStats, type Competition } from '@/lib/wca'

const CompetitionMap = dynamic(() => import('./CompetitionMap'), { ssr: false })

/** centiseconds. The video only shows while the PR still matches. */
const PR_VIDEO_CS = 887
const PR_VIDEO_ID = 'dkkchjre3A8'
const BATCH = 8

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(cs: number): string {
  if (cs <= 0) return '–'
  const total = cs / 100
  const mins  = Math.floor(total / 60)
  const secs  = total % 60
  if (mins > 0) return `${mins}:${secs.toFixed(2).padStart(5, '0')}`
  return secs.toFixed(2)
}

const fmt = (n: number) => new Intl.NumberFormat('en-AU').format(n)

// ── Sub-components ─────────────────────────────────────────────────────────────

const CARD = 'rounded-xl border border-line bg-card p-6 shadow-soft'

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className={CARD}>
      <p className="eyebrow mb-3">{label}</p>
      <p className="display text-3xl text-fg tabular-nums">{value}</p>
      {sub && <p className="mt-2 font-sans text-sm text-fg-2">{sub}</p>}
    </div>
  )
}

function MedalRow({ gold, silver, bronze }: { gold: number; silver: number; bronze: number }) {
  return (
    <div className={CARD}>
      <p className="eyebrow mb-4">Medals</p>
      <ul className="flex flex-wrap gap-x-8 gap-y-3">
        {([
          { label: 'Gold',   count: gold,   color: 'var(--medal-gold)' },
          { label: 'Silver', count: silver, color: 'var(--medal-silver)' },
          { label: 'Bronze', count: bronze, color: 'var(--medal-bronze)' },
        ] as const).map(m => (
          <li key={m.label} className="flex items-center gap-2">
            <span aria-hidden className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: m.color }} />
            <span className="font-mono text-2xl text-fg tabular-nums">{m.count}</span>
            <span className="font-sans text-sm text-fg-2">{m.label}</span>
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
      <SectionHeading
        index="04"
        eyebrow="Off the clock"
        title="Speedcubing"
        className="mb-10 md:mb-12"
        action={
          <a href={WCA_PROFILE} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
            <WCALogo className="h-4 w-4 text-fg-2" />
            WCA profile
            <span aria-hidden className={`text-fg-3 ${btnArrow}`}>↗</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
        }
      />

      {!stats ? (
        <p className="font-sans text-base text-fg-2">
          Results are on my <a href={WCA_PROFILE} className="font-medium text-fg underline underline-offset-4 decoration-fg-3 hover:decoration-accent">WCA profile</a>.
        </p>
      ) : (
        <div className="space-y-4">

          {/* The signature moment: the personal best as a split-time readout. */}
          {single && (
            <div className="on-dark overflow-hidden rounded-2xl border border-d-line-strong bg-d-page">
              <div className={`grid grid-cols-1 ${showVideo ? 'md:grid-cols-5' : ''}`}>

                {/* Stat side */}
                <div className="flex flex-col justify-center p-6 md:col-span-2 md:p-10">
                  <p className="eyebrow">3×3 single, personal record</p>
                  <p className="mt-4 font-mono text-7xl font-medium leading-none tracking-tighter text-accent-on-dark tabular-nums md:text-8xl">
                    {formatTime(single.best)}
                  </p>
                  <dl className="mt-8 grid grid-cols-3 gap-x-4 border-t border-d-line pt-6">
                    <div>
                      <dt className="eyebrow">Australia</dt>
                      <dd className="mt-1 font-mono text-xl text-d-fg tabular-nums">#{fmt(single.rank.country)}</dd>
                    </div>
                    <div>
                      <dt className="eyebrow">World</dt>
                      <dd className="mt-1 font-mono text-xl text-d-fg tabular-nums">#{fmt(single.rank.world)}</dd>
                    </div>
                    {average && (
                      <div>
                        <dt className="eyebrow">Average</dt>
                        <dd className="mt-1 font-mono text-xl text-d-fg tabular-nums">{formatTime(average.best)}</dd>
                        <dd className="split mt-1">#{fmt(average.rank.country)} AU</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {/* Video side, only while the PR still matches */}
                {showVideo && (
                  <div className="aspect-video bg-d-deep md:col-span-3 md:aspect-auto md:min-h-80">
                    <YouTubeLite id={PR_VIDEO_ID} title="8.87 official solve, Mitchell Anderson" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Stats grid ──────────────────────────────────────── */}
          <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3">
            <StatBox
              label="Competitions"
              value={String(stats.numberOfCompetitions)}
              sub="attended"
            />
            <StatBox
              label="World Championships"
              value="2"
              sub="Representative in 2023 and 2025"
            />
            <StatBox
              label="Best result"
              value="Silver"
              sub="QLD State Champs, FMC"
            />
          </div>

          {/* ── Medals ──────────────────────────────────────────── */}
          <MedalRow {...stats.medals} />

          {/* ── Competition map ──────────────────────────────────── */}
          {competitions.length > 0 && (
            <div>
              <p className="eyebrow mb-4 mt-10">Competition locations</p>
              <WhenNear
                placeholder={
                  <div className="flex h-96 items-center justify-center rounded-2xl border border-line bg-raised">
                    <p className="font-sans text-sm text-fg-3">Loading map…</p>
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
