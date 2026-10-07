// Shared button styles, so every button on the site is the same size.
// 48px tall (12px padding + 24px line height), 15px semibold label, pill
// shaped to match the nav. Put {btnArrow} on an arrow inside to nudge it on hover.

const base =
  'group/btn inline-flex items-center justify-center gap-2 font-sans font-semibold text-[15px] leading-6 px-6 py-3 rounded-full whitespace-nowrap transition-[background-color,border-color,color,box-shadow] duration-200'

/** Maroon, for the main action on a section. */
export const btnPrimary = `${base} bg-primary hover:bg-secondary text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_10px_28px_-12px_rgba(124,29,46,0.8)]`

/** Glassy outline, for a second action on dark backgrounds. */
export const btnOnDark = `${base} bg-white/[0.07] hover:bg-white/[0.13] border border-white/20 hover:border-white/35 text-white`

/** White outline, for a second action on light backgrounds. */
export const btnSecondary = `${base} bg-white hover:bg-maroon-50 border border-maroon-200 hover:border-primary/50 text-foreground`

/** Solid white, for the main action on a maroon or ink panel. */
export const btnLight = `${base} bg-white hover:bg-maroon-100 text-ink shadow-[0_10px_28px_-12px_rgba(0,0,0,0.6)]`

/** Solid ink, for a strong action on light backgrounds that isn't the main one. */
export const btnInk = `${base} bg-foreground hover:bg-primary text-white`

/** An arrow inside a button that slides a little on hover. */
export const btnArrow = 'transition-transform duration-200 ease-out-expo group-hover/btn:translate-x-0.5 motion-reduce:transition-none'
