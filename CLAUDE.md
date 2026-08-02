# StarScoop Daily — Claude Operating Manual

> Single source of truth for every Claude session working on this project.
> Read this fully before writing any article, making any code change, or publishing anything.

---

## 1. Project Overview

**StarScoop Daily** (`starscoopdaily.site`) is an entertainment news and celebrity gossip site.
**Goal:** Organic SEO traffic → ad revenue (Adsterra) → 50K+ monthly sessions within 6 months.
**Stack:** Next.js 14 App Router · Vercel (auto-deploys on push to `main`) · GitHub
**Admin Panel:** `/admin` · Password: `StarScoop@2026`
**Contact:** contact@starscoopdaily.site

---

## 2. Site Categories

Use these slugs verbatim in every article JSON `category` field.

| Slug | Display Name | Posts/Week | Best Day |
|---|---|---|---|
| `celebrity` | Celebrity | 3–4 | Any |
| `hollywood` | Hollywood | 3–4 | Mon, Thu |
| `bollywood` | Bollywood | 2–3 | Fri, Mon |
| `british-royals` | British Royals | 2–3 | Tue–Wed |
| `tv-shows` | TV Shows | 3–4 | Fri, Mon |
| `web-series` | Web Series | 1–2 | Any |
| `music` | Music | 2 | Fri, Tue |
| `movies` | Movies | 3–4 | Fri, Sat |
| `ending-explained` | Ending Explained | 2–3 | Release day or day after |
| `where-to-watch` | Where to Watch | 2 | Any (evergreen) |
| `relationships` | Relationships | 2 | Any |
| `fashion` | Fashion | 1–2 | Day-of or day-after event |
| `pop-culture` | Pop Culture | 1–2 | As news breaks |

### Daily Schedule

Every one of the 13 categories has a fixed slot. If a category has no day, it never gets written — that is exactly why `web-series` sat empty while the rest of the site grew.

| Day | Articles | Slot 1 | Slot 2 | Slot 3 |
|---|---|---|---|---|
| **Monday** | 3 | Hollywood | Celebrity | Bollywood |
| **Tuesday** | 2 | British Royals | Music |  |
| **Wednesday** | 3 | TV Shows | Relationships | Celebrity |
| **Thursday** | 3 | Hollywood | Movies | **Web Series** |
| **Friday** | 3 | **Ending Explained** | **Ending Explained** | TV Shows |
| **Saturday** | 2 | Movies | Pop Culture |  |
| **Sunday** | 2 | Where to Watch | Fashion |  |

**Weekly total: 18.** Per-category output:

| Category | Per week | Day |
|---|---|---|
| Hollywood | 2 | Mon, Thu |
| Celebrity | 2 | Mon, Wed |
| Ending Explained | 2 | Fri ×2 |
| TV Shows | 2 | Wed, Fri |
| Movies | 2 | Thu, Sat |
| Bollywood | 1 | Mon |
| British Royals | 1 | Tue |
| Music | 1 | Tue |
| Relationships | 1 | Wed |
| Web Series | 1 | Thu |
| Pop Culture | 1 | Sat |
| Where to Watch | 1 | Sun |
| Fashion | 1 | Sun |

### Schedule Rules

**Friday is double Ending Explained.** It is the highest-value format on this site — high-intent queries, a 72-hour search spike, and beatable competition because the questions are specific. Two per week is the floor, not a target.

**Ending Explained overrides any slot.** If something major releases midweek, drop that day's lowest-priority article and publish the Ending Explained within 24–48 hours instead. The spike does not wait for Friday.

**Priority when bandwidth is short:** Ending Explained → Celebrity/Relationships → TV Shows/Hollywood → Where to Watch → Web Series → Fashion/Pop Culture

