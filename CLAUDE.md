# StarScoop Daily — Claude Operating Manual

## 1. Project Overview

**StarScoop Daily** (`starscoopdaily.site`) is an entertainment news and celebrity gossip site built for Google Discover, Pinterest, and organic SEO traffic. The goal is 2–3 published articles per day across 13 site categories.

- **Stack**: Next.js 14 App Router, deployed on Vercel, source on GitHub
- **Admin Panel**: `/admin` — password `StarScoop@2026`
- **Publishing**: Articles are JSON files in `data/articles/`. Pushing to `main` triggers a Vercel auto-deploy.
- **Contact email**: contact@starscoopdaily.site

---

## 2. Site Categories

These are the exact slugs used in article JSON and routing. Use them verbatim.

| Slug | Display Name | Focus |
|---|---|---|
| `celebrity` | Celebrity | Gossip, scandals, red carpet, A-list news |
| `hollywood` | Hollywood | US movies, box office, actor updates |
| `bollywood` | Bollywood | Indian film industry, stars, drama |
| `british-royals` | British Royals | Royal Family, palace news |
| `tv-shows` | TV Shows | Netflix, HBO, streaming, reality TV |
| `web-series` | Web Series | Indian & international OTT series |
| `music` | Music | Album drops, tours, chart-toppers |
| `movies` | Movies | Reviews, ratings, cast interviews |
| `ending-explained` | Ending Explained | Plot twists, hidden meanings |
| `where-to-watch` | Where to Watch | Streaming guides |
| `relationships` | Relationships | Couples, breakups, dating drama |
| `fashion` | Fashion | Celebrity fashion, red carpet, trends |
| `pop-culture` | Pop Culture | Viral moments, memes, trending topics |

---

## 3. Pre-Write Checklist (Run Every Time, No Exceptions)

### 3a. Check the Date
- Read `currentDate` from the system context injected at session start.
- Calculate the actual day of the week from the date — never trust a label from a summary or prior context.
- **Anchor**: January 1, 2026 = Thursday. July 4, 2026 = Saturday.
- Use the verified date in the article `date` field and commit messages.

### 3b. Check for Duplicates
Before writing any article:
1. Run `ls data/articles/` to list all existing slugs.
2. Scan titles and slugs for topic overlap with the planned article.
3. If an existing article covers the same film, person, or event — pick a different topic or angle.
4. Never assume a topic hasn't been covered.

**Why this matters:** A duplicate Spider-Man article was published on July 24, 2026, which had to be deleted. This check is mandatory every single time.

### 3c. Verify All Images Before Writing
Every TMDB image URL must return HTTP 200 before it goes into an article:
```bash
curl -s -o /dev/null -w "%{http_code}" --max-time 8 -I "IMAGE_URL"
```
- Use the site's TMDB proxy for lookups: `https://www.starscoopdaily.site/api/tmdb?query=NAME&type=person|movie|tv`
- TMDB API is NOT directly accessible from the sandbox — always use the proxy.
- Only use verified 200 images in article JSON.

---

## 4. Article JSON Schema

Every article is a JSON file at `data/articles/SLUG.json`. Required fields:

```json
{
  "title": "Headline Here",
  "slug": "headline-here-2026",
  "excerpt": "150-160 char SEO summary.",
  "category": "celebrity",
  "author": "StarScoop Daily Staff",
  "date": "2026-07-25",
  "featured": false,
  "articleType": "standard",
  "image": "https://image.tmdb.org/t/p/w1280/VERIFIED_PATH.jpg",
  "imageAlt": "Descriptive alt text",
  "metaDescription": "Under 160 chars for Google.",
  "tags": ["Tag1", "Tag2", "Tag3"],
  "content": "<h2>...</h2><p>...</p>",

  // Optional — for person-focused articles:
  "personTmdbId": 12345,
  "personProfilePhoto": "https://image.tmdb.org/t/p/w500/VERIFIED_PATH.jpg"
}
```

