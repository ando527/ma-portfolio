'use client'

import { useState, useEffect, useLayoutEffect, useRef, type KeyboardEvent, type RefObject } from 'react'
import { motion, AnimatePresence, MotionConfig, useMotionValue, useTransform, animate, type PanInfo } from 'framer-motion'
import Link from 'next/link'
import type { FeaturedProject } from '@/lib/types'
import { TrafficLights, HistoryMenu, type ChromeItem } from '@/components/browser/BrowserChrome'
import { flyTabToHistory, flyTabFrom, pulse } from '@/components/browser/motion'

// ── Types ─────────────────────────────────────────────────────────────────────
type ProjectTab = { kind: 'project'; project: FeaturedProject }
type NewTab     = { kind: 'new'; id: number }
type Tab        = ProjectTab | NewTab
type PhoneView  = 'tabs' | 'browser'

const tabKey   = (tab: Tab) => (tab.kind === 'project' ? tab.project.slug : `new-${tab.id}`)
const tabTitle = (tab: Tab) => (tab.kind === 'project' ? tab.project.title : 'New tab')

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** null until mounted, then whether the media query matches. */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState<boolean | null>(null)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])
  return matches
}

/** True while the element is on screen and the tab is visible. */
function useActive(ref: RefObject<HTMLElement | null>) {
  const [onScreen, setOnScreen] = useState(false)
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting))
    io.observe(el)
    const onVis = () => setVisible(document.visibilityState === 'visible')
    onVis()
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [ref])
  return onScreen && visible
}

/** The current time, ticking once a second only while `active`. Null until mounted. */
function useClock(active: boolean) {
  const [time, setTime] = useState<Date | null>(null)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the time must not be baked into the static HTML
    setTime(new Date())
    if (!active) return
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [active])
  return time
}

// ── New Tab page ──────────────────────────────────────────────────────────────
const FUN_FACTS = [
  'Represented Australia at the WCA World Championships twice.',
  'Silver medalist at the 2025 QLD Speedcubing State Championships.',
  'Runs speedcubing.org.au as Website Coordinator for Speedcubing Australia.',
  '2022 IDA Honourable Mention for the McR ESG Web Project.',
]

const SHORTCUTS = [
  { label: 'Work',   href: '/work/' },
  { label: 'About',  href: '/about/' },
  { label: 'GitHub', href: 'https://github.com/ando527' },
  { label: 'Cubing', href: 'https://www.worldcubeassociation.org/persons/2022ANDE01' },
]

