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
  { id: 'agency', label: 'Agency work', test: p => p.badge === 'SLATE' },
  { id: 'pro-bono', label: 'Pro-bono', test: p => p.badge === 'Pro-bono' },
  { id: 'freelance', label: 'Freelance', test: p => p.badge === 'Freelance' },
]

const sorters: Record<Sort, (a: WorkItem, b: WorkItem) => number> = {
  newest: (a, b) => b.date.localeCompare(a.date),
  az: (a, b) => a.title.localeCompare(b.title, 'en-AU'),
  involved: (a, b) => b.effort - a.effort || b.date.localeCompare(a.date),
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

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-4">
        <div role="group" aria-label="Show projects" className="flex flex-wrap gap-2">
          {filters.map(f => {
            const pressed = f.id === active.id
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={pressed}
                onClick={() => update(f.id, sort)}
                className={`inline-flex items-center gap-2 h-10 px-4 rounded-full border font-sans text-sm font-medium transition-colors duration-200 ${
                  pressed
                    ? 'bg-foreground border-foreground text-background'
                    : 'bg-white border-maroon-200 text-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {f.label}
                <span className={`tabular-nums text-xs ${pressed ? 'text-background/70' : 'text-muted-foreground'}`}>{f.count}</span>
              </button>
            )
          })}
        </div>

        <label className="flex items-center gap-3 font-sans text-sm text-muted-foreground" htmlFor="work-sort">
          Sort by
          <span className="relative">
            <select
              id="work-sort"
              value={sort}
              onChange={e => update(show, e.target.value as Sort)}
              className="appearance-none h-10 pl-4 pr-10 rounded-full border border-maroon-200 bg-white font-medium text-foreground cursor-pointer hover:border-primary transition-colors duration-200"
            >
              {SORTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
            <svg aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-3 h-3 text-primary" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M2.5 4.5 6 8l3.5-3.5" />
            </svg>
          </span>
        </label>
      </div>

      <p aria-live="polite" className="font-sans text-sm text-muted-foreground mb-8">
        {visible.length === projects.length
          ? `${projects.length} projects`
          : `${visible.length} of ${projects.length} projects`}
        {sort === 'involved' && ', ordered by how much went into them'}
      </p>

      {visible.length > 0 ? (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visible.map(p => (
            <li key={p.slug}>
              <ProjectCard project={p} headingLevel={2} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="py-20 text-center">
          <p className="font-sans text-muted-foreground mb-4">No projects match that filter.</p>
          <button type="button" onClick={() => update('all', sort)} className="font-sans text-sm font-semibold text-primary underline underline-offset-2">
            Show all projects
          </button>
        </div>
      )}
    </div>
  )
}