- **Slug format**: `topic-keywords-YYYY` (always include year)
- **Category**: Must exactly match a slug from Section 2
- **Content**: Valid HTML string — use `<h2>`, `<p>`, `<figure>`, `<img>`, `<strong>`, `<blockquote>`

---

## 5. Editorial Rules — Voice & Style

### DO
- Keep sentences **under 20 words average**. Short. Punchy. Direct.
- Write in an engaging, scannable, plugged-in culture voice.
- Get straight to the facts — no long introductory essays.
- Place `[EMBED_MEDIA: description of X/TikTok/IG post]` immediately after the introductory hook in breaking news articles.
- Place `[IMAGE: description]` under every H2 heading in listicles.
- Use active voice. Present tense where possible.

### DON'T
- Never use AI filler words: *In conclusion, Furthermore, Delve, Tapestry, Fascinating, Only time will tell, In recent news, It's worth noting, Notably*
- Never fabricate celebrity quotes. Only use publicly documented statements.
- Never publish unverified gossip as confirmed fact — attribute appropriately.
- Never hardcode the TMDB API key in source code. It lives in Vercel env as `TMDB_API_KEY`.
- Never place adult ads on the site.

---

## 6. Article Structures

### Breaking News (300–450 words)
Use for: celebrity drama, chart entries, announcements, social media moments.

```
H1: Headline (under 10 words, catchy)
Hook: 2 sentences — Who, What, When
[EMBED_MEDIA: description of relevant social post]
H2: The Breakdown
  - 3–4 bullet points of fast facts
H2: Public Reaction
  - Summary of fan/social media response
Closing engagement question (1 sentence, invites comment)
```

### Listicle / Ranking (800–1,200 words)
Use for: Top 10s, best-of lists, rankings, streaming guides.

```
H1: Headline with Number ("Top 10...", "7 Reasons...")
Intro Hook: 75 words max — why this list matters right now
List Entries (H2 per item):
  [IMAGE: description]
  2-sentence synopsis
  "Why it makes the list" (1–2 sentences)
  Quick Stats: bullet points (release year, rating, where to watch)
Wrap-Up: 2–3 sentences — no "In conclusion"
```

### Deep Dive / Profile (800–1,500 words)
Use for: celebrity profiles, relationship timelines, career breakdowns, film explainers.

```
H1: Headline
Intro: 2–3 sentences — hook the reader immediately
H2 sections: Each covers one clear angle (career, relationship, controversy, etc.)
[IMAGE: description] — one per major section
Internal links: Link to related StarScoop articles where relevant
Closing: Forward-looking sentence — what's next, what to watch for
```

---

## 7. Image Sourcing Workflow

### TMDB (movies, TV, actors)
Search via site proxy:
```
Person:  https://www.starscoopdaily.site/api/tmdb?query=NAME&type=person
Movie:   https://www.starscoopdaily.site/api/tmdb?query=TITLE&type=movie
TV Show: https://www.starscoopdaily.site/api/tmdb?query=TITLE&type=tv
```
- Hero images (banners): use `w1280` size path
- Portrait / inline: use `w500` size path
- Always verify all URLs return 200 before writing article

### Wikipedia / Wikimedia Commons
For royals, politicians, and public figures not well-represented on TMDB:
- Search API: `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=QUERY&format=json&origin=*`
- Summary + thumbnail: `https://en.wikipedia.org/api/rest_v1/page/summary/PAGE_TITLE`
- Free CORS API — no key needed.

### API Output Requirement
At the bottom of every article draft, output the exact search strings used:
```
TMDB: query="NAME OR TITLE", type=person|movie|tv
Wikipedia: search="QUERY"
Images used: [list verified URLs]
```

---

## 8. Publishing Workflow

### Step 1 — Write & Verify
- Complete pre-write checklist (Section 3)
- Write article JSON following schema (Section 4)
- Verify all image URLs return 200