**Check the category counts before writing.** Run this to see what is starving:
```bash
node -e "const fs=require('fs'),p='data/articles';const c={};fs.readdirSync(p).filter(f=>f.endsWith('.json')).forEach(f=>{const d=JSON.parse(fs.readFileSync(p+'/'+f,'utf8'));c[d.category]=(c[d.category]||0)+1});console.log(c)"
```
An empty category is worse than no category — the page still sits in the sitemap serving a "No articles yet" state, which is a thin page Google is being asked to crawl.

**Prefer topical depth over breadth.** Once a category has coverage, the higher-value move is a cluster: 5–8 interlinked articles on one subject (see the MCU cluster around `avengers-doomsday-cast-release-date-2026`). Clusters beat scattered one-offs because internal links concentrate authority and give Google a coherent signal about what the site knows.

---

## 3. Pre-Write Checklist (Mandatory — Every Article)

### 3a. Confirm the Date
- Read `currentDate` from the system context.
- **Calculate the actual day of the week** — never trust a label from a summary or prior context.
- Anchor: January 1, 2026 = Thursday · July 4, 2026 = Saturday.
- Use the verified date in the article `date` field and commit messages.

### 3b. Check for Duplicates
1. Run `ls data/articles/` to list all existing slugs.
2. Scan for topic overlap — same person, film, or event.
3. If overlap exists — pick a different angle or topic entirely.
4. Never assume a topic hasn't been covered.

### 3c. Verify All Images Return 200
```bash
curl -s -o /dev/null -w "%{http_code}" --max-time 8 -I "IMAGE_URL"
```
- Use the site's TMDB proxy (TMDB API is not directly accessible from sandbox):
  ```
  Person: https://www.starscoopdaily.site/api/tmdb?query=NAME&type=person
  Movie:  https://www.starscoopdaily.site/api/tmdb?query=TITLE&type=movie
  TV:     https://www.starscoopdaily.site/api/tmdb?query=TITLE&type=tv
  ```
- Hero images: `w1280` path · Portrait/inline: `w500` path
- Every URL must return 200 before it goes into an article.

---

## 4. Article JSON Schema

File location: `data/articles/SLUG.json`

```json
{
  "title": "Headline Here",
  "slug": "headline-here-2026",
  "excerpt": "150–160 char SEO summary.",
  "category": "celebrity",
  "author": "StarScoop Daily Staff",
  "date": "2026-07-25",
  "featured": false,
  "articleType": "standard",
  "image": "https://image.tmdb.org/t/p/w1280/VERIFIED.jpg",
  "imageAlt": "Descriptive alt text with keyword",
  "metaDescription": "Under 160 chars. Include main keyword.",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "content": "<h2>...</h2><p>...</p>",

  "personTmdbId": 12345,
  "personProfilePhoto": "https://image.tmdb.org/t/p/w500/VERIFIED.jpg"
}
```

- **Slug:** `topic-keywords-YYYY` — always include year
- **Minimum 3 images per article:** hero + 2 inline body images
- **First inline image must be portrait** (2:3 ratio — TMDB poster or person profile) so Pinterest can pull it

---

## 5. Article Structures

### Breaking News (300–450 words)
For: celebrity drama, announcements, social media moments, chart entries.

```
H1: Headline — under 10 words, catchy
Hook: 2 sentences — Who, What, When
[EMBED_MEDIA: https://x.com/user/status/123...]   ← must be a real URL, not a description
H2: The Breakdown
  · 3–4 bullet points of fast facts
H2: Public Reaction
  · Summary of fan/social media response
Closing engagement question (1 sentence)
```

### Listicle / Ranking (800–1,200 words)
For: Top 10s, best-of lists, streaming roundups.

```
H1: Headline with number ("Top 10...", "7 Best...")
Intro Hook: 75 words max — why this list matters right now
Per entry (H2):
  [IMAGE: description]
  2-sentence synopsis
  "Why it makes the list" — 1–2 sentences
  Quick Stats: release year · rating · where to watch
Wrap-Up: 2–3 sentences — no "In conclusion"
```

