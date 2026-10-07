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
        background: '#FDF7F7',
        foreground: '#1C0A0E',
        card: '#FFFFFF',
        muted: '#F5EDEF',
        'muted-foreground': '#6B2035',
        // Near-black wine used for every dark surface (hero, nav, footer)
        ink: '#100408',
        maroon: {
          50:  '#FDF2F4',
          100: '#F9DDE1',
          200: '#F1B8BF',
          300: '#E6939F',
          500: '#9B2335',
          700: '#6B1826',
          800: '#3D0E17',
          900: '#24080E',
        },
      },
      fontFamily: {
        heading: ['var(--font-archivo)', 'sans-serif'],
        sans: ['var(--font-space-grotesk)', 'sans-serif'],
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

export default config
