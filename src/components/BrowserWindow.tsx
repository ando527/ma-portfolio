'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion'
import Link from 'next/link'
import type { Project } from '@/lib/projects'

// ── Types ─────────────────────────────────────────────────────────────────────
type ProjectTab = { kind: 'project'; project: Project }
type NewTab     = { kind: 'new'; id: number }
type Tab        = ProjectTab | NewTab
type PhoneView  = 'tabs' | 'browser'

// ── Helpers ───────────────────────────────────────────────────────────────────
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

// ── New Tab page ──────────────────────────────────────────────────────────────
const FUN_FACTS = [
  '🎲 Represented Australia at the WCA World Championships — twice.',
  '🏆 Silver medalist at the 2025 QLD Speedcubing State Championships.',
  '🌐 Runs speedcubing.org.au as Website Coordinator for Speedcubing Australia.',
  '🏅 2022 IDA Honourable Mention for the McR ESG Web Project.',
]

const SHORTCUTS = [
  { label: 'Work',    href: '/work',                      emoji: '💼' },
  { label: 'About',  href: '/about',                     emoji: '👋' },
  { label: 'GitHub', href: 'https://github.com/ando527',  emoji: '🐙' },
  { label: 'Cubing', href: 'https://speedcubing.org.au', emoji: '🎲' },
]