function NewTabPage({ compact = false }: { compact?: boolean }) {
  const ref                   = useRef<HTMLDivElement>(null)
  const active                = useActive(ref)
  const time                  = useClock(active)
  const [factIdx, setFactIdx] = useState(0)

  // A random fact per new tab; "Another fact" steps through the rest. (They
  // change on request rather than on a timer, so nothing updates by itself.)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- random per visit, so picked after hydration
    setFactIdx(Math.floor(Math.random() * FUN_FACTS.length))
  }, [])

  const h        = time ? time.getHours() : 12
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const timeStr  = time ? time.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : ''
  const dateStr  = time ? time.toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' }) : ''

  return (
    <div ref={ref} className={`h-full flex flex-col items-center justify-center bg-paper ${compact ? 'px-5 py-5 gap-5' : 'px-8 py-10 gap-8'}`}>

      {/* Clock + greeting */}
      <div className="text-center">
        <div className={`font-mono font-medium leading-none text-fg tabular-nums ${compact ? 'text-5xl min-h-12' : 'text-6xl min-h-16'}`}>
          {timeStr}
        </div>
        <p className={`font-sans text-fg-3 mt-3 min-h-5 ${compact ? 'text-xs' : 'text-sm'}`}>{dateStr}</p>
        <p className={`font-heading font-medium text-fg mt-2 ${compact ? 'text-base' : 'text-xl'}`}>{greeting}</p>
      </div>

      {/* Shortcuts */}
      <div className={compact ? 'grid grid-cols-2 gap-2 w-full max-w-48' : 'flex items-center gap-3'}>
        {SHORTCUTS.map(s => (
          <Link
            prefetch={false}
            key={s.label}
            href={s.href}
            className="inline-flex items-center justify-center h-10 min-w-20 px-4 rounded-[10px] border border-line bg-card font-sans text-sm font-medium text-fg-2 hover:text-fg hover:border-line-strong hover:bg-raised transition-[background-color,border-color,color] duration-150 ease-spec motion-reduce:transition-none"
          >
            {s.label}
          </Link>
        ))}
      </div>

      {/* Fun fact: fixed height prevents layout shift when it changes */}
      <div className={`text-center flex flex-col items-center ${compact ? 'max-w-56' : 'max-w-sm'}`}>
        <p
          aria-live="polite"
          className={`font-sans text-xs leading-4 text-fg-2 ${compact ? 'min-h-12' : 'min-h-10'}`}
        >
          {FUN_FACTS[factIdx]}
        </p>
        <button
          type="button"
          onClick={() => setFactIdx(i => (i + 1) % FUN_FACTS.length)}
          className="mt-1 inline-flex items-center gap-1.5 min-h-8 px-3 rounded-md font-sans text-xs font-medium text-accent hover:bg-raised transition-colors duration-150 ease-spec motion-reduce:transition-none"
        >
          Another fact
          <svg aria-hidden className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Mini case study ───────────────────────────────────────────────────────────
function MiniCaseStudy({ project, imageSizes }: { project: FeaturedProject; imageSizes: string }) {
  return (
    <div className="min-h-full bg-card">
      <div className="w-full aspect-[16/5] bg-raised overflow-hidden">
        {project.hero
          ? <img
              src={project.hero.src}
              srcSet={project.hero.srcSet}
              sizes={imageSizes}
              width={project.hero.width}
              height={project.hero.height}
              alt=""
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          : <div className="w-full h-full flex items-center justify-center">
              <span className="font-heading font-medium text-8xl text-fg-3/30 select-none">{project.title.charAt(0)}</span>
            </div>
        }
      </div>
      <div className="max-w-2xl mx-auto px-5 py-5">
        {project.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2 mb-3" aria-label="Tags">
            {project.tags.map(tag => (
              <li key={tag} className="eyebrow text-fg-2 bg-raised px-2 py-0.5 rounded-md">{tag}</li>
            ))}
          </ul>
        )}
        <h3 className="font-heading font-medium text-xl leading-7 text-fg mb-1">{project.title}</h3>
        {project.dateLabel && <p className="split mb-3">{project.dateLabel}</p>}
        {/* The preview sections replace the summary here. The summary is the case study's intro, so repeating it on the homepage duplicates that page's text. */}
        {project.preview.length === 0 && <p className="font-sans text-sm text-fg-2 leading-5 mb-5">{project.summary}</p>}
        {project.preview.length > 0 && (
          <div className="space-y-4 border-t border-line pt-5">
            {project.preview.map(({ heading, body }) => (
              <div key={heading}>
                <h4 className="font-heading font-medium text-sm leading-5 text-fg mb-1">{heading}</h4>
                <p className="font-sans text-sm text-fg-2 leading-5">{body}</p>
              </div>
            ))}
          </div>
        )}
        <div className="mt-6 pt-4 border-t border-line">
          <Link prefetch={false} href={`/work/${project.slug}/`} className="group inline-flex items-center gap-2 py-1 font-sans text-sm font-medium text-accent hover:text-accent-hover transition-colors duration-150 ease-spec motion-reduce:transition-none">
            View full case study<span className="sr-only">: {project.title}</span>
            <span aria-hidden className="transition-transform duration-150 ease-spec group-hover:translate-x-0.5 motion-reduce:transition-none">→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── Closed tabs (shared by the desktop window and the phone) ──────────────────
type ClosedEntry = { tab: Tab; index: number; scroll: number }

const MAX_CLOSED    = 8
const NEW_TAB_ICON  = '/images/ma-logo.svg'
const tabIcon       = (tab: Tab) => (tab.kind === 'project' ? tab.project.favicon || undefined : NEW_TAB_ICON)
const toItem        = (tab: Tab): ChromeItem => ({ key: tabKey(tab), title: tabTitle(tab), favicon: tabIcon(tab) })

/** A polite live region for "Closed…", "Reopened…". Present (empty) in the server HTML so it is announced reliably. */
function useAnnouncer() {
  const [msg, setMsg] = useState({ text: '', n: 0 })
  const say = (text: string) => setMsg(m => ({ text, n: m.n + 1 }))
  const region = (
    <div role="status" aria-live="polite" className="sr-only">
      <span key={msg.n}>{msg.text}</span>
    </div>
  )
  return [say, region] as const
}

// ── Desktop Chrome ────────────────────────────────────────────────────────────
let tabCounter = 0

function DesktopBrowser({ projects }: { projects: FeaturedProject[] }) {
  const [tabs, setTabs]           = useState<Tab[]>(() => projects.slice(0, 4).map(p => ({ kind: 'project', project: p })))
  const [closed, setClosed]       = useState<ClosedEntry[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const [say, status]             = useAnnouncer()
  const scrollRef                 = useRef<HTMLDivElement>(null)
  const layerRef                  = useRef<HTMLDivElement>(null)
  const historyBtnRef             = useRef<HTMLButtonElement>(null)
  const plusBtnRef                = useRef<HTMLButtonElement>(null)
  const tabRefs                   = useRef<(HTMLButtonElement | null)[]>([])
  const wrapRefs                  = useRef<Record<string, HTMLElement | null>>({})
  const scrollPositions           = useRef<Record<number, number>>({})
  // A tab that has just been added or reopened: where it came from, and whether to focus it.
  const entering                  = useRef<{ key: string; from: DOMRect | null; focus: boolean } | null>(null)

  // Once a reopened tab is in the DOM, grow it in from its source and (for
  // keyboard routes) move focus to it. The state change has already happened.
  useLayoutEffect(() => {
    const p = entering.current
    if (!p) return
    entering.current = null
    const el = wrapRefs.current[p.key]
    if (el && p.from) flyTabFrom(el, p.from)
    if (p.focus) tabRefs.current[tabs.findIndex(t => tabKey(t) === p.key)]?.focus()
  }, [tabs])

  if (tabs.length === 0) return null
  const activeTab = tabs[activeIdx]

  const switchTab = (i: number) => {
    if (scrollRef.current) scrollPositions.current[activeIdx] = scrollRef.current.scrollTop
    setActiveIdx(i)
    requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollPositions.current[i] ?? 0 })
  }

  /** Put a tab in at position `at`, select it, and restore its scroll position. */
  const insertTab = (tab: Tab, at: number, scroll = 0) => {
    const j = Math.max(0, Math.min(at, tabs.length))
    if (scrollRef.current) scrollPositions.current[activeIdx] = scrollRef.current.scrollTop
    const np: Record<number, number> = {}
    Object.entries(scrollPositions.current).forEach(([k, v]) => { const ki = Number(k); np[ki < j ? ki : ki + 1] = v })
    np[j] = scroll
    scrollPositions.current = np
    setTabs([...tabs.slice(0, j), tab, ...tabs.slice(j)])
    setActiveIdx(j)
    requestAnimationFrame(() => { if (scrollRef.current) scrollRef.current.scrollTop = scroll })
  }

  const addNewTab = () => {
    const tab = { kind: 'new' as const, id: ++tabCounter }
    entering.current = { key: tabKey(tab), from: plusBtnRef.current?.getBoundingClientRect() ?? null, focus: false }
    insertTab(tab, tabs.length)
  }

  const closeTab = (i: number) => {
    if (tabs.length === 1) return
    const tab  = tabs[i]
    const key  = tabKey(tab)
    // Measured before the DOM changes, for the animation only.
    const from   = wrapRefs.current[key]?.getBoundingClientRect()
    const to     = historyBtnRef.current?.getBoundingClientRect()
    const layer  = layerRef.current
    const scroll = i === activeIdx ? (scrollRef.current?.scrollTop ?? 0) : (scrollPositions.current[i] ?? 0)

    const next = tabs.filter((_, idx) => idx !== i)
    const np: Record<number, number> = {}
    Object.entries(scrollPositions.current).forEach(([k, v]) => {
      const ki = Number(k); if (ki < i) np[ki] = v; else if (ki > i) np[ki - 1] = v
    })
    scrollPositions.current = np
    setTabs(next)
    setClosed(c => [{ tab, index: i, scroll }, ...c.filter(e => tabKey(e.tab) !== key)].slice(0, MAX_CLOSED))
    say(`Closed ${tabTitle(tab)}`)
    const nextActive = Math.min(i <= activeIdx ? Math.max(activeIdx - (i < activeIdx ? 1 : 0), 0) : activeIdx, next.length - 1)
    setActiveIdx(nextActive)
    requestAnimationFrame(() => tabRefs.current[nextActive]?.focus())

    if (from && to && layer) {
      flyTabToHistory({ layer, from, to, title: tabTitle(tab), favicon: tabIcon(tab), selected: i === activeIdx })
      pulse(historyBtnRef.current, 300)
    }
  }

  const reopen = (key: string, from: DOMRect | null, focus: boolean) => {
    const entry = closed.find(e => tabKey(e.tab) === key)
    if (!entry) return
    setClosed(c => c.filter(e => e !== entry))
    entering.current = { key, from, focus }
    insertTab(entry.tab, entry.index, entry.scroll)
    say(`Reopened ${tabTitle(entry.tab)}`)
  }

  // Ctrl/Cmd+Shift+T reopens the last closed tab, only while focus is inside
  // this window. (Most browsers keep that shortcut for themselves, so the
  // history menu is the route that always works.)
  const onWindowKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && !e.altKey && e.key.toLowerCase() === 't' && closed.length > 0) {
      e.preventDefault()
      reopen(tabKey(closed[0].tab), historyBtnRef.current?.getBoundingClientRect() ?? null, true)
    }
  }

  // Arrow keys move between tabs and Delete closes one (WAI-ARIA tabs pattern).
  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === 'Delete' && tabs.length > 1) {
      e.preventDefault()
      closeTab(i)
      return
    }
    const last = tabs.length - 1
    const target =
      e.key === 'ArrowRight' ? (i === last ? 0 : i + 1) :
      e.key === 'ArrowLeft'  ? (i === 0 ? last : i - 1) :
      e.key === 'Home'       ? 0 :
      e.key === 'End'        ? last : null
    if (target === null) return
    e.preventDefault()
    switchTab(target)
    tabRefs.current[target]?.focus()
  }

  const urlSlug = activeTab.kind === 'project' ? activeTab.project.slug : 'new-tab'
  const panelId = 'browser-panel'
  const layoutKey = tabs.map(tabKey).join()

  return (
    // The shortcut listener only sees keys pressed while focus is inside the window.
    <div className="relative rounded-2xl overflow-hidden border border-d-line-strong bg-d-deep shadow-float" onKeyDown={onWindowKeyDown}>
      <div className="on-dark bg-d-card h-11 flex items-center px-4 gap-3 select-none">
        <TrafficLights />
        <div className="flex-1 max-w-sm mx-auto">
          <div className="bg-d-raised rounded-lg h-7 flex items-center justify-center gap-1.5 px-3">
            <svg aria-hidden className="w-3 h-3 text-d-fg-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="font-sans text-xs text-d-fg-2 truncate">
              {activeTab.kind === 'new' ? 'New tab' : `mitchellanderson.com.au/work/${urlSlug}`}
            </span>
          </div>
        </div>
        <HistoryMenu
          items={closed.map(e => toItem(e.tab))}
          buttonRef={historyBtnRef}
          onReopen={(key, rect) => reopen(key, rect, true)}
        />
      </div>
      <div className="on-dark bg-d-deep flex items-end px-2 pt-2 gap-0.5 select-none overflow-x-auto overflow-y-hidden scrollbar-none">
        <div role="tablist" aria-label="Featured projects" className="flex items-end gap-0.5">
          {tabs.map((tab, i) => {
            const selected = i === activeIdx
            const key = tabKey(tab)
            return (
              <motion.div
                key={key}
                ref={el => { wrapRefs.current[key] = el }}
                layout="position"
                layoutDependency={layoutKey}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative flex-shrink-0 min-w-28 max-w-48 rounded-t-lg transition-colors duration-150 ease-spec motion-reduce:transition-none ${
                  selected ? 'bg-card -mb-px z-10' : 'bg-d-card hover:bg-d-raised'
                }`}
              >
                <button
                  ref={el => { tabRefs.current[i] = el }}
                  role="tab"
                  id={`browser-tab-${key}`}
                  aria-selected={selected}
                  aria-controls={panelId}
                  aria-keyshortcuts={tabs.length > 1 ? 'Delete' : undefined}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => switchTab(i)}
                  onKeyDown={e => onTabKeyDown(e, i)}
                  className={`flex w-full items-center gap-2 pl-3 pr-8 py-2 text-xs font-sans font-medium rounded-t-lg focus-visible:outline-offset-[-3px] ${
                    selected ? 'text-fg focus-visible:outline-accent' : 'text-d-fg-2 group-hover:text-d-fg'
                  }`}
                >
                  {/* React preloads every eager <img> in the server HTML; low priority
                      keeps the background tabs' favicons out of that, so only the
                      selected tab's competes with the hero. */}
                  {tab.kind === 'project' && tab.project.favicon
                    ? <img src={tab.project.favicon} alt="" width={12} height={12} fetchPriority={selected ? undefined : 'low'} className="w-3 h-3 rounded-sm flex-shrink-0 object-cover" />
                    : tab.kind === 'new'
                      ? <img src="/images/ma-logo.svg" alt="" width={12} height={12} className="w-3 h-3 rounded-sm flex-shrink-0 object-cover" />
                      : <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${selected ? 'bg-accent' : 'bg-d-fg-3'}`} />
                  }
                  <span className="truncate flex-1 text-left">{tabTitle(tab)}</span>
                </button>
                {/* A tablist may only contain tabs, so the × is a pointer
                    shortcut hidden from assistive tech; keyboard and screen
                    reader users close a tab with Delete (aria-keyshortcuts). */}
                {tabs.length > 1 && (
                  <span
                    aria-hidden
                    onClick={() => closeTab(i)}
                    title={`Close ${tabTitle(tab)} tab`}
                    className={`absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md flex items-center justify-center text-xs leading-none cursor-default transition-[color,background-color,opacity] duration-150 ease-spec motion-reduce:transition-none ${
                      selected
                        ? 'text-fg-3 hover:bg-raised hover:text-fg'
                        : 'text-d-fg-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-d-line-strong'
                    }`}
                  >
                    ×
                  </span>
                )}
              </motion.div>
            )
          })}
        </div>
        <button ref={plusBtnRef} onClick={addNewTab} aria-label="Open a new tab"
          className="mb-0.5 ml-1 w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-md text-d-fg-3 hover:text-d-fg hover:bg-d-raised active:scale-[0.98] transition-[color,background-color,transform] duration-150 ease-spec motion-reduce:transition-none font-sans text-base"
        ><span aria-hidden>+</span></button>
        <div className="flex-1 min-w-0" />
      </div>
      <div
        ref={scrollRef}
        id={panelId}
        role="tabpanel"
        aria-labelledby={`browser-tab-${tabKey(activeTab)}`}
        tabIndex={0}
        className="h-[520px] overflow-y-auto overscroll-contain bg-card focus-visible:outline-accent focus-visible:outline-offset-[-4px]"
      >
        {activeTab.kind === 'project'
          ? <MiniCaseStudy project={activeTab.project} imageSizes="(min-width: 1152px) 1104px, 96vw" />
          : <NewTabPage />}
      </div>
      {status}
      {/* Closing-tab ghosts fly across this overlay; it never takes input. */}
      <div ref={layerRef} aria-hidden className="pointer-events-none absolute inset-0 z-50 overflow-hidden" />
    </div>
  )
}

