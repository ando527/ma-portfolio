import { pageMetadata, SITE } from '@/lib/site'
import PageHero from '@/components/PageHero'
import '@/app/prose.css'

export const metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'Privacy policy for mitchellanderson.com.au: what analytics data is collected, why, and how to opt out.',
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

            <h2>Why it&apos;s collected</h2>
            <p>
              To understand how visitors find and use this portfolio, so I can improve it.
            </p>

            <h2>Cookie consent</h2>
            <p>
              Analytics cookies are only set after you explicitly accept via the banner on your first
              visit. If you decline, no scripts are loaded and no data is sent to Google — the site
              functions identically either way.
            </p>

            <h2>Third parties</h2>
            <p>
              Data is processed by Google under their{' '}
              <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
                Privacy Policy
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
              Google Analytics retains data for 14 months by default. No data is stored on this
              site&apos;s servers.
            </p>

            <h2>Your rights</h2>
            <p>
              You can withdraw consent at any time by clearing local storage or cookies for this
              site in your browser settings. If you are in the EU or UK, you have the right to
              access, correct, or request deletion of your data — contact me via LinkedIn.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
