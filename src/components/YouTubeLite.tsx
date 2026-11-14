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
      className="group relative h-full w-full overflow-hidden bg-d-deep focus-visible:outline-offset-[-4px]"
    >
      <img
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        alt=""
        width={480}
        height={360}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity duration-150 ease-spec group-hover:opacity-100 motion-reduce:transition-none"
      />
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-12 w-16 items-center justify-center rounded-lg bg-d-fg text-ink transition-colors duration-150 ease-spec group-hover:bg-white motion-reduce:transition-none">
          <svg aria-hidden viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
        </span>
      </span>
      <span className="sr-only text-d-fg">Play video: {title}</span>
    </button>
  )
}
