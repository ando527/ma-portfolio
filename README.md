# mitchellanderson.com.au

Next.js site exported as static files (`output: 'export'`) and served by DigitalOcean App Platform. Every push to `main` builds and deploys.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Refreshes the speedcubing cache, then builds the static site into `out/` |
| `npm run serve` | Serves `out/` at http://localhost:4173 the way a static host would, applying `public/_headers` |
| `npm run images` | Turns originals in `assets/images/` into the WebP files and sizes the site serves |
| `npm run wca` | Refreshes the speedcubing cache on its own |
| `npm run covers` | Rebuilds the composite article cover photos from their screenshots |
| `npm run screenshot:home` | Screenshots the homepage (from `npm run serve`) for the platform article's cover |

## Adding an image

1. Put the original (PNG, JPG or WebP, any size) in `assets/images/<folder>/`.
2. Run `npm run images`. It writes `public/images/<folder>/<name>.webp` plus smaller sizes, and records the size in `src/data/images.json`.
3. Reference it in content by its path with any extension, e.g. `/images/case-studies/new-site.jpg`. The site swaps in the WebP with width, height and `srcset`.
4. Commit `assets/`, `public/images/` and `src/data/images.json`.

If an image is referenced but hasn't been through step 2, the build fails and says which one.

## Adding a case study

Create `src/content/projects/<slug>.md` (copy an existing one for the front matter). It appears on `/work/`, in the footer, the sitemap and `llms.txt` automatically, and gets a 1200×630 share image the next time `npm run images` runs. `seoTitle`, `seoDescription`, `heroAlt` and `beforeAlt` are optional but worth filling in. `effort` (0–100) sets its place in the Work page's "Most involved" sort and isn't shown anywhere.

## Adding an article

Create `src/content/articles/<slug>.md` with the front matter from the existing article. It publishes at `/articles/<slug>/` and joins the homepage slider. While the body is empty the page shows the summary and links to `originalUrl`, and stays out of search results and the sitemap.

### Article covers

Article cards show `coverText` on a dark panel. Add `coverImage` (and optionally `coverPosition`, default `right center`) to put a photo behind the text and its gradient. The gradient is solid on the left, so the subject should sit on the right. `heroImage` is different: it replaces the cover with a plain photo and no text.

Two covers are composites of screenshots, built by `scripts/make-article-covers.mjs`: the launch checklist's phones (from the Speedcubing Australia mobile screenshot) and the platform article's browser windows (this site, We Got The Chocolates and Sippy Tom). If one of those screenshots changes, run `npm run covers` then `npm run images`. This site's screenshot lives in `assets/covers/home.png`, outside `assets/images/` so it isn't published; refresh it with `npm run screenshot:home` while `npm run serve` is running.

## Service pages

`src/content/services/<slug>.md` publishes at `/<slug>/` and lists every case study tagged with one of its `relatedTags`.

## Speedcubing data

`scripts/update-wca-cache.mjs` runs before every build. It saves the WCA profile and every competition attended to `src/data/wca/`, fetching only competitions that aren't cached yet. The About page renders from that cache, then checks the live profile in the browser and fetches only competitions newer than the build.

## Hosting

`.do/app.yaml` is a reference copy of the App Platform spec (including the www → apex redirect); App Platform only reads the copy in its console. App Platform can't set custom response headers for static sites, so the cache and security headers in `public/_headers` only apply on a host that reads that file, such as Cloudflare Pages or Netlify.
