# Sources and checks for showing-up-in-ai-search

## Facts used and where they came from (all pages opened and read)

- Google AI features eligibility (indexed, snippet-eligible, no additional requirements, no need for AI text files or markup, no special schema, keep Business Profile current, Google-Extended not about Search): https://developers.google.com/search/docs/appearance/ai-features
- Structured data must match visible content; no guarantee of rich results: https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- OpenAI bots (OAI-SearchBot, GPTBot, ChatGPT-User; independent settings; opting out of OAI-SearchBot removes you from ChatGPT search answers; ~24 hours): https://developers.openai.com/api/docs/bots (platform.openai.com/docs/bots redirects here)
- Anthropic bots (ClaudeBot, Claude-User, Claude-SearchBot): https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler
- PerplexityBot / Perplexity-User: https://docs.perplexity.ai/guides/bots
- Cloudflare default change to block AI crawlers, 1 July 2025: https://blog.cloudflare.com/content-independence-day-no-ai-crawl-without-compensation/
- AI crawlers don't render JavaScript (Vercel/MERJ, 17 Dec 2024): https://vercel.com/blog/the-rise-of-the-ai-crawler
- Google AI Overviews rolled out Australia wide, post dated 29 Oct 2024, "Introducing AI Overviews in Australia, a new generative AI experience on Search" (page opened 2026-11-09): https://blog.google/intl/en-au/company-news/outreach-initiatives/ai-overviews-australia/
- Ahrefs schema study (1,885 pages, ~4,000 controls, May 2026, no meaningful AI citation lift, pages were already heavily cited, cited pages ~3x as likely to have JSON-LD): https://ahrefs.com/blog/schema-ai-citations/
- Ahrefs llms.txt study (137,210 domains, ~97% of llms.txt files got zero requests in May 2026, article dated 15 June 2026, does not measure citations, concludes unlikely to help): https://ahrefs.com/blog/llmstxt-study/
- Mueller, "no AI system currently uses llms.txt", Bluesky 17 June 2025: https://www.seroundtable.com/google-ai-llms-txt-39607.html
- BrightLocal, "Nearly Half of Consumers are Asking AI for Business Recommendations", 10 Mar 2026 (opened 2026-11-09): https://www.brightlocal.com/research/lcrs-ai-trust/ . Figures used: AI for local business recommendations 6% (2025) to 45%; Google reviews 83% to 71%; ChatGPT 31% and Google AI Mode 23% in the last 12 months; 3% treat an AI platform as default for local search. Also its description of what AI answers draw on (reviews, local directories, business websites, social media, other third-party sources, depending on tool and prompt; patterns across sources). The draft labels it as vendor research. Trust figures (63% trust, 10% distrust among active AI users) were not used.
- Mitchell's own site, verified in repo: public/robots.txt (allows all, lists sitemap), src/app/sitemap.ts, src/app/llms.txt/route.ts (generated from content), JSON-LD in src/lib/schema.ts and page files (Article, CreativeWork, Service with FAQPage, Person, WebSite).

## [MITCHELL: ...] placeholders (2)

1. Why he added llms.txt to his own site, and whether he has seen it fetched in his logs.
2. A real example from testing page content for AI citations, if he has one.

## Unsure or worth checking

- BrightLocal survey country and sample were not verified. BrightLocal is US-based and sells local SEO tools, so the figures are not presented as Australian and are labelled as one vendor's survey. The draft does not claim reviews feed any specific AI tool beyond what BrightLocal says.
- Cloudflare: the post says default changes to block AI crawlers "unless they pay"; I did not verify the exact scope for existing sites. Wording in the draft is kept general.
- Vercel/MERJ JavaScript finding is from Dec 2024 and may be out of date. The draft says so.
- "Almost three times as likely to have JSON-LD" is from the Ahrefs page; I did not separately verify.
- The opinion lines (e.g. "I wouldn't expect llms.txt to change anything", "I'd be wary of anyone charging for one", "a company that benefits when local SEO sounds urgent") are written in his voice; he should confirm he agrees.
- Not verified: how ChatGPT or Gemini choose sources. The post says no verified formula exists.
- The cover image /images/articles/showing-up-in-ai-search.png does not exist yet.
