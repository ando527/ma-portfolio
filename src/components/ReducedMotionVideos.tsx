'use client'

import { useEffect } from 'react'

/**
 * Autoplaying videos inside case study content keep looping for everyone
 * else; for visitors who've asked their device for reduced motion they're
 * paused on load and given controls, so playing them is a choice.
 */
export default function ReducedMotionVideos() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      if (!mq.matches) return
      document.querySelectorAll<HTMLVideoElement>('.article-content video[autoplay]').forEach(v => {
        v.pause()
        v.removeAttribute('autoplay')
        v.controls = true
      })
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return null
}
