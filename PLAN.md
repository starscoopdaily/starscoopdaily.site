# Post/Credits — Full Project Plan

Movie content site: reviews, ending-explained breakdowns, and where-to-watch guides. Monetized via Adsterra + Monetag ad networks. Built for organic (SEO + social) growth from $0 budget.

---

## 1. Niche & Content Model

**Core content types:**
- Ending Explained — highest search intent, published fast after release
- Reviews (spoiler-free)
- Where to Watch — evergreen, keeps getting searched for months
- Cast/character breakdowns
- Trailer breakdowns/reactions
- Trivia/facts
- Comparisons ("X vs Y")

**Content sourcing rule:** everything is original writing (AI-drafted, human-personalized before publishing) or licensed/official assets (TMDB API images, official press-kit stills). No scraping, no reposting, no hosting pirated video/streams — that's what gets sites DMCA'd and de-indexed. Movie *commentary* is the product, never the movie itself.

**Who writes:** Claude drafts the first pass (structure, accurate plot details via research, TMDB data) → you personalize before publishing (real opinion, tone tweaks). Fully unedited AI publishing at scale risks Google's Helpful Content penalty — the personalization step is what protects the SEO channel, not just a nicety.

---

## 2. Tech Stack & Architecture

- **Next.js** (App Router) — SSR for SEO
- **TailwindCSS** — styling
- **Vercel** — free-tier hosting, deploys from GitHub
- **TMDB API** (free key) — auto-pulls posters, cast, ratings, release dates, "similar movies"
- **Adsterra + Monetag** — ad monetization (accounts already created)

**Routes:**
- `/` — homepage, hero + latest posts grid
- `/movies/[slug]` — individual article (TMDB data + written content)
- `/category/[category]` — hub pages (Ending Explained, Reviews, Where to Watch, 2026 Releases)
- `/search` — client-side search
- `/about`, `/contact` — trust/credibility pages (E-E-A-T signal for Google)

**SEO infrastructure:** per-page `generateMetadata`, auto sitemap.xml/robots.txt, JSON-LD Movie schema (powers star-rating rich snippets in search results).

**Content storage:** one Markdown file per article under `/articles` (current setup) — simple, version-controlled, no database needed at this scale.

---

## 3. Design System

Brand name: **Post/Credits** (ties directly to the ending-explained/post-credit-scene niche).

- **Hero/brand moments:** dark, cinematic — near-black ground (`#0C0A08`), brass/gold accent (`#C6A15B`), letterboxed hero banner, Instrument Serif display type, IBM Plex Mono for metadata (runtime/rating/date), Public Sans body.
- **Article body:** light theme — matches what actually-ranking competitors use (Screen Rant, Collider, Movie Explained Hub are all light); better long-form readability, better ad-creative compatibility than dark.
- **"Also Read" block** on every article — 5-40+ internal links, copied from what works for competitors, multiplies pageviews/session and therefore ad impressions/session.
- First homepage mockup published as an Artifact for reference.

---

## 4. Ad Placement

- **Popunder** — site-wide, fires once/session on first click. Never on homepage first load (protects bounce rate) — trigger on article pages after engagement.
- **Native Banner** — inline in article body, after 2nd-3rd paragraph, before "Also Read."
- **Social Bar** — sticky corner unit, site-wide, passive.
- **SmartLink** — behind explicit CTAs ("See Full Cast," "Where to Stream," "Continue Reading").
- **Density cap:** 1 Popunder trigger + 1-2 Native placements + 1 Social Bar per page — more than that hurts Core Web Vitals, which hurts SEO ranking directly.
- Running both Adsterra and Monetag: don't stack the same format from both networks on one page (gets flagged as invalid traffic). Split by page/format, compare payout after a few weeks, consolidate to the winner.

---

## 5. Competitor Research (Jul 2026)

| Site | Monthly traffic | Theme | Model |
|---|---|---|---|
| Letterboxd | 62M | Dark | Social cataloging app — different category, not a comparison |
| Screen Rant | ~29-30M | Light | 82% traffic from search, ~85 articles/day, short paragraphs + images, trend-keyword targeting |
| Collider | (Valnet network, shared w/ Screen Rant) | Light | Same playbook, shared tooling |
| Movie Explained Hub (direct niche competitor) | — | Light | Heavy "Also Read" internal linking (40+ links/article), table of contents, long-form structure |

