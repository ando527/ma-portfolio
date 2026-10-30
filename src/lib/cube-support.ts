// Can this browser draw the contact form's small CSS 3D cube? If not, the cube
// is skipped and the form works without it (the cube is UX only; Turnstile is
// the real check). No imports, so `node --test` can run it as is.

export interface CubeSupportFacts {
  preserve3d: boolean
  perspective: boolean
  backfaceHidden: boolean
  /** A real element with a 3D transform came back as a matrix3d from the renderer. */
  transform3dApplied: boolean
  /** navigator.deviceMemory, where the browser reports it. */
  deviceMemoryGB?: number
}

export function cubeSupportFromFacts(f: CubeSupportFacts): boolean {
  if (!f.preserve3d || !f.perspective || !f.backfaceHidden || !f.transform3dApplied) return false
  return f.deviceMemoryGB === undefined || f.deviceMemoryGB >= 1
}

/** Renders an off-screen 3D-rotated element and checks the browser really applied a 3D transform. */
function probeTransform3d(): boolean {
  const parent = document.createElement('div')
  parent.setAttribute('aria-hidden', 'true')
  parent.style.cssText =
    'position:absolute;top:0;left:-200px;width:10px;height:10px;perspective:100px;visibility:hidden;pointer-events:none;overflow:hidden'
  const el = document.createElement('div')
  el.style.cssText = 'width:10px;height:10px;transform:rotateY(45deg)'
  parent.appendChild(el)
  try {
    document.body.appendChild(parent)
    return getComputedStyle(el).transform.startsWith('matrix3d')
  } finally {
    parent.remove()
  }
}

/** Gathers the facts in the browser. False on the server or if anything throws. */
export function detectCubeSupport(): boolean {
  if (typeof window === 'undefined' || typeof document === 'undefined') return false
  try {
    if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') return false
    const memory = (navigator as Navigator & { deviceMemory?: unknown }).deviceMemory
    return cubeSupportFromFacts({
      preserve3d: CSS.supports('transform-style', 'preserve-3d'),
      perspective: CSS.supports('perspective', '1px'),
      backfaceHidden: CSS.supports('backface-visibility', 'hidden'),
      transform3dApplied: probeTransform3d(),
      deviceMemoryGB: typeof memory === 'number' ? memory : undefined,
    })
  } catch {
    return false
  }
}
