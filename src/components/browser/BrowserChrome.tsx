'use client'

import { useEffect, useRef, useState, type KeyboardEvent, type RefObject } from 'react'

// Pieces of the fake browser chrome on the home page: the window buttons and a
// recently-closed menu. The menu is part of the illustration but really works,
// so it carries the usual roles and keyboard behaviour. Colours come from the
// project's dark-ramp tokens (the window is always the dark ramp); only the
// window buttons are fixed on purpose.

export type ChromeItem = { key: string; title: string; favicon?: string }

/** Decorative window buttons, not clickable. d-fg-3 at 80% on the title bar is about 3.7:1. */
export function TrafficLights() {
  return (
    <div className="flex w-12 flex-shrink-0 items-center gap-1.5" aria-hidden>
      {[0, 1, 2].map(i => (
        <span key={i} className="h-3 w-3 rounded-full bg-d-fg-3/80" />
      ))}
    </div>
  )
}

function Favicon({ src }: { src?: string }) {
  return src
    ? <img src={src} alt="" width={12} height={12} loading="lazy" fetchPriority="low" className="h-3 w-3 flex-shrink-0 rounded-sm object-cover" />
    : <span aria-hidden className="h-3 w-3 flex-shrink-0 rounded-sm bg-d-fg-3" />
}

// ── Recently closed ───────────────────────────────────────────────────────────
const isMac = () => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

/** A history button that opens a menu of recently closed tabs, newest first. */
export function HistoryMenu({ items, buttonRef, onReopen }: {
  items: ChromeItem[]
  buttonRef: RefObject<HTMLButtonElement>
  onReopen: (key: string, rect: DOMRect) => void
}) {
  const [open, setOpen]  = useState(false)
  const wrapRef          = useRef<HTMLDivElement>(null)
  const menuRef          = useRef<HTMLDivElement>(null)
  const count            = items.length

  const menuItems = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])

  // Move focus into the menu when it opens.
  useEffect(() => {
    if (open) menuItems()[0]?.focus()
  }, [open])

  // A click or tap outside closes it.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  const close = (returnFocus: boolean) => {
    setOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }

  const onMenuKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const els = menuItems()
    const i = els.indexOf(document.activeElement as HTMLElement)
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); return }
    if (e.key === 'Tab') { close(true); return } // focus goes back to the button, then Tab carries on from there
    const target =
      e.key === 'ArrowDown' ? (i + 1) % els.length :
      e.key === 'ArrowUp'   ? (i <= 0 ? els.length - 1 : i - 1) :
      e.key === 'Home'      ? 0 :
      e.key === 'End'       ? els.length - 1 : null
    if (target === null) return
    e.preventDefault()
    els[target]?.focus()
  }

  const choose = (key: string, el: HTMLElement) => {
    const rect = el.getBoundingClientRect()
    setOpen(false)
    onReopen(key, rect)
  }

  const hint = isMac() ? '⌘⇧T' : 'Ctrl+Shift+T'
  const itemClass = 'flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left font-sans text-xs font-medium text-d-fg transition-colors duration-150 ease-spec hover:bg-d-card focus-visible:bg-d-card focus-visible:outline-offset-[-2px] motion-reduce:transition-none aria-disabled:cursor-default aria-disabled:text-d-fg-3 aria-disabled:hover:bg-transparent'

  return (
    <div ref={wrapRef} className="relative flex w-12 flex-shrink-0 justify-end">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="browser-history-menu"
        aria-keyshortcuts="Control+Shift+T Meta+Shift+T"
        aria-label={count > 0 ? `Recently closed tabs (${count})` : 'Recently closed tabs'}
        title="Recently closed tabs"
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => { if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true) } }}
        className="relative flex h-8 w-8 items-center justify-center rounded-md text-d-fg-2 transition-[color,background-color] duration-150 ease-spec hover:bg-d-raised hover:text-d-fg aria-expanded:bg-d-raised aria-expanded:text-d-fg motion-reduce:transition-none"
      >
        <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5M12 7v5l3 2" />
        </svg>
        {count > 0 && (
          <span aria-hidden className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-on-dark px-1 font-mono text-[11px] font-medium leading-none text-d-deep">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div
          ref={menuRef}
          id="browser-history-menu"
          role="menu"
          aria-label="Recently closed tabs"
          onKeyDown={onMenuKeyDown}
          className="on-dark absolute right-0 top-full z-40 mt-1.5 w-72 max-w-[80vw] rounded-xl border border-d-line-strong bg-d-raised p-1 shadow-float-dark"
        >
          <button
            type="button"
            role="menuitem"
            tabIndex={-1}
            aria-disabled={count === 0}
            aria-keyshortcuts="Control+Shift+T Meta+Shift+T"
            onClick={e => { if (count > 0) choose(items[0].key, e.currentTarget) }}
            className={`${itemClass} justify-between`}
          >
            <span>Reopen closed tab</span>
            <span aria-hidden className="font-mono text-[11px] text-d-fg-3">{hint}</span>
          </button>
          <div role="separator" className="mx-1 my-1 h-px bg-d-line-strong" />
          {count === 0 ? (
            <button type="button" role="menuitem" tabIndex={-1} aria-disabled="true" className={itemClass}>
              No recently closed tabs
            </button>
          ) : (
            <div role="group" aria-label="Recently closed">
              {items.map(it => (
                <button
                  key={it.key}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={e => choose(it.key, e.currentTarget)}
                  className={itemClass}
                >
                  <Favicon src={it.favicon} />
                  <span className="truncate">{it.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
