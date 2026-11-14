// The site theme. `data-theme="light" | "dark"` on <html> is the single source
// of truth: the CSS reads it (globals.css), the map reads it (CompetitionMap),
// and the toggle reads and writes it here.
//
// Before first paint the inline script in layout.tsx sets it from
// localStorage['theme'], falling back to the system setting. Everything in this
// file survives storage being blocked (private windows, cleared site data).

export type Theme = 'light' | 'dark'

export const THEME_KEY = 'theme'

/** The theme currently on screen. */
export function getTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

/** The visitor's saved choice, or null when they have not made one. */
export function getStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

/** The theme the system asks for. */
export function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

let target: Theme | null = null
let running: { skipTransition: () => void } | null = null

/** The theme the page is heading for: the pending one while a change is queued. */
function heading(): Theme {
  return target ?? getTheme()
}

/**
 * Puts a theme on screen: sets data-theme, tells the rest of the page
 * (`themechange` on window, which the map listens for) and, when `persist` is
 * true, remembers it. This is the one place the DOM changes.
 *
 * With an `origin` (the toggle's centre) the change is a circular reveal: the
 * new theme grows out of that point (View Transitions, styled in globals.css
 * under [data-vt]). The state change happens inside the transition's callback,
 * a frame after the call, and never waits for the animation. Without the API,
 * with reduced motion, or without an origin (system change, first load) it
 * is an instant swap.
 */
export function applyTheme(next: Theme, origin?: { x: number; y: number }, persist = true): void {
  target = next
  const commit = () => {
    document.documentElement.dataset.theme = next
    if (persist) {
      try {
        localStorage.setItem(THEME_KEY, next)
      } catch {
        // Storage blocked: the choice lasts for this page view only.
      }
    }
    if (target === next) target = null
    window.dispatchEvent(new CustomEvent('themechange', { detail: next }))
  }

  const doc = document as Document & {
    startViewTransition?: (update: () => void) => {
      finished: Promise<void>
      skipTransition: () => void
    }
  }
  if (
    !origin ||
    typeof doc.startViewTransition !== 'function' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    commit()
    return
  }

  // A second toggle while one is still running: finish the first at once so
  // the two never stack (its state change still lands, in order).
  running?.skipTransition()

  const root = document.documentElement
  const w = window.innerWidth
  const h = window.innerHeight
  root.style.setProperty('--vt-x', `${origin.x}px`)
  root.style.setProperty('--vt-y', `${origin.y}px`)
  root.style.setProperty('--vt-r', `${Math.hypot(Math.max(origin.x, w - origin.x), Math.max(origin.y, h - origin.y))}px`)
  root.setAttribute('data-vt', '')

  try {
    const vt = doc.startViewTransition(commit)
    running = vt
    const done = () => {
      if (running === vt) {
        running = null
        root.removeAttribute('data-vt')
      }
    }
    vt.finished.then(done, done)
  } catch {
    root.removeAttribute('data-vt')
    commit()
  }
}

/** Switches to the other theme (counting one that is still being applied). */
export function toggleTheme(origin?: { x: number; y: number }): void {
  applyTheme(heading() === 'dark' ? 'light' : 'dark', origin)
}