function NewTabPage({ compact = false }: { compact?: boolean }) {
  const [time, setTime]               = useState(() => new Date())
  const [factIdx, setFactIdx]         = useState(() => Math.floor(Math.random() * FUN_FACTS.length))
  const [factVisible, setFactVisible] = useState(true)

  useEffect(() => {
    const clock = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(clock)
  }, [])

  useEffect(() => {
    const cycle = setInterval(() => {
      setFactVisible(false)
      setTimeout(() => { setFactIdx(i => (i + 1) % FUN_FACTS.length); setFactVisible(true) }, 400)
    }, 4000)
    return () => clearInterval(cycle)
  }, [])

  const h        = time.getHours()
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const timeStr  = time.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
  const dateStr  = time.toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className={`h-full flex flex-col items-center justify-center bg-[#f5f0f1] ${compact ? 'px-5 py-5 gap-5' : 'px-8 py-10 gap-8'}`}>

      {/* Clock + greeting */}
      <div className="text-center">
        <div className={`font-heading font-bold leading-none text-foreground tracking-tight ${compact ? 'text-5xl' : 'text-[5rem]'}`}>
          {timeStr}
        </div>
        <p className={`font-sans text-muted-foreground mt-1.5 ${compact ? 'text-[11px]' : 'text-sm'}`}>{dateStr}</p>
        <p className={`font-heading font-semibold text-foreground mt-2 ${compact ? 'text-base' : 'text-2xl'}`}>{greeting}.</p>
      </div>

      {/* Shortcuts */}
      <div className={compact ? 'grid grid-cols-2 gap-3 w-full max-w-[190px]' : 'flex items-center gap-5'}>
        {SHORTCUTS.map(s => (
          <Link key={s.label} href={s.href} className="flex flex-col items-center gap-1.5 group">
            <div className={`bg-white border border-maroon-100 shadow-sm flex items-center justify-center group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-200 ${compact ? 'w-11 h-11 rounded-xl text-xl' : 'w-14 h-14 rounded-2xl text-2xl'}`}>
              {s.emoji}
            </div>
            <span className={`font-sans text-muted-foreground group-hover:text-foreground transition-colors duration-200 ${compact ? 'text-[10px]' : 'text-xs'}`}>
              {s.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Fun fact — fixed height prevents layout shift during text swap */}
      <div
        className={`text-center ${compact ? 'max-w-[210px]' : 'max-w-sm'}`}
        style={{
          opacity: factVisible ? 1 : 0,
          transition: 'opacity 0.4s ease',
          minHeight: compact ? '2rem' : '2.5rem',
        }}
      >
        <p className={`font-sans text-muted-foreground leading-relaxed ${compact ? 'text-[10px]' : 'text-xs'}`}>
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
      <div className="w-full aspect-[16/5] bg-maroon-50 overflow-hidden">
        {project.heroImage
          ? <img src={project.heroImage} alt={project.title} className="w-full h-full object-cover" loading="lazy" />
          : <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-maroon-50 via-maroon-100 to-maroon-50">
              <span className="font-heading font-bold text-8xl text-primary/10 select-none">{project.title.charAt(0)}</span>
            </div>
        }
      </div>
      <div className="max-w-2xl mx-auto px-5 py-5">
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {project.tags.map(tag => (
              <span key={tag} className="text-xs font-sans font-medium text-primary bg-maroon-50 px-2.5 py-1 rounded-full border border-maroon-200">{tag}</span>
            ))}
          </div>
        )}
        <h3 className="font-heading font-bold text-xl text-foreground tracking-tight mb-1">{project.title}</h3>
        {project.date && <p className="font-sans text-xs text-muted-foreground mb-3">{project.date}</p>}
        <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-5">{project.summary}</p>
        {sections.length > 0 && (
          <div className="space-y-4 border-t border-maroon-100 pt-5">
            {sections.map(({ heading, body }) => (
              <div key={heading}>
                <h4 className="font-heading font-semibold text-sm text-foreground uppercase tracking-widest mb-2">{heading}</h4>
                <p className="font-sans text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {(body || '—').replace(/!\[.*?\]\(.*?\)/g, '').replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/\n{3,}/g, '\n\n').trim() || '—'}
                </p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 pt-4 border-t border-maroon-100">
          <Link href={`/work/${project.slug}/`} className="inline-flex items-center gap-2 font-sans text-sm font-semibold text-primary hover:text-maroon-700 transition-colors duration-200 group">
            View full case study
            <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Desktop Chrome ────────────────────────────────────────────────────────────
let tabCounter = 0

function DesktopBrowser({ projects }: { projects: Project[] }) {
  const [tabs, setTabs]           = useState<Tab[]>(() => projects.slice(0, 4).map(p => ({ kind: 'project', project: p })))
  const [activeIdx, setActiveIdx] = useState(0)
  const scrollRef                 = useRef<HTMLDivElement>(null)
  const scrollPositions           = useRef<Record<number, number>>({})

  if (tabs.length === 0) return null
  const activeTab = tabs[activeIdx]

  const switchTab = (i: number) => {
    if (scrollRef.current) scrollPositions.current[activeIdx] = scrollRef.current.scrollTop
    setActiveIdx(i)
    requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollPositions.current[i] ?? 0 })
  }

  const addNewTab = () => {
    const next = [...tabs, { kind: 'new' as const, id: ++tabCounter }]
    setTabs(next)
    switchTab(next.length - 1)
  }

  const closeTab = (i: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (tabs.length === 1) return
    const next = tabs.filter((_, idx) => idx !== i)
    const np: Record<number, number> = {}
    Object.entries(scrollPositions.current).forEach(([k, v]) => {
      const ki = Number(k); if (ki < i) np[ki] = v; else if (ki > i) np[ki - 1] = v
    })
    scrollPositions.current = np
    setTabs(next)
    setActiveIdx(Math.min(activeIdx, next.length - 1))
  }

  const urlSlug = activeTab.kind === 'project' ? activeTab.project.slug : 'new-tab'

  return (
    <div className="rounded-2xl overflow-hidden shadow-[0_32px_80px_-12px_rgba(0,0,0,0.25)] border border-black/10">
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
              {activeTab.kind === 'new' ? 'New Tab' : `mitchellanderson.com.au/work/${urlSlug}`}
            </span>
          </div>
        </div>
      </div>
      <div className="bg-[#292929] flex items-end px-2 pt-2 gap-0.5 select-none overflow-x-auto overflow-y-hidden scrollbar-none">
        {tabs.map((tab, i) => (
          <button
            key={tab.kind === 'project' ? tab.project.slug : `new-${tab.id}`}
            onClick={() => switchTab(i)}
            className={`group relative flex items-center gap-2 px-3 py-2 text-[11px] font-sans font-medium rounded-t-lg flex-shrink-0 min-w-[100px] max-w-[180px] transition-all duration-150 ${
              i === activeIdx ? 'bg-white text-gray-800 mb-[-1px] z-10 shadow-sm' : 'bg-[#3a3a3a] text-gray-400 hover:bg-[#454545] hover:text-gray-200'
            }`}
          >
            {tab.kind === 'project' && tab.project.favicon
              ? <img src={tab.project.favicon} alt="" className="w-3 h-3 rounded-sm flex-shrink-0 object-cover" />
              : tab.kind === 'new'
                ? <img src="/images/ma-logo.svg" alt="" className="w-3 h-3 rounded-sm flex-shrink-0 object-cover" />
                : <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${i === activeIdx ? 'bg-primary' : 'bg-primary/50'}`} />
            }
            <span className="truncate flex-1 text-left">{tab.kind === 'project' ? tab.project.title : 'New Tab'}</span>
            <span onClick={(e) => closeTab(i, e)} role="button" aria-label="Close tab"
              className={`ml-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] leading-none flex-shrink-0 cursor-pointer transition-colors duration-150 ${
                i === activeIdx ? 'text-gray-400 hover:bg-gray-200 hover:text-gray-700' : 'text-transparent group-hover:text-gray-500 group-hover:hover:bg-white/20'
              }`}
            >×</span>
          </button>
        ))}
        <button onClick={addNewTab} aria-label="New tab"
          className="mb-0 ml-1 w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-200 hover:bg-white/10 active:scale-95 transition-all duration-150 font-sans text-base font-light pb-0.5"
        >+</button>
        <div className="flex-1 min-w-0" />
      </div>
      <div ref={scrollRef} className="h-[520px] overflow-y-auto overscroll-contain bg-white">
        {activeTab.kind === 'project' ? <MiniCaseStudy project={activeTab.project} /> : <NewTabPage />}
      </div>
    </div>
  )
}

// ── Mobile Phone ──────────────────────────────────────────────────────────────
let mobileTabCounter = 0

// ── Swipeable tab card ────────────────────────────────────────────────────────
function TabCard({ tab, i, isActive, highlighted = false, onOpen, onClose }: {
  tab: Tab
  i: number
  isActive: boolean
  highlighted?: boolean
  onOpen: () => void
  onClose: () => void
}) {
  const x       = useMotionValue(0)
  const opacity = useTransform(x, [-110, -60, 0, 60, 110], [0, 0.5, 1, 0.5, 0])
  const rotate  = useTransform(x, [-110, 0, 110], [-7, 0, 7])

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 70) {
      onClose()
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 25 })
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28, delay: i * 0.04 }}
    >
      <motion.button
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        style={{ x, opacity, rotate, touchAction: 'pan-y' }}
        onClick={onOpen}
        className={`relative w-full rounded-xl overflow-hidden border-2 ${highlighted || isActive ? 'border-[#0a84ff]' : 'border-transparent'}`}
      >
        <div className="aspect-[4/3] bg-[#2c2c2e] overflow-hidden">
          {tab.kind === 'project' && tab.project.heroImage
            ? <img src={tab.project.heroImage} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
            : <div className="w-full h-full bg-[#f5f0f1] flex items-center justify-center">
                <img src="/images/ma-logo.svg" alt="" className="w-7 h-7" />
              </div>
          }
        </div>
        <div className="bg-[#2c2c2e] px-2 py-[6px] flex items-center gap-1.5 min-w-0">
          {tab.kind === 'project' && tab.project.favicon
            ? <img src={tab.project.favicon} alt="" className="w-3 h-3 rounded-[3px] flex-shrink-0 object-cover" />
            : <img src="/images/ma-logo.svg"  alt="" className="w-3 h-3 rounded-[3px] flex-shrink-0" />
          }
          <span className="font-sans text-white/80 text-[10px] truncate flex-1 text-left leading-none">
            {tab.kind === 'project' ? tab.project.title : 'New Tab'}
          </span>
          <span
            role="button"
            onClick={(e) => { e.stopPropagation(); onClose() }}
            className="flex-shrink-0 text-white/40 hover:text-white/80 text-sm leading-none flex items-center justify-center w-4 h-4"
          >×</span>
        </div>
      </motion.button>
    </motion.div>
  )
}

function MobilePhone({ projects }: { projects: Project[] }) {
  const [tabs, setTabs]           = useState<Tab[]>(() => projects.slice(0, 4).map(p => ({ kind: 'project', project: p })))
  const [activeIdx, setActiveIdx] = useState(0)
  const [view, setView]           = useState<PhoneView>('tabs')
  const [isOff, setIsOff]         = useState(false)
  const [time, setTime]           = useState(() => new Date())
  const [volumeLevel, setVolumeLevel] = useState(75)
  const [showVolume, setShowVolume]   = useState(false)
  const volumeTimer                   = useRef<ReturnType<typeof setTimeout>>()
  const scrollRef                     = useRef<HTMLDivElement>(null)
  const scrollTimerRef                = useRef<ReturnType<typeof setTimeout>>()
  // 0=none  1=tabs-highlight  2=scroll-highlight  3=tab-btn-highlight
  const [tooltipStep, setTooltipStep] = useState(0)

  // ── Real device status ────────────────────────────────────────────────────
  const [battery, setBattery]         = useState<{ level: number; charging: boolean } | null>(null)
  const [connType, setConnType]       = useState<string | null>(null)

  useEffect(() => {
    // Battery Status API (Chrome/Android; not available on iOS Safari)
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      ;(navigator as any).getBattery().then((bat: any) => {
        const update = () => setBattery({ level: bat.level, charging: bat.charging })
        update()
        bat.addEventListener('levelchange',   update)
        bat.addEventListener('chargingchange', update)
        return () => {
          bat.removeEventListener('levelchange',   update)
          bat.removeEventListener('chargingchange', update)
        }
      })
    }
    // Network Information API (Chrome/Android; not available on iOS Safari)
    const nav = navigator as any
    if (nav.connection) {
      const update = () => setConnType(nav.connection.effectiveType ?? nav.connection.type ?? null)
      update()
      nav.connection.addEventListener('change', update)
      return () => nav.connection.removeEventListener('change', update)
    }
  }, [])

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => () => clearTimeout(volumeTimer.current), [])
  useEffect(() => () => clearTimeout(scrollTimerRef.current), [])

  // ── First-time tooltip: only show if user hasn't completed the tour yet ──
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('ma_tooltip_v1')) return
    const t = setTimeout(() => setTooltipStep(1), 900)
    return () => clearTimeout(t)
  }, [])

  const timeStr = time.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false })
  const dateStr = time.toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })

  const activeTab = tabs[activeIdx]
  const urlSlug   = activeTab?.kind === 'project' ? activeTab.project.slug : ''
  const urlText   = activeTab?.kind === 'new' ? 'New Tab' : `mitchellanderson.com.au/work/${urlSlug}`

  const openTab = (i: number) => {
    setActiveIdx(i)
    setView('browser')
    if (tooltipStep === 1) setTooltipStep(2)
  }

  const completeTooltip = () => {
    if (typeof window !== 'undefined') localStorage.setItem('ma_tooltip_v1', '1')
    setTooltipStep(0)
  }

  const goToTabs = () => {
    setView('tabs')
    if (tooltipStep === 3) completeTooltip()       // completed the tour
    else if (tooltipStep === 2) setTooltipStep(1)  // went back before scrolling
  }

  const closeTab = (i: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (tabs.length === 1) return
    const next = tabs.filter((_, idx) => idx !== i)
    setTabs(next)
    setActiveIdx(prev => Math.min(prev, next.length - 1))
  }

  const addTab = () => {
    const next = [...tabs, { kind: 'new' as const, id: ++mobileTabCounter }]
    setTabs(next); setActiveIdx(next.length - 1); setView('browser')
  }

  const nudgeVolume = (delta: number) => {
    setVolumeLevel(v => Math.max(0, Math.min(100, v + delta)))
    setShowVolume(true)
    clearTimeout(volumeTimer.current)
    volumeTimer.current = setTimeout(() => setShowVolume(false), 1600)
  }

  return (
    <div className="relative" style={{ width: 'min(290px, calc(100vw - 32px))', margin: '0 auto' }}>

      {/* Volume up */}
      <button
        onClick={() => nudgeVolume(10)}
        className="absolute rounded-l-full bg-[#2c2c2e] hover:brightness-125 active:brightness-75 transition-all"
        style={{ left: -5, top: 70, width: 5, height: 32 }}
        aria-label="Volume up"
      />
      {/* Volume down */}
      <button
        onClick={() => nudgeVolume(-10)}
        className="absolute rounded-l-full bg-[#2c2c2e] hover:brightness-125 active:brightness-75 transition-all"
        style={{ left: -5, top: 114, width: 5, height: 32 }}
        aria-label="Volume down"
      />
      {/* Power button */}
      <button
        onClick={() => setIsOff(o => !o)}
        className="absolute rounded-r-full bg-[#2c2c2e] hover:brightness-125 active:brightness-75 transition-all"
        style={{ right: -5, top: 108, width: 5, height: 48 }}
        aria-label="Power"
      />

      {/* Phone body */}
      <div
        className="rounded-[2.1rem] p-[10px] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.08),0_0_0_1px_rgba(0,0,0,0.4)]"
        style={{
          background: 'linear-gradient(160deg, #2e2e2e 0%, #1a1a1a 100%)',
          height: 'min(calc(100dvh - 90px), 620px)',
        }}
      >
        {/* Screen */}
        <div className="relative rounded-[1.6rem] overflow-hidden h-full flex flex-col bg-white select-none">

          {/* Punch-hole camera lens */}
          <div className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none" style={{ top: 11 }}>
            <div className="rounded-full bg-black flex items-center justify-center relative" style={{ width: 14, height: 14 }}>
              <div className="rounded-full flex items-center justify-center" style={{ width: 11, height: 11, background: '#1a1a22', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                <div className="rounded-full bg-black flex items-center justify-center" style={{ width: 7, height: 7 }}>
                  <div className="rounded-full" style={{ width: 3, height: 3, background: 'rgba(70,90,200,0.25)' }} />
                </div>
              </div>
              <div className="absolute rounded-full bg-white/20" style={{ width: 2.5, height: 2.5, top: 1.5, left: 2 }} />
            </div>
          </div>

          {/* Volume HUD */}
          <AnimatePresence>
            {showVolume && (
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: -6 }}
                animate={{ opacity: 1, scale: 1,    y: 0  }}
                exit={{    opacity: 0, scale: 0.88, y: -6 }}
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                className="absolute z-[45] rounded-2xl flex items-center gap-2 px-3 py-2.5"
                style={{ top: 38, left: 12, minWidth: 130, background: 'rgba(30,30,30,0.88)', backdropFilter: 'blur(8px)' }}
              >
                {/* Speaker icon */}
                <svg className="w-3.5 h-3.5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  {volumeLevel === 0
                    ? <path d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                    : <>
                        <path d="M11.536 3.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        {volumeLevel > 40 && <path d="M15.536 8.464a5 5 0 010 7.072" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>}
                        {volumeLevel > 70 && <path d="M18.364 5.636a9 9 0 010 12.728" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none"/>}
                      </>
                  }
                </svg>
                {/* Volume bar */}
                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <motion.div
                    className="h-full rounded-full bg-white"
                    animate={{ width: `${volumeLevel}%` }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lock screen */}
          <AnimatePresence>
            {isOff && (
              <motion.button
                key="lockscreen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onClick={() => setIsOff(false)}
                className="absolute inset-0 z-40 bg-black flex flex-col items-center justify-center w-full cursor-pointer"
              >
                <div className="absolute z-[1] pointer-events-none" style={{ top: 11, left: '50%', transform: 'translateX(-50%)' }}>
                  <div className="rounded-full bg-black flex items-center justify-center relative" style={{ width: 14, height: 14 }}>
                    <div className="rounded-full flex items-center justify-center" style={{ width: 11, height: 11, background: '#1a1a22', border: '0.5px solid rgba(255,255,255,0.07)' }}>
                      <div className="rounded-full bg-black flex items-center justify-center" style={{ width: 7, height: 7 }}>
                        <div className="rounded-full" style={{ width: 3, height: 3, background: 'rgba(70,90,200,0.25)' }} />
                      </div>
                    </div>
                    <div className="absolute rounded-full bg-white/20" style={{ width: 2.5, height: 2.5, top: 1.5, left: 2 }} />
                  </div>
                </div>
                <p className="font-sans text-white/35 text-[10px] tracking-widest uppercase">{dateStr}</p>
                <p className="font-heading font-bold text-white leading-none tracking-tight mt-2" style={{ fontSize: '3.8rem' }}>{timeStr}</p>
                <motion.p
                  className="font-sans text-white/30 text-[10px] mt-8 tracking-widest uppercase"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  Tap to wake
                </motion.p>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Status bar */}
          <div
            className={`flex-shrink-0 flex items-center justify-between px-5 z-10 ${view === 'tabs' ? 'bg-[#1c1c1e] text-white' : 'bg-white text-black'}`}
            style={{ paddingTop: 13, paddingBottom: 5 }}
          >
            <span className="font-sans font-semibold text-[11px]">{timeStr}</span>
            <div className="flex items-center gap-[5px]" style={{ opacity: 0.65 }}>
              {/* Signal / connection — real if available, otherwise static full bars */}
              {connType === 'wifi' || connType === null ? (
                <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
                  <circle cx="7" cy="10.2" r="1.3" fill="currentColor"/>
                  <path d="M4.3 7.6a3.8 3.8 0 0 1 5.4 0"   stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  <path d="M1.5 4.8a8.2 8.2 0 0 1 11 0"    stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              ) : (
                /* Cellular bars — dim inactive bars for weaker connections */
                <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor">
                  <rect x="0"    y="8"   width="2.5" height="3"   rx="0.9" opacity={1}/>
                  <rect x="4.2"  y="5.5" width="2.5" height="5.5" rx="0.9" opacity={connType === '2g' ? 0.3 : 1}/>
                  <rect x="8.4"  y="3"   width="2.5" height="8"   rx="0.9" opacity={connType === '2g' || connType === '3g' ? 0.3 : 1}/>
                  <rect x="12.5" y="0"   width="2.5" height="11"  rx="0.9" opacity={connType !== '4g' ? 0.3 : 1}/>
                </svg>
              )}
              {/* Battery — real level + percentage + charging bolt if available */}
              {battery ? (
                <div className="flex items-center gap-[3px]">
                  {/* Percentage */}
                  <span className="font-sans font-semibold text-[10px] leading-none tabular-nums">
                    {Math.round(battery.level * 100)}%
                  </span>
                  {/* Lightning bolt SVG — sits between percentage and battery when charging */}
                  {battery.charging && (
                    <svg width="5" height="9" viewBox="0 0 5 9" fill="none">
                      <path d="M3 0L0 4.5H2.2L1.5 9L5 4.5H2.8L3 0Z" fill="currentColor"/>
                    </svg>
                  )}
                  {/* Battery icon — fill scaled to real level */}
                  <svg width="24" height="12" viewBox="0 0 24 12" fill="none" style={{ marginLeft: 3 }}>
                    <rect x="0.6" y="0.6" width="20" height="10.8" rx="2.4" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="21" y="3.5" width="2.4" height="5" rx="1.2" fill="currentColor" opacity="0.5"/>
                    <rect
                      x="2.2" y="2.2"
                      width={Math.max(1, battery.level * 15)}
                      height="7.6" rx="1.4"
                      fill={battery.charging ? '#4fe870' : battery.level < 0.2 ? '#ff3b30' : 'currentColor'}
                    />
                  </svg>
                </div>
              ) : (
                <svg width="24" height="12" viewBox="0 0 24 12" fill="none">
                  <rect x="0.6" y="0.6" width="20" height="10.8" rx="2.4" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="21" y="3.5" width="2.4" height="5" rx="1.2" fill="currentColor" opacity="0.5"/>
                  <rect x="2.2" y="2.2" width="15" height="7.6" rx="1.4" fill="currentColor"/>
                </svg>
              )}
            </div>
          </div>

          {/* ── View container ── */}
          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence mode="sync" initial={false}>

              {/* TABS VIEW */}
              {view === 'tabs' && (
                <motion.div
                  key="tabs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 overflow-y-auto overscroll-contain bg-[#1c1c1e] flex flex-col"
                >
                  {/* Header bar — dimmed during step 1 */}
                  <div className="relative flex items-center justify-between px-4 pt-2 pb-3 sticky top-0 bg-[#1c1c1e] z-10">
                    <span className="font-sans font-bold text-white text-sm">
                      {tabs.length} {tabs.length === 1 ? 'Tab' : 'Tabs'}
                    </span>
                    <button onClick={addTab} className="font-sans text-[#0a84ff] text-sm font-semibold active:opacity-60 transition-opacity">
                      + New Tab
                    </button>
                    {tooltipStep === 1 && (
                      <div className="absolute inset-0 bg-black/60 pointer-events-none" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 px-3 pb-4">
                    <AnimatePresence mode="popLayout">
                      {tabs.map((tab, i) => {
                        const isHighlighted = tooltipStep === 1 && i === 0
                        return (
                          <div
                            key={tab.kind === 'project' ? tab.project.slug : `new-${tab.id}`}
                            className={`relative ${isHighlighted ? 'z-10 rounded-xl shadow-[0_0_0_2px_#0a84ff,0_0_18px_rgba(10,132,255,0.55)]' : ''}`}
                          >
                            <TabCard
                              tab={tab}
                              i={i}
                              isActive={i === activeIdx}
                              highlighted={isHighlighted}
                              onOpen={() => openTab(i)}
                              onClose={() => {
                                if (tabs.length === 1) return
                                const next = tabs.filter((_, idx) => idx !== i)
                                setTabs(next)
                                setActiveIdx(prev => Math.min(prev, next.length - 1))
                              }}
                            />
                            {/* Dim non-highlighted cards during step 1 */}
                            {tooltipStep === 1 && i !== 0 && (
                              <div className="absolute inset-0 bg-black/65 rounded-xl pointer-events-none" />
                            )}
                            {/* Speech bubble — left:0 right:0 + items-center avoids Framer Motion clobbering translateX */}
                            {isHighlighted && (
                              <div
                                className="absolute flex flex-col items-center pointer-events-none z-50"
                                style={{ top: 'calc(100% + 4px)', left: 0, right: 0 }}
                              >
                                <motion.div
                                  key="step1-label"
                                  initial={{ opacity: 0, y: -4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.35, type: 'spring', stiffness: 280, damping: 24 }}
                                  className="flex flex-col items-center"
                                >
                                  <div style={{ width: 0, height: 0, borderLeft: '7px solid transparent', borderRight: '7px solid transparent', borderBottom: '8px solid #0a84ff' }} />
                                  <div className="bg-[#0a84ff] text-white font-sans font-semibold text-[11px] px-3.5 py-2 rounded-2xl shadow-xl whitespace-nowrap">
                                    Tap to open a project
                                  </div>
                                </motion.div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {/* BROWSER VIEW */}
              {view === 'browser' && (
                <motion.div
                  key="browser"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="absolute inset-0 flex flex-col"
                >
                  {/* URL bar */}
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, duration: 0.2 }}
                    className="flex-shrink-0 bg-white px-3 py-2 border-b border-gray-100"
                  >
                    <div className="bg-[#f2f2f7] rounded-[10px] h-9 flex items-center gap-1.5 px-3">
                      <svg className="w-[11px] h-[11px] text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      <div className="relative flex-1 overflow-hidden">
                        <span className="font-sans text-[11px] text-black/60 whitespace-nowrap block">{urlText}</span>
                        <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#f2f2f7] to-transparent pointer-events-none" />
                      </div>
                      <button onClick={addTab} aria-label="New tab"
                        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-black/[0.07] hover:bg-black/[0.12] active:bg-black/[0.18] transition-colors"
                      >
                        <svg className="w-[14px] h-[14px] text-black/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                      <button onClick={goToTabs} aria-label="Show all tabs"
                        className="relative flex-shrink-0 rounded-[5px] bg-black/[0.07] hover:bg-black/[0.12] border border-black/20 flex items-center justify-center active:bg-black/[0.18] transition-colors"
                        style={{ width: 24, height: 24 }}
                      >
                        {/* Step 3: static blue ring around tab count button (no infinite loop = no flash) */}
                        <AnimatePresence>
                          {tooltipStep === 3 && (
                            <motion.span
                              key="tab-btn-ring"
                              initial={{ opacity: 0, scale: 0.7 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.7 }}
                              transition={{ duration: 0.2 }}
                              className="absolute rounded-[6px] pointer-events-none"
                              style={{ inset: -3, border: '2px solid #0a84ff', boxShadow: '0 0 10px rgba(10,132,255,0.55)' }}
                            />
                          )}
                        </AnimatePresence>
                        <span className="font-sans font-bold text-[11px] text-black/65 leading-none">{tabs.length}</span>
                      </button>
                    </div>
                  </motion.div>

                  {/* Step 3: label + arrow below/beside the tab count button */}
                  <AnimatePresence>
                    {tooltipStep === 3 && (
                      <motion.div
                        key="tab-btn-label"
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 8 }}
                        transition={{ delay: 0.15, duration: 0.22 }}
                        className="absolute pointer-events-none z-30 flex flex-col items-end"
                        style={{ top: 54, right: 8 }}
                      >
                        <div style={{ width: 0, height: 0, marginRight: 28, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '6px solid #0a84ff' }} />
                        <div className="bg-[#0a84ff] text-white font-sans font-semibold text-[10px] px-2.5 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
                          Browse other projects
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Content wrapper (relative so overlays can sit inside) */}
                  <div className="flex-1 relative overflow-hidden">
                    <motion.div
                      ref={scrollRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.22 }}
                      className="h-full overflow-y-auto overscroll-contain"
                      onScroll={() => {
                        if (tooltipStep === 2) {
                          clearTimeout(scrollTimerRef.current)
                          scrollTimerRef.current = setTimeout(() => setTooltipStep(3), 800)
                        }
                      }}
                      onClick={() => { if (tooltipStep === 3) completeTooltip() }}
                    >
                      {activeTab?.kind === 'project'
                        ? <MiniCaseStudy project={activeTab.project} />
                        : <NewTabPage compact />
                      }
                    </motion.div>

                    {/* Step 2: static blue ring + label (no infinite loop = no flash on dismiss) */}
                    <AnimatePresence>
                      {tooltipStep === 2 && (
                        <>
                          <motion.div
                            key="scroll-ring"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="absolute inset-0 pointer-events-none z-10"
                            style={{ border: '2.5px solid #0a84ff', boxShadow: 'inset 0 0 16px rgba(10,132,255,0.15)' }}
                          />
                          <motion.div
                            key="scroll-label"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ delay: 0.15, duration: 0.22 }}
                            className="absolute top-3 inset-x-0 flex justify-center pointer-events-none z-20"
                          >
                            <div className="bg-[#0a84ff] text-white font-sans font-semibold text-[10px] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                              Scroll to read the case study
                              <svg className="w-2.5 h-2.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                              </svg>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────────────
export default function BrowserWindow({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null
  return (
    <>
      <div className="hidden lg:block">
        <DesktopBrowser projects={projects} />
      </div>
      <div className="lg:hidden flex justify-center py-4">
        <MobilePhone projects={projects} />
      </div>
    </>
  )
}
