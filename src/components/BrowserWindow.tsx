'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import type { Project } from '@/lib/projects'

// ── Types ────────────────────────────────────────────────────────────────────

type ProjectTab = { kind: 'project'; project: Project }
type NewTab     = { kind: 'new';     id: number }
type Tab        = ProjectTab | NewTab

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseSections(content: string): { heading: string; body: string }[] {
  const sections: { heading: string; body: string }[] = []
  let current: { heading: string; lines: string[] } | null = null
  for (const line of content.split('\n')) {
    if (line.startsWith('## ')) {
      if (current) sections.push({ heading: current.heading, body: current.lines.join('\n').trim() })
      current = { heading: line.replace(/^##\s+/, ''), lines: [] }
    } else if (line.startsWith('### ') && current) {
      current.lines.push(line.replace(/^###\s+/, ''))
    } else if (current) {
      current.lines.push(line)
    }
  }
  if (current) sections.push({ heading: current.heading, body: current.lines.join('\n').trim() })
  return sections
}

// ── New Tab page ─────────────────────────────────────────────────────────────

const FUN_FACTS = [
  '🎲 Represented Australia at the WCA World Championships — twice.',
  '🏆 Silver medalist at the 2025 QLD Speedcubing State Championships.',
  '🌐 Runs speedcubing.org.au as Website Coordinator for Speedcubing Australia.',
  '🏅 2022 IDA Honourable Mention for the McR ESG Web Project.',
]

const SHORTCUTS = [
  { label: 'Work',    href: '/work',   emoji: '💼' },
  { label: 'About',  href: '/about',  emoji: '👋' },
  { label: 'GitHub', href: 'https://github.com/ando527',       emoji: '🐙' },
  { label: 'Cubing', href: 'https://speedcubing.org.au', emoji: '🎲' },
]

function NewTabPage() {
  const [time, setTime]       = useState(() => new Date())
  const [factIdx, setFactIdx] = useState(() => Math.floor(Math.random() * FUN_FACTS.length))
  const [factVisible, setFactVisible] = useState(true)

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(clock)
  }, [])

  useEffect(() => {
    const cycle = setInterval(() => {
      setFactVisible(false)
      setTimeout(() => {
        setFactIdx(i => (i + 1) % FUN_FACTS.length)
        setFactVisible(true)
      }, 400)
    }, 4000)
    return () => clearInterval(cycle)
  }, [])

  const h = time.getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const timeStr  = time.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
  const dateStr  = time.toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="h-full flex flex-col items-center justify-center bg-[#f5f0f1] px-8 py-10 gap-8">

      {/* Clock + greeting */}
      <div className="text-center">
        <div className="font-heading font-bold text-[5rem] leading-none text-foreground tracking-tight">
          {timeStr}
        </div>
        <p className="font-sans text-sm text-muted-foreground mt-2">{dateStr}</p>
        <p className="font-heading font-semibold text-2xl text-foreground mt-3">{greeting}.</p>
      </div>

      {/* Shortcuts */}
      <div className="flex items-center gap-5">
        {SHORTCUTS.map(s => (
          <Link
            key={s.label}
            href={s.href}
            className="flex flex-col items-center gap-2 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-white border border-maroon-100 shadow-sm
                            flex items-center justify-center text-2xl
                            group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-200">
              {s.emoji}
            </div>
            <span className="font-sans text-xs text-muted-foreground group-hover:text-foreground transition-colors duration-200">
              {s.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Rotating fun fact */}
      <div
        className="max-w-sm text-center transition-opacity duration-400"
        style={{ opacity: factVisible ? 1 : 0 }}
      >
        <p className="font-sans text-xs text-muted-foreground leading-relaxed">
          {FUN_FACTS[factIdx]}
        </p>
      </div>

    </div>
  )
}

// ── Mini case study ───────────────────────────────────────────────────────────

function MiniCaseStudy({ project }: { project: Project }) {
  const sections = parseSections(project.content).slice(0, 3)

  return (
    <div className="min-h-full bg-white">
      <div className="w-full aspect-[16/6] bg-maroon-50 overflow-hidden">
        {project.heroImage ? (
          <img src={project.heroImage} alt={project.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-maroon-50 via-maroon-100 to-maroon-50">
            <span className="font-heading font-bold text-8xl text-primary/10 select-none">
              {project.title.charAt(0)}
            </span>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-8 py-8">
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map(tag => (
              <span key={tag} className="text-xs font-sans font-medium text-primary bg-maroon-50 px-2.5 py-1 rounded-full border border-maroon-200">
                {tag}
              </span>
            ))}
          </div>
        )}

        <h3 className="font-heading font-bold text-2xl text-foreground tracking-tight mb-1">{project.title}</h3>
        {project.date && <p className="font-sans text-xs text-muted-foreground mb-4">{project.date}</p>}
        <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-8">{project.summary}</p>

        {sections.length > 0 && (
          <div className="space-y-6 border-t border-maroon-100 pt-8">
            {sections.map(({ heading, body }) => (
              <div key={heading}>
                <h4 className="font-heading font-semibold text-sm text-foreground uppercase tracking-widest mb-2">{heading}</h4>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {/* Strip markdown images/links so raw ![]() syntax never shows */}
                  {(body || '—')
                    .replace(/!\[.*?\]\(.*?\)/g, '')   // markdown images
                    .replace(/\*\*(.*?)\*\*/g, '$1')   // bold
                    .replace(/\*(.*?)\*/g, '$1')        // italic
                    .replace(/\n{3,}/g, '\n\n')         // collapse excess blank lines
                    .trim() || '—'}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-maroon-100">
          <Link href={`/work/${project.slug}/`} className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-primary hover:text-maroon-700 transition-colors duration-200 group">
            View full case study
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Browser window ────────────────────────────────────────────────────────────

let newTabCounter = 0

export default function BrowserWindow({ projects }: { projects: Project[] }) {
  const [tabs, setTabs]     = useState<Tab[]>(() => projects.slice(0, 4).map(p => ({ kind: 'project', project: p })))
  const [activeIdx, setActiveIdx] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollPositions = useRef<Record<number, number>>({})

  if (tabs.length === 0) return null

  const activeTab = tabs[activeIdx]

  const switchTab = (i: number) => {
    // Save scroll position of the tab we're leaving
    if (scrollRef.current) {
      scrollPositions.current[activeIdx] = scrollRef.current.scrollTop
    }
    setActiveIdx(i)
    // Restore scroll position for the tab we're switching to
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollPositions.current[i] ?? 0
      }
    })
  }

  const addNewTab = () => {
    const id  = ++newTabCounter
    const next = [...tabs, { kind: 'new' as const, id }]
    setTabs(next)
    switchTab(next.length - 1)
  }

  const closeTab = (i: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (tabs.length === 1) return          // keep at least one tab
    const next = tabs.filter((_, idx) => idx !== i)
    // Adjust saved positions for tabs that shifted down
    const newPositions: Record<number, number> = {}
    Object.entries(scrollPositions.current).forEach(([k, v]) => {
      const ki = Number(k)
      if (ki < i) newPositions[ki] = v
      else if (ki > i) newPositions[ki - 1] = v
    })
    scrollPositions.current = newPositions
    setTabs(next)
    setActiveIdx(Math.min(activeIdx, next.length - 1))
  }

  const tabLabel = (t: Tab) => t.kind === 'project' ? t.project.title : 'New Tab'
  const urlSlug  = activeTab.kind === 'project' ? activeTab.project.slug : 'new-tab'

  return (
    <div className="rounded-2xl overflow-hidden shadow-[0_32px_80px_-12px_rgba(0,0,0,0.25)] border border-black/10">

      {/* ── macOS title bar ──────────────────────────────────────── */}
      <div className="bg-[#1e1e1e] h-11 flex items-center px-4 gap-3 select-none">
        <div className="flex items-center gap-[6px]">
          {(['#FF5F57','#FFBD2E','#28C840'] as const).map((col, i) => (
            <div key={i} className="w-3 h-3 rounded-full" style={{ backgroundColor: col }} />
          ))}
        </div>

        <div className="flex-1 max-w-xs mx-auto">
          <div className="bg-[#2c2c2e] rounded-lg h-7 flex items-center justify-center gap-1.5 px-3">
            <svg className="w-3 h-3 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-sans text-[11px] text-gray-400 tracking-tight truncate">
              {activeTab.kind === 'new' ? 'New Tab' : `mitchellanderson.dev/work/${urlSlug}`}
            </span>
          </div>
        </div>
      </div>

      {/* ── Chrome tab bar ───────────────────────────────────────── */}
      <div className="bg-[#292929] flex items-end px-2 pt-2 gap-0.5 select-none overflow-x-auto overflow-y-hidden scrollbar-none">
        {tabs.map((tab, i) => (
          <button
            key={tab.kind === 'project' ? tab.project.slug : `new-${tab.id}`}
            onClick={() => switchTab(i)}
            className={`
              group relative flex items-center gap-2 px-3 py-2 text-[11px] font-sans font-medium
              rounded-t-lg flex-shrink-0 min-w-[100px] max-w-[180px] transition-all duration-150
              ${i === activeIdx
                ? 'bg-white text-gray-800 mb-[-1px] z-10 shadow-sm'
                : 'bg-[#3a3a3a] text-gray-400 hover:bg-[#454545] hover:text-gray-200'
              }
            `}
          >
            {tab.kind === 'project' && tab.project.favicon ? (
              <img
                src={tab.project.favicon}
                alt=""
                className="w-3 h-3 rounded-sm flex-shrink-0 object-cover"
              />
            ) : tab.kind === 'new' ? (
              <img
                src="/images/ma-logo.svg"
                alt=""
                className="w-3 h-3 rounded-sm flex-shrink-0 object-cover"
              />
            ) : (
              <span className={`w-3 h-3 rounded-sm flex-shrink-0 transition-colors duration-150 ${
                i === activeIdx ? 'bg-primary' : 'bg-primary/50'
              }`} />
            )}
            <span className="truncate flex-1 text-left">{tabLabel(tab)}</span>
            <span
              onClick={(e) => closeTab(i, e)}
              className={`ml-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] leading-none flex-shrink-0 cursor-pointer
                transition-colors duration-150
                ${i === activeIdx
                  ? 'text-gray-400 hover:bg-gray-200 hover:text-gray-700'
                  : 'text-transparent group-hover:text-gray-500 group-hover:hover:bg-white/20'
                }`}
              role="button"
              aria-label="Close tab"
            >
              ×
            </span>
          </button>
        ))}

        {/* New tab button */}
        <button
          onClick={addNewTab}
          className="mb-0 ml-1 w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full
                     text-gray-500 hover:text-gray-200 hover:bg-white/10 active:scale-95
                     transition-all duration-150 font-sans text-base font-light pb-0.5"
          aria-label="New tab"
        >
          +
        </button>
        <div className="flex-1 min-w-0" />
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div ref={scrollRef} className="h-[520px] overflow-y-auto overscroll-contain bg-white">
        {activeTab.kind === 'project'
          ? <MiniCaseStudy project={activeTab.project} />
          : <NewTabPage />
        }
      </div>

    </div>
  )
}
