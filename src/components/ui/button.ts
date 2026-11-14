// Shared button styles, so every button on the site is the same size.
// 44px tall, 15px medium label, 10px radius. Hover changes colour only, press
// scales to .98. Put {btnArrow} on an arrow inside to nudge it 3px on hover
// (.arrow-nudge in globals.css: pointer devices only, no motion if reduced).
//
// Which one to use:
//   on a light page    btnPrimary (the one main action), btnSecondary (second action)
//   on a dark band     btnLight (the one main action), btnOnDark (second action)
//   in the nav (36px)  btnNav on light, btnNavOnDark over the dark hero

const base =
  'group/btn inline-flex items-center justify-center gap-2 font-sans font-medium text-[15px] leading-6 min-h-11 px-5 py-2.5 rounded-[10px] whitespace-nowrap select-none transition-[background-color,border-color,color,transform] duration-150 ease-spec active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 forced-colors:border'

/** Accent fill, for the main action on a light page. */
export const btnPrimary = `${base} bg-accent-fill hover:bg-accent-fill-hover active:bg-accent-fill-hover text-on-accent`

/** Raised surface with a hairline, for a second action on a dark band. */
export const btnOnDark = `${base} bg-d-raised hover:bg-d-card border border-d-line-strong hover:border-d-fg-3 text-d-fg`

/** Raised surface with a hairline, for a second action on a light page. */
export const btnSecondary = `${base} bg-raised hover:bg-card border border-line-strong hover:border-fg-3 text-fg`

/** Off-white with dark text, for the main action on a dark band. */
export const btnLight = `${base} bg-d-fg hover:bg-white active:bg-white text-ink`

/** Graphite fill, for a strong action on a light page that isn't the main one. */
export const btnInk = `${base} bg-fg hover:bg-fg-2 active:bg-fg-2 text-on-fg`

/** Same as btnLight, under a name that says where it goes. */
export const btnOnDarkPrimary = btnLight

// Nav-sized variants: 36px tall, tighter padding.
const navBase =
  'group/btn inline-flex items-center justify-center gap-2 font-sans font-medium text-[14px] leading-5 h-9 px-4 rounded-lg whitespace-nowrap select-none transition-[background-color,border-color,color,transform] duration-150 ease-spec active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100 forced-colors:border'

/** Accent fill, 36px, for the nav on a light bar. */
export const btnNav = `${navBase} bg-accent-fill hover:bg-accent-fill-hover text-on-accent`

/** Off-white, 36px, for the nav over the dark hero. */
export const btnNavOnDark = `${navBase} bg-d-fg hover:bg-white text-ink`

/** An arrow inside a button that slides 3px on hover. */
export const btnArrow = 'arrow-nudge'
