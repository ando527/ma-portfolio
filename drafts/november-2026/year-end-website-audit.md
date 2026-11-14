---
title: "The Year-End Website Audit: What to Fix Before the Christmas Shutdown"
date: "2026-11"
summary: "A live website drifts over a year. Here's what I'd check in the next six weeks, from domain renewals and form emails to holiday hours and who still has admin access."
seoTitle: "Year-End Website Audit: What to Check Before the Christmas Break"
seoDescription: "A year-end website audit for Australian small businesses: domain and SSL renewals, form emails, holiday hours, admin access, backups, INP and a holiday plan."
tags: ["Maintenance", "Process", "Performance"]
coverText: "The year-end website audit"
coverImage: "/images/articles/year-end-website-audit.png"
coverPosition: "right center"
relatedServices: ["webflow-development", "shopify-development", "nextjs-development"]
---

A website that was fine in January is rarely fine in December. Nothing breaks all at once. A domain gets close to expiry, someone leaves and keeps their admin login, a contact form stops reaching anyone. Then the office shuts for three weeks and nobody is looking.

The next six weeks are the last easy window to catch these. After mid-December, suppliers go quiet and developers' inboxes fill with auto-replies. A problem found on 5 January has usually been costing you since the 20th.

My [launch checklist](/articles/website-launch-checklist/) covers a site before it goes live. This one is for a site that's been live a while, where the problems come from things changing around it.

## Check every renewal date, and who gets the reminder

Start with the domain. For a .au domain, auDA says you can renew up to 90 days before expiry, and you get 30 calendar days after it. During those 30 days you can't use or update the domain, so the website and email both stop. After that it's released, and anyone can register it.

A domain that expires on 22 December can sit in that grace period until late January, with your inbox dead the whole time.

Find out where each domain is registered, when it expires, and which email address gets the reminder. It's often someone who set it up years ago, or an agency that no longer works with you.

Then the SSL certificate. The CA/Browser Forum, the body that sets the rules for these, voted in April 2025 to shorten how long a certificate can last. The maximum is 200 days for certificates issued from 15 March 2026, 100 days from 15 March 2027, and 47 days from 15 March 2029.

If your host issues and renews the certificate for you, ask them to confirm it renews on its own. If someone bought one by hand and installed it, check that one, because its renewals will come round more often.

## Submit your forms and check the email arrives

Submit every form on the site and follow the message all the way to a real inbox. I'd also check who that inbox belongs to, since form notifications have a habit of going to someone who has left.

[MITCHELL: add a real example here, only if you have one, of a form or notification going to the wrong or an old inbox.]

Then check the email authentication. Since 1 February 2024, Google has required anyone sending to Gmail to have SPF or DKIM set up on their domain. Senders above 5,000 messages a day need SPF, DKIM and DMARC, and DMARC can be set to "none". Most small businesses send far less than that, but the same DNS records are what keep your form notifications and invoices out of spam.

Your form tool, host, newsletter service and accounts software can all send email as your domain, and each one has to be covered by the records.

The quick test is to send a form message to a Gmail address. Gmail shows a question mark next to the sender's name when a message isn't authenticated, though Google says unauthenticated messages aren't necessarily spam. For more detail, choose More, then Show original. In Outlook or Apple Mail, find the Authentication-Results header instead. If the message was authenticated by SPF or DKIM, you'll see "spf=pass" or "dkim=pass". If you don't, ask whoever manages your DNS to look at it.

## Update your opening hours everywhere

Hours live in more places than people think: the website, the footer, the contact page, your Google Business Profile, Facebook, and the booking widget.

On Google Business Profile, special hours work for up to 6 days in a row. A closure longer than that, which a Christmas shutdown usually is, should be marked as temporarily closed. Google also suggests confirming hours for official holidays even when they match your normal hours, so customers know they're accurate.

If you sell products, put last order dates for Christmas delivery on the site as well as in a banner. Customers decide at the checkout.

## Hunt for out-of-date content

Search the site for last year's year. Then search for the year before that.

The footer copyright is the easy one. Change it in January, or have it update itself. The rest takes a read-through: prices, team pages, staff who've left, "upcoming" events from 2024, old promotions, and a news section whose latest item is from March.

Then run a link checker. Links to other websites go bad the fastest, because you don't control them. Fix the ones that matter, and delete the ones that don't.

## Check your privacy policy

If the Privacy Act covers your business, read your privacy policy. From 10 December 2026, APP entities must say in it when a computer program makes or informs decisions that significantly affect people's rights or interests, such as automated approvals or pricing. Most businesses under $3 million turnover are generally not covered, but there are exceptions, so check the [OAIC page](https://www.oaic.gov.au/news/media-centre/new-resources-on-transparency-for-use-of-ai-and-automated-decision-making).

## Remove old access and turn on 2FA

List everyone who can log in to the CMS, the host, the domain registrar, your email, Google Analytics and Google Business Profile. Remove anyone who has left, and check whether any freelancers or agencies still have access they no longer need.

Then turn on two-factor authentication for every account that supports it, starting with the domain registrar and your email. Whoever controls those can take over everything else.

## Updates and backups

If your site uses plugins, apps, themes or integrations, update them now rather than on the last day before the break. That way, if an update breaks the checkout, you find out while people are around to fix it. On Webflow and Shopify the platform looks after the core software, but the apps and user accounts are still yours to check.

Then find out where your backups are, how recent the last one is, and who can restore it. If nobody can answer, that's a finding.

## Check speed, analytics and cookie consent

Google's Core Web Vitals include Interaction to Next Paint (INP), which measures how long a page takes to respond after someone taps or clicks. Google's target is 200 milliseconds or less. Over 500 is poor. It's measured on real visitors at the 75th percentile, separately for mobile and desktop.

Run your key pages through [PageSpeed Insights](https://pagespeed.web.dev/) and look at the mobile results. Added chat widgets, tracking tags and plugins are the usual reason a page that was quick at launch no longer is.

While you're in there, confirm analytics is still recording, and that the cookie banner still works. Tracking scripts should only load after someone accepts. Remove tags for tools you stopped using, like an old ad account or a pixel nobody looks at.

## Plan for the shutdown

Decide this before you close, not on the 23rd:

- Who reads the contact form inbox over the break, and how often.
- What the form's auto-reply says. It should give a return date and a way to reach someone for urgent matters.
- Who has the logins if the site goes down, and whether your developer is reachable.
- Whether anything needs monitoring. A free uptime monitor that emails or texts someone who'll actually see it costs little.

And stop making changes in the last few days before the break. A tweak on the 22nd with nobody watching is how a quiet fortnight becomes a bad one.

[MITCHELL: optional one-line sign-off about what your own site audit looks like, or a real example from a client site, if you have one.]

If you'd like a second set of eyes on a live site before the break, [send me a message on LinkedIn](https://www.linkedin.com/in/mitchell-anderson-527au/).
