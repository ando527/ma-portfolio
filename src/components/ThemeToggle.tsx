'use client'

import { useEffect, useState } from 'react'
import { applyTheme, getStoredTheme, getSystemTheme, getTheme, toggleTheme } from '@/lib/theme'

// One button, two looks:
//  - 'icon' sits in the nav: a sun/moon with a 44px hit area and the name
//    "Dark mode" (the name never flips; aria-pressed says whether it is on).
//  - 'switch' sits in the footer: the same name as visible text, with a small
//    track and knob.
//
// The page is static HTML, so the server cannot know the theme. What is drawn
// (which icon, where the knob sits) therefore comes from CSS reading
// <html data-theme> (see .theme-toggle in globals.css), never from React state.
// Only aria-pressed is state, written after mount, and the end-of-body script
// in layout.tsx sets it before that, so assistive tech is not told "off" while
// the page is dark.

let watching = false

/** Without a saved choice, follow the system when it changes. Once, for all toggles. */
function followSystem() {
  if (watching) return
  watching = true
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (!getStoredTheme()) applyTheme(getSystemTheme(), undefined, false)
  })
}

export default function ThemeToggle({
  variant = 'icon',
  className = '',
}: {
  variant?: 'icon' | 'switch'
  className?: string
}) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const sync = () => setDark(getTheme() === 'dark')
    sync()
    followSystem()
    window.addEventListener('themechange', sync)
    return () => window.removeEventListener('themechange', sync)
  }, [])

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const box = event.currentTarget.getBoundingClientRect()
    toggleTheme({ x: box.left + box.width / 2, y: box.top + box.height / 2 })
  }

  // One drawing that morphs: a disc with a cut-out (the moon) whose cut slides
  // away and whose disc shrinks while eight rays grow and turn in (the sun).
  // All of it is CSS keyed on <html data-theme> (.theme-icon in globals.css).
  const icons = (
    <svg aria-hidden viewBox="0 0 24 24" className="theme-icon h-5 w-5">
      <mask id="theme-icon-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
        <rect width="24" height="24" fill="#fff" />
        <circle className="theme-icon-cut" cx="16" cy="8" r="7.5" fill="#000" />
      </mask>
      <g mask="url(#theme-icon-cut)">
        <circle className="theme-icon-disc" cx="12" cy="12" r="8.5" fill="currentColor" />
      </g>
      <g className="theme-icon-rays" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round">
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.28 5.28l1.42 1.42M17.3 17.3l1.42 1.42M5.28 18.72l1.42-1.42M17.3 6.7l1.42-1.42" />
      </g>
    </svg>
  )

  if (variant === 'switch') {
    return (
      <button
        type="button"
        data-theme-toggle
        aria-pressed={dark}
        onClick={toggle}
        suppressHydrationWarning
        className={`theme-toggle inline-flex items-center gap-2.5 py-1.5 ${className}`}
      >
        Dark mode
        <span aria-hidden className="theme-track">
          <span className="theme-knob" />
        </span>
      </button>
    )
  }

  return (
    <button
      type="button"
      data-theme-toggle
      aria-label="Dark mode"
      aria-pressed={dark}
      onClick={toggle}
      suppressHydrationWarning
      className={`theme-toggle flex h-11 w-9 min-[375px]:w-11 flex-shrink-0 items-center justify-center rounded-lg ${className}`}
    >
      {icons}
    </button>
  )
}
