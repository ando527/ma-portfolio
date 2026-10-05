// Shared button styles, so every button on the site is the same size.
// 48px tall (12px padding + 24px line height), 15px semibold label.

const base =
  'inline-flex items-center justify-center gap-2 font-sans font-semibold text-[15px] leading-6 px-6 py-3 rounded-xl whitespace-nowrap transition-colors duration-200'

/** Maroon, for the main action on a section. */
export const btnPrimary = `${base} bg-primary hover:bg-maroon-700 text-white shadow-sm`

/** Glassy outline, for a second action on dark backgrounds. */
export const btnOnDark = `${base} bg-white/10 hover:bg-white/15 border border-white/20 text-white`

/** White outline, for a second action on light backgrounds. */
export const btnSecondary = `${base} bg-white hover:bg-maroon-50 border border-maroon-200 text-foreground`