### Step 2 — Push to GitHub
```bash
git add data/articles/SLUG.json
git commit -m "feat: ARTICLE_TITLE — CATEGORY"
git push origin main
```
Vercel auto-deploys on push to `main`. If it doesn't trigger, push an empty commit:
```bash
git commit --allow-empty -m "chore: trigger Vercel rebuild"
git push origin main
```

### Step 3 — Post-Publish (Every Article, Every Time)
Do these immediately after every publish — do not wait to be asked:

1. **Google Search Console** — URL Inspection → paste article URL → Request Indexing
   `https://www.starscoopdaily.site/article/SLUG`

2. **Twitter/X** — post immediately to `@StarScoop_Daily`
   Format: Punchy 1-2 sentence hook + link + 3–4 hashtags

3. **Pinterest** — pin with hero image to `StarScoopDaily` board
   Format: SEO-friendly caption + relevant hashtags

Auto-generate both Twitter post and Pinterest caption at the end of every article write session — no need for user to ask.

---

## 9. Traffic Growth Strategy

**Priority channels (in order):**

1. **Google Search Console** — Request indexing after every article. Gets indexed same day vs. weeks of waiting.
2. **Pinterest** — Pin every article. Celebrity gossip and royal content spreads massively here.
3. **Twitter/X** — Post immediately after every publish. Drives same-day spikes.
4. **Google News / Publisher Center** — Site submitted at publishercenter.google.com. One-time setup complete.
5. **Topical authority** — Build 10+ articles on the same celebrity or topic before spreading wider. Google rewards depth.

**NOT yet (hold off):** TikTok/Instagram (requires video production), paid advertising (wait until organic traffic base is established), backlink outreach (too slow for current stage).

**Target cadence:** 2–3 articles per day. Volume + publishing speed is the #1 Google Discover ranking signal.

---

## 10. Social Media Accounts

| Platform | Handle / URL |
|---|---|
| Twitter/X | @StarScoop_Daily — `https://x.com/StarScoop_Daily` |
| Pinterest | `https://in.pinterest.com/StarScoopDaily/` |
| Google Search Console | starscoopdaily.site property |
| Google Publisher Center | StarScoop Daily (starscoopdaily.site) |

All accounts registered with: **contact@starscoopdaily.site**

---

## 11. API Keys & Environment

Stored in `.env.local` and Vercel environment — **never hardcode in source**:

| Variable | Used For |
|---|---|
| `TMDB_API_KEY` | Movie/person image lookups |
| `OMDB_API_KEY` | Ratings (auto-fetched in `/api/tmdb` route) |
| `GROQ_API_KEY` | AI article generation in admin panel |
| `PEXELS_API_KEY` | Stock images |

- OMDB is already integrated inside `/api/tmdb/route.js` — auto-fetches ratings when a movie is searched.
- Wikipedia API is free, CORS-enabled — no key needed. Call directly from the browser.
- SmartLink ad URL stored only in `data/ad-config.json` — never in source code.

---

## 12. Security Rules (Non-Negotiable)

- Never hardcode any API key in source code
- Never commit `.env.local`
- Adult advertisements must never appear on the site
- Never publish fabricated quotes attributed to real people as fact
- Never publish unverified gossip as confirmed news — attribute to sources

---

## 13. Key File Locations

| File / Path | Purpose |
|---|---|
| `data/articles/` | All published article JSON files |
| `data/ad-config.json` | Ad SmartLink URL |
| `lib/categories.js` | Category slugs, colours, icons |
| `app/admin/page.js` | Admin panel (News Fetcher, Generator, Image Fixer, etc.) |
| `app/api/tmdb/route.js` | TMDB + OMDB proxy route |
| `app/api/publish/route.js` | GitHub push endpoint for admin panel |
| `components/Footer.js` | Site footer — X link: `https://x.com/StarScoop_Daily` |
