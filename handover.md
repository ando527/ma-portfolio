# Portfolio Site — Session Handover

## What this is
Mitchell Anderson's personal portfolio site, built to replace a Webflow subscription (~$30/mo).
Hosted on **GitHub → Digital Ocean App Platform (free static tier)**.

**Local path:** `C:\Users\ando5\OneDrive\Documents\MA portfolio`
**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS · `gray-matter` for MD parsing

---

## Running the project

```bash
npm run dev      # http://localhost:3000
npm run build    # production build (outputs to .next — DO NOT deploy this directly)
```

> Digital Ocean deploys from the GitHub repo automatically. Push to main = deploy.

---

## File structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout — Nav + Footer, Archivo + Space Grotesk fonts
│   ├── globals.css             # Tailwind base, body bg/colour
│   ├── page.tsx                # Homepage (hero + browser window + CTA)
│   ├── about/page.tsx          # About page — bio, skills, experience timeline
│   └── work/
│       ├── page.tsx            # All projects grid
│       └── [slug]/page.tsx     # Full case study page
├── components/
│   ├── Nav.tsx                 # Fixed nav — transparent on hero, opaque on scroll/inner pages
│   ├── Footer.tsx              # Footer — © name, LinkedIn + email links (NEEDS REAL URLs)
│   ├── HeroBackground.tsx      # Client component — SVG film grain + mouse-tracking glow
│   ├── BrowserWindow.tsx       # Client component — fake Chrome browser with tabs
│   └── ProjectCard.tsx         # Card used on /work grid
├── content/
│   └── projects/               # One .md file per project (see format below)
│       └── example-project.md  # Placeholder — replace with real projects
└── lib/
    └── projects.ts             # Reads + parses all .md files from /content/projects
```

---

## Design system

| Token | Value | Usage |
|---|---|---|
| `primary` | `#7C1D2E` | Buttons, accents, links |
| `secondary` | `#9B2335` | Hover states |
| `accent` | `#1E3A5F` | LinkedIn/CTA button |
| `background` | `#FDF7F7` | Page background (warm off-white) |
| `foreground` | `#1C0A0E` | Body text |
| `card` | `#FFFFFF` | Card/section backgrounds |
| `muted-foreground` | `#6B2035` | Secondary text |
| Hero bg | `#100408` | Dark maroon-black |
| `maroon-100/200` | see config | Borders, dividers |

**Fonts:** `font-heading` = Archivo (headings) · `font-sans` = Space Grotesk (body)

Tailwind config lives in `tailwind.config.ts`. All custom colours + font aliases are defined there.

---

## Pages

### `/` — Homepage
- **Hero:** `sticky top-0 z-0 h-screen` dark section. Next sections are `relative z-10` with solid
  backgrounds, so they slide over the hero as you scroll.
- **HeroBackground:** SVG noise grain (5.5% opacity) + maroon mouse-following radial glow (RAF lerp,
  no React re-renders). Glow lives at `z-[1]`, behind the photo (`z-[10]`).
- **Photo:** `/public/images/hero.png` (transparent bg PNG). Wrapper is `w-screen flex justify-end`
  so the bottom gradient is full-width. Gradient is *inside* the photo wrapper so it travels with it.
- **Nav behaviour:** transparent + white text over hero, becomes opaque + dark at 85% scroll depth.
- **BrowserWindow:** fake Chrome browser showing featured projects as tabs (see below).
- **CTA strip:** "Reach out on LinkedIn" → `https://www.linkedin.com/in/mitchellanderson`
  ⚠️ Confirm this LinkedIn slug is correct.

### `/work` — All projects
Standard grid of `ProjectCard` components, one per `.md` file with `featured: true` or all.

### `/work/[slug]` — Case study
Renders the full markdown content with `@tailwindcss/typography` prose styles.

### `/about`
Three-column layout: photo + CV download (left), bio + skills + timeline (right).
- Photo: same `/public/images/hero.png`
- CV download: links to `/public/cv.pdf` — **this file doesn't exist yet, add it**
- Skills: Webflow, Shopify, Next.js, HTML/CSS/JS, UX & Wireframing, Front-end Dev, Performance & Accessibility, ArcGIS/Python
- Experience timeline: SLATE Media (2021–Present), Fulton Hogan (2023–2024), UQ BIT (2024)

---

## BrowserWindow — fake Chrome browser

**File:** `src/components/BrowserWindow.tsx`

- Renders up to 4 project tabs from the `featured` projects array
- Each tab shows a **mini case study**: hero image → tags → title → summary → first 3 MD sections → "View full case study" link
- **`+` new tab button** opens a personalised Chrome new-tab parody:
  - Live clock (ticks every second)
  - Time-based greeting (morning/afternoon/evening)
  - Shortcut tiles: Work, About, GitHub, Cubing (speedcubing.org.au)
  - Fun facts rotating every 4s (WCA Championships, UQ Racing, Fulton Hogan automation, etc.)
- Tab close (`×`) works; at least 1 tab always stays open
- URL bar shows `mitchellanderson.dev/work/[slug]` or `New Tab`
- macOS traffic lights (decorative), back/forward controls, lock icon

---

## Adding a real project

Create `src/content/projects/your-project-slug.md`:

```markdown
---
title: "Project Title"
date: "2024-03"
tags: ["Webflow", "Shopify"]
thumbnail: "/images/projects/your-project-thumbnail.jpg"
heroImage: "/images/projects/your-project-hero.jpg"
summary: "One or two sentences describing the project."
featured: true
---

## Overview
...

## Process
...

## Outcome
...
```

- `featured: true` → appears in the homepage browser window (max 4 shown)
- Images go in `/public/images/projects/`
- Slug = filename without `.md`

---

## Things still needed / known gaps

| Item | Notes |
|---|---|
| `/public/cv.pdf` | Add Mitchell's CV PDF for the About page download button |
| Footer LinkedIn URL | Currently `https://linkedin.com/in/yourprofile` — update in `Footer.tsx` |
| Footer email | Currently `you@email.com` — update in `Footer.tsx` |
| LinkedIn CTA slug | Homepage button uses `mitchellanderson` — confirm this is the correct slug |
| Real projects | Replace `example-project.md` with actual case studies |
| Project images | Add hero + thumbnail images to `/public/images/projects/` |
| GitHub repo | Needs to be created and linked to Digital Ocean App Platform |
| Digital Ocean app spec | See `spec.md` for DO static site config |

---

## Digital Ocean deployment

- DO App Platform free tier supports static sites (no server-side Node.js at runtime)
- Next.js must export as **static HTML**: add `output: 'export'` to `next.config.ts` before deploying
- Build command: `npm run build`
- Output directory: `out` (after static export)
- See `spec.md` for the full DO app spec

> ⚠️ Static export means no API routes, no server components that fetch at runtime, no ISR.
> All data must be available at build time. The current MD file approach works fine for this.

---

## Session history summary

1. Set up full Next.js project from scratch (App Router, TypeScript, Tailwind)
2. Defined maroon colour palette + font system
3. Built all pages: homepage, work grid, case study, about
4. Hero: sticky section, transparent nav, mouse-glow + grain HeroBackground
5. Replaced Webflow/Shopify coworking aesthetic with light-mode maroon theme
6. Populated all content from Mitchell's CV (SLATE Media, Fulton Hogan, UQ, speedcubing)
7. Built BrowserWindow fake Chrome component with tab switching + new tab easter egg
8. Fixed: tab bar scrollbar, image vignette, bottom gradient attached to image unit
9. Nav: logo removed, centred links only
10. CTA button → "Reach out on LinkedIn"
