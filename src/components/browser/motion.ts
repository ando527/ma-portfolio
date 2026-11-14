// Small imperative animations for the home browser window. They use the Web
// Animations API on transform and opacity only, so they run on the compositor
// and never touch layout. Each one is purely cosmetic: callers change state
// first and animate afterwards, so nothing waits on an animation.

const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

export function prefersReducedMotion() {
  return typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

const centre = (r: DOMRect) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 })

/**
 * A tab that was just closed: a ghost of it shrinks and drops, as a small
 * title chip, toward the history button. `layer` is a non-interactive overlay
 * covering the window; the ghost is removed when it finishes.
 */
export function flyTabToHistory(opts: {
  layer: HTMLElement
  from: DOMRect
  to: DOMRect
  title: string
  favicon?: string
  selected: boolean
}) {
  if (prefersReducedMotion()) return
  const { layer, from, to, title, favicon, selected } = opts
  const lr = layer.getBoundingClientRect()
  const ghost = document.createElement('div')
  ghost.className =
    'absolute flex items-center gap-2 pl-3 pr-3 rounded-t-lg font-sans font-medium text-xs whitespace-nowrap overflow-hidden ' +
    (selected ? 'bg-card text-fg' : 'bg-d-raised text-d-fg')
  ghost.style.cssText =
    `left:${from.left - lr.left}px;top:${from.top - lr.top}px;width:${from.width}px;height:${from.height}px;` +
    'will-change:transform,opacity;transform-origin:50% 100%;'
  if (favicon) {
    const img = document.createElement('img')
    img.src = favicon
    img.alt = ''
    img.width = 12
    img.height = 12
    img.className = 'w-3 h-3 rounded-sm flex-shrink-0 object-cover'
    ghost.appendChild(img)
  }
  const label = document.createElement('span')
  label.className = 'truncate'
  label.textContent = title
  ghost.appendChild(label)
  layer.appendChild(ghost)

  const a = centre(from)
  const b = centre(to)
  const dx = b.x - a.x
  const dy = b.y - a.y
  const done = () => ghost.remove()
  const anim = ghost.animate(
    [
      { transform: 'translate(0px, 0px) scale(1)', opacity: 1, offset: 0 },
      { transform: 'translate(0px, 2px) scale(0.9, 0.82)', opacity: 1, offset: 0.3 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0, offset: 1 },
    ],
    { duration: 380, easing: EASE, fill: 'forwards' },
  )
  anim.onfinish = done
  anim.oncancel = done
  window.setTimeout(done, 700)
}

/** A reopened tab grows in from the history button or menu item it was reopened from. */
export function flyTabFrom(el: HTMLElement, from: DOMRect) {
  if (prefersReducedMotion()) return
  const to = el.getBoundingClientRect()
  const a = centre(from)
  const b = centre(to)
  el.animate(
    [
      { transform: `translate(${a.x - b.x}px, ${a.y - b.y}px) scale(0.45)`, opacity: 0 },
      { transform: 'translate(0px, 0px) scale(1)', opacity: 1 },
    ],
    { duration: 320, easing: EASE },
  )
}

/** A quick nudge on the history button when a closed tab lands in it. */
export function pulse(el: HTMLElement | null, delay = 0) {
  if (!el || prefersReducedMotion()) return
  el.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.2)', offset: 0.45 }, { transform: 'scale(1)' }],
    { duration: 260, delay, easing: EASE },
  )
}
