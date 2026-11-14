---
title: "AI Website Builders vs Hiring a Developer: What Small Businesses Should Know"
date: "2026-11"
summary: "AI can now produce a decent-looking website from one prompt. Here is where that is good enough for a small business, where it falls over, and how to decide. I'm a developer, so I've said where that bias might creep in."
seoTitle: "AI Website Builders vs a Web Developer: How to Decide"
seoDescription: "A Brisbane web developer's fair take on AI website builders like Wix, Squarespace, Framer, Lovable and Webflow AI: where they work, where they fail, and how to choose."
tags: ["AI", "Process", "Accessibility", "SEO"]
coverText: "AI builder or developer?"
coverImage: "/images/articles/ai-website-builders-vs-a-developer.png"
coverPosition: "right center"
relatedServices: ["webflow-development", "shopify-development", "nextjs-development"]
---

I build websites for a living, so you should discount what follows accordingly. A developer telling you that you need a developer is about as neutral as a baker telling you that you need bread.

What I can do is describe what these tools do today. They are good, and getting better every few months.

## What the AI builders actually are

There are two different things sold under the same label.

The first is a website builder with AI added: Wix, Squarespace, Framer and Webflow. You describe your business, the tool lays out pages and writes some copy, and you edit the result in a visual editor. Wix says all its plans include its AI site builder, and Squarespace puts AI credits on every plan. Squarespace's plans start at A$18.70 a month paid annually (A$26.40 month to month, GST included), and Framer's paid plans start at US$10 a month.

I'm a Webflow developer, so read this paragraph with the same salt. Webflow's AI site builder, by its own description, needs no design or technical expertise and can build a site, change designs, write copy and generate code, with guardrails for your brand and data. The free Starter plan gives you a Webflow.io domain and two static pages. Basic, which adds a custom domain, is US$15 a month billed yearly, and Premium, which includes the CMS, is US$25. Webflow prices are in US dollars, per site, plus tax, and they change.

The second is "vibe coding": Lovable, Bolt and v0, plus plain chats with Claude or ChatGPT. These write actual code from your prompts. Bolt's paid plan is US$25 a month and v0's is US$30 a month. Lovable has a free tier of five build credits a day, capped at 30 a month.

The first group gives you a site inside a platform. The second gives you a pile of code, and you have to host, secure and look after it. That difference matters more than any feature list.

## Where AI is good enough

A one-page site for a side project, a market stall, a local club or a new idea you want to test. If a mistake costs you an afternoon, not a client, AI is a fine way to start.

It's also good at getting past the blank page, even if you rewrite most of the draft. And for anything temporary, like an event page you'll switch off in three months, developer money rarely makes sense.

[MITCHELL: add what you saw when you tried one of these tools, or where you've used AI in your own builds. Delete this line if you'd rather not.]

## Where it falls over

### Accessibility

WebAIM tests the home pages of the top one million sites each year. Its 2026 report found an average of 56.1 detectable errors per page, up 10.1% on 2025, and 95.9% of pages had at least one WCAG failure. That is the first reversal after several years of slow improvement, and the report says the trend likely reflects AI-assisted coding and heavier use of frameworks. That's a likely explanation, not a proven one, and the report covers the whole web.

The most common failures are the dull ones: low contrast text on 83.9% of pages, missing image descriptions on 53.1% and unlabelled form fields on 51%. They're also what AI tends to produce when nobody checks, because a layout that looks fine to you can be unusable with a keyboard or screen reader. A builder won't make a site accessible by default, and the Australian Human Rights Commission says organisations should aim for WCAG 2.2 Level AA at a minimum.

### Security

If your site only shows information, security risk is small. It grows quickly once you take logins, bookings or customer details.

In October 2025, security company Escape.tech scanned more than 5,600 publicly available vibe-coded apps, mostly built on Lovable. It found over 2,000 vulnerabilities, more than 400 exposed secrets and 175 instances of personal data, including medical records and phone numbers. It describes those as lower-bound figures, and the sample leaned heavily towards one platform.

In February 2026, The Register reported a Lovable-built app with 18,697 user records exposed. The app had no row-level security on its database, and its AI-generated login logic was inverted, blocking logged-in users and letting anonymous ones in. Lovable said every project gets a security scan before publishing, but fixing what it flags is up to the owner. That tells you who carries the risk.

### Search, migrations and redirects

This is the one that costs the most when it's missed. An AI builder only knows what's in your prompt, and the history of your old site isn't. If you replace a site that has Google rankings, every old address that earned traffic needs to redirect to its new home. When I rebuilt [Speedcubing Australia's site](/work/speedcubing-australia/), keeping addresses the same and redirecting the rest meant it held first place on Google Australia for "speedcubing australia" on launch day.

Rendering used to be the other worry. Lovable's older apps draw pages in the browser, which can leave crawlers with an empty page. Apps created since May 2026 render on the server instead. That one is improving, but metadata, sitemaps and redirects still need a person checking them.

### Performance and the details

My [pre-launch checklist](/articles/website-launch-checklist/) exists because the problems that matter are rarely visible in a preview. Speedcubing Australia's FAQ page scored 0.39 on Cumulative Layout Shift, where Google wants under 0.1. Reserving space for the content before it loaded fixed it.

### Ownership and upkeep

If you build inside Wix or Squarespace, the site lives there. Check what the export covers before you commit. Squarespace's help page says you can export certain content to an .xml file for WordPress, but many features rely on its JavaScript and CSS, so some content doesn't export, and you can't move content from one Squarespace site to another. Plan on rebuilding the design if you leave. Lovable's docs say you can sync a project's code with GitHub, GitLab or Bitbucket, so a copy can sit in your own repository. Code nobody on your side understands is its own kind of lock-in, though. When it breaks in eight months, someone has to read it first.

[MITCHELL: add what you've seen when a client moves off one of these platforms, if anything.]

### Brand

In my opinion, AI layouts tend to look like each other. That's fine for a stall and a problem for a business that competes on being recognisably different.

[MITCHELL: add an example of a generic AI-built site you've seen, or cut this section down.]

## How to decide

Ask these in order.

1. What happens if the site is wrong for a month? If the answer is "nothing much", use the AI tool.
2. Does it take logins, payments or personal details? If so, get a person involved before it goes live, even if AI wrote most of it.
3. Is there an old site with rankings? Then the migration plan matters more than the build.
4. Who will look after it in a year? If it's you, pick a platform with an editor. If it's nobody, that's a reason to pay someone.
5. Does the brand carry the business? Then spend on design.

There's a middle path too. Use AI for the first draft and bring in a developer to audit it. Reviewing a draft is a smaller job than building from scratch. And [Sippy Tom](/work/sippy-tom/) got a new brand and a Webflow site in two days on a tight budget, so hiring a developer isn't always a long project.

## Not sure where your site sits?

If you've built something with one of these tools and want a straight second opinion on accessibility, speed, search and security, [send me a message on LinkedIn](https://www.linkedin.com/in/mitchell-anderson-527au/). If the answer is that it's fine, I'll say so. You can also see [how I build in Webflow](/webflow-development/).
