'use client'

import { useState } from 'react'

/**
 * A YouTube video that costs nothing until it's played: a thumbnail and a
 * play button, swapped for the real player (privacy-enhanced domain) on click.
 */
export default function YouTubeLite({ id, title }: { id: string; title: string }) {
  const [playing, setPlaying] = useState(false)

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative w-full h-full overflow-hidden bg-black"
    >
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        width={480}
        height={360}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover opacity-90 transition-opacity duration-200 group-hover:opacity-100"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex items-center justify-center w-16 h-11 rounded-xl bg-[#c4302b] shadow-lg transition-transform duration-200 group-hover:scale-110 motion-reduce:group-hover:scale-100">
          <svg aria-hidden viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
        </span>
      </span>
      <span className="sr-only">Play video: {title}</span>
    </button>
  )
}