// ── Mobile Phone ──────────────────────────────────────────────────────────────
let mobileTabCounter = 0

// ── Swipeable tab card ────────────────────────────────────────────────────────
function TabCard({ tab, i, isActive, highlighted = false, canClose, onOpen, onClose }: {
  tab: Tab
  i: number
  isActive: boolean
  highlighted?: boolean
  canClose: boolean
  onOpen: () => void
  onClose: () => void
}) {
  const x       = useMotionValue(0)
  const opacity = useTransform(x, [-110, -60, 0, 60, 110], [0, 0.5, 1, 0.5, 0])
  const rotate  = useTransform(x, [-110, 0, 110], [-7, 0, 7])

  const handleDragEnd = (_: PointerEvent, info: PanInfo) => {
    if (canClose && Math.abs(info.offset.x) > 70) {
      onClose()
    } else {
      animate(x, 0, { duration: 0.2, ease: [0.22, 1, 0.36, 1] })
    }
  }

  const hero = tab.kind === 'project' ? tab.project.hero : undefined

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.88, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1], delay: i * 0.04 }}
    >
      <motion.div
        drag={canClose ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        style={{ x, opacity, rotate, touchAction: 'pan-y' }}
        className={`relative w-full rounded-xl overflow-hidden border-2 ${highlighted || isActive ? 'border-accent-on-dark' : 'border-transparent'}`}
      >
        <button type="button" onClick={onOpen} className="block w-full text-left" aria-label={`Open ${tabTitle(tab)}`}>
          <div className="aspect-[4/3] bg-d-raised overflow-hidden">
            {hero
              ? <img src={hero.src} srcSet={hero.srcSet} sizes="140px" width={hero.width} height={hero.height} alt="" className="w-full h-full object-cover object-top" loading="lazy" decoding="async" draggable={false} />
              : <div className="w-full h-full bg-paper flex items-center justify-center">
                  <img src="/images/ma-logo.svg" alt="" width={28} height={28} className="w-7 h-7" />
                </div>
            }
          </div>
          <div className="bg-d-raised pl-2 pr-7 py-1.5 flex items-center gap-1.5 min-w-0">
            {tab.kind === 'project' && tab.project.favicon
              ? <img src={tab.project.favicon} alt="" width={12} height={12} className="w-3 h-3 rounded-sm flex-shrink-0 object-cover" loading="lazy" />
              : <img src="/images/ma-logo.svg"  alt="" width={12} height={12} className="w-3 h-3 rounded-sm flex-shrink-0" />
            }
            <span className="font-sans text-d-fg text-xs truncate flex-1 text-left leading-none">
              {tabTitle(tab)}
            </span>
          </div>
        </button>
        {canClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${tabTitle(tab)} tab`}
            className="absolute right-0.5 bottom-0 w-7 h-7 flex items-center justify-center text-d-fg-3 hover:text-d-fg text-sm leading-none transition-colors duration-150 ease-spec motion-reduce:transition-none"
          >
            <span aria-hidden>×</span>
          </button>
        )}
      </motion.div>
    </motion.div>
  )
}

function MobilePhone({ projects }: { projects: FeaturedProject[] }) {
  const rootRef                   = useRef<HTMLDivElement>(null)
  const active                    = useActive(rootRef)
  const time                      = useClock(active)
  const [tabs, setTabs]           = useState<Tab[]>(() => projects.slice(0, 4).map(p => ({ kind: 'project', project: p })))
  const [activeIdx, setActiveIdx] = useState(0)
  const [view, setView]           = useState<PhoneView>('tabs')
  const [isOff, setIsOff]         = useState(false)
  const [volumeLevel, setVolumeLevel] = useState(75)
  const [showVolume, setShowVolume]   = useState(false)
  const volumeTimer                   = useRef<ReturnType<typeof setTimeout>>(undefined)
  const scrollRef                     = useRef<HTMLDivElement>(null)
  const scrollTimerRef                = useRef<ReturnType<typeof setTimeout>>(undefined)
  // 0=none  1=tabs-highlight  2=scroll-highlight  3=tab-btn-highlight
  const [tooltipStep, setTooltipStep] = useState(0)

  // Closed tabs come back from the history panel in the tab switcher.
  const [closed, setClosed]           = useState<ClosedEntry[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [say, status]                 = useAnnouncer()
  const historyBtnRef                 = useRef<HTMLButtonElement>(null)

  // ── Real device status ────────────────────────────────────────────────────
  const [battery, setBattery]         = useState<{ level: number; charging: boolean } | null>(null)
  const [connType, setConnType]       = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let bat: any = null
    const updateBattery = () => { if (bat && !cancelled) setBattery({ level: bat.level, charging: bat.charging }) }
    // Battery Status API (Chrome/Android; not available on iOS Safari)
    if ('getBattery' in navigator) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(navigator as any).getBattery().then((b: any) => {
        if (cancelled) return
        bat = b
        updateBattery()
        bat.addEventListener('levelchange', updateBattery)
        bat.addEventListener('chargingchange', updateBattery)
      }).catch(() => {})
    }
    // Network Information API (Chrome/Android; not available on iOS Safari)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const conn = (navigator as any).connection
    const updateConn = () => setConnType(conn.effectiveType ?? conn.type ?? null)
    if (conn) {
      updateConn()
      conn.addEventListener('change', updateConn)
    }
    return () => {
      cancelled = true
      if (bat) {
        bat.removeEventListener('levelchange', updateBattery)
        bat.removeEventListener('chargingchange', updateBattery)
      }
      if (conn) conn.removeEventListener('change', updateConn)
    }
  }, [])

  useEffect(() => () => clearTimeout(volumeTimer.current), [])
  useEffect(() => () => clearTimeout(scrollTimerRef.current), [])

  // ── First-time tooltip: only show if user hasn't completed the tour yet ──
  useEffect(() => {
    try { if (localStorage.getItem('ma_tooltip_v1')) return } catch {}
    const t = setTimeout(() => setTooltipStep(1), 900)
    return () => clearTimeout(t)
  }, [])

  const timeStr = time ? time.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: false }) : ''
  const dateStr = time ? time.toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' }) : ''

  const activeTab = tabs[activeIdx]
  const urlSlug   = activeTab?.kind === 'project' ? activeTab.project.slug : ''
  const urlText   = activeTab?.kind === 'new' ? 'New tab' : `mitchellanderson.com.au/work/${urlSlug}`

  const openTab = (i: number) => {
    setActiveIdx(i)
    setView('browser')
    if (tooltipStep === 1) setTooltipStep(2)
  }

  const completeTooltip = () => {
    try { localStorage.setItem('ma_tooltip_v1', '1') } catch {}
    setTooltipStep(0)
  }

  const goToTabs = () => {
    setView('tabs')
    if (tooltipStep === 3) completeTooltip()       // completed the tour
    else if (tooltipStep === 2) setTooltipStep(1)  // went back before scrolling
  }

  const closeTab = (i: number) => {
    if (tabs.length === 1) return
    const tab  = tabs[i]
    const next = tabs.filter((_, idx) => idx !== i)
    setTabs(next)
    setActiveIdx(prev => Math.min(prev, next.length - 1))
    setClosed(c => [{ tab, index: i, scroll: 0 }, ...c.filter(e => tabKey(e.tab) !== tabKey(tab))].slice(0, MAX_CLOSED))
    say(`Closed ${tabTitle(tab)}`)
    pulse(historyBtnRef.current, 150)
  }

  const addTab = () => {
    const next = [...tabs, { kind: 'new' as const, id: ++mobileTabCounter }]
    setTabs(next); setActiveIdx(next.length - 1); setView('browser')
  }

  /** Put a closed tab back where it was and show it. */
  const reopen = (key: string) => {
    const entry = closed.find(e => tabKey(e.tab) === key)
    if (!entry) return
    const j = Math.min(entry.index, tabs.length)
    setClosed(c => c.filter(e => e !== entry))
    setTabs([...tabs.slice(0, j), entry.tab, ...tabs.slice(j)])
    setActiveIdx(j)
    setView('browser')
    setHistoryOpen(false)
    say(`Reopened ${tabTitle(entry.tab)}`)
  }

  const nudgeVolume = (delta: number) => {
    setVolumeLevel(v => Math.max(0, Math.min(100, v + delta)))
    setShowVolume(true)
    clearTimeout(volumeTimer.current)
    volumeTimer.current = setTimeout(() => setShowVolume(false), 1600)
  }

  return (
    <div ref={rootRef} className="relative" style={{ width: 'min(288px, calc(100vw - 32px))', margin: '0 auto' }}>

      {/* Hardware buttons are part of the illustration: decorative, out of the tab order */}
      <button
        onClick={() => nudgeVolume(10)}
        tabIndex={-1}
        aria-hidden
        className="absolute rounded-l-sm bg-d-raised"
        style={{ left: -4, top: 72, width: 4, height: 32 }}
      />
      <button
        onClick={() => nudgeVolume(-10)}
        tabIndex={-1}
        aria-hidden
        className="absolute rounded-l-sm bg-d-raised"
        style={{ left: -4, top: 116, width: 4, height: 32 }}
      />
      <button
        onClick={() => setIsOff(o => !o)}
        tabIndex={-1}
        aria-hidden
        className="absolute rounded-r-sm bg-d-raised"
        style={{ right: -4, top: 108, width: 4, height: 48 }}
      />

      {/* Phone body */}
      <div
        className="rounded-[32px] p-2.5 bg-d-card border border-d-line-strong shadow-float"
        style={{ height: 'min(calc(100dvh - 90px), 620px)' }}
      >
        {/* Screen: 32px outer minus 10px bezel = 22px, within 1px of the border */}
        <div className="relative rounded-[22px] overflow-hidden h-full flex flex-col bg-card select-none">

          {status}

          {/* Punch-hole camera lens */}
          <div aria-hidden className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none" style={{ top: 11 }}>
            <div className="rounded-full bg-d-deep" style={{ width: 12, height: 12 }} />
          </div>

          {/* Volume HUD */}
          <AnimatePresence>
            {showVolume && (
              <motion.div
                aria-hidden
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{    opacity: 0, y: -6 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="absolute z-[45] rounded-xl flex items-center gap-2 px-3 py-2 bg-d-raised text-d-fg"
                style={{ top: 40, left: 12, minWidth: 128 }}
              >
                {/* Speaker icon */}
                <svg className="w-3.5 h-3.5 text-d-fg flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  {volumeLevel === 0
                    ? <path d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                    : <>
                        <path d="M11.536 3.464a5 5 0 010 7.072M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        {volumeLevel > 40 && <path d="M15.536 8.464a5 5 0 010 7.072" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>}
                        {volumeLevel > 70 && <path d="M18.364 5.636a9 9 0 010 12.728" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>}
                      </>
                  }
                </svg>
                {/* Volume bar */}
                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-d-line-strong">
                  <div className="h-full rounded-full bg-d-fg" style={{ width: `${volumeLevel}%` }} />
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
                aria-label="Wake the phone"
                className="on-dark absolute inset-0 z-40 bg-d-deep flex flex-col items-center justify-center w-full cursor-pointer"
              >
                <p className="font-sans text-d-fg-3 text-xs">{dateStr}</p>
                <p className="font-mono font-medium text-d-fg leading-none tabular-nums mt-2 text-6xl">{timeStr}</p>
                <p className="font-sans text-d-fg-3 text-xs mt-8">Tap to wake</p>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Status bar */}
          <div
            aria-hidden
            className={`flex-shrink-0 flex items-center justify-between px-5 z-10 ${view === 'tabs' ? 'bg-d-card text-d-fg' : 'bg-card text-fg'}`}
            style={{ paddingTop: 13, paddingBottom: 5 }}
          >
            <span className="font-sans font-medium text-xs tabular-nums min-w-10">{timeStr}</span>
            <div className="flex items-center gap-1" style={{ opacity: 0.65 }}>
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
                <div className="flex items-center gap-0.5">
                  <span className="font-sans font-medium text-xs leading-none tabular-nums">
                    {Math.round(battery.level * 100)}%
                  </span>
                  {battery.charging && (
                    <svg width="5" height="9" viewBox="0 0 5 9" fill="none">
                      <path d="M3 0L0 4.5H2.2L1.5 9L5 4.5H2.8L3 0Z" fill="currentColor"/>
                    </svg>
                  )}
                  <svg width="24" height="12" viewBox="0 0 24 12" fill="none" style={{ marginLeft: 3 }}>
                    <rect x="0.6" y="0.6" width="20" height="10.8" rx="2.4" stroke="currentColor" strokeWidth="1.2"/>
                    <rect x="21" y="3.5" width="2.4" height="5" rx="1.2" fill="currentColor" opacity="0.5"/>
                    <rect
                      x="2.2" y="2.2"
                      width={Math.max(1, battery.level * 15)}
                      height="7.6" rx="1.4"
                      fill={battery.charging ? '#4CC38A' : battery.level < 0.2 ? '#E5484D' : 'currentColor'}
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
                  onKeyDown={e => {
                    if (e.key === 'Escape' && historyOpen) { setHistoryOpen(false); historyBtnRef.current?.focus() }
                  }}
                  className="on-dark absolute inset-0 overflow-y-auto overscroll-contain bg-d-card text-d-fg flex flex-col"
                >
                  {/* Header bar — dimmed during step 1 */}
                  <div className="relative flex items-center justify-between px-4 pt-2 pb-3 sticky top-0 bg-d-card z-10">
                    <span className="font-sans font-medium text-d-fg text-sm">
                      {tabs.length} {tabs.length === 1 ? 'tab' : 'tabs'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        ref={historyBtnRef}
                        type="button"
                        aria-expanded={historyOpen}
                        aria-controls="phone-history"
                        aria-label={closed.length > 0 ? `Recently closed tabs (${closed.length})` : 'Recently closed tabs'}
                        onClick={() => setHistoryOpen(o => !o)}
                        className="relative flex h-9 w-9 items-center justify-center rounded-md text-d-fg-2 transition-[color,background-color] duration-150 ease-spec hover:text-d-fg active:bg-d-raised aria-expanded:bg-d-raised aria-expanded:text-d-fg motion-reduce:transition-none"
                      >
                        <svg aria-hidden className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2" />
                        </svg>
                        {closed.length > 0 && (
                          <span aria-hidden className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-on-dark px-1 font-mono text-[11px] font-medium leading-none text-d-deep">
                            {closed.length}
                          </span>
                        )}
                      </button>
                      <button onClick={addTab} className="py-1 font-sans text-accent-on-dark text-sm font-medium active:opacity-60 transition-opacity duration-150 ease-spec">
                        New tab
                      </button>
                    </div>
                    {tooltipStep === 1 && (
                      <div className="absolute inset-0 bg-d-deep/70 pointer-events-none" />
                    )}
                  </div>

                  {/* Recently closed: a disclosure panel under the header */}
                  {historyOpen && (
                    <div id="phone-history" className="mx-3 mb-3 rounded-xl bg-d-raised p-2">
                      <p className="px-2 pb-1 pt-1 font-sans text-xs font-medium text-d-fg-3">Recently closed</p>
                      {closed.length === 0 ? (
                        <p className="px-2 pb-2 font-sans text-xs text-d-fg-2">No recently closed tabs</p>
                      ) : (
                        <ul className="mb-1">
                          {closed.map(e => (
                            <li key={tabKey(e.tab)}>
                              <button
                                type="button"
                                onClick={() => reopen(tabKey(e.tab))}
                                className="flex min-h-10 w-full items-center gap-2 rounded-lg px-2 text-left font-sans text-xs font-medium text-d-fg active:bg-d-card"
                              >
                                {tabIcon(e.tab)
                                  ? <img src={tabIcon(e.tab)} alt="" width={12} height={12} className="h-3 w-3 flex-shrink-0 rounded-sm object-cover" loading="lazy" />
                                  : <span aria-hidden className="h-3 w-3 flex-shrink-0 rounded-sm bg-d-fg-3" />}
                                <span className="truncate">Reopen {tabTitle(e.tab)}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 px-3 pb-4">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {tabs.map((tab, i) => {
                        const isHighlighted = tooltipStep === 1 && i === 0
                        return (
                          <motion.div
                            key={tabKey(tab)}
                            exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] } }}
                            className={`relative ${isHighlighted ? 'z-10 rounded-xl' : ''}`}
                          >
                            <TabCard
                              tab={tab}
                              i={i}
                              isActive={i === activeIdx}
                              highlighted={isHighlighted}
                              canClose={tabs.length > 1}
                              onOpen={() => openTab(i)}
                              onClose={() => closeTab(i)}
                            />
                            {/* Dim non-highlighted cards during step 1 */}
                            {tooltipStep === 1 && i !== 0 && (
                              <div className="absolute inset-0 bg-d-deep/70 rounded-xl pointer-events-none" />
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
                                  transition={{ delay: 0.35, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                  className="flex flex-col items-center"
                                >
                                  <div style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderBottom: '6px solid var(--accent-fill)' }} />
                                  <div className="bg-accent-fill text-on-accent font-sans font-medium text-xs px-3 py-2 rounded-lg whitespace-nowrap">
                                    Tap to open a project
                                  </div>
                                </motion.div>
                              </div>
                            )}
                          </motion.div>
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
                    className="flex-shrink-0 bg-card px-3 py-2 border-b border-line"
                  >
                    <div className="bg-raised rounded-[10px] h-9 flex items-center gap-1.5 px-3">
                      <svg aria-hidden className="w-3 h-3 text-fg-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      <div className="relative flex-1 min-w-0">
                        <span className="font-sans text-xs text-fg-2 truncate block">{urlText}</span>
                      </div>
                      <button onClick={addTab} aria-label="Open a new tab"
                        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md hover:bg-card active:bg-card transition-colors duration-150 ease-spec"
                      >
                        <svg aria-hidden className="w-3.5 h-3.5 text-fg-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                      <button onClick={goToTabs} aria-label={`Show all ${tabs.length} tabs`}
                        className="relative flex-shrink-0 w-6 h-6 rounded-md hover:bg-card border border-line-strong flex items-center justify-center active:bg-card transition-colors duration-150 ease-spec"
                      >
                        {/* Step 3: static blue ring around tab count button (no infinite loop = no flash) */}
                        <AnimatePresence>
                          {tooltipStep === 3 && (
                            <motion.span
                              key="tab-btn-ring"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="absolute rounded-lg pointer-events-none"
                              style={{ inset: -3, border: '2px solid var(--accent-fill)' }}
                            />
                          )}
                        </AnimatePresence>
                        <span aria-hidden className="font-sans font-medium text-xs text-fg-2 leading-none tabular-nums">{tabs.length}</span>
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
                        <div style={{ width: 0, height: 0, marginRight: 28, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderBottom: '6px solid var(--accent-fill)' }} />
                        <div className="bg-accent-fill text-on-accent font-sans font-medium text-xs px-3 py-1.5 rounded-lg whitespace-nowrap">
                          Browse other projects
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Content wrapper (relative so overlays can sit inside) */}
                  <div className="flex-1 relative overflow-hidden">
                    <motion.div
                      ref={scrollRef}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
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
                        ? <MiniCaseStudy project={activeTab.project} imageSizes="270px" />
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
                            style={{ border: '2px solid var(--accent-fill)' }}
                          />
                          <motion.div
                            key="scroll-label"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ delay: 0.15, duration: 0.22 }}
                            className="absolute top-3 inset-x-0 flex justify-center pointer-events-none z-20"
                          >
                            <div className="bg-accent-fill text-on-accent font-sans font-medium text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                              Scroll to read the case study
                              <svg aria-hidden className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
// Both versions are in the static HTML (CSS shows the right one before
// JavaScript runs). Once mounted, only the one that fits the screen stays
// mounted, so the hidden one isn't running clocks and animations.
export default function BrowserWindow({ projects }: { projects: FeaturedProject[] }) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  if (projects.length === 0) return null
  return (
    <MotionConfig reducedMotion="user">
      {isDesktop !== false && (
        <div className="hidden lg:block">
          <DesktopBrowser projects={projects} />
        </div>
      )}
      {isDesktop !== true && (
        <div className="lg:hidden flex justify-center py-4">
          <MobilePhone projects={projects} />
        </div>
      )}
    </MotionConfig>
  )
}
