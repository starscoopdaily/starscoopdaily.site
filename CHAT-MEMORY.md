# StarScoop Daily — Project Memory (for Claude chat)

*Replaces the July 12 memory entirely.*

> **Status: living document — updated daily through 10 August 2026.**
> Copy this into the Claude chat project memory on **10 August**, once it is final.
> 11–12 August is the manual-workflow test period. Claude Code access ends 12 August.

**Last updated:** 5 August 2026 (Wednesday's articles published)

---

## Purpose & context

Somen runs **StarScoop Daily** (starscoopdaily.site) — entertainment and celebrity news targeting
USA, UK and India. Launched ~23 June 2026. Goal: organic search + Pinterest traffic → ad revenue.

Realistic revenue expectation: at 30–50k monthly visitors, Adsterra display pays roughly **$50–150/month**.
This is worth stating plainly rather than implying more.

Somen has no coding background. Until 12 August 2026 he worked through Claude Code (VS Code terminal).
**After 12 August the workflow changes** — see "How articles get made now".

---

## Current state — 5 August 2026

- **53 articles**, 87 static pages, Next.js 14 App Router + Tailwind, Vercel, repo `starscoopdaily/starscoopdaily.site`
- **All 13 categories have articles.** No category serves an empty state.
- **25+ pages indexed** in Google Search Console
- Search impressions: **8 → 23** over the last week, curve bending upward. 1 click total.
- Pinterest: **7 pins, 36 monthly views** — the biggest untapped channel
- Adsterra revenue: **$0**. Impressions counted are essentially self-traffic.

### Category counts
hollywood 10 · celebrity 8 · tv-shows 5 · music 5 · where-to-watch 4 · movies 3 ·
bollywood 3 · british-royals 4 · relationships 4 · ending-explained 2 · web-series 2 ·
fashion 2 · pop-culture 1

---

## How articles get made now

**Gemini researches → Claude chat writes → admin panel publishes.** Full prompts in `WRITING-PROMPT.md`
in the repo.

1. **Gemini** — fetches `https://www.starscoopdaily.site/api/articles`, checks nothing is repeated,
   applies the day's category schedule, returns topics + image search terms + real slugs to link to
2. **Admin → Find Images** — search, see thumbnails, click **Copy all for prompt**
3. **Claude chat** — writes the article JSON from Gemini's topic + the image block
4. **Admin → Paste & Publish** — validates schema, checks every image loads, pushes to GitHub

**Groq is no longer used for writing.** `llama-3.3-70b` produced generic copy and invented details.
The `/api/groq` route still exists but should not be relied on.

### Weekly schedule — every category has a fixed day

| Day | Slot 1 | Slot 2 | Slot 3 |
|---|---|---|---|
| Monday | hollywood | celebrity | bollywood |
| Tuesday | british-royals | music | — |
| Wednesday | tv-shows | relationships | celebrity |
| Thursday | hollywood | movies | web-series |
| Friday | ending-explained | ending-explained | tv-shows |
| Saturday | movies | pop-culture | — |
| Sunday | where-to-watch | fashion | — |

A category with no assigned day never gets written — that is exactly why `web-series` sat empty for
weeks. Friday is deliberately double Ending Explained: highest-intent format, 72-hour search spike,
beatable competition.

---

## Content strategy — this changed significantly

**Target specific answerable questions, not head terms.** The site has no domain authority and cannot
outrank IGN, Variety or ScreenRant. Proven by data: the Avengers: Doomsday article ranks **position 98**
for "avengers doomsday".

| Cannot win | Can win |
|---|---|
| avengers doomsday cast | do you need to watch loki before avengers doomsday |
| dune part three | dune part three release date india |

**Build topical clusters, not scattered one-offs.** There is a 9-page interlinked MCU cluster around
`avengers-doomsday-cast-release-date-2026`. Internal links concentrate authority and tell Google what
the site knows.

**India angle is valuable** — strongest country signal in GSC, and far less competitive.

### Abandoned angles
The old memory listed "bold photoshoot", "Bollywood kissing scandal", "hottest Netflix shows" as best
performers. **These are no longer the strategy.** They invite thin-content and EEAT problems, and none
of them ever produced traffic.

---

## Images

- **TMDB via the site's own proxy** — `/api/tmdb?query=NAME&type=person|movie|tv`
- **Wikipedia for royals and public figures** — TMDB resolves "Prince William" to an unrelated musician
- Hero = landscape (w1280). First inline **must** be portrait (w500) so Pinterest can pull it.
- Pexels is no longer used. **The old Pexels key in the previous memory should be treated as
  compromised and rotated** — it was stored in plain text.

---

## Monetization — current, honest state

**Banner ad slots: ON.** Four slots in `data/ad-config.json`. Reduced to 2 on mobile (sidebar and footer
hidden below breakpoint) to avoid Google's "overly distracting advertisements" guidance.

**SmartLink CTAs: OFF**, behind `SMARTLINK_CTAS_ENABLED = false` in `lib/adConfig.js`. Disabled because
the Adsterra redirect rotates to destinations we do not control, while labels promised streaming it
cannot deliver — a deceptive-content risk with manual-action exposure. At ~0 sessions it earned nothing,
so the risk bought nothing. All labels have already been rewritten to "See Offer (Sponsored)" with
`rel="sponsored"`, so flipping the flag back on is safe. Re-enable at a few thousand sessions/month.

**Monetag popunder: OFF** — `POPUNDER_ENABLED = false` in `components/MonetizationScripts.js`.
Zone 11371947 was redirecting readers off articles on tap. Found 5 August. This is the most damaging
thing that can run on a content site: Google treats unexpected redirects as deceptive behaviour, which
carries **manual-action exposure** rather than a ranking adjustment, and readers thrown off-site never
reach the article they clicked. It earned nothing. **Never re-enable it.**

**Monetag in-page push: ON** — zone 11371954, renders a notification-style banner in the page.
Does not redirect. Safe.

**Monetag vignette: OFF**, behind `VIGNETTE_ENABLED = false` — full-screen interstitials risk mobile
ranking penalties.

**Ad rendering:** `AdSlotRenderer` loads Adsterra `atOptions` banners **sequentially in the main
document**. An earlier iframe-isolation approach broke fill entirely — the invoke script fingerprints
its environment (`SharedWorker`, `registerProtocolHandler`, `document.cookie`) and a sandboxed
`srcdoc` iframe fails those checks. Do not reintroduce iframes around ad code.

**Per-device visibility** is set per slot in `data/ad-config.json` (`desktop` / `mobile` booleans),
editable from Admin → Ads Manager. No hardcoded responsive classes around ad slots.

**Adult ads: NEVER.** The old memory said "adult ads enabled" — that is wrong and contradicts the
project's own security rules. It is also unenforceable while SmartLink is live, which is part of why
SmartLink is off.

**Known issue:** all four banner slots reuse one Adsterra key. Adsterra issues one key per placement.
Getting four unique zone keys would let the iframe isolation workaround in `AdSlotRenderer` be removed.

---

## Bugs already found and fixed — do not reintroduce

1. **UTF-8 BOM broke 16 of 20 articles.** Files saved with a BOM fail `JSON.parse` silently, so
   `getAllArticles()` dropped them and the sitemap only ever had 4 articles. This is why nothing was
   indexed for three weeks. Never write article JSON with a BOM.
2. **nexguild countdown blocked Googlebot.** `data-countdown="45"` gated content behind an overlay;
   Googlebot saw a blank page. Now `data-countdown="0"` and `data-scroll="0"`. **The script itself must
   stay** — only the countdown is disabled.
3. **Category slugs must be lowercase hyphenated** in article JSON (`"tv-shows"`, not `"TV Shows"`).
   17 articles once had display names and vanished from category pages.
4. **Two ranking pages were 404ing** (`jennifer-lawrence-new-movie`, `netflix-new-celebrity-show`) —
   deleted from the repo while still indexed at position ~10. Republished at the same slugs.
5. **Meta keywords tag removed** — Google states it does not use it.
6. **Unescaped quotes in article JSON** break the file silently. Use `&ldquo;`/`&rdquo;` inside content.

---

## Hard rules

- Never invent quotes, release dates, box office numbers, awards or cast members. Write
  "not yet confirmed" instead of guessing. TMDB cast lists update before official announcements —
  attribute them as *reported*.
- Never state rumour as fact. Use "reportedly" / "sources say".
- Never publish adult ads.
- Never expose an API key in a repo file or a README.
- Never use `[EMBED_MEDIA: description]` — the converter only fires on a real `http(s)://` URL.
  A description renders as literal bracket text. **Ask Somen for the post URL.**
- **Staying on the `.site` domain** until revenue exists. Google applies no ranking penalty to new
  gTLDs and the TLD was never the indexing blocker. Do not re-raise migrating to `.com`.
- Internal links are **not** automatically checked. A link to a non-existent slug is a 404 on the site.
  Only use slugs copied from the live `/api/articles`.

---

## Admin panel — `/admin`, password `StarScoop@2026`

Next.js route (not `admin.html` — that was the abandoned v1). Tabs:

News Fetcher · Article Generator · **Find Images** · **Paste & Publish** · Published Articles ·
Image Fixer · Site Controls · Quick Stats · Ads Manager

The last two tabs in bold were added 5 August specifically so the site can run without Claude Code.
Publishing goes through the GitHub Contents API — Vercel's filesystem is read-only.

**Pin generator:** `https://www.starscoopdaily.site/api/pin?slug=SLUG` returns a 1000×1500 Pinterest
image with the headline burned in. Never paste an article URL into Pinterest directly — that pulls
`og:image`, which is 1200×630 landscape and gets buried.

---

## Where the real bottleneck is

Not the site. Not the ads. **Traffic.**

Technical SEO is clean: correct canonicals, structured data, alt text on all 66+ inline images, no
broken internal links, sitemap serving all pages, `index, follow` confirmed as Googlebot.

The two things that would actually move numbers:

1. **Pinterest.** 7 pins is not a strategy. Accounts that work pin 5–25/day. Pinterest moves in
   **weeks**, search takes **months**. The pin generator exists and is barely used. This is the single
   biggest gap.
2. **Consistency.** New domains in competitive niches need 3–6 months of daily publishing. The site
   has only been *working correctly* since ~26 July — everything before that was a broken sitemap.

Judging results before roughly 1 September means judging a broken period.

---

## Response preferences

- Specific and step-by-step. One step at a time, wait for confirmation.
- Concise — message limits apply.
- Never repeat a prompt already given.
- Be honest about what is not working. Somen has explicitly asked not to be talked into things.

---

## Pending

- Get 4 unique Adsterra zone keys → remove the iframe workaround in `AdSlotRenderer`
- Rotate the exposed Pexels key
- Pinterest daily pinning — the actual priority
- Re-enable SmartLink CTAs only at a few thousand sessions/month
- Reassess in early September: if impressions are flat after 28 days of daily publishing **and**
  daily pinning, that is genuine signal to change approach
