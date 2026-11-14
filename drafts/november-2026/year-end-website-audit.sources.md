# Sources and checks: year-end-website-audit

## Facts used and where they came from (pages I opened)

1. .au renewal: renew up to 90 days before expiry; 30 calendar day grace after expiry; domain and website/email stop working during it; then released first-come, first-served.
   https://www.auda.org.au/au-domain-names/manage-your-au-domain-name/renew-your-au-domain-name/
2. TLS certificate maximum validity: 200 days from 15 Mar 2026, 100 days from 15 Mar 2027, 47 days from 15 Mar 2029 (Relevant Dates table, section 1.2.2).
   https://cabforum.org/working-groups/server/baseline-requirements/requirements/
3. Ballot SC-081v3 vote closed 11 Apr 2025, requirements met; reductions run March 2026 to March 2029.
   https://cabforum.org/2025/04/11/ballot-sc081v3-introduce-schedule-of-reducing-validity-and-data-reuse-periods/
4. Google sender rules: all senders need SPF or DKIM from 1 Feb 2024; bulk senders (more than 5,000/day) need SPF, DKIM, DMARC (policy may be "none"); From domain must align with SPF or DKIM domain; spam rate under 0.3%.
   https://support.google.com/a/answer/81126
5. INP thresholds: 200 ms or less good, over 500 ms poor, 75th percentile, mobile and desktop separately.
   https://web.dev/articles/inp
6. Google Business Profile special hours: up to 6 days in a row; longer or unknown closure = mark temporarily closed; confirm hours for official holidays even if unchanged.
   https://support.google.com/business/answer/6303076
7. Gmail "More > Show original" shows full headers.
   https://support.google.com/mail/answer/29436
8. Gmail authentication check (page opened 2026-11-09): for other email clients, find the Authentication-Results header; if authenticated by SPF or DKIM you'll see spf=pass or dkim=pass. Gmail shows a question mark next to the sender's name when a message isn't authenticated; unauthenticated messages aren't necessarily spam. SPF = which hosts may send for a domain; DKIM = digital signature checked with a public key.
   https://support.google.com/mail/answer/180707
9. Privacy Act (opened 2026-11-09): from 10 Dec 2026 APP entities must include in their privacy policy information about computer programs that make or inform decisions significantly affecting individuals' rights or interests (APP 1.7, from the Privacy and Other Legislation Amendment Act 2024). OAIC news item, 30 Sep 2026.
   https://www.oaic.gov.au/news/media-centre/new-resources-on-transparency-for-use-of-ai-and-automated-decision-making
   Small business turnover threshold of $3 million (generally not covered, with exceptions): seen on an earlier OAIC page. The post hedges this and links the news item only.

## Searches used for context only (not cited as fact)
Secondary blogs (appviewx, sslinsights, etc.) were consulted via search but nothing in the post relies on them.

## Things Mitchell must check
- Optionally test the header advice on a real form message.
- The statement that on Webflow and Shopify "the platform looks after the core software": this is general knowledge, not sourced. Keep only if you agree.
- "Ask your host to confirm the certificate renews automatically" is advice, not a sourced claim.
- Link-checker, uptime monitor, 2FA, backups advice and "freeze changes before the break" are practical opinion, unsourced.
- The claim that your SPF/DKIM records keep form notifications and invoices out of spam is a reasonable inference, not directly from Google's page.
- Cover image /images/articles/year-end-website-audit.png does not exist yet.
- The post says "before mid-December" and "next six weeks" from 9 Nov 2026; adjust if publishing later.
- The 5,000/day Gmail threshold is Google's; Yahoo's rules and Microsoft's were not researched.

## Left out because I could not verify it from a primary source
- Privacy Act statutory tort start date (not verified, not in the post).
- The date INP replaced FID (March 2024): appeared in a search snippet, not on the page I opened.
- Let's Encrypt shorter certificate timeline (opened: https://letsencrypt.org/2025/12/02/from-90-to-45), not used.
- Any Google Analytics, Webflow or Shopify specifics.

## [MITCHELL] placeholders
1. Form/notification going to a wrong or old inbox (post, forms section): real example only.
2. Optional sign-off or example near the end of the post.
3. LinkedIn file: pick an opening line, add an example, insert the article link.
