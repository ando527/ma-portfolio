import Link from 'next/link'
import { HOME_TESTIMONIALS, type HomeTestimonial } from '@/lib/testimonials'
import { AnimateIn } from '@/components/ui/animate-in'

const LINK = 'group inline-flex items-center gap-1.5 py-2 font-sans text-sm font-semibold text-primary hover:text-secondary transition-colors duration-200'
const LINK_TEXT = 'underline decoration-1 underline-offset-[3px] group-hover:decoration-2'
const LINK_ARROW = 'transition-transform duration-200 ease-out-expo motion-reduce:transition-none'

/** One review, set like a magazine pull-quote. The first is the lead and runs the full width. */
function Testimonial({ t, lead }: { t: HomeTestimonial; lead?: boolean }) {
  const { link } = t
  // Role and company on one line; reviews without a role say where they were left instead.
  const meta = t.role ? `${t.role}, ${t.company}` : [t.company, t.source].filter(Boolean).join(' · ')

  return (
    <AnimateIn className={lead ? undefined : 'h-full'}>
      <figure
        className={
          lead
            ? 'lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-10'
            : 'flex h-full flex-col border-t-2 border-foreground pt-6'
        }
      >
        {/* The pull line repeats part of the quote, so screen readers skip it.
            The negative indent hangs the opening quote mark in the margin, so the
            letters line up with everything below. */}
        <p
          aria-hidden="true"
          className={`mb-6 font-heading font-extrabold leading-[1.02] tracking-[-0.03em] text-foreground text-balance indent-[-0.42em] ${
            lead
              ? 'text-[2.25rem] sm:text-[2.75rem] md:text-[3.25rem] lg:col-span-7 lg:row-span-2 lg:mb-0 lg:text-[clamp(2.25rem,4.6vw,4rem)]'
              : 'text-[1.75rem] md:text-[2rem] lg:text-[2.5rem]'
          }`}
        >
          &ldquo;<span className="marker">{t.pull}</span>&rdquo;
        </p>

        <blockquote className={`max-w-[60ch] font-sans text-base leading-relaxed text-foreground/75 md:text-[17px] ${lead ? 'lg:col-span-5 lg:col-start-8' : ''}`}>
          <p>&ldquo;{t.quote}&rdquo;</p>
        </blockquote>

        <figcaption className={`pt-6 md:pt-8 ${lead ? 'lg:col-span-5 lg:col-start-8' : 'mt-auto'}`}>
          <p className="font-sans font-semibold text-foreground">{t.name}</p>
          <p className="font-sans text-sm text-muted-foreground">{meta}</p>

          <ul aria-label="What I did" className="mt-4 flex flex-wrap gap-2">
            {t.services.map(service => (
              <li
                key={service}
                className="inline-flex items-center gap-1.5 rounded-full border border-maroon-200 bg-maroon-50 px-2.5 py-1 font-sans text-xs font-medium text-primary"
              >
                {service === t.ongoing && (
                  <span aria-hidden className="pulse-dot h-1.5 w-1.5 shrink-0 rounded-full bg-primary text-primary" />
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

/**
 * The homepage's client quotes. This section is the light sheet that slides up
 * over the sticky hero, so it carries the rounded corners and shadow.
 */
export default function Testimonials() {
  const [lead, ...rest] = HOME_TESTIMONIALS
  if (!lead) return null

  return (
    <section
      className="relative z-10 pt-20 md:pt-28 pb-20 md:pb-24 bg-card rounded-t-[2rem] md:rounded-t-[2.75rem] shadow-[0_-24px_60px_-24px_rgba(0,0,0,0.55)]"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* No visible heading: the quotes speak for themselves. */}
        <h2 id="testimonials-heading" className="sr-only">What clients say</h2>
        <Testimonial t={lead} lead />
        {rest.length > 0 && (
          <div className="mt-14 md:mt-20 grid gap-12 md:grid-cols-2 md:gap-10 lg:gap-16">
            {rest.map(t => (
              <Testimonial key={t.name} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
