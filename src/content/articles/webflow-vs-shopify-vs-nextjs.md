---
title: "Webflow, Shopify or Next.js? How I Choose a Platform for a Website"
date: "2026-09"
summary: "Most business websites belong in Webflow, most online stores belong in Shopify, and a few projects need to be built in code. Here's how I decide, and the client projects that landed on each side."
seoTitle: "Webflow vs Shopify vs Next.js: How to Choose"
seoDescription: "How a Brisbane web developer chooses between Webflow, Shopify and Next.js: what the site sells, who edits it and where its data comes from, with real projects."
tags: ["Webflow", "Shopify", "Next.js"]
coverText: "Webflow, Shopify or Next.js?"
# Shown behind the cover text and gradient on article cards: Sippy Tom
# (Webflow), We Got The Chocolates (Shopify) and this site (Next.js).
coverImage: "/images/articles/platform-sites.png"
coverPosition: "right center"
relatedServices: ["webflow-development", "shopify-development", "nextjs-development"]
---

I build websites in three tools: Webflow, Shopify and Next.js. Picking between them is the first real decision on most projects, and plenty of clients arrive with the answer already chosen because a friend uses one or a previous agency liked it.

Here's the short version. If the site exists to sell products, use Shopify. If your team needs to update it without a developer, use Webflow. If it needs custom logic, data from other systems or full control over hosting, build it in Next.js. Most business websites end up in Webflow.

The rest of this article covers the questions behind that answer, where each platform starts to struggle, and the projects that went each way.

## Three questions to answer before choosing a platform

I don't start with features. I start with these:

1. **Is selling products the point of the site?** I mean checkout being the main thing people come to do, as opposed to "we might sell a few things one day".
2. **Who will update the site, and how often?** A marketing team posting every week needs something different from a site that changes twice a year.
3. **Where does the content come from?** If people type it in, any of the three will do. If it comes from another system, like a booking platform, a database or a public API, that narrows the field quickly.

Budget and timeline matter too, but they usually follow from these answers.

## When Webflow is the right choice

Webflow is a visual website builder with a CMS and hosting included. I design and build directly in it, and after launch the client edits their own content in the Editor without being able to break the layout.

It suits sites where the content changes often but the structure doesn't: service businesses, hospitality, professional firms, not-for-profits and personal brands. Some examples from my own work:

- [Sippy Tom](/work/sippy-tom/), a cafe in Teneriffe, needed a new brand and a website on a tight budget. Both were delivered in two days. The staff now change their seasonal menus in the CMS themselves.
- [VennCap Real Estate](/work/venncap/) manages $0.93bn in property and needed a site that looks the part, with property case studies and team profiles their own staff can add to.
- [Speedcubing Australia](/work/speedcubing-australia/) is run entirely by volunteers. Committee members manage records and team members in the CMS without ever needing me.

Webflow also stretches further than people expect. Speedcubing Australia's competition finder is a single embedded script that reads the World Cube Association's public API, so competitions appear on the site the moment they're announced and nobody types them in.

### Where Webflow struggles

- **Big or complicated content.** Each plan caps how many CMS items you can store, and there are limits on how collections can reference and nest inside each other. A site with tens of thousands of records will hit them.
- **Serious e-commerce.** Webflow can sell products, but large catalogues, complex variants, subscriptions and the app ecosystem that stores rely on are Shopify's territory.
- **Heavy custom functionality.** Custom code embeds go a long way. Past a certain point, though, you're working against the tool, and that's usually the sign a project wants Next.js.

## When Shopify is the right choice

Shopify is built around selling. Products, inventory, payments, shipping, tax and checkout are all handled, and the checkout is one many of your customers will already have used somewhere else. If a store is the reason the site exists, I'd start with Shopify even when Webflow could technically do the job.

The bigger decision inside Shopify is the theme. A bought theme is fine for a lot of stores. A custom theme is worth it when the brand needs to look and behave like nothing else in its category.

[We Got The Chocolates](/work/we-got-the-chocolates/) is a comedy podcast, and their store needed to feel like the show: dark, loud and full of surprises, with animated product cards, scrolling marquee banners and a hidden easter egg. The same store also takes membership applications and plays podcast episodes and video, so it works as a home for the fans as well as a shop.

### Where Shopify struggles

- **Content-heavy pages.** Blogs, long guides and rich landing pages are possible but more limited than in Webflow, and they're harder for a marketing team to lay out freely.
- **App creep.** Many features come from apps. Each one adds a monthly fee and often its own script to every page, and a store with fifteen apps can feel it.
- **Anything that isn't a store.** If selling is a side feature, you're paying for and working around an e-commerce platform to run a brochure site.

## When Next.js is the right choice

Next.js is a React framework, so the whole site is code. That means almost anything is possible, and nothing comes ready-made. I reach for it when a project needs:

- **Data from other systems,** pulled in when the site is built or as people use it.
- **Custom logic** a builder can't handle well, such as calculators, portals, logged-in areas or complex search.
- **Full control over performance and hosting,** down to exactly what each page loads.

The site you're reading is built this way. It's a Next.js site exported as plain static files, so there's no server to keep patched. The [About page](/about/) gets my speedcubing results from the World Cube Association when the site builds, then checks for newer competitions in your browser, so it stays current without me editing anything.

### Where Next.js struggles

- **Content editing.** Content lives in code, so changes go through a developer. A headless CMS can give your team an editing screen, but that's another service to set up and pay for.
- **Cost up front.** Everything a builder gives you for free, from forms to image handling to hosting, has to be chosen and set up.
- **Long-term upkeep.** Whoever maintains the site next needs to be comfortable with the codebase. With Webflow or Shopify, far more people can pick it up.

## What about WordPress?

I don't recommend WordPress for new builds anymore. Between plugin updates, security patches and hosting performance, too much of the budget goes on keeping the site running. I've written more about that in [why companies are moving from WordPress to Webflow](/articles/ditching-wordpress-for-webflow/).

## When the answer isn't obvious

A few situations come up often enough to have a default answer:

- **A service business that sells a handful of products.** Webflow, with its built-in e-commerce or a Shopify Buy Button for the products. Neither needs a full store.
- **A Webflow-shaped site that needs one piece of live data.** Stay in Webflow and add a custom embed, as Speedcubing Australia did, rather than rebuilding everything in code for one feature.
- **A store that's mostly editorial.** Usually still Shopify, with the content pages designed carefully, because moving the shop somewhere else later is the more expensive mistake.

## Frequently asked questions

### Which platform is best for SEO?

Any of the three can rank well. Rankings come down to how the site is set up: written page titles and descriptions, structured data, a clean sitemap, fast pages and accessible markup. A platform makes some of that easier, but none of them does it for you.

### Can I move platforms later?

Yes, but it means a rebuild. The important part is keeping the page addresses the same where possible and redirecting the rest, so the new site keeps the search rankings the old one earned. When I rebuilt Speedcubing Australia's site in 2026, it held the top spot on Google Australia for "speedcubing australia" on launch day.

### Which one is cheapest?

It depends on what you're comparing. Webflow and Shopify have monthly plan fees but cover hosting and much of the upkeep. A static Next.js site can be very cheap to host, but every change needs a developer. I'd compare the cost of running the site for three years, not just building it.

## Not sure which one fits?

You can see projects on each platform on [my work page](/work/), or read more about how I build in [Webflow](/webflow-development/), [Shopify](/shopify-development/) and [Next.js](/nextjs-development/). If you'd like a straight answer for your project, [send me a message on LinkedIn](https://www.linkedin.com/in/mitchell-anderson-527au/) with what the site needs to do and who will be looking after it.