**Takeaway:** can't out-publish a media company's volume solo. Differentiation is design quality (theirs are generic templates) + tighter niche focus (ending-explained/post-credits specifically, deeper than their catch-all coverage) rather than trying to out-volume them.

---

## 6. Distribution Channels (organic, $0 budget)

- **Blog/SEO** — primary, compounding, slowest to mature (3-6 months for evergreen; faster for fresh-release content)
- **Instagram Reels / YouTube Shorts** — hook-driven short clips, bio → bridge page. (TikTok excluded — banned in India; Josh/Moj/Chingari as low-effort cross-post extras.)
- **Telegram channel** — mirrors blog/Reels content + bonus material, SmartLink dropped every 4-5 posts (not every message)
- Target US/UK audiences via English content, US/UK cultural references, hashtags/keywords, and posting-time alignment — geo is determined by content targeting, not by creator location or any VPN/proxy workaround (ruled out both as unnecessary and, for TikTok specifically, legally murky given the India ban)

---

## 7. Growth Plan (First 2 Months)

- **Weeks 1-2:** publish first 10-15 articles, submit sitemap to Google Search Console immediately, set up Telegram channel, cross-post each article.
- **Weeks 3-4:** move to daily publishing, start cutting Shorts/Reels from articles, monitor Search Console for early impressions, double down on what's getting traction.
- **Weeks 5-6:** build category hub pages once enough posts exist, lean into best-performing content type, light community outreach (genuine, not spam).
- **Weeks 7-8:** review real traffic data, fix underperforming pages, turn on ad placements at baseline traffic, evaluate first revenue and decide what to scale.

**Realistic expectation:** near-zero revenue for weeks 1-4 while the account/domain is new. Fresh-release content (ending-explained/where-to-watch published within hours of release) ranks faster than evergreen keywords, so that's the realistic path to early traffic inside the 2-month window — full SEO maturity takes longer.

---

## 8. First Content Batch

1. Spider-Man: Brand New Day — Everything We Know Before It Swings In *(opens Jul 31, 2026 — countdown/hype format)*
2. Moana, 2026 vs. 2016: What the Remake Changes
3. The Odyssey — Ending Explained ✅ *drafted, see `/articles/the-odyssey-ending-explained.md`*
4. Toy Story 5 — Is It Too Intense for Kids? (Parent's Guide)
5. Minions & Monsters — Ending & Post-Credit Scene, Explained
6. Where to Watch Every Harry Potter Movie in 2026 *(ties to Aug 2026 25th-anniversary re-release)*
7. Insidious: Out of the Further — What to Expect *(opens Aug 21, 2026)*
8. Coyote vs. ACME — Everything We Know So Far

---

## 9. Explicitly Ruled Out

For the record, these were considered and rejected — noted so they don't get re-litigated:
- Adult content (deceptive clickbait, AI-generated explicit media, AI-girlfriend engagement funnels, faceswap/deepfake personas) — deceptive, exploitative, unreliable payout economics, high ban/legal risk.
- Scraping/reposting others' content (TikTok reups, pirated streams) — copyright infringement, gets accounts/domains killed via DMCA regardless of short-term traffic.
- Fake payment cards to bypass Meta thresholds — fraud, hard no.
- TikTok via VPN — banned in India at the government level; also doesn't solve audience reach since Indian viewers face the same block.
- Paid traffic arbitrage — legitimate model, but requires real ad spend; revisit once organic channels generate reinvestable income.
- Telegram Mini App (games) — legitimate and buildable, parked in favor of the movie fansite as the primary focus; can revisit as a second project.

---

## 10. Immediate Next Steps

- [ ] Sign up for free TMDB API key
- [ ] Register domain (or start on Vercel free subdomain to test)
- [ ] Scaffold the actual Next.js project
- [ ] Write 2-3 more articles from the First Content Batch list
- [ ] Set up Google Search Console + Analytics
- [ ] Create the Telegram channel
