import { SITE } from '@/lib/site'
import { btnPrimary } from '@/components/ui/button'
import { AnimateIn } from '@/components/ui/animate-in'

/** "Let's talk." strip that sits above the footer on the homepage and service pages. */
export default function ContactStrip() {
  return (
    <section className="relative z-10 py-20 bg-background border-t border-maroon-100">
      <AnimateIn className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <h2 className="font-heading font-bold text-3xl text-foreground mb-1">
            Let&rsquo;s talk.
          </h2>
          <p className="font-sans text-muted-foreground">
            I&rsquo;m available for freelance work and collaborations.
          </p>
        </div>
        <a href={SITE.links.linkedin} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
          Reach out on LinkedIn
          <span aria-hidden>→</span>
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </AnimateIn>
    </section>
  )
}
