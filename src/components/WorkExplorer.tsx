'use client'

import { useEffect, useMemo, useState } from 'react'
import ProjectCard from '@/components/ProjectCard'
import type { WorkItem } from '@/lib/types'

// The Work page's filters and sort. The static HTML renders the default view
// (all projects, newest first); the choice is mirrored in the URL
// (?show=webflow&sort=involved) so a filtered view can be shared or bookmarked.

type Sort = 'newest' | 'az' | 'involved'

const SORTS: { id: Sort; label: string }[] = [
  { id: 'newest', label: 'Newest first' },
  { id: 'az', label: 'A to Z' },
  { id: 'involved', label: 'Most involved' },
]

interface Filter {
  id: string
  label: string
  test: (p: WorkItem) => boolean
}

const hasTag = (p: WorkItem, tag: string) => p.tags.some(t => t.toLowerCase() === tag)

const FILTERS: Filter[] = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'webflow', label: 'Webflow', test: p => hasTag(p, 'webflow') },
  { id: 'shopify', label: 'Shopify', test: p => hasTag(p, 'shopify') },
  { id: 'custom', label: 'Custom', test: p => hasTag(p, 'custom build') },
  { id: 'agency', label: 'Agency work', test: p => p.badge === 'SLATE' },
  { id: 'pro-bono', label: 'Pro-bono', test: p => p.badge === 'Pro-bono' },
  { id: 'freelance', label: 'Freelance', test: p => p.badge === 'Freelance' },
]

const sorters: Record<Sort, (a: WorkItem, b: WorkItem) => number> = {
  newest: (a, b) => b.sortDate.localeCompare(a.sortDate),
  az: (a, b) => a.title.localeCompare(b.title, 'en-AU'),
  involved: (a, b) => b.effort - a.effort || b.sortDate.localeCompare(a.sortDate),
}

export default function WorkExplorer({ projects }: { projects: WorkItem[] }) {
  const [show, setShow] = useState('all')
  const [sort, setSort] = useState<Sort>('newest')

  // Only offer filters that match at least one project.
  const filters = useMemo(
    () => FILTERS.map(f => ({ ...f, count: projects.filter(f.test).length })).filter(f => f.id === 'all' || f.count > 0),
    [projects],
  )

  // Read the view from the URL once on load.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const s = params.get('show')
    const o = params.get('sort') as Sort | null
    // The static HTML renders the default view; the URL is only known in the
    // browser, so it's applied after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser-only value, read after hydration
    if (s && filters.some(f => f.id === s)) setShow(s)
    if (o && SORTS.some(x => x.id === o)) setSort(o)
  }, [filters])

  const update = (nextShow: string, nextSort: Sort) => {
    setShow(nextShow)
    setSort(nextSort)
    const params = new URLSearchParams()
    if (nextShow !== 'all') params.set('show', nextShow)
    if (nextSort !== 'newest') params.set('sort', nextSort)
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
  }

  const active = filters.find(f => f.id === show) ?? filters[0]
  const visible = projects.filter(active.test).sort(sorters[sort])

  // The newest (or most involved) project leads the grid across the full row.
  const hasLead = sort !== 'az' && visible.length >= 3

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div role="group" aria-label="Show projects" className="flex flex-wrap gap-2">
          {filters.map(f => {
            const pressed = f.id === active.id
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => update(f.id, sort)}
                className={`inline-flex items-center gap-2 h-10 px-3 rounded-lg border font-sans text-sm font-medium transition-[background-color,border-color,color] duration-150 ease-spec motion-reduce:transition-none ${
                  pressed
                    ? 'bg-raised border-control text-fg'
                    : 'bg-transparent border-line text-fg-2 hover:bg-raised/60 hover:text-fg'
                }`}
              >
                {f.label}
                <span className="split">{f.count}</span>
              </button>
            )
          })}
        </div>

        <label className="shrink-0 whitespace-nowrap flex items-center gap-3 font-sans text-sm text-fg-2" htmlFor="work-sort">
          Sort by
          <span className="relative">
            <select
              id="work-sort"
              value={sort}
              onChange={e => update(show, e.target.value as Sort)}
              className="appearance-none h-10 pl-3 pr-9 rounded-lg border border-control bg-card font-medium text-fg cursor-pointer hover:bg-raised/60 transition-[background-color,border-color] duration-150 ease-spec motion-reduce:transition-none"
            >
              {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <svg aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-fg-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 4.5 6 8l3.5-3.5" />
            </svg>
          </span>
        </label>
      </div>

      <p aria-live="polite" className="split pb-4 mb-8 border-b border-line">
        {visible.length === projects.length
          ? `${projects.length} projects`
          : `${visible.length} of ${projects.length} projects`}
        {sort === 'involved' && ', ordered by how much went into them'}
      </p>

      {visible.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {visible.map((p, i) => (
            <li key={p.slug} className={hasLead && i === 0 ? 'md:col-span-2' : undefined}>
              {/* The first row is in view on load */}
              <ProjectCard
                project={p}
                headingLevel={2}
                size={hasLead && i === 0 ? 'xl' : 'lg'}
                priority={i < 2}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-16 text-center">
          <p className="font-sans text-fg-2 mb-4">No projects match that filter</p>
          <button type="button" onClick={() => update('all', sort)} className="font-sans text-sm font-medium text-accent underline underline-offset-4 hover:text-accent-hover">
            Show all projects
          </button>
        </div>
      )}
    </div>
  )
}
