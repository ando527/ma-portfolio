import BrowserFrame from '@/components/BrowserFrame'
import type { ImageData } from '@/lib/types'

export interface StackItem {
  image: ImageData
  url?: string
}

// Up to three screenshots fanned like cards on a desk: the first one sits in
// front and straight, the others peek out behind it at an angle.
const POSITIONS = [
  'left-[14%] top-[16%] w-[72%] z-30',
  'left-0 top-[2%] w-[62%] z-20 -rotate-6 opacity-90',
  'right-0 top-[30%] w-[60%] z-10 rotate-[5deg] opacity-90',
]

export default function FrameStack({ items }: { items: StackItem[] }) {
  const shown = items.slice(0, 3)
  if (shown.length === 0) return null
  return (
    <div aria-hidden className="relative w-full aspect-[5/4] max-w-[560px] mx-auto lg:mr-0">
      {shown.map((item, i) => (
        <div key={i} className={`absolute ${POSITIONS[i]}`}>
          <BrowserFrame
            image={item.image}
            alt=""
            url={item.url}
            sizes="(min-width: 1024px) 400px, 70vw"
            imageClassName="aspect-[16/10] object-cover object-top"
          />
        </div>
      ))}
    </div>
  )
}