### Deep Dive / Profile (800–1,500 words)
For: celebrity profiles, relationship timelines, career breakdowns, film explainers.

```
H1: Headline
Intro: 2–3 sentences — hook immediately, no essay buildup
H2 sections: one clear angle each (career / relationship / controversy / impact)
[IMAGE] — one per major section
Internal links: 2–3 related StarScoop articles
Closing: Forward-looking — what's next, what to watch for
```

### Ending Explained (800–1,200 words)
**Timing rule:** Publish within 24–48 hours of release. The search spike lasts 72 hours.

```
H1: "[Title] Ending Explained — What Really Happened"
Intro: Set up the confusion without spoiling immediately
H2: What Happened in the Final Scene
H2: What It Actually Means
H2: The [Twist/Symbol/Detail] You Missed
H2: What It Sets Up Next (sequel / season 2)
```

---

## 6. Editorial Voice Rules

### DO
- Sentences **under 20 words average** — short, punchy, direct.
- Conversational but credible — like a knowledgeable friend who follows Hollywood obsessively.
- Get straight to the facts — no long introductory essays.
- Max 2–3 sentences per paragraph — white space = mobile readability.
- **Bold** names, numbers, key facts on first mention in a paragraph.
- Active voice: "Kate wore the dress" not "the dress was worn by Kate."
- `[EMBED_MEDIA: <full post URL>]` immediately after hook in breaking news. **Must be a real URL** — `ArticleBody` only converts the tag when it contains `http(s)://`. A description renders as literal bracket text on the live page. If no verified post URL is available, omit the embed entirely.
- `[IMAGE: description]` under every H2 in listicles.

### DON'T
- Never use: *In conclusion · Furthermore · Delve · Tapestry · Fascinating · Only time will tell · In recent news · It's worth noting · Needless to say · Let's dive in · At the end of the day*
- Never fabricate celebrity quotes — only use publicly documented statements.
- Never state unverified gossip as fact — use "reportedly", "sources say", "according to X."
- Never publish thin content — minimum 400 words, all H2s must have real content.
- Clickbait without payoff — headline must match content.

### Headline Formulas
```
[Celebrity] Just [Did Something] — Here's What We Know
Is [Celebrity] Really [Claim]? The Truth Revealed
[Movie/Show] Ending Explained — What Really Happened
Everything We Know About [Title] Before [Date]
[Celebrity]'s [Event] — Full Breakdown
Why [Celebrity] [Did X] — The Real Reason
[Number] Things [Movie] Got Right/Wrong About [Topic]
[Movie] Review — Worth Watching? (Spoiler-Free)
```

---

## 7. SEO Rules (Every Article)

- Keyword in title (within first 60 characters)
- Keyword in meta description (under 155 characters)
- Keyword in first paragraph
- At least 3 H2 subheadings with related keywords
- All images have descriptive alt text
- Internal links to 2–3 related StarScoop articles
- Target long-tail, not just celebrity name: "kate middleton summer style 2026" not "kate middleton"
- Answer "People Also Ask" questions from Google as H2 subheadings — this is how you get featured snippets

**Freshness rules:**
- Breaking news: publish within 2 hours or skip it
- Ending Explained: publish on release day or day-after
- Evergreen (Where to Watch): update every 2–3 months

---

## 8. Image Sourcing

### Priority Order
1. TMDB API (via site proxy) — movie backdrops, posters, person profiles
2. OMDb poster — movie fallback (auto-fetched in `/api/tmdb` route)
3. Wikipedia REST API — royals, politicians, public figures
4. Pexels — generic mood images only

### Wikipedia (free, no key, CORS-enabled)
```
Search: https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=QUERY&format=json&origin=*
Summary + thumbnail: https://en.wikipedia.org/api/rest_v1/page/summary/PAGE_TITLE
```

### Image Placement
- Hero: landscape (w1280), full-bleed
- First inline: **must be portrait** (w500) — TMDB poster or person profile
- Second inline: landscape (w780 or w1280), mid-article
- List articles: one image per section entry

