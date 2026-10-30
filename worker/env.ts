// Bindings, secrets and vars available to the Worker.
// `Fetcher` is a global from @cloudflare/workers-types.

export interface Env {
  /** Static assets (the Next.js export in out/). */
  ASSETS: Fetcher
  /** Secret: Cloudflare Turnstile secret key. */
  TURNSTILE_SECRET_KEY: string
  /** Secret: Resend API key (sending access only). Not needed while CONTACT_DRY_RUN is "1". */
  RESEND_API_KEY: string
  /** Secret: the inbox that receives enquiries. Never committed to the repo. */
  CONTACT_TO: string
  /** Var in wrangler.jsonc, e.g. "Website contact <contact@mail.example.com.au>". */
  CONTACT_FROM: string
  /** "1" logs the subject instead of sending. Local development only. */
  CONTACT_DRY_RUN?: string
}
