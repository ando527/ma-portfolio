# Setting up the contact form

The contact page (`/contact/`) posts to a small Worker (`worker/index.ts`) that runs only for `POST /api/contact`. Every other request is still served straight from `out/` and never runs the Worker. The Worker checks the request, verifies a Cloudflare Turnstile token, and emails the message to you through Resend. Nothing is stored on the site.

Everything here is free at this site's volume: Workers Free allows 100,000 requests a day, Turnstile is free, and Resend's free plan allows 100 emails a day and 3,000 a month.

The Rubik's cube on the form is a friendly extra, not a security control. A bot can skip it by posting straight to `/api/contact`, so the server never sees or checks it. The invisible Turnstile check is what keeps bots out.

You need to do three things once, in dashboards (Turnstile, Resend, then the Worker's secrets). The code can be deployed first; the form just shows its "didn't send" message until the setup is finished.

## 1. Create the Turnstile widget

1. Cloudflare dashboard → **Turnstile → Add widget**.
2. **Hostname management**: add `mitchellanderson.com.au`. Add `localhost` too if you want to try the real widget on your own machine.
3. **Widget mode**: **Invisible**. Visitors should only ever see the cube.
4. **Pre-clearance**: off.
5. Create it, then copy the two keys:
   - **Site key** (public): it goes in `src/lib/site.ts` as `SITE.turnstileSiteKey` (already set to the live widget's key).
   - **Secret key**: keep it for step 3.

The site key is not secret and is meant to be in the repo. While it is still the dummy key, the widget always passes, so **do not go live with the dummy key**: the Worker would then be checked against your real secret and every send would fail.

An Invisible widget can never show a visitor a challenge. On a rare false positive (a privacy browser, some VPNs) the visitor sees the "didn't send, message me on LinkedIn" message. If that turns out to happen in practice, switch the widget to **Managed** in the dashboard and set `appearance: 'interaction-only'` in the `turnstile.render` call in `src/components/ContactForm.tsx`.

## 2. Set up Resend

1. Sign up at [resend.com](https://resend.com) (free plan).
2. **Domains → Add domain**. The recommended sending domain is the subdomain `mail.mitchellanderson.com.au`, so it can't clash with any email already on the root domain.
3. Resend lists DNS records (SPF, DKIM, and a suggested DMARC record). DNS for this site is on Cloudflare (see [cloudflare-setup.md](cloudflare-setup.md)), so add them in Cloudflare: **mitchellanderson.com.au → DNS → Records**. Set each one to **DNS only** (grey cloud, proxy off), since proxied records break email verification.
4. Back in Resend, click **Verify**. It can take a few minutes, occasionally longer.
5. **API Keys → Create API key** with **Sending access** only (not full access), limited to that domain if it offers the option. Copy it for step 3. Resend shows it once.
6. Check `CONTACT_FROM` in `wrangler.jsonc`. It is not a secret, so it lives in that file (secrets persist across deploys but plain dashboard variables don't). It must be an address on the domain you verified. If you verified a different domain from `mail.mitchellanderson.com.au`, change it to match, for example `Mitchell Anderson website <contact@your-verified-domain>`. Mail will not send until the two match.

For a quick smoke test before DNS verifies, a brand-new Resend account can usually send from `onboarding@resend.dev` to the address you signed up with. Treat that as a test only; real use needs the verified domain for good deliverability.

## 3. Set the Worker's secrets

| Name | What it is |
| --- | --- |
| `TURNSTILE_SECRET_KEY` | The Turnstile **secret key** from step 1. |
| `RESEND_API_KEY` | The Resend API key from step 2. |
| `CONTACT_TO` | The inbox that receives enquiries (your Gmail). |

Set them as **Secrets**, not plain variables. Either in the dashboard (**Workers & Pages → ma-portfolio → Settings → Variables and Secrets → Add**, type **Secret**) or from the command line:

```bash
npx wrangler secret put TURNSTILE_SECRET_KEY
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put CONTACT_TO
```

The Worker has to exist before you can set secrets on it, so do this after the first deploy. Secrets survive every later `wrangler deploy`. `CONTACT_TO` is deliberately a secret so your address is never in the public GitHub repo.

## 4. Optional: rate limit the endpoint

Not set up: the dashboard offered rate-limiting rules only on paid plans for this zone. Turnstile already blocks automated sends, and Resend's 100-a-day cap limits the damage if it ever didn't, so this is skipped for now. If the plan changes, **Security → WAF → Rate limiting rules → Create rule**:

- If: **URI Path** equals `/api/contact` and **Method** equals `POST`
- Same characteristics: **IP**
- Rate: 5 requests per 10 seconds
- Action: **Block**

It is extra defence on top of Turnstile.

## Testing locally

```bash
cp .dev.vars.example .dev.vars
npm run build && npx wrangler dev
```

Open http://localhost:8787/contact/. `.dev.vars` is git-ignored and holds Cloudflare's dummy Turnstile secret (it always passes) plus `CONTACT_DRY_RUN=1`, which makes the Worker log the email subject instead of sending anything. Put your own address in `CONTACT_TO` there, never in the example file.

To test the failure path, use Cloudflare's always-failing dummy pair: site key `2x00000000000000000000BB` (set `NEXT_PUBLIC_TURNSTILE_SITE_KEY=2x00000000000000000000BB` in `.env.local` and rebuild) and secret `2x0000000000000000000000000000000AA` in `.dev.vars`. Sending should then show "Verification failed", and a retry should work after the widget resets.

The automated tests for the Worker and the cube need no setup:

```bash
npm run test
npm run typecheck:worker
```

## Checking it in production

After the first deploy with real keys:

- [ ] Send a real message from the live form. It should arrive in your inbox within a minute (check spam the first time). Replying should address the visitor.
- [ ] `curl -i https://mitchellanderson.com.au/api/contact` returns `405`.
- [ ] `curl -sI https://mitchellanderson.com.au/contact/` shows a `content-security-policy` that includes `challenges.cloudflare.com` in both `script-src` and `frame-src`.
- [ ] The browser console on `/contact/` shows no CSP errors, and the homepage's network tab shows no Turnstile or cube code.
- [ ] **Workers & Pages → ma-portfolio → Metrics**: Worker requests only go up when the form is submitted, not on page views.
- [ ] Try once with JavaScript blocked and once in a private window or on a VPN, to see the fallback messages.

## Quotas and what happens when they run out

- **Resend free plan: 100 emails a day, 3,000 a month.** Past that Resend returns an error, the Worker answers `502`, and the visitor sees "Sorry, that didn't send. You can message me on LinkedIn instead." Nothing is lost silently.
- **Workers Free: 100,000 requests a day.** Only form posts count. Page views are static assets and are free and unlimited.
- **Turnstile:** free, with no per-challenge charge.

The Worker logs failures without logging any message text or email addresses. Find them under **Workers & Pages → ma-portfolio → Logs**.

## Rotating a key

1. Create the new key (Resend: **API Keys**; Turnstile: **Settings → Rotate secret key**, or a new widget).
2. Run `npx wrangler secret put <NAME>` with the new value, or edit the secret in the dashboard. It takes effect on the next request; no deploy is needed.
3. Delete or disable the old key.

If you create a new Turnstile *widget*, its site key changes too: update `SITE.turnstileSiteKey` in `src/lib/site.ts` and deploy.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| "Sorry, that didn't send" every time | A secret is missing (the Worker log says which), `CONTACT_FROM` isn't on a domain verified in Resend, or the Turnstile script was blocked. |
| "Verification failed" every time | The site key in `src/lib/site.ts` and the `TURNSTILE_SECRET_KEY` secret are from different widgets, or the widget's hostname list doesn't include the domain you're testing on. |
| Preview (`*.workers.dev`) URLs can't send | Add the preview hostname to the Turnstile widget's hostname list, or test on the production domain. |
| Console shows a CSP error naming `challenges.cloudflare.com` | `public/_headers` wasn't deployed with the change that allows it in `script-src` and `frame-src`. |
| Email lands in spam | The Resend domain isn't fully verified (check SPF and DKIM), or add a DMARC record as Resend suggests. |

## Switching to Cloudflare Email Service later

Cloudflare's own email sending (a `send_email` binding, no API key) is a possible replacement for Resend once it leaves beta. Only `worker/mail.ts` knows about Resend, so the change is confined to `sendContactEmail`: swap the `fetch` to Resend for the binding call, add the binding to `wrangler.jsonc`, and drop `RESEND_API_KEY`. The form, the validation and the Turnstile check stay as they are.
