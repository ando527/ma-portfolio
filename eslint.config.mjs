import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

// Next.js's recommended rules (React, hooks, accessibility, Core Web Vitals)
// plus its TypeScript rules. `npm run lint` runs this over the whole project.
export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Images go through scripts/optimize-images.mjs instead (WebP, srcset,
      // width and height), and next/image can't optimise a static export.
      '@next/next/no-img-element': 'off',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),
])