### API Output Requirement
At the bottom of every article draft, output:
```
TMDB: query="...", type=person|movie|tv
Wikipedia: search="..."
Images verified 200: [list all URLs used]
```

---

## 9. Publishing Workflow

### Step 1 — Write
- Complete Section 3 checklist (date · duplicates · images)
- Write article JSON per Section 4 schema
- All image URLs verified 200

### Step 2 — Push
```bash
git add data/articles/SLUG.json
git commit -m "feat: ARTICLE TITLE — Category"
git push origin main
```
If Vercel doesn't auto-deploy after push:
```bash
git commit --allow-empty -m "chore: trigger Vercel rebuild"
git push origin main
```
Do NOT use Vercel's "Redeploy" button — it re-runs the old build, not the latest code.

### Step 3 — Post-Publish (Auto — No Need to Ask)
Generate and output all of the following immediately after every article publish:

**1. GSC Indexing URL**
```
https://www.starscoopdaily.site/article/SLUG
```
Go to Google Search Console → URL Inspection → paste URL → Request Indexing.

**2. Twitter/X Post** — @StarScoop_Daily
```
🚨 [hook line — punchy, under 15 words]

[1–2 line teaser — what's the drama?]

Full story 👇
[article URL]

#[Tag1] #[Tag2] #[Tag3] #Entertainment
```
Rules: max 280 chars including URL · 3–4 hashtags · emoji at start

**Pin image — always use the generator, never the og:image.**
```
https://www.starscoopdaily.site/api/pin?slug=SLUG
```
Returns a 1000x1500 (2:3) PNG built from the article's hero image with the headline burned in. Open it, save the PNG, upload it to Pinterest manually, then set the destination link to the article URL.

Do **not** just paste the article URL into Pinterest — that pulls `og:image`, which is 1200x630 landscape. Pinterest ranks 2:3 vertical pins with text overlay far above landscape photos, so a pasted-URL pin gets buried. Route is `app/api/pin/route.js` (edge runtime); hitting `/api/pin` with no slug lists available ones.

**3. Pinterest Pin** — StarScoop Daily Pinterest
```
Paste URL: [full article URL]

Title:
[Punchy headline — max 100 chars]

Description:
[2–3 sentences — what happened, why it matters]
Read the full story 👇 starscoopdaily.site
#[Tag1] #[Tag2] #[Tag3] #[Tag4] #[Tag5] #[Tag6] #[Tag7] #[Tag8] #StarScoopDaily

Link: [full article URL]
Board: [board name from table below]
Alt Text: [1 sentence describing the image]
Mark as AI-Modified: ON
```

### Pinterest Board → Category Mapping
| Article Category | Pinterest Board |
|---|---|
| British Royals | British Royal Family News |
| Celebrity | Celebrity Scandals & Drama |
| Relationships | Celebrity Dating & Relationships |
| Hollywood / Movies | Hollywood Gossip |
| TV Shows | TV Show Updates |
| Music / Pop Culture | Music & Pop Culture |
| Bollywood | Bollywood Celebrities |
| Fashion | Celebrity Style & Fashion |

---

## 10. Traffic Growth Strategy

**Priority order:**
1. **Google Search Console** — request indexing within 30 minutes of every publish
2. **Pinterest** — pin every article, best times 8–11pm EST
3. **Twitter/X** — post immediately after publish, best times 9am / 12pm / 6pm / 9pm EST
4. **Google News** — site submitted at publishercenter.google.com (one-time done)
5. **Topical authority** — build 10+ articles on same celeb/topic before spreading wider

**NOT yet:** TikTok/Instagram (needs video) · Paid ads (wait for organic base) · Backlink outreach (too slow)

**Target cadence:** 2–3 articles per day. Volume + speed is the #1 Google Discover signal.

---

## 11. Growth Phases

