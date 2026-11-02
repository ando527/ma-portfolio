// Homepage-only curated list. The first item is the lead quote, shown large;
// keep this to 3 for now. Full reviews live in the project markdown.

export interface HomeTestimonial {
  /** A short phrase lifted verbatim from the quote, set large above it. */
  pull: string
  quote: string
  name: string
  /** The reviewer's title, e.g. "Director". */
  role?: string
  company: string
  /** Where the review was published, e.g. "Google review of SLATE Media". */
  source?: string
  /** What I did for them, shown as pills. */
  services: string[]
  /** One of `services` that is still running, shown with a live dot. */
  ongoing?: string
  link: { href: string; label: string; external?: boolean }
}

export const HOME_TESTIMONIALS: HomeTestimonial[] = [
  {
    pull: 'I continue to use him for any website or creative work.',
    quote:
      'Working with Mitch was an excellent experience, he is very knowledgeable and has a great creative mind. The work we did in person was so productive and he is very reliable. It is for these reasons that I continue to use him for any website or creative work.',
    name: 'Stuart Smith',
    role: 'Director',
    // Also quoted on the Vitalis case study, where he's listed under Vitalis;
    // here he's credited to his own site.
    company: 'Calibrate Global',
    services: ['Web design', 'Webflow build'],
    link: { href: 'https://www.calibrateglobal.com/', label: 'calibrateglobal.com', external: true },
  },
  {
    pull: 'Mitch is your man.',
    quote:
      'Mitch is very professional and responsive with an equal balance of creativity and integrity. If you’re looking for someone that is solutions focused and reliable, Mitch is your man.',
    name: 'Dave Hobart',
    role: 'Director',
    company: 'Vitalis Institute',
    services: ['Web design', 'Webflow build', 'Ongoing maintenance'],
    ongoing: 'Ongoing maintenance',
    link: { href: '/work/vitalis-institute/', label: 'Read the Vitalis case study' },
  },
  {
    pull: 'Even better than we imagined.',
    // An excerpt of her Google review of SLATE Media. "[Mitch]" stands in for
    // "The team at Slate"; the full original stays on the VennCap case study.
    quote:
      '[Mitch] genuinely nailed what we were after and somehow managed to turn our ideas into something even better than we imagined.',
    name: 'Emily Parr',
    company: 'VennCap',
    source: 'Google review of SLATE Media',
    services: ['Webflow build'],
    link: { href: '/work/venncap/', label: 'Read the full review' },
  },
]
