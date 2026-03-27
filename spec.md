# MA Portfolio — Site Specification

## Overview

Personal portfolio website for an MA graduate. Moving from Webflow to a self-hosted static site on DigitalOcean App Platform (free tier), deployed automatically from GitHub.

**Goals:**
- Showcase work and case studies
- Serve as a professional online presence / CV
- Zero monthly cost (within DO free tier limits)
- Full ownership of code and content

---

## Hosting: DigitalOcean App Platform (Free Static Site)

### Free Tier Details
| Limit | Value |
|---|---|
| Free static apps | 3 |
| Outbound bandwidth | 1 GiB / month per app |
| Extra bandwidth | $0.02 / GiB |
| Extra apps | $3.00 / month each |
| Inbound transfer | Free |

### Deployment Flow
1. Push code to GitHub (`main` branch)
2. DO detects the push → runs build command
3. Output folder served as static files
4. Custom domain with managed HTTPS/TLS

### DO Build Config
| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `out` |
| Environment | Node.js (auto-detected) |

---

## What You CAN Have on This Static Site

- **Full client-side JavaScript** — React components, animations, interactions
- **CSS animations and transitions** — anything visual
- **Image galleries, lightboxes, carousels** — client-side JS
- **Video embeds** — YouTube/Vimeo iframes
- **PDF downloads** — link directly to `/public/cv.pdf`
- **Dark mode toggle** — via `localStorage` + CSS variables
- **Analytics** — Plausible, Fathom, or Google Analytics (script tag)
- **Contact form** — via [Formspree](https://formspree.io) or [EmailJS](https://emailjs.com) (free tiers available)
- **Custom fonts** — Google Fonts or self-hosted in `/public`
- **Client-side search** — Fuse.js over a pre-built JSON index
- **Build-time env vars** — for public API keys (e.g. analytics IDs)

## What You CANNOT Have

| Feature | Why | Alternative |
|---|---|---|
| Server-side code | No Node/PHP runtime | N/A or separate service |
| Database queries | No runtime server | Markdown files as content |
| Server-side forms | No `/api` routes | Formspree / EmailJS |
| `next/image` optimisation | Requires server | `unoptimized: true` — pre-optimise images manually |
| `getServerSideProps` | No SSR | `getStaticProps` or static data |
| Next.js API routes | No server | Third-party APIs |
| Auth / login | No session handling | Third-party (Clerk, Auth0) |
| Webhooks / cron jobs | No runtime | N/A |
| Runtime env vars | Build-time only | Bake into build output |

**Image note:** `next/image` won't auto-optimise on a static export. Run images through [Squoosh](https://squoosh.app) or similar before committing. Keep hero images under 200KB, project images under 100KB to stay within the 1 GiB bandwidth limit comfortably.

---

## Tech Stack

| Tool | Version | Reason |
|---|---|---|
| Next.js | 14+ | App Router, static export, React ecosystem |
| TypeScript | 5+ | Type safety |
| Tailwind CSS | 3+ | Utility-first, no runtime CSS |
| React | 18+ | Included with Next.js |

---

## Project Structure

```
MA portfolio/
├── spec.md                        ← this file
├── package.json
├── next.config.js                 ← output: 'export', images: unoptimized
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── .gitignore
├── src/
│   ├── app/
│   │   ├── layout.tsx             ← root layout (Nav, Footer, fonts)
│   │   ├── page.tsx               ← Home / Hero
│   │   ├── work/
│   │   │   ├── page.tsx           ← Work index (project grid)
│   │   │   └── [slug]/
│   │   │       └── page.tsx       ← Individual case study
│   │   └── about/
│   │       └── page.tsx           ← About + CV
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   ├── ProjectCard.tsx
│   │   └── HeroSection.tsx
│   ├── content/
│   │   └── projects/
│   │       └── example-project.md ← One .md file per case study
│   └── lib/
│       └── projects.ts            ← Reads + parses project markdown
└── public/
    ├── images/
    │   └── projects/
    ├── cv.pdf                     ← Downloadable CV
    └── favicon.ico
```

---

## Pages

### Home (`/`)
- Full-screen hero: name, title, short positioning statement
- Featured work: 2–3 selected project cards
- CTA: link to full Work page

### Work (`/work`)
- Grid of all project cards (title, thumbnail, short description, tags)
- Each card links to `/work/[slug]`

### Work Case Study (`/work/[slug]`)
- Generated statically from `/src/content/projects/*.md` at build time
- Content: title, hero image, overview, process, outcome, tags
- Back link to `/work`

### About (`/about`)
- Photo, bio paragraph(s)
- Skills / tools list
- Work history / timeline
- Download CV button → `/cv.pdf`

---

## Content Model (Markdown Frontmatter)

Each project file at `src/content/projects/[slug].md`:

```yaml
---
title: "Project Name"
slug: "project-name"
date: "2024-06"
tags: ["Branding", "Motion", "Research"]
thumbnail: "/images/projects/project-name/thumb.jpg"
heroImage: "/images/projects/project-name/hero.jpg"
summary: "One sentence description shown on the Work index."
featured: true
---

Full case study content in markdown...
```

---

## Next.js Config

```js
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',        // static export — required for DO static site
  images: {
    unoptimized: true,     // next/image won't optimise without a server
  },
  trailingSlash: true,     // generates index.html files for clean URLs on DO
}

module.exports = nextConfig
```

---

## DigitalOcean Setup Steps

1. **Create GitHub repo** — push this project to a public or private repo
2. **Create DO App**
   - Go to App Platform → Create App
   - Connect GitHub → select repo + branch (`main`)
   - DO detects Node.js → set as **Static Site** component
   - Build command: `npm run build`
   - Output directory: `out`
3. **Custom domain**
   - In DO App → Settings → Domains → Add Domain
   - Point your domain's DNS to DO (add provided A record or CNAME)
   - DO provisions TLS automatically
4. **Auto-deploy**
   - Enabled by default — every push to `main` triggers a rebuild

---

## Development Workflow

```bash
# Install dependencies
npm install

# Local dev server (hot reload)
npm run dev

# Build static output to /out
npm run build

# Preview the static output locally
npx serve out
```

---

## Bandwidth Estimate

| Asset | Size estimate | Monthly requests (est.) |
|---|---|---|
| HTML pages | ~5 KB each | — |
| CSS bundle | ~20 KB | — |
| JS bundle | ~80 KB | — |
| Images per project | ~300 KB | — |
| **Per page load** | **~500 KB** | — |
| **1 GiB limit** | | **~2,000 full page loads/month** |

Fine for a portfolio. If you exceed the limit (unlikely), overage is $0.02/GiB.

---

## Decisions Still To Make

- [ ] Choose a typeface / visual direction
- [ ] Decide on colour scheme (light only / dark only / toggle)
- [ ] Confirm number of projects to feature at launch
- [ ] Prepare CV as PDF
- [ ] Optimise and collect project images
- [ ] Register / confirm custom domain
