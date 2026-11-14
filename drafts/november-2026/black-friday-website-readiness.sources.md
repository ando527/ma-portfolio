# Sources and notes: black-friday-website-readiness

## Facts used and where they came from (all opened with WebFetch on 2026-11-09)

- Black Friday 27 Nov 2026, Cyber Monday 30 Nov 2026: https://www.mozo.com.au/online-shopping/black-friday (secondary; dates also match search results from several sources).
- Australians spent $23.8b over the two-week Black Friday period in 2025, 19.5% above a typical fortnight; online $8b, up 9.3%; in-store flat (the page also says 2.3% in a key point, ambiguous, so I only said "flat"); sales up 5.1% YoY in the week before: https://www.commbank.com.au/articles/newsroom/2025/12/black-friday-travel-splurge-lifts-spending-to-record.html
- Mobile 57.5% of US online sales on Cyber Monday 2025; 52.8% season-to-date 1 Nov to 1 Dec (US retail sites): https://news.adobe.com/news/2025/12/adobe-cyber-monday-hits-record
- Core Web Vitals "good" thresholds LCP 2.5s, INP 200ms, CLS 0.1, at the 75th percentile: https://web.dev/articles/defining-core-web-vitals-thresholds
- Shopify flash-sale guidance (tens of thousands of checkouts in minutes; 50,000 visitors / 1,000 orders needs nothing special; payment provider and second provider; check apps with developers; pay-later may cause overselling; use preview products, hiding Add to cart is unreliable): https://help.shopify.com/en/manual/promoting-marketing/sales/flash-sales
- Australia Post: almost 111 million parcels in Nov-Dec "last year"; 2026 Parcel Post and Express Post last dates; 2:30pm over-the-counter; regional needs extra time: https://auspost.com.au/christmas
- Think with Google, "Find out how you stack up to new industry benchmarks for mobile page speed", dated 20 February 2018 (opened 2026-11-09): Google trained a neural network (90% prediction accuracy) on bounce and conversion data; as mobile page load goes from 1s to 10s, the probability of a mobile visitor bouncing rises 123%. Used with the label "Google research from 2018". The page says it was updated; nothing is claimed about the update. https://business.google.com/ca-en/think/marketing-strategies/mobile-page-speed-new-industry-benchmarks/
- PageSpeed Insights (link only, no stat): https://pagespeed.web.dev/
- Voice and format: Mitchell's three existing articles in src/content/articles/. LinkedIn URL and service slugs reused from them.

## Searched or opened but NOT used

- Shopify BFCM 2025 results ($14.6b, up 27%; Australia third-highest selling country): https://www.shopify.com/news/bfcm-data-2025 (opened, left out as not needed).
- Shopify BFCM help page (only a link list): https://help.shopify.com/en/manual/promoting-marketing/sales/marketing-for-bfcm
- Google/SOASTA bounce rate (1s to 3s = 32%): could not open the primary page. Left out; replaced by the 2018 Think with Google 123% figure, now listed above as opened.
- Adobe Jan 2026 season PDF (56.4% mobile): fetch returned binary, not verified. Left out.
- Webflow help page on enabling checkout: 403. The Webflow test advice in the post is generic and not attributed to Webflow.
- Agency claims that Shopify recommends a code freeze: unverified and sources disagree. The post presents the freeze as Mitchell's own rule of thumb.
- No 2026 Australian BFCM forecast could be found, so none is used.

## [MITCHELL: ...] placeholders

1. In "Check speed where Google measures it": add a real client-store example (a sale-page change that made it faster, with numbers if available).

## Things to check before publishing

- Replace [LINK TO ARTICLE] in the LinkedIn post. "Less than three weeks away" is true from 7 Nov 2026; if posting after about 16 Nov, re-word it (for example "about a week away") in both files.
- FINAL CHECK REQUIRED before publishing: the Webflow help page on enabling ecommerce checkout is still unverified (403 earlier; the Webflow test advice stays generic and unattributed), and the Australia Post dates need a final re-check against https://auspost.com.au/christmas.
- Dates confirmed consistent in the post: Black Friday Fri 27 Nov 2026, Cyber Monday Mon 30 Nov 2026, example freeze Fri 20 Nov 2026, 13 Nov 2026 is a Friday.
- The article says CommBank figures are for "last year" (2025). The 4.6% growth and other details are in the source but unused.
- The post says the freeze date Friday 20 November and "13 November" are examples; Nov 20 2026 is a Friday.
- Australia Post dates are metro Parcel Post/Express Post from the page as fetched; re-check the page before publishing in case dates change. Qld to WA Thu 17 Dec, Qld to Tas Fri 18 Dec, Qld to NT Mon 14 Dec, Qld to Qld Tue 22 Dec.
- The "freeze a week out" and "put an order-by date in the cart" advice is opinion, not sourced.
- The Webflow test advice and "real card and refund" suggestion are general practice, not from a source.
- Cover image /images/articles/black-friday-website-readiness.png does not exist yet.
