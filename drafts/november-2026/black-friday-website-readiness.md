---
title: "Is Your Website Ready for Black Friday and Cyber Monday?"
date: "2026-11"
summary: "Black Friday is 27 November. Here's what I'd check on a Shopify, Webflow or promo site in the next two weeks: phone speed, a change freeze, checkout tests and Australia Post cut-offs."
seoTitle: "Black Friday Website Readiness Checklist for Australian Businesses"
seoDescription: "A Brisbane web developer's Black Friday and Cyber Monday checklist for Shopify and Webflow sites: mobile speed, change freeze, checkout testing, promo pages and Australia Post cut-offs."
tags: ["Shopify", "Webflow", "Performance", "E-commerce"]
coverText: "Black Friday readiness"
coverImage: "/images/articles/black-friday-website-readiness.png"
coverPosition: "right center"
relatedServices: ["shopify-development", "webflow-development"]
---

Black Friday is Friday 27 November and Cyber Monday is Monday 30 November. As I write this, that's less than three weeks away.

That's enough time to fix most of what goes wrong on a sale weekend, if you start now and stop changing things well before the sale. Here's what I'd check, in the order I'd do it.

## The sale starts before Friday

CommBank put Australian spending over the two-week Black Friday period last year at $23.8 billion, 19.5% above a typical fortnight. Online sales were $8 billion, up 9.3% on the year before, while in-store spending was flat.

Its report also shows sales up 5.1% year on year in the week before Black Friday. Plenty of shoppers are already buying by then, so your sale page needs to work from the day you announce the offer.

## Test it on a phone first

Adobe's figures cover US stores, so they're a guide only. They put mobile at 57.5% of online sales on Cyber Monday 2025, and 52.8% across 1 November to 1 December.

Whatever the exact Australian split, a lot of your sale traffic will arrive on a phone, often from an email or an Instagram ad, often on mobile data. Open your homepage, your sale collection, a product page and the checkout on a real phone with wifi switched off. Look for:

- a promo banner that pushes the page down or covers the menu
- a pop-up with a close button too small to tap
- a sale price that shows on the collection page but not on the product page
- a countdown timer that's still counting down to last year's sale

## Check speed where Google measures it

Google's "good" thresholds, measured at the 75th percentile of visits, are a Largest Contentful Paint of 2.5 seconds or less, an Interaction to Next Paint of 200 milliseconds or less and a Cumulative Layout Shift of 0.1 or less. In plain terms: the main thing on the page appears quickly, the page responds when tapped and nothing jumps around while it loads.

Run your homepage and your busiest sale page through [PageSpeed Insights](https://pagespeed.web.dev/) and read the mobile result first. A sale usually makes speed worse, because the first things people add are a big new banner image and a pop-up app. Compress the banner, drop any pop-up you can live without, and look at the third-party scripts on the page. Every chat widget and review app has to download before it can help anyone. Google research from 2018 found that as mobile page load time goes from one second to 10 seconds, the chance of a visitor bouncing rises by 123%.

[MITCHELL: add a real example from a client store here, e.g. one change to a sale page that made it faster, with before and after numbers if you have them.]

## Freeze changes about a week out

This is my own rule of thumb. Once the sale is set up, stop changing the site. Pick a date, say Friday 20 November, and after it only fix things that are broken. No new apps, no theme experiments, no quick layout tweak the night before.

The reason is dull. A change made on Thursday night has had no time to show you what it breaks. A change made on 13 November has had a week of normal traffic to show you.

Before the freeze, duplicate your theme or take a backup so you can go back if something goes wrong. If a developer or agency looks after your site, tell them the date now so they don't schedule a small update for the Wednesday of the sale.

## Test checkout and payments properly

Place a real test order from a phone. Then do it again with a discount code, and again with a different payment method.

Shopify's help centre has specific advice for big sales:

- If you don't use Shopify Payments, ask your payment provider whether it can handle your expected volume, and consider setting up a second provider as a backup.
- Ask the developers of any app that touches checkout whether it can handle your expected order volume, and turn it off for the sale if they aren't confident.
- Pay-later and partial-payment options from outside providers can cause overselling, so Shopify suggests considering turning them off during the sale.
- Don't publish sale products early and rely on hiding the Add to cart button. Products published with inventory available can still be bought, so create separate preview products instead.

That last one catches people out. A "hidden" sale price is a real price the moment someone finds the link.

On Webflow Ecommerce the test is the same: add a product to the cart, go through checkout, place the order and confirm the order email arrives. Use your payment provider's test mode if it has one, or a real card and a refund if it doesn't.

## You probably don't need to panic about traffic

Shopify's help centre says special preparation is usually only needed when you expect tens of thousands of customers to start checkout within a few minutes. Its own example is a sale with 50,000 visitors and 1,000 orders over 24 hours, which it says needs no special preparation.

Most small stores are nowhere near that. The usual way a sale goes wrong is smaller: a discount code that doesn't behave the way you expected, or a sale page nobody linked to the menu.

## If you don't have a store

A promo site or a service business with a Black Friday offer has less to break, but the same checks apply.

Does the offer page say when it ends, in your timezone, and does it actually end? Do the enquiry form, the booking link and the phone number all work from a phone? Do your ad and email links go to a page built for the offer instead of the homepage? And who reads the form emails over the weekend? A promo that brings in leads nobody answers until Tuesday wastes most of the ad spend.

## Put the Australia Post cut-offs on your site

If people are buying gifts, the question you'll get most in December is "will it arrive in time?" Australia Post says it delivered almost 111 million parcels in November and December last year, so the network will be full.

For metro Parcel Post, its 2026 last posting dates are mostly Monday 21 December, with Tuesday 22 December inside a state. From Queensland, parcels to Western Australia need to go by Thursday 17 December, to Tasmania by Friday 18 December and to the Northern Territory by Monday 14 December. Express Post runs to Wednesday 23 December, or Tuesday 22 December to and from WA and the NT. Over-the-counter parcels need to be lodged by 2:30pm, and regional addresses need extra time.

Those are Australia Post's dates, and yours need to be earlier to allow for packing. Work backwards from them, then put your "order by" date in the cart and on product pages so customers see it before they pay. The full table is on [Australia Post's Christmas page](https://auspost.com.au/christmas), since the dates change with the origin and destination.

## Want a second pair of eyes?

If you'd like someone to go through your store or promo page before the sale, [send me a message on LinkedIn](https://www.linkedin.com/in/mitchell-anderson-527au/) with the link. I build in [Shopify](/shopify-development/) and [Webflow](/webflow-development/), and I'll tell you what I'd fix first.