| Phase | Articles | Monthly Sessions | Goal |
|---|---|---|---|
| Foundation | 0–25 | 500 | Get all categories indexed, set up socials |
| Momentum | 25–100 | 5,000 | Double down on top 2 categories, first ad revenue |
| Scale | 100–300 | 25,000 | Topic clusters, evergreen updates, $100–200/mo |
| Authority | 300+ | 100,000+ | Own 2–3 niches, newsletter, $500+/mo |

---

## 12. Social Media Accounts

| Platform | Handle / URL |
|---|---|
| Twitter/X | @StarScoop_Daily · `https://x.com/StarScoop_Daily` |
| Pinterest | `https://in.pinterest.com/StarScoopDaily/` |
| Google Search Console | starscoopdaily.site property |
| Google Publisher Center | StarScoop Daily (starscoopdaily.site) |

All accounts: **contact@starscoopdaily.site**

---

## 13. Technical — APIs & Environment

Stored in `.env.local` and Vercel environment — **never hardcode in source code.**

| Variable | Purpose |
|---|---|
| `TMDB_API_KEY` | Movie/person image lookups |
| `OMDB_API_KEY` | Ratings (auto-fetched inside `/api/tmdb` route) |
| `GROQ_API_KEY` | AI article generation in admin panel |
| `PEXELS_API_KEY` | Stock image fallback |

GitHub token for publishing: stored in admin panel localStorage (Site Controls tab) — not in code.
SmartLink ad URL: stored only in `data/ad-config.json` — not in source.

### API Call Order (Article Generation)
1. Claude AI → generates article HTML
2. TMDB Search → finds matching movie/TV/person
3. TMDB Details → backdrop, poster, cast, ratings
4. OMDb (inside TMDB route) → IMDB rating, RT%, Metacritic
5. Wikipedia (inside TMDB route) → person bio + thumbnail
6. Pexels → fallback stock image if no TMDB match
7. GitHub API → saves JSON to repo → triggers Vercel rebuild

---

## 14. Security Rules (Non-Negotiable)

- Never hardcode any API key in source code
- Never commit `.env.local`
- Adult advertisements must never appear on the site
- Never publish fabricated quotes as real
- Never link to pirated content
- SmartLink URL lives only in `data/ad-config.json`

---

## 15. Key File Locations

---

## 16. Google Indexing & Quality Rules

### 16a. Critical Indexing Blockers

**nexguild.js countdown gate (`app/layout.js`)** — The site loads a script from `nexguild.in` with `data-countdown="45"`. This appears to gate access to content behind a 45-second countdown timer. **Googlebot will see a blank page instead of your article content.** This is the single most likely cause of non-indexing. Investigation required: verify whether the script blocks the DOM and remove or replace it if it does.

**Category slug mismatch** — All article JSON files must use lowercase hyphenated slugs in the `category` field (e.g. `"category": "tv-shows"`), not display names (`"TV Shows"`). Wrong slugs prevent articles from appearing on category pages and send incorrect signals to Google's category crawl. The admin panel now enforces correct slugs automatically.

**Thin content** — Google's Helpful Content system ignores pages under ~300 words or with low information density. Minimum 400 words per article. Every H2 must have real content.

### 16b. EEAT Requirements (Google's Quality Criteria)

EEAT = **E**xpertise · **E**xperiencce · **A**uthoritativeness · **T**rustworthiness. Google's quality raters use these to assess pages before ranking.

**What harms EEAT:**
- Fictional named experts with professional titles (e.g. "body language expert Dr. Sarah Mills") — Google's raters flag fake expertise as a trust signal failure. The Groq prompts no longer include this.
- Fabricated celebrity quotes attributed to real people — Google's Helpful Content system detects unverifiable claims.
- Deceptive CTAs: "Watch Full Movie Now" / "Free stream — no sign-up" on SmartLink buttons mislead users about what they're clicking. Use neutral labels like "Stream Now" or "See Where to Watch."
- Unattributed claims presented as fact — always add "reportedly", "sources say", "according to X" for unverified information.

