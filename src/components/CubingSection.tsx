'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Competition } from './CompetitionMap'

const CompetitionMap = dynamic(() => import('./CompetitionMap'), { ssr: false })

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE        = 'https://raw.githubusercontent.com/robiningelbrecht/wca-rest-api/master/api'
const WCA_ID      = '2022ANDE01'
const WCA_PROFILE = `https://www.worldcubeassociation.org/persons/${WCA_ID}`

/** centiseconds — only show video if PR still matches */
const PR_VIDEO_CS = 887
const PR_VIDEO_ID = 'dkkchjre3A8'

// ── Types ─────────────────────────────────────────────────────────────────────

interface RankEntry {
  eventId: string
  best: number
  rank: { world: number; continent: number; country: number }
}

interface WCAPerson {
  numberOfCompetitions: number
  competitionIds: string[]
  rank: { singles: RankEntry[]; averages: RankEntry[] }
  medals: { gold: number; silver: number; bronze: number }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(cs: number): string {
  if (cs <= 0) return '—'
  const total = cs / 100
  const mins  = Math.floor(total / 60)
  const secs  = total % 60
  if (mins > 0) return `${mins}:${secs.toFixed(2).padStart(5, '0')}`
  return secs.toFixed(2)
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-maroon-50 ring-1 ring-maroon-100 rounded-xl p-5">
      <p className="font-sans text-xs font-semibold text-primary uppercase tracking-widest mb-2">{label}</p>
      <p className="font-heading font-bold text-2xl text-foreground">{value}</p>
      {sub && <p className="font-sans text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}

function MedalRow({ gold, silver, bronze }: { gold: number; silver: number; bronze: number }) {
  return (
    <div className="bg-maroon-50 ring-1 ring-maroon-100 rounded-xl p-5">
      <p className="font-sans text-xs font-semibold text-primary uppercase tracking-widest mb-3">Medals</p>
      <div className="flex gap-5">
        {([
          { label: 'Gold',   count: gold,   color: '#B8860B' },
          { label: 'Silver', count: silver, color: '#71717A' },
          { label: 'Bronze', count: bronze, color: '#92400E' },
        ] as const).map(m => (
          <div key={m.label} className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: m.color }} />
            <span className="font-heading font-bold text-xl text-foreground">{m.count}</span>
            <span className="font-sans text-xs text-muted-foreground">{m.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function WCALogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2"  y="2"  width="11" height="11" rx="2" fill="currentColor" />
      <rect x="15" y="2"  width="11" height="11" rx="2" fill="currentColor" />
      <rect x="27" y="2"  width="11" height="11" rx="2" fill="currentColor" />
      <rect x="2"  y="15" width="11" height="11" rx="2" fill="currentColor" />
      <rect x="15" y="15" width="11" height="11" rx="2" fill="currentColor" />
      <rect x="27" y="15" width="11" height="11" rx="2" fill="currentColor" />
      <rect x="2"  y="27" width="11" height="11" rx="2" fill="currentColor" />
      <rect x="15" y="27" width="11" height="11" rx="2" fill="currentColor" />
      <rect x="27" y="27" width="11" height="11" rx="2" fill="currentColor" />
    </svg>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function CubingSection() {
  const [person,      setPerson]      = useState<WCAPerson | null>(null)
  const [competitions, setCompetitions] = useState<Competition[]>([])
  const [loading,     setLoading]     = useState(true)
  const [compsLoading, setCompsLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // ── Phase 1: person stats (fast) ──────────────────────────
        const personData: WCAPerson = await fetch(`${BASE}/persons/${WCA_ID}.json`).then(r => r.json())
        setPerson(personData)
        setLoading(false)

        // ── Phase 2: competition locations (batched to avoid rate-limits) ─
        const ids       = personData.competitionIds
        const BATCH     = 8
        const settled: PromiseSettledResult<Competition>[] = []
        for (let i = 0; i < ids.length; i += BATCH) {
          const chunk = await Promise.allSettled(
            ids.slice(i, i + BATCH).map(id =>
              fetch(`${BASE}/competitions/${id}.json`)
                .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json() })
                .then(d => ({
                  id:          d.id   ?? id,
                  name:        d.name ?? id,
                  city:        d.city ?? '',
                  country:     d.country ?? '',
                  coordinates: d.venue?.coordinates,
                } as Competition))
            )
          )
          settled.push(...chunk)
        }

        const comps = settled
          .filter((r): r is PromiseFulfilledResult<Competition> => r.status === 'fulfilled')
          .map(r => r.value)
          .filter(c => c.coordinates?.latitude && c.coordinates?.longitude)

        setCompetitions(comps)
      } catch {
        setLoading(false)
      } finally {
        setCompsLoading(false)
      }
    }
    load()
  }, [])

  const pr333single = person?.rank.singles.find(r => r.eventId === '333')
  const pr333avg    = person?.rank.averages.find(r => r.eventId === '333')
  const showVideo   = pr333single?.best === PR_VIDEO_CS

  return (
    <div>

      {/* ── Section header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-bold text-2xl text-foreground">Speedcubing</h2>
        <a
          href={WCA_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200 group"
          aria-label="View WCA profile"
        >
          <WCALogo className="w-5 h-5" />
          <span className="font-sans text-xs font-medium tracking-wide hidden sm:inline">WCA Profile</span>
          <span className="font-sans text-xs opacity-60 group-hover:opacity-100 transition-opacity duration-200">↗</span>
        </a>
      </div>

      {loading ? (
        /* ── Skeleton ─────────────────────────────────────────── */
        <div className="space-y-4 animate-pulse">
          <div className="h-52 bg-maroon-50 rounded-2xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-maroon-50 rounded-xl" />)}
          </div>
          <div className="h-20 bg-maroon-50 rounded-xl" />
          <div className="h-96 bg-maroon-50 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-4">

          {/* ── PR Hero ─────────────────────────────────────────── */}
          {pr333single && (
            <div className="bg-maroon-50 ring-1 ring-maroon-100 rounded-2xl overflow-hidden">
              <div className={`grid grid-cols-1 ${showVideo ? 'sm:grid-cols-[1fr_1.6fr]' : ''}`}>

                {/* Stat side */}
                <div className="p-6 flex flex-col justify-center">
                  <p className="font-sans text-xs font-semibold text-primary uppercase tracking-widest mb-3">
                    3×3 Personal Record — Single
                  </p>
                  <p className="font-heading font-bold text-[5rem] leading-none text-foreground mb-2">
                    {formatTime(pr333single.best)}
                  </p>
                  <p className="font-sans text-sm text-muted-foreground">
                    #{pr333single.rank.country} in Australia &nbsp;·&nbsp; #{pr333single.rank.world} World
                  </p>
                  {pr333avg && (
                    <p className="font-sans text-xs text-muted-foreground mt-1">
                      Average: {formatTime(pr333avg.best)} &nbsp;(#{pr333avg.rank.country} AU)
                    </p>
                  )}
                </div>

                {/* Video side — only if PR still matches */}
                {showVideo && (
                  <div className="bg-black aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${PR_VIDEO_ID}?rel=0&modestbranding=1`}
                      title="8.87 official solve — Mitchell Anderson"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Stats grid ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatBox
              label="Competitions"
              value={person?.numberOfCompetitions?.toString() ?? '—'}
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
          <MedalRow
            gold={person?.medals.gold ?? 0}
            silver={person?.medals.silver ?? 0}
            bronze={person?.medals.bronze ?? 0}
          />

          {/* ── Competition map ──────────────────────────────────── */}
          <div>
            <p className="font-sans text-xs font-semibold text-primary uppercase tracking-widest mb-3">
              Competition Locations
            </p>
            {compsLoading ? (
              <div className="h-96 bg-maroon-50 ring-1 ring-maroon-100 rounded-xl animate-pulse flex items-center justify-center">
                <p className="font-sans text-xs text-muted-foreground">Loading map…</p>
              </div>
            ) : competitions.length > 0 ? (
              <CompetitionMap competitions={competitions} />
            ) : null}
          </div>

        </div>
      )}

    </div>
  )
}
