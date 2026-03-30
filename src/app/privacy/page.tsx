import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Mitchell Anderson',
  description: 'Privacy policy for mitchellanderson.com.au — how analytics data is collected and used.',
  robots: { index: false },
}

export default function PrivacyPolicy() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <h1 className="font-heading text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-muted-foreground text-sm mb-12">Last updated: 2025</p>

      <div className="prose prose-sm max-w-none space-y-8">
        <section>
          <h2 className="font-heading text-xl font-semibold mb-2">Who I am</h2>
          <p>
            This is the personal portfolio of <strong>Mitchell Anderson</strong>, a web developer based in Brisbane, QLD.
            You can reach me via{' '}
            <a href="https://www.linkedin.com/in/mitchell-anderson-dev/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2">
              LinkedIn
            </a>.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-2">What data is collected</h2>
          <p>
            If you accept cookies, this site uses Google Analytics 4 to collect anonymised usage
            data — pages visited, time on site, device type, and approximate location (country/city
            level). No personally identifiable information is collected.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-2">Why it&apos;s collected</h2>
          <p>
            To understand how visitors find and use this portfolio, so I can improve it.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-2">Cookie consent</h2>
          <p>
            Analytics cookies are only set after you explicitly accept via the banner on your first
            visit. If you decline, no scripts are loaded and no data is sent to Google — the site
            functions identically either way.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-2">Third parties</h2>
          <p>
            Data is processed by Google under their{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-2">Data retention</h2>
          <p>
            Google Analytics retains data for 14 months by default. No data is stored on this
            site&apos;s servers.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-semibold mb-2">Your rights</h2>
          <p>
            You can withdraw consent at any time by clearing local storage or cookies for this
            site in your browser settings. If you are in the EU or UK, you have the right to
            access, correct, or request deletion of your data — contact me via LinkedIn.
          </p>
        </section>
      </div>
    </div>
  )
}