**What helps EEAT:**
- Consistent author byline on all articles (currently "StarScoop Daily Staff" — acceptable for a new site)
- Linking to authoritative external sources where natural (IMDB, Wikipedia, official press releases)
- Internal linking between related articles — signals topical depth
- Publishing Ending Explained articles within 24 hours of release — demonstrates editorial speed

### 16c. Content Quality Signals

**Freshness:** Google Discover rewards recency heavily for entertainment news. Target:
- Breaking news: publish within 2 hours or skip entirely
- Ending Explained: publish on release day or the next morning
- Evergreen (Where to Watch, rankings): update every 2–3 months, increment the title year

**Duplicate content:** Never re-write the same celebrity/film topic with minimal changes. Google de-indexes thin rewrites. Pick a new angle or wait 30+ days before returning to the same subject.

**SmartLink CTAs — currently disabled.** `SMARTLINK_CTAS_ENABLED = false` in `lib/adConfig.js` makes `getSmartLink()` return `''`, silencing all four consumers: the exit-intent popup, the in-article CTA, the category empty state, and the 404 page. The banner ad slots in `data/ad-config.json` are unaffected and keep running.

Disabled because SmartLink points to an Adsterra redirect whose destination rotates and is not under our control (sweepstakes, dating, gambling) — which also makes the "no adult ads" rule in Section 14 unenforceable. Labels like "Find Where to Watch" or "Watch {Category} Content Free" promised streaming the link cannot deliver, a deceptive-content risk carrying manual-action exposure. At ~0 sessions these CTAs earned nothing, so the risk bought nothing during the window Google forms its first assessment of a new domain.

**Re-enable only once traffic justifies it** (target a few thousand sessions/month). All labels have already been rewritten to "See Offer (Sponsored)" with `rel="nofollow noopener noreferrer sponsored"`, so flipping the flag to `true` is safe by default. Never restore streaming-promise copy.

**Domain:** staying on `starscoopdaily.site` until the site generates revenue. Google applies no ranking penalty to new gTLDs, and the TLD was never the indexing blocker. Do not propose migrating to `.com`.

### 16d. Sitemap & Robots

- `app/robots.js` is correctly configured: allows `/`, disallows `/admin` and `/api/`
- `app/sitemap.js` correctly includes all articles — verify after every new publish
- Submit sitemap in Google Search Console: `https://www.starscoopdaily.site/sitemap.xml`
- New domains take 2–6 months to earn consistent Google trust. Site launched ~June 2026. Index growth is expected to be slow through August.

### 16e. Page Experience

Google's Core Web Vitals (LCP, CLS, INP) affect ranking. Potential issues:
- nexguild.js blocking script — investigate and remove if it delays content paint
- Large hero images — confirm `next/image` with `priority` prop is used on article hero
- ExitIntentPopup is safe by design — mouseleave at the top edge after 300px of scroll, once per session, never on page load, and never on touch devices (no `mouseleave` on mobile). Googlebot has no mouse, so it never renders for the crawler. Not an intrusive-interstitial violation. While SmartLink CTAs are off it shows the 3 latest articles, which lifts pages/session instead of bouncing readers off-site.

| Path | Purpose |
|---|---|
| `data/articles/` | All published article JSON files |
| `data/ad-config.json` | Ad SmartLink URL |
| `lib/categories.js` | Category slugs, colours, icons |
| `app/admin/page.js` | Admin panel (News Fetcher, Generator, Image Fixer, etc.) |
| `app/api/tmdb/route.js` | TMDB + OMDb proxy route |
| `app/api/publish/route.js` | GitHub push endpoint used by admin panel |
| `components/Footer.js` | Site footer — X link: `https://x.com/StarScoop_Daily` |
| `CONTENT_STRATEGY.md` | Full editorial + business strategy reference (for human reading) |
