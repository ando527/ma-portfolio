import type { Config } from 'tailwindcss'

// rgb(var(--c-x) / <alpha-value>): Tailwind fills the alpha in.
const rgb = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`

const config: Config = {
  // dark: utilities apply under <html data-theme="dark"> (set by src/lib/theme.ts).
  darkMode: ['selector', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Theme ramp (warm) ───────────────────────────────────────────────
        // These swap with the theme. The channels live in globals.css (:root
        // for light, [data-theme='dark'] for dark), so opacity utilities such
        // as bg-paper/90 keep working.
        paper: rgb('paper'), // page
        card: rgb('card'), // cards, panels
        raised: rgb('raised'), // inputs, chips, active rows
        line: 'rgb(var(--c-line) / var(--a-line))', // hairline
        'line-strong': 'rgb(var(--c-line) / var(--a-line-strong))',
        control: rgb('control'), // border of an input: 3:1 against its surface
        fg: rgb('fg'), // primary text
        'fg-2': rgb('fg-2'), // secondary text
        'fg-3': rgb('fg-3'), // muted, meta only

        // ── Accent (the one red) ────────────────────────────────────────────
        accent: rgb('accent'), // text, links, rings, hairlines
        'accent-hover': rgb('accent-hover'), // hover text
        'accent-fill': rgb('accent-fill'), // solid fills (buttons, tooltips)
        'accent-fill-hover': rgb('accent-fill-hover'),
        'on-accent': rgb('on-accent'), // label on accent-fill
        'on-fg': rgb('on-fg'), // label on a bg-fg fill
        'accent-on-dark': '#E08A9A', // text, ink and focus ring on the always-dark ramp
        ink: '#1F1B16', // text on an always-light fill (bg-d-fg)
        'light-card': '#FDFBF7', // a light chip that sits on images, in both themes
        'light-accent': '#7C1D2E', // accent for rings that sit on light images

        // ── Dark ramp (warm) ────────────────────────────────────────────────
        'd-deep': '#12110F',
        'd-page': '#161513',
        'd-card': '#1C1A18',
        'd-raised': '#262421',
        'd-line': 'rgb(239 233 222 / 0.08)',
        'd-line-strong': 'rgb(239 233 222 / 0.14)',
        'd-fg': '#EFE9DE',
        'd-fg-2': '#AAA398',
        'd-fg-3': '#918B81', // muted on dark (4.6:1 on d-raised, 5.4:1 on d-page)

        // ── Competition gold (World Championships). Theme-swappable. ────────
        gold: 'var(--gold-fill)', // markers, dots, fills (graphics only)
        'gold-edge': 'var(--gold-edge)', // outline that separates the fill from the map
        'gold-on': 'var(--gold-on)', // text on a gold fill
        'gold-text': 'var(--gold-text)', // gold as text or thin strokes

        // ── Semantic (meaning only) ─────────────────────────────────────────
        positive: { DEFAULT: rgb('positive'), dark: '#4CC38A' }, // dots, fills
        'on-positive': rgb('on-positive'),
        negative: { DEFAULT: rgb('negative'), dark: '#E5484D' }, // borders, icons
        'negative-text': rgb('negative-text'), // 4.5:1 text on every surface of the theme
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        heading: ['var(--font-geist)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        // Swap with the theme (globals.css). Always-dark surfaces use surface
        // steps and hairlines instead.
        soft: 'var(--shadow-soft)',
        float: 'var(--shadow-float)',
        // A window floating over the dark ramp.
        'float-dark': '0 16px 40px rgba(0, 0, 0, 0.35)',
      },
      transitionTimingFunction: {
        // The one easing curve. `out-expo` is the old name, kept so existing
        // markup keeps working; both are the same curve.
        'out-expo': 'cubic-bezier(0.22, 1, 0.36, 1)',
        spec: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
}

export default config
