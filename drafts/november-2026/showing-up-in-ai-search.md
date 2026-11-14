---
title: "How Your Website Shows Up in AI Search (and What's Just Hype)"
date: "2026-11"
summary: "More people are asking ChatGPT, Gemini and Google's AI answers instead of searching the old way. Here's what is known about how a small business website gets included, what's still guesswork, and what to ignore."
seoTitle: "AI Search for Small Business: What Actually Works"
seoDescription: "How a small business website appears in ChatGPT, Gemini, Perplexity and Google AI Overviews: crawlers, schema, llms.txt, Google Business Profile and what's proven."
tags: ["SEO", "AI search", "Structured data"]
coverText: "Showing up in AI search"
coverImage: "/images/articles/showing-up-in-ai-search.png"
coverPosition: "right center"
relatedServices: ["webflow-development", "shopify-development", "nextjs-development"]
---

Search used to mean typing a few words into Google and picking a link. Now plenty of people ask a full question and read an answer that ChatGPT, Gemini, Perplexity or Google itself wrote for them. Google's AI Overviews have been live in Australia since October 2024.

That has created a small industry selling "AI visibility" packages, most of it confident and not much of it tested. Here's my attempt to sort what's documented from what's guesswork.

## Most of it is still ordinary SEO

Google's own guidance on AI Overviews and AI Mode is short. To be shown as a supporting link, a page has to be indexed and eligible to appear in Search with a snippet. Google says there are no additional technical requirements, and no special optimisation to do.

It also says you don't need new machine-readable files, AI text files or special markup. The list it gives is the old one: let crawlers in, link your pages together, keep important content as text, give people a decent page experience and keep your Business Profile information current.

If that sounds like the [pre-launch checklist](/articles/website-launch-checklist/) I run on every site, it should. A site that Google can't index or can't show a snippet for is out of the running for AI answers too.

## Check that AI crawlers can actually read your site

This is the part most small businesses get wrong without knowing, because nobody looks at robots.txt after launch.

The main AI companies run separate crawlers for separate jobs:

- OpenAI has OAI-SearchBot for ChatGPT search, GPTBot for training its models, and ChatGPT-User for pages people ask it to open. OpenAI says each setting is independent, and that sites that opt out of OAI-SearchBot won't appear in ChatGPT's search answers. Changes take about 24 hours to take effect.
- Anthropic has ClaudeBot for training, Claude-SearchBot for search results and Claude-User for requests made by a person.
- Perplexity has PerplexityBot, which it says is for surfacing sites in its search results and not for training models.

So you can allow the search bots and block the training bots if you want to. Plenty of businesses are happy with that split. What matters is making the choice on purpose instead of inheriting someone else's. According to OpenAI, blocking GPTBot doesn't affect ChatGPT search. Blocking OAI-SearchBot does.

Two things to check beyond robots.txt:

- Your host or CDN. Cloudflare announced in July 2025 that it was changing its default to block AI crawlers. A site can have a friendly robots.txt and still turn bots away one layer earlier. Ask whoever manages your hosting, or look at the settings yourself.
- Whether your content is in the HTML. In a December 2024 analysis, Vercel and MERJ found that none of the major AI crawlers they tested (GPTBot, ClaudeBot, PerplexityBot) ran JavaScript. That was nearly two years ago and may have changed, so use it as a reason to check. If your important text only appears after a script runs, view the page source and see what a plain request gets.

My own robots.txt allows everything and points to the sitemap.

## Structured data: good for Google, unproven for AI

Structured data is the hidden markup that tells a machine a page is an article, a service or a business. This site has it: it marks up articles, case studies and services, and the service pages carry FAQ markup.

I do it because it has real, documented uses in Google Search. Whether it helps with AI answers is much less clear.

In May 2026 Ahrefs tracked 1,885 pages that added JSON-LD and compared them with about 4,000 similar pages that didn't. It found no meaningful change in citations in Google's AI Overviews, AI Mode or ChatGPT. One caveat is that every page in the test was already being cited heavily, so it says nothing about a small site AI has never seen. Pages that were cited did have schema almost three times as often, which Ahrefs puts down to good SEO overall.

Google adds that there is no special schema.org markup needed for these features, and that markup must match what's visible on the page. My take: add accurate structured data because it's cheap and useful in regular search, and don't pay anyone extra for "AI schema".

## llms.txt: lots of claims, little evidence

llms.txt is a plain text file at the root of your site that summarises it for AI tools. You'll see it recommended in a lot of AI SEO checklists.

The evidence for it is thin. In June 2025 Google's John Mueller said no AI system currently uses llms.txt. In June 2026 Ahrefs looked at 137,210 domains and found that about 97% of the llms.txt files it saw received no requests at all in May. Ahrefs didn't measure citations, but it did conclude the file is unlikely to help AI search visibility today.

I'm not going to pretend I'm above it: [this site has an llms.txt](https://mitchellanderson.com.au/llms.txt), generated from the same content as the pages. [MITCHELL: add a real reason you added it, and whether you've seen it fetched in your logs.] Mine builds itself from the site content, so it costs nothing to maintain. I wouldn't expect it to change anything, and I'd be wary of anyone charging for one.

## Being cited depends on being the clearest answer

AI answers are built from pages that already exist. The practical advice follows from that.

Write a page that answers the question in plain language, near the top. Put your prices, service areas, opening hours and contact details in text, where a person and a crawler can both read them. Use headings that match how customers phrase things. Pages that say "what we do" in vague brand language give an AI summary nothing to quote.

There's no verified formula beyond that. Anyone claiming to know exactly how ChatGPT picks sources is guessing, because the companies haven't published it. [MITCHELL: if you've tested this on a real site, add what you saw.]

## Google Business Profile and reviews

For a local business, your Google Business Profile is the first thing outside your website worth checking. Google lists keeping it current as part of showing up in its AI features.

Check the basics: correct categories, hours, phone number, address, services and photos, and a website link that goes to a real page.

Reviews are harder to call. They obviously affect whether people choose you, and there's some vendor research on how people use AI to find local businesses. BrightLocal, a company that sells local SEO software, published a consumer survey in March 2026. It says the share of consumers using AI for local business recommendations went from 6% in 2025 to 45%, while use of Google reviews slipped from 83% to 71%. It also says 31% had used ChatGPT for business recommendations in the last 12 months and 23% had used Google's AI Mode, and that just 3% treated an AI tool as their default for local searches.

I couldn't confirm who was surveyed or in which country, and BrightLocal is US-based, so I wouldn't read those as Australian numbers. It's one vendor's survey, from a company that benefits when local SEO sounds urgent.

BrightLocal's description of what AI answers draw on is more useful than the percentages. It says the tools pull from across the internet, which may include reviews, local directories, a business's website, social media and other third-party sources, depending on the tool and the prompt. It also says they look for patterns across several sources instead of reading reviews the way a person would. I can't tell you which source any one tool leans on most. So keep your Business Profile and directory listings consistent and current, and make sure your website says the same things. Reply to your reviews while you're at it, and keep collecting honest ones.

## What I'd do this week

1. Open your robots.txt (yoursite.com.au/robots.txt) and see which bots are blocked.
2. Check your host or CDN settings for AI bot blocking.
3. View the source of your most important page and confirm the key text is there.
4. Make sure your Business Profile is accurate.
5. Rewrite one service page so the first paragraph answers the question a customer would actually ask.

If you'd like someone to run through this on your site, [send me a message on LinkedIn](https://www.linkedin.com/in/mitchell-anderson-527au/).
