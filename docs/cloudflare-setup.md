# Moving hosting to Cloudflare Workers

The site is static, so Cloudflare serves `out/` directly: free plan, no request limits, and it applies `public/_headers` (cache lifetimes, HSTS, security headers), which DigitalOcean App Platform can't. Pushing to `main` still builds and deploys; other branches get a preview URL.

The repo already has what Cloudflare needs:

- `wrangler.jsonc`: serve `out/`, use `404.html` for unknown pages, handle trailing slashes
- `.node-version`: build with Node 24, the same as local

Order matters: get the site working on Cloudflare's test URL first, then move DNS, then switch the domain over. The site stays up on DigitalOcean until the last step.

## 1. Check it locally

```bash
npm run build && npx wrangler dev
```

Open http://localhost:8787. Click through the main pages and check the browser console for Content-Security-Policy errors. The policy in `_headers` has never been enforced in production, so this is the first time it actually applies.

## 2. Create the Worker from GitHub

1. Sign up at [dash.cloudflare.com](https://dash.cloudflare.com) (free plan).
2. Go to **Compute → Workers & Pages → Create → Import a repository**.
3. Connect GitHub and give the Cloudflare app access to `ando527/ma-portfolio` only.
4. Settings:
   | Setting | Value |
   | --- | --- |
   | Project name | `ma-portfolio` (must match `name` in `wrangler.jsonc`) |
   | Production branch | `main` |
   | Build command | `npm run build` |
   | Deploy command | `npx wrangler deploy` |
   | Non-production branch deploy command | `npx wrangler versions upload` |
   | Root directory | `/` |
5. Save and deploy. Dependencies install automatically before the build.

## 3. Test the workers.dev URL

The first deploy goes to `https://ma-portfolio.<your-subdomain>.workers.dev`. Check:

- [ ] Home, Work, a case study, About, Articles, an article, Privacy
- [ ] A made-up URL shows the 404 page
- [ ] `/about` redirects to `/about/`
- [ ] No CSP errors in the console, especially on pages with a YouTube embed, the competition map (map tiles) and About (live WCA fetch)
- [ ] Accepting cookies loads Google Analytics without errors
- [ ] Headers are applied:

```bash
curl -sI https://ma-portfolio.<your-subdomain>.workers.dev/images/hero.webp
```

You should see `cache-control: public, max-age=2592000, stale-while-revalidate=86400` and `strict-transport-security`. Files under `/_next/static/` should show `max-age=31536000, immutable`.

If something is blocked, fix `_headers`, push, and test again. Nothing public has changed yet.

## 4. Move DNS to Cloudflare

The domain's DNS is at GoDaddy (`ns25/ns26.domaincontrol.com`). Cloudflare has to run DNS to serve the bare domain.

1. In Cloudflare: **Add a domain** → `mitchellanderson.com.au` → **Free** plan.
2. Review the records it imports. You should see:
   - two `A` records for `mitchellanderson.com.au` (DigitalOcean: `172.66.0.96`, `162.159.140.98`)
   - `CNAME www` → `ma-portfolio-bct9k.ondigitalocean.app`
   - `TXT` `google-site-verification=…` (keep: Search Console uses it)

   Set the `A` and `CNAME` records to **DNS only** (grey cloud) for now, so they keep pointing straight at DigitalOcean during the switch.
3. In GoDaddy: if DNSSEC is on, turn it off first. Then **Domain → DNS → Nameservers → Change → I'll use my own nameservers** and enter the two Cloudflare gives you.
4. Wait for Cloudflare to email that the domain is active (usually under an hour, up to 24). The site still runs from DigitalOcean meanwhile.

## 5. Switch the domain to the Worker

This step has a minute or two of downtime, so do it in one sitting.

1. In **DNS → Records**, delete the two DigitalOcean `A` records and the `www` `CNAME`. (Custom domains can't be added while another record uses the name.)
2. Open the Worker → **Settings → Domains & Routes → Add → Custom domain**. Add `mitchellanderson.com.au`, then `www.mitchellanderson.com.au`. Cloudflare creates the DNS records and certificates.
3. **Rules → Redirect Rules → Create from template → Redirect from WWW to root**. It's a 301 that keeps the path and query string. This replaces the redirect in `.do/app.yaml`.

## 6. Zone settings

Defaults are mostly fine. Check these, because they change the HTML or would be blocked by the CSP:

- **SSL/TLS → Edge Certificates**: Always Use HTTPS **on**.
- **Caching → Configuration → Browser Cache TTL**: **Respect existing headers** (the default), so `_headers` decides.
- **Scrape Shield → Email Address Obfuscation**: **off** (rewrites links and adds a script).
- **Speed → Rocket Loader**: **off**.
- **Web Analytics**: don't turn on the automatic setup. Its script comes from `static.cloudflareinsights.com`, which the CSP blocks, and Google Analytics already covers it.

## 7. Check the live site

```bash
curl -sI https://mitchellanderson.com.au/
curl -sI https://www.mitchellanderson.com.au/work/
```

The first should be `200` with the security headers. The second should be `301` to `https://mitchellanderson.com.au/work/`. Then run PageSpeed Insights again: "Use efficient cache lifetimes" should be gone.

## 8. Retire DigitalOcean

After about a week with no problems, delete the app in DigitalOcean. Until then it keeps auto-deploying from GitHub too, which does no harm. Then remove `.do/` from the repo and update the Hosting section of the README.

## Notes

- **Images are cached for 30 days under the same name.** If you replace an image without renaming it, returning visitors may see the old one for up to 30 days. Rename the original in `assets/images/` to avoid that. JS and CSS under `/_next/static/` get new names every build, so they're always fresh.
- **Free plan limits:** 20,000 files per deploy (the site is about 500), 25 MiB per file, 3,000 build minutes a month, one build at a time.
