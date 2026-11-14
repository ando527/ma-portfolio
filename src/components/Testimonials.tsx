import Link from 'next/link'
import { HOME_TESTIMONIALS, type HomeTestimonial } from '@/lib/testimonials'
import { AnimateIn } from '@/components/ui/animate-in'

const LINK = 'group inline-flex items-center gap-1.5 py-2 font-sans text-sm font-medium text-accent hover:text-accent-hover transition-colors duration-150 ease-spec motion-reduce:transition-none'
const LINK_TEXT = 'underline decoration-1 underline-offset-4'
const LINK_ARROW = 'transition-transform duration-150 ease-spec motion-reduce:transition-none'

/**
 * One review, set like a pull-quote. The first is the lead and runs the full
 * width; the others share a row at different widths (`span` is the column span
 * out of 12 on wide screens).
 */
function Testimonial({ t, lead, span }: { t: HomeTestimonial; lead?: boolean; span?: string }) {
  const { link } = t
  // Role and company on one line; reviews without a role say where they were left instead.
  const meta = t.role ? `${t.role}, ${t.company}` : [t.company, t.source].filter(Boolean).join(' · ')

  return (
    <AnimateIn className={lead ? undefined : `h-full ${span ?? ''}`}>
      <figure
        className={
          lead
            ? 'lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12'
            : 'flex h-full flex-col border-t border-line-strong pt-6'
        }
      >
        {/* The pull line repeats part of the quote, so screen readers skip it.
            The negative indent hangs the opening quote mark in the margin, so the
            letters line up with everything below. */}
        <p
          aria-hidden="true"
          className={`display mb-6 text-fg text-balance indent-[-0.42em] ${
            lead
              ? 'text-4xl sm:text-5xl lg:col-span-7 lg:row-span-2 lg:mb-0 lg:text-6xl lg:leading-[1.04] lg:tracking-[-0.03em]'
              : 'text-2xl md:text-3xl'
          }`}
        >
          &ldquo;{t.pull}&rdquo;
        </p>

        <blockquote className={`max-w-[60ch] font-sans text-base leading-6 text-fg-2 ${lead ? 'lg:col-span-5 lg:col-start-8' : ''}`}>
          <p>&ldquo;{t.quote}&rdquo;</p>
        </blockquote>

        <figcaption className={`pt-6 ${lead ? 'lg:col-span-5 lg:col-start-8' : 'mt-auto'}`}>
          <p className="font-sans font-medium text-fg">{t.name}</p>
          <p className="font-sans text-sm leading-5 text-fg-2">{meta}</p>

          <ul aria-label="What I did" className="mt-4 flex flex-wrap gap-2">
            {t.services.map(service => (
              <li
                key={service}
                className="eyebrow inline-flex items-center gap-1.5 rounded-md bg-raised px-2 py-1 text-fg-2"
              >
                {service === t.ongoing && (
                  <span aria-hidden className="pulse-dot h-1.5 w-1.5 shrink-0 rounded-full bg-positive text-positive" />
                )}
                {service}
                {service === t.ongoing && <span className="sr-only"> (current)</span>}
              </li>
            ))}
          </ul>

          <div className="mt-2">
            {link.external ? (
              <a href={link.href} target="_blank" rel="noopener noreferrer" className={LINK}>
                <span className={LINK_TEXT}>{link.label}</span>
                <span aria-hidden className={`${LINK_ARROW} group-hover:-translate-y-0.5 group-hover:translate-x-0.5`}>↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <Link prefetch={false} href={link.href} className={LINK}>
                <span className={LINK_TEXT}>{link.label}</span>
                <span aria-hidden className={`${LINK_ARROW} group-hover:translate-x-0.5`}>→</span>
              </Link>
            )}
          </div>
        </figcaption>
      </figure>
    </AnimateIn>
  )
}

// Column spans for the cards under the lead: wider, then narrower.
const SPANS = ['md:col-span-7', 'md:col-span-5']

/**
 * The homepage's client quotes. This section is the light sheet that slides up
 * over the sticky hero, so it carries the rounded top corners.
 */
export default function Testimonials() {
  const [lead, ...rest] = HOME_TESTIMONIALS
  if (!lead) return null

  return (
    <section
      className="relative z-10 pt-20 md:pt-28 pb-20 md:pb-28 bg-paper rounded-t-[20px] border-t border-transparent dark:border-line-strong"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* No visible heading: the quotes speak for themselves. */}
        <h2 id="testimonials-heading" className="sr-only">What clients say</h2>
        <Testimonial t={lead} lead />
        {rest.length > 0 && (
          <div className="mt-16 md:mt-20 grid gap-12 md:grid-cols-12 md:gap-x-12">
            {rest.map((t, i) => (
              <Testimonial key={t.name} t={t} span={SPANS[i % SPANS.length]} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
