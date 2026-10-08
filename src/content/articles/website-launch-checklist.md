---
title: "The Pre-Launch Checklist I Run on Every Website"
date: "2026-10"
summary: "The checks I run before any website goes live: phones, links, accessibility, speed, search and forms. Most of it is work nobody notices until it's missing."
seoTitle: "Website Launch Checklist: What to Check Before Going Live"
seoDescription: "A web developer's pre-launch website checklist: mobile layouts, broken links, accessibility, page speed, SEO, structured data, redirects and forms."
tags: ["Launch", "Accessibility", "SEO", "Performance"]
coverText: "The launch checklist"
# Shown behind the cover text and gradient on article cards. Two phones from
# the SCA case study's sca-2026-mobile screenshot, set on the cover colour.
coverImage: "/images/articles/launch-checklist-phones.png"
coverPosition: "right center"
relatedServices: ["webflow-development", "shopify-development", "nextjs-development"]
---

The last week before a website launches is when most of the problems people would actually notice get caught. A form that sends to an old inbox, a page that scrolls sideways on a small phone, or a "noindex" tag left over from staging that quietly keeps the whole site out of Google.

None of these are hard to fix. They're just easy to miss, so I don't rely on remembering them. Before any site goes live, I go through the same list.

When I rebuilt [Speedcubing Australia's website](/work/speedcubing-australia/) this year, the list and feedback from a group of beta testers turned into 36 fixes. I ranked them by what a visitor would notice first, worked from the top, then audited every page again at phone, tablet and desktop widths before launch. Here's the list, grouped the way I work through it.

## Check every page on a phone

Most visitors arrive on a phone, so this comes first.

- **Check every page from 320px wide upwards.** That's the width WCAG uses for its reflow test, and roughly the narrowest phone still in use. Look for anything that scrolls sideways: a wide table, a long word, an image with a fixed width.
- **Use a real phone, not just browser tools.** Browser tools resize the page, but they don't show you a thumb trying to hit a small link, or a sticky header taking up a third of a short screen.
- **Check tap targets.** Buttons and links need enough size and space that people don't hit the wrong one.
- **Open the menu on every page.** Mobile navigation is where layout bugs like to hide.

## Content and links

- **Search for leftovers.** Placeholder text, links pointing at "#", "test" pages and draft CMS items that shouldn't be published.
- **Click every link.** Internal links, buttons, footer links and links inside CMS content. Broken links on launch day undo a lot of goodwill.
- **Check the facts people act on.** Phone numbers (and that they're tappable on phones), email addresses, street addresses, opening hours and prices.
- **Make the 404 page useful.** Someone will hit a broken link eventually. The page should say what happened and get them back on track. Speedcubing Australia's [404 page](https://www.speedcubing.org.au/404) has a Rubik's cube that solves itself, but a clear message and a link home does the job.
- **Have a privacy policy,** and a cookie consent banner if the site uses analytics or advertising cookies.

## Accessibility

Accessibility is easiest to get right during the build, but the pre-launch pass catches what slipped through. On Speedcubing Australia, these checks covered everything from filter buttons to map pins.

- **Tab through every page with the keyboard.** Every link, button and form field should be reachable, in a sensible order, with a visible focus ring showing where you are.
- **Give every meaningful image alt text** that describes what it shows. Decorative images get empty alt text so screen readers skip them.
- **Label every form field properly.** Placeholder text that disappears when you start typing isn't a label.
- **Check colour contrast.** WCAG asks for at least 4.5:1 between body text and its background. Light grey text on white is the usual offender.
- **Check headings.** One H1 per page, then headings in order, so screen reader users can jump around the page.
- **Make custom controls say what they do.** A filter button should announce whether it's on or off. Every pin on Speedcubing Australia's competition map has a full name, like "Cairns Open 2026, 3–4 Oct 2026, Cairns, Queensland", instead of "marker".
- **Respect reduced motion.** If someone has asked their device to reduce motion, animations should calm down or switch off.

## Page speed

- **Compress and size every image.** Images are usually the heaviest thing on a page. Serve modern formats like WebP or AVIF at the size they're displayed. The committee portraits on Speedcubing Australia are AVIFs of around 20 KB each.
- **Stop the page jumping while it loads.** Google measures this as Cumulative Layout Shift, and anything over 0.1 needs work. Speedcubing Australia's FAQ page measured 0.39. Reserving space for content before it loads brought it under 0.1.
- **Count your third-party scripts.** Chat widgets, trackers, embeds and fonts all slow pages down. Keep the ones that earn their place.
- **Test on mobile, not your desktop.** Run key pages through [PageSpeed Insights](https://pagespeed.web.dev/) and look at the mobile score first.

## Search and sharing

This is the section that protects your Google rankings, so it gets the most care.

- **Remove "noindex" from the live site.** Staging sites are usually hidden from search engines, and that setting sometimes follows the site to launch. Check the live pages, not the settings screen.
- **Write a title and description for every page.** Each one unique, written for a person reading search results. Never left as the site name on every page.
- **Redirect old addresses.** If the site is replacing an old one, every old URL that had traffic or links should redirect to its new equivalent. Better still, keep the same addresses where you can. That's how Speedcubing Australia's new site ranked first on Google Australia for "speedcubing australia" on launch day.
- **Add and test structured data.** Structured data tells search engines what a page is about: an organisation, an event, an FAQ. Test it with Google's [Rich Results Test](https://search.google.com/test/rich-results) so you know it's valid.
- **Check the sitemap and robots.txt.** The sitemap should list the pages you want found and nothing else, and robots.txt shouldn't block them.
- **Pick one address for the site.** With or without "www", always HTTPS, and every other version redirecting to it.
- **Paste a link into a message.** Check the share image, title and description look right when the site is shared, and that the favicon shows up in the browser tab.

## Forms and integrations

- **Submit every form.** Then check the email actually arrives, in the right inbox, and that the person who receives it knows it's coming. On Speedcubing Australia that meant five separate contact forms, one for each reason people get in touch.
- **Test bookings, payments and embeds end to end.** A booking widget or checkout should be tested all the way through, using test mode where the payment provider offers it.
- **Confirm analytics is recording visits,** and only after consent where consent is needed.

## Launch day and the week after

- **Check the domain and HTTPS** once DNS has switched over, on more than one network.
- **Submit the sitemap to Google Search Console.** Then come back after a week to check which pages were indexed and whether any came back with errors.
- **Watch search rankings for the terms that matter.** A drop in the first few weeks usually points to a missing redirect or a changed page title.
- **Hand over properly.** Whoever edits the site next should know how to add content without breaking anything, and who to call if they do.

## Can you run this on a site that's already live?

Yes, and it's worth doing. Most of these checks don't care whether a site launched yesterday or five years ago, and sites drift over time as content gets added by people who never saw the original build.

If you'd like a second set of eyes on a site you're about to launch, or one that's been live a while, [send me a message on LinkedIn](https://www.linkedin.com/in/mitchell-anderson-527au/). You can also see how these checks played out on a real project in the [Speedcubing Australia case study](/work/speedcubing-australia/).
