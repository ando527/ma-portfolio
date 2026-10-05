---
title: "Speedcubing Australia 2023"
date: "2023-06"
tags: ["Webflow", "UI Design", "CMS", "Interactive"]
thumbnail: "/images/case-studies/sca-hero.webp"
heroImage: "/images/case-studies/sca-hero.png"
beforeImage: "/images/case-studies/speedcubing-before.jpg"
summary: "The original 2023 Webflow build for Australia's national speedcubing organisation — interactive competition map, live records database, and community-driven CMS."
seoTitle: "Speedcubing Australia 2023 Webflow Build"
seoDescription: "The original 2023 Webflow build for Speedcubing Australia: a competition map, a national records database and a CMS volunteers run themselves."
heroAlt: "The 2023 Speedcubing Australia homepage: a competitor solving a cube beside a stackmat timer reading 10.744"
beforeAlt: "Speedcubing Australia's site before 2023: a blurred photo of cubes behind a plain Competitions heading"
# How much of myself went into it (0–100), for the Work page's "Most involved" sort. Not shown.
effort: 60
featured: false
liveUrl: "https://www.speedcubing.org.au"
favicon: "/images/favicons/speedcubing.png"
badge: "Pro-bono"
client: "Speedcubing Australia (Not-for-profit)"
role: "Webflow Developer & UI Designer"
year: "2023"
deliverables:
  - "Full Webflow site rebuild"
  - "Rubik's cube-inspired design system"
  - "Interactive Google Maps competition finder"
  - "List/Map toggle for upcoming events"
  - "CMS national records database"
  - "Photo & video integration per record"
  - "Competitor quotes & reconstructions"
  - "Responsive mobile-first layout"
stats:
  - label: "Records tracked with media"
    value: "50+"
  - label: "Competitions mapped"
    value: "100+"
  - label: "Years of archive data"
    value: "10+"
  - label: "Platform"
    value: "Webflow"
---

> This is the original 2023 build. Three years later I redesigned the site on a refreshed brand — [read the 2026 case study](/work/speedcubing-australia/).

## The Organisation

Speedcubing Australia is the not-for-profit, volunteer-run governing body for competitive Rubik's cube solving in Australia. They coordinate dozens of WCA-sanctioned competitions each year across every state, maintain a database of national and oceanic records, and support a community of thousands of competitors aged 5 to 85.

Their old site was a plain grey page with a basic list of links and a spinning Rubik's cube GIF. It had no records database, no map, no personality, and no way to dynamically update content without editing raw HTML.

## Design Direction

The rebrand drew directly from the Rubik's cube itself: a bold, multi-colour system using green, yellow, and orange — the face colours of a standard cube. Typography is heavy and confident, with orange pill-shaped CTAs and green/yellow alternating table rows that make data instantly scannable.

The design deliberately feels energetic and approachable — this is a community sport, not a corporate organisation. Every page needed to reflect that.

## The Build

The site was built in Webflow with a heavy focus on CMS architecture and interactive features.

### Competition Finder

The Competitions page features a **List/Map toggle**: switch between a colour-coded tabular list of all upcoming events, or an interactive Google Maps embed with pin markers for each competition location. Competitors can quickly find events in their state and click through to the WCA registration page.

![The 2023 competitions list: alternating green and yellow rows of competition names, dates and cities](/images/case-studies/sca-1.png)

### National Records Database

The Records page is the centrepiece of the rebuild. Each Australian National Record (ANR) and Oceanic Record (OcR) has its own CMS entry containing:

- The record holder's photo
- The time/result
- The competition where it was set
- An embedded video of the solve (where available)
- A quote from the competitor

A featured slider on the homepage cycles through recent record-breaking moments, giving the community a reason to return to the site regularly.

![A 2023 record page: Charlie Eggins' 3x3 blindfolded average, with a quote and solve reconstructions](/images/case-studies/sca-2.png)

![The 2023 Results page: a large heading with an arrow icon above a slider of green record cards](/images/case-studies/sca-3.png)

### Content Management

Because the organisation is entirely volunteer-run, the CMS was architected so that non-technical committee members can update all content — adding new competitions, updating records, and managing team members — without any developer involvement.

![The Webflow CMS editor: collections for delegates, committee members, roles and national records, with the committee members list open](/images/case-studies/sca-4.png)

## Outcome

The rebuild transformed Speedcubing Australia's digital presence from a static afterthought into a genuine community hub. The records database in particular has become a key feature that the community engages with — tracking records, watching solves, and following Australian competitors at the world stage.

The site is also significantly faster and more accessible than its predecessor, with a mobile-first layout that works for competitors checking competition details on-site.
