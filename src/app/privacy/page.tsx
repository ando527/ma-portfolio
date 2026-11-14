import type { ReactNode } from 'react'
import Link from 'next/link'
import { pageMetadata, SITE } from '@/lib/site'
import PageHero from '@/components/PageHero'
import JsonLd from '@/components/JsonLd'
import { graph, webPageNode, breadcrumbNode } from '@/lib/schema'

export const metadata = pageMetadata({
  title: 'Privacy policy',
  description: 'Privacy policy for mitchellanderson.com.au: what the contact form and analytics collect, why, who processes it, and how to opt out.',
  path: '/privacy/',
  noindex: true,
})

// Plain prose: one column, a readable measure, headings set by size and colour.
const linkClass =
  'font-medium text-fg underline underline-offset-4 decoration-1 decoration-fg-3 hover:decoration-accent transition-colors duration-150 ease-spec'

function H2({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 mt-12 font-sans text-xl font-medium leading-7 text-fg first:mt-0">{children}</h2>
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-4 first:mt-0">{children}</p>
}

function Ext({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
    </a>
  )
}

export default function PrivacyPolicy() {
  return (
    <div className="bg-paper">
      <JsonLd
        data={graph(
          webPageNode('/privacy/', {
            name: 'Privacy policy',
            description: 'Privacy policy for mitchellanderson.com.au: what the contact form and analytics collect, why, who processes it, and how to opt out.',
            breadcrumb: true,
          }),
          breadcrumbNode('/privacy/', [
            { name: 'Home', path: '/' },
            { name: 'Privacy policy', path: '/privacy/' },
          ]),
        )}
      />
      <PageHero
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Privacy policy' }]}
        eyebrow="Legal"
        title="Privacy policy"
        intro={<span className="split">Last updated: October 2026</span>}
      />

      <div className="mx-auto max-w-6xl px-6 py-16 md:py-24 lg:px-8">
        <div className="max-w-2xl font-sans text-base leading-7 text-fg-2">
          <H2>Who I am</H2>
          <P>
            This is the personal portfolio of <strong className="font-medium text-fg">Mitchell Anderson</strong>, a web developer based in Brisbane, QLD.
            You can reach me via <Ext href={SITE.links.linkedin}>LinkedIn</Ext>.
          </P>

          <H2>What data is collected</H2>
          <P>
            If you accept cookies, this site uses Google Analytics 4 to collect anonymised usage
            data: pages visited, time on site, device type, and approximate location (country/city
            level). No personally identifiable information is collected.
          </P>

          <H2>Contact form</H2>
          <P>
            If you use the <Link prefetch={false} href="/contact/" className={linkClass}>contact form</Link>, I collect what you type into it: your
            name, your email address, your message, your project type and budget range, and, if you
            choose to give them, your company, your current website, your timeline and how you heard
            about me. Nothing else is collected from the form.
          </P>
          <P>
            Your message is emailed to me through Resend and is not stored on this site. It lives in my
            inbox and in Resend&apos;s records of sent email, and I use it only to reply to you.
          </P>
          <P>
            When you press send, the form runs a bot check from Cloudflare Turnstile. It works
            invisibly in the background and Cloudflare sees your IP address and some browser details to
            do it, whether or not you have accepted analytics cookies. The Turnstile script only loads on
            the contact page. How Cloudflare handles that data is set out in the{' '}
            <Ext href="https://www.cloudflare.com/turnstile-privacy-policy/">Cloudflare Turnstile Privacy Addendum</Ext>.
          </P>
          <P>
            The Rubik&apos;s Cube puzzle on the form runs entirely in your browser. It sends no data
            anywhere.
          </P>

          <H2>Why it&apos;s collected</H2>
          <P>
            Analytics data is collected to understand how visitors find and use this portfolio, so I can
            improve it. Contact form details are collected so I can read and reply to your enquiry.
          </P>

          <H2>Cookie consent</H2>
          <P>
            Analytics cookies are only set after you explicitly accept via the banner on your first
            visit. If you decline, no scripts are loaded and no data is sent to Google. The site
            functions identically either way.
          </P>

          <H2>Third parties</H2>
          <P>
            Analytics data is processed by Google under their{' '}
            <Ext href="https://policies.google.com/privacy">Privacy Policy</Ext>.
          </P>
          <P>
            This site is hosted and protected by Cloudflare, which also runs Turnstile on the contact
            form; see the <Ext href="https://www.cloudflare.com/privacypolicy/">Cloudflare Privacy Policy</Ext>.
            Contact form emails are delivered by Resend; see the{' '}
            <Ext href="https://resend.com/legal/privacy-policy">Resend Privacy Policy</Ext>.
          </P>
          <P>
            Some pages load content from other services whether or not you accept cookies. The
            About page fetches speedcubing results from GitHub and map tiles from Esri,
            which see your IP address like any website you visit. The YouTube video on that page
            only loads, from YouTube&apos;s privacy-enhanced domain, if you press play.
          </P>

          <H2>Data retention</H2>
          <P>
            Google Analytics retains data for 14 months by default. This site doesn&apos;t keep a
            database of visitors or messages: analytics data stays with Google, and contact form
            messages stay in my email inbox until I delete them.
          </P>

          <H2>Your rights</H2>
          <P>
            You can withdraw consent at any time by clearing local storage or cookies for this
            site in your browser settings. If you are in the EU or UK, you have the right to
            access, correct, or request deletion of your data, including anything you sent through
            the contact form. To do so, contact me via LinkedIn.
          </P>
        </div>
      </div>
    </div>
  )
}
