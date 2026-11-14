---
title: "Website Accessibility for Small Business in 2026, in Plain English"
date: "2026-11"
summary: "What WCAG 2.2 asks for, where Australian law stands, whether the European Accessibility Act reaches you, and the six fixes that matter most for the least money."
seoTitle: "Website Accessibility for Australian Small Business (2026)"
seoDescription: "A plain-English guide to website accessibility for Australian small businesses: WCAG 2.2, the Disability Discrimination Act, the EU Accessibility Act and six cheap fixes."
tags: ["Accessibility", "Launch", "Process"]
coverText: "Accessibility, in plain English"
# Shown behind the cover text and gradient on article cards.
coverImage: "/images/articles/accessibility-for-small-business-2026.png"
coverPosition: "right center"
relatedServices: ["webflow-development", "shopify-development", "nextjs-development"]
---

Nearly every website has accessibility problems, and yours probably does too. WebAIM tests the home pages of the top one million sites each year. Its 2026 report found detectable WCAG failures on 95.9% of them, an average of 56.1 errors per page.

Most of those errors are small and cheap to fix, and the same handful turn up again and again. This post covers what the standard asks for, where Australian law stands, whether the European rules reach you, and the fixes I'd do first. I'm a web developer, not a lawyer, so read the legal parts as background and not as advice.

I covered the pre-launch version in my [website launch checklist](/articles/website-launch-checklist/).

## What WCAG 2.2 asks for

WCAG is the Web Content Accessibility Guidelines, published by the W3C. Version 2.2 became a W3C Recommendation on 5 October 2023, and Level AA is the level most business sites aim for.

It adds nine new success criteria to 2.1 and drops one, 4.1.1 Parsing, which the W3C calls obsolete. These are the new ones a small business site is most likely to trip over:

- A link or button you've tabbed to must stay at least partly visible, so a sticky header can't cover it completely (2.4.11, AA).
- Anything you can drag needs a simple alternative, like a button (2.5.7, AA).
- Buttons and links should be at least 24 by 24 CSS pixels, with a few exceptions (2.5.8, AA).
- Help options such as a contact link or chat appear in the same place on every page (3.2.6, A).
- People shouldn't have to type the same details twice in one process (3.3.7, A).
- Logging in shouldn't depend on a cognitive test, with a few exceptions (3.3.8, AA).

Most common failures come from older criteria.

## Where Australian law stands

The Disability Discrimination Act 1992 (Cth) makes it unlawful to discriminate on the ground of disability when providing goods or services or making facilities available, "whether for payment or not" (section 24). That covers refusing to provide them, the terms or conditions, and the manner of providing them.

Section 11 is the unjustifiable hardship provision. It weighs all the relevant circumstances, including the benefit and detriment involved, the effect of the person's disability, the business's financial circumstances and estimated expenditure, and what financial or other assistance is available. Whether it helps a particular business is a question for a lawyer, and none of this is legal advice.

I haven't found an Australian statute or regulation that itself requires WCAG 2.2. The detail comes from guidance. The Australian Human Rights Commission published its Guidelines on equal access to digital goods and services in April 2025, updating its 2014 advisory note. Its page on standards says the latest version is WCAG 2.2 and that organisations should conform with Level AA at a minimum. The guidelines say meeting those standards will help organisations meet their Act obligations, and call them the minimum to aim for.

The guidelines aren't legally binding, and the Commission says to read them alongside the Act. I can't say how a court would treat them, but they are the regulator's stated minimum, so WCAG 2.2 AA is a sensible target.

The Attorney-General's Department is also reviewing the Act. Consultation ran from 1 August to 14 November 2025 and covered 15 recommendations from the Disability Royal Commission. I found no announced outcome and nothing about website rules. I couldn't confirm claims that Australia passed new digital accessibility laws in 2025 or 2026.

## The European Accessibility Act, if you sell to the EU

The European Accessibility Act (Directive 2019/882) applies to listed services provided to consumers after 28 June 2025, and e-commerce is on the list. The Directive defines e-commerce services as services provided at a distance, through websites and mobile apps, at a consumer's request, to conclude a consumer contract.

A service provider is anyone who provides such a service on the EU market or makes offers to provide it to consumers in the EU. An Australian business that makes offers to EU consumers can fit that wording. How, and whether, national authorities enforce it against sellers outside the EU, I haven't been able to verify.

Microenterprises that provide services are exempt from the accessibility requirements. A microenterprise has fewer than 10 people and either annual turnover or an annual balance sheet total of no more than €2 million. It is turnover or balance sheet, so check both figures. Some summaries mention only turnover.

If EU customers are a real share of your revenue, ask an adviser who knows the rules.

## Six fixes that cost the least

### Colour contrast

Low contrast text was the most common failure in WebAIM's report, on 83.9% of home pages. WCAG asks for at least 4.5:1 between text and its background, or 3:1 for large text (18pt, or 14pt bold).

Light grey on white, white on a pale brand colour, text over photos and form placeholders are the usual offenders. Paste your colours into a free contrast checker. The fix is often one colour variable.

[MITCHELL: add a real example here, such as a brand colour you darkened on a project and what the client said.]

### Keyboard use

Put the mouse away and press Tab. You should be able to reach the menu, every link, every button and every form field, in an order that makes sense, and open and close things without a mouse.

Classic failures are hover-only dropdown menus, fake buttons the keyboard skips, and pop-ups you can't close. On Speedcubing Australia's competition finder, the filter chips work by keyboard and announce whether they're on or off.

### Focus you can see

When you tab around, something should show where you are. Many designers remove the focus ring because it looks untidy and replace it with nothing. Keep it and style it to suit the brand.

Watch the new 2.2 rule too. A sticky header or cookie banner that covers the link you've just tabbed to is a failure.

### Alt text and unnamed buttons

Missing alt text was on 53.1% of home pages. Write what the image is for, in a sentence, as if describing it over the phone. A team photo on your About page gets the team's names. A purely decorative flourish gets empty alt text so screen readers skip it.

The same logic applies to icon-only links and buttons. Empty links showed up on 46.3% of home pages and empty buttons on 30.6%. A social icon or a hamburger menu needs a name a screen reader can read.

### Forms

Missing form labels were on 51% of home pages. A visible label sits with each field. Placeholder text that disappears when you start typing doesn't count, because people forget what the field was for.

Say which field has the problem when something goes wrong. Submit your contact form using only the keyboard.

### Headings

Use one H1 per page, then H2s and H3s in order, as structure and not as a way to make text bigger. Screen reader users jump from heading to heading to scan a page.

While you're in the code, check the page has its language set. 13.5% of home pages don't.

## What automated checkers miss

Free tools like WAVE or the Lighthouse audit in Chrome will flag low contrast, missing labels and missing alt text. They can't tell you whether your alt text is any good, or whether the page makes sense when you only use a keyboard. Run one, then do the Tab test yourself.

If you'd like a second set of eyes on a site that's already live, [send me a message on LinkedIn](https://www.linkedin.com/in/mitchell-anderson-527au/). I build in [Webflow](/webflow-development/), [Shopify](/shopify-development/) and [Next.js](/nextjs-development/), and I check these things on every one.
