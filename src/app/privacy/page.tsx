import Link from 'next/link'
import { pageMetadata, SITE } from '@/lib/site'
import PageHero from '@/components/PageHero'
import '@/app/prose.css'

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'Privacy policy for mitchellanderson.com.au: what the contact form and analytics collect, why, who processes it, and how to opt out.',
  path: '/privacy/',
  noindex: true,
})

export default function PrivacyPolicy() {
  return (
    <div className="bg-background">
      <PageHero
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Privacy Policy' }]}
        eyebrow="Legal"
        title="Privacy Policy"
        intro="Last updated: October 2026"
      />

      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="max-w-[680px]">
          <div className="article-content">
            <h2>Who I am</h2>
            <p>
              This is the personal portfolio of <strong>Mitchell Anderson</strong>, a web developer based in Brisbane, QLD.
              You can reach me via{' '}
              <a href={SITE.links.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>.
            </p>

            <h2>What data is collected</h2>
            <p>
              If you accept cookies, this site uses Google Analytics 4 to collect anonymised usage
              data — pages visited, time on site, device type, and approximate location (country/city
              level). No personally identifiable information is collected.
            </p>

            <h2>Contact form</h2>
            <p>
              If you use the <Link prefetch={false} href="/contact/">contact form</Link>, I collect what you type into it: your
              name, your email address, your message, your project type and budget range, and, if you
              choose to give them, your company, your current website, your timeline and how you heard
              about me. Nothing else is collected from the form.
            </p>
            <p>
              Your message is emailed to me through Resend and is not stored on this site. It lives in my
              inbox and in Resend&apos;s records of sent email, and I use it only to reply to you.
            </p>
            <p>
              When you press send, the form runs a bot check from Cloudflare Turnstile. It works
              invisibly in the background and Cloudflare sees your IP address and some browser details to
              do it, whether or not you have accepted analytics cookies. The Turnstile script only loads on
              the contact page. How Cloudflare handles that data is set out in the{' '}
              <a href="https://www.cloudflare.com/turnstile-privacy-policy/" target="_blank" rel="noopener noreferrer">
                Cloudflare Turnstile Privacy Addendum
              </a>
              .
            </p>
            <p>
              The Rubik&apos;s Cube puzzle on the form runs entirely in your browser. It sends no data
              anywhere.
            </p>

            <h2>Why it&apos;s collected</h2>
            <p>
              Analytics data is collected to understand how visitors find and use this portfolio, so I can
              improve it. Contact form details are collected so I can read and reply to your enquiry.
            </p>

            <h2>Cookie consent</h2>
            <p>
              Analytics cookies are only set after you explicitly accept via the banner on your first
              visit. If you decline, no scripts are loaded and no data is sent to Google — the site
              functions identically either way.
            </p>

            <h2>Third parties</h2>
            <p>
              Analytics data is processed by Google under their{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
              </a>
              .
            </p>
            <p>
              This site is hosted and protected by Cloudflare, which also runs Turnstile on the contact
              form; see the{' '}
              <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">
                Cloudflare Privacy Policy
              </a>
              . Contact form emails are delivered by Resend; see the{' '}
              <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
                Resend Privacy Policy
              </a>
              .
            </p>
            <p>
              Some pages load content from other services whether or not you accept cookies. The
              About page fetches speedcubing results from GitHub and map tiles from OpenStreetMap,
              which see your IP address like any website you visit. The YouTube video on that page
              only loads, from YouTube&apos;s privacy-enhanced domain, if you press play.
            </p>

            <h2>Data retention</h2>
            <p>
              Google Analytics retains data for 14 months by default. This site doesn&apos;t keep a
              database of visitors or messages: analytics data stays with Google, and contact form
              messages stay in my email inbox until I delete them.
            </p>

            <h2>Your rights</h2>
            <p>
              You can withdraw consent at any time by clearing local storage or cookies for this
              site in your browser settings. If you are in the EU or UK, you have the right to
              access, correct, or request deletion of your data — including anything you sent through the contact form — contact me via LinkedIn.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
