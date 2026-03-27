import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Portfolio palette — deep maroon + warm off-white
        primary: '#7C1D2E',
        secondary: '#9B2335',
        accent: '#1E3A5F',
        background: '#FDF7F7',
        foreground: '#1C0A0E',
        card: '#FFFFFF',
        muted: '#F5EDEF',
        'muted-foreground': '#6B2035',
        maroon: {
          50:  '#FDF2F4',
          100: '#F9DDE1',
          200: '#F1B8BF',
          500: '#9B2335',
          700: '#6B1826',
        },
      },
      fontFamily: {
        heading: ['var(--font-archivo)', 'sans-serif'],
        sans: ['var(--font-space-grotesk)', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            '--tw-prose-body': '#1C0A0E',
            '--tw-prose-headings': '#1C0A0E',
            '--tw-prose-links': '#7C1D2E',
            '--tw-prose-bold': '#1C0A0E',
            '--tw-prose-counters': '#6B2035',
            '--tw-prose-bullets': '#7C1D2E',
            '--tw-prose-hr': '#F1B8BF',
            '--tw-prose-quotes': '#6B2035',
            '--tw-prose-quote-borders': '#7C1D2E',
            '--tw-prose-code': '#1C0A0E',
            '--tw-prose-pre-bg': '#FDF2F4',
            maxWidth: 'none',
            h1: { fontFamily: 'var(--font-archivo), sans-serif' },
            h2: { fontFamily: 'var(--font-archivo), sans-serif' },
            h3: { fontFamily: 'var(--font-archivo), sans-serif' },
          },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
