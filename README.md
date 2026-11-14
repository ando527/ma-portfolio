# mitchellanderson.com.au

Next.js site exported as static files (`output: 'export'`) and served by Cloudflare Workers (static assets, plus one small Worker for the contact form). Every push to `main` builds and deploys.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Refreshes the speedcubing cache, then builds the static site into `out/` |
| `npm run serve` | Serves `out/` at http://localhost:4173 the way a static host would, applying `public/_headers` |
| `npm run images` | Turns originals in `assets/images/` into the WebP files and sizes the site serves |
| `npm run wca` | Refreshes the speedcubing cache on its own |
| `npm run covers` | Rebuilds the composite article cover photos from their screenshots |
| `npm run og` | Renders the share cards (`assets/og/cards/<slug>.png`) from each project and article, and the default card. Needs Chrome or Edge. Run it before `npm run images` |
| `npm run screenshot:home` | Screenshots the homepage (from `npm run serve`) for the platform article's cover |
| `npm test` | Runs the Worker tests and the cube and contact-schema tests (Node's built-in test runner) |
| `npm run test:worker` | Runs the Worker tests on their own |
| `npm run typecheck:worker` | Typechecks the Worker (`worker/`), which the site's own typecheck skips |

## Adding an image

1. Put the original (PNG, JPG or WebP, any size) in `assets/images/<folder>/`.
2. Run `npm run images`. It writes `public/images/<folder>/<name>.webp` plus smaller sizes, and records the size in `src/data/images.json`.
3. Reference it in content by its path with any extension, e.g. `/images/case-studies/new-site.jpg`. The site swaps in the WebP with width, height and `srcset`.
4. Commit `assets/`, `public/images/` and `src/data/images.json`.

If an image is referenced but hasn't been through step 2, the build fails and says which one.

## Adding a case study

Create `src/content/projects/<slug>.md` (copy an existing one for the front matter). It appears on `/work/`, in the footer, the sitemap and `llms.txt` automatically, and gets a 1200×630 share image the next time `npm run og` and then `npm run images` run. `seoTitle`, `seoDescription`, `heroAlt` and `beforeAlt` are optional but worth filling in. `effort` (0–100) sets its place in the Work page's "Most involved" sort and isn't shown anywhere. `preview` (two short sections, each a `heading` and `body`) is what the homepage project browser shows for a featured project. It's never shown on the case study page, so write it fresh rather than copying from the body, to keep the homepage from duplicating the case study.

## Adding an article

Create `src/content/articles/<slug>.md` with the front matter from the existing article. It publishes at `/articles/<slug>/` and joins the homepage slider. While the body is empty the page shows the summary and links to `originalUrl`, and stays out of search results and the sitemap.

### Article covers

Article cards show `coverText` on a dark panel. Add `coverImage` (and optionally `coverPosition`, default `right center`) to put a photo beside the text. A solid panel covers the left side with a hard edge, so the subject should sit on the right. `heroImage` is different: it replaces the cover with a plain photo and no text.

Two covers are composites of screenshots, built by `scripts/make-article-covers.mjs`: the launch checklist's phones (from the Speedcubing Australia mobile screenshot) and the platform article's browser windows (this site, We Got The Chocolates and Sippy Tom). If one of those screenshots changes, run `npm run covers` then `npm run images`. This site's screenshot lives in `assets/covers/home.png`, outside `assets/images/` so it isn't published; refresh it with `npm run screenshot:home` while `npm run serve` is running.

## Light and dark theme

`<html data-theme="light|dark">` is the one switch. A tiny inline script in `src/app/layout.tsx` sets it before first paint from `localStorage['theme']`, else the system setting; `src/lib/theme.ts` (`applyTheme`) and `ThemeToggle` change it. The colours are CSS variables (RGB channels, so `bg-paper/90` still works): light values on `:root`, dark values under `[data-theme='dark']` in `src/app/globals.css`, wired into `tailwind.config.ts`. The `d-*` tokens are the always-dark ramp (hero, footer, covers, cookie banner, browser chrome) and do not change. Use `bg-accent-fill text-on-accent` for solid accent fills (the button red is lighter in dark), `text-accent` for accent text, `border-control` for input borders, `text-negative-text` for error text, and `dark:` utilities when one element needs a one-off dark rule.

## Service pages

`src/content/services/<slug>.md` publishes at `/<slug>/` and lists every case study tagged with one of its `relatedTags`.

## Speedcubing data

`scripts/update-wca-cache.mjs` runs before every build. It saves the WCA profile and every competition attended to `src/data/wca/`, fetching only competitions that aren't cached yet. The About page renders from that cache, then checks the live profile in the browser and fetches only competitions newer than the build.

## Contact form

`/contact/` has a form that posts to `worker/index.ts`, a Worker that runs only for `POST /api/contact`. It validates the message, checks an invisible Cloudflare Turnstile token and emails it through Resend, storing nothing. The Rubik's cube on the form is UX only; the server never sees it. The one-time setup (Turnstile widget, Resend domain, secrets), local testing and troubleshooting are in `docs/contact-form-setup.md`. Shared field choices and limits are in `src/lib/contact-schema.ts`.

## Hosting

Cloudflare Workers serves the site: `wrangler.jsonc` points it at `out/` and at the contact form Worker, and `public/_headers` sets the cache and security headers. Cloudflare's Git integration runs `npm run build` and `npx wrangler deploy` on every push to `main`, and other branches get a preview URL. `.node-version` sets Node 24. `docs/cloudflare-setup.md` has the setup steps.

`.do/app.yaml` is the old DigitalOcean App Platform spec, kept as a reference copy until that app is retired (see step 8 of `docs/cloudflare-setup.md`). App Platform can't set custom response headers for static sites, so `public/_headers` only applies on a host that reads that file, such as Cloudflare or Netlify.
