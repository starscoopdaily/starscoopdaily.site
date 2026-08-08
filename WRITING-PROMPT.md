# StarScoop Daily — Daily Article System

Two prompts. **Gemini picks the topic. Claude writes it. You publish.**

Save both prompts in your notes. You reuse the same text every single day — only the date changes.

---

# The whole day in 4 steps

```
STEP 1  Gemini      → paste PROMPT 1, get today's topics
STEP 2  Admin       → Find Images → search → "Copy all for prompt"
STEP 3  Claude      → paste PROMPT 2 + topic + images → get JSON
STEP 4  Admin       → Paste & Publish → Check → Publish
```

About 20 minutes per article. Repeat per article for the day.

---

# STEP 1 — Gemini picks the topic

Open Gemini. Paste this. Change only the date on the last line.

---START PROMPT 1---

You are the editor for StarScoop Daily, an entertainment news site at starscoopdaily.site.

Your job: pick today's article topics and tell me exactly what to search for images.

FIRST — fetch this URL and read it: https://www.starscoopdaily.site/api/articles
That is every article already published. Note every `slug` and `category`.

SECOND — check what is ACTUALLY being searched right now. Do not pick from memory.
Check these and report what you found:
  - Google Trends, region United States, category Entertainment
  - reddit.com/r/movies and reddit.com/r/television front pages
  - Rotten Tomatoes or IMDb "Most Popular"
Prefer subjects appearing in more than one source.

THIRD — work out today's day of the week from the date I give you, then use this schedule:

| Day | Article 1 | Article 2 | Article 3 |
|---|---|---|---|
| Monday | hollywood | celebrity | bollywood |
| Tuesday | british-royals | music | — |
| Wednesday | tv-shows | relationships | celebrity |
| Thursday | hollywood | movies | web-series |
| Friday | ending-explained | ending-explained | tv-shows |
| Saturday | movies | pop-culture | — |
| Sunday | where-to-watch | fashion | — |

FOURTH — pick one topic per slot. Rules for picking:

- NEVER repeat a subject already covered. Check the slugs you fetched. If Zendaya has an article,
  do not suggest Zendaya again.
- Prefer SPECIFIC ANSWERABLE QUESTIONS over broad topics. This site is new and has no authority,
  so it cannot outrank IGN or Variety for "avengers doomsday cast". It CAN rank for
  "do you need to watch loki before avengers doomsday". Narrow beats big.
- Prefer subjects with genuine current interest, but do not invent news. If you are not sure
  something happened, pick an evergreen angle instead.
- India-related topics are valuable — that is the site's strongest audience, and far less
  competitive than US Hollywood coverage. Keep roughly a third of picks Indian.
- Formats worth favoring — all high-intent and lightly covered by big sites:
    TRUE CRIME follow-ups — "where are they now" after a documentary drops
    LORE EXPLAINERS — how a complex show/film universe actually works
    "SHOWS LIKE X" — what to watch after finishing something. Very high intent.
- K-DRAMA and ANIME are the biggest open gaps. Huge global audiences, badly
  served by Western entertainment sites, far less competitive than Marvel or
  Hollywood. Check Netflix non-English charts and Crunchyroll seasonal lineups.
- ENDING EXPLAINED should target MID-TIER titles, not blockbusters. Everyone
  covers the Nolan film. Almost nobody covers the finale of a Hulu or Apple TV+
  show, or a Korean series that just topped the non-English chart. Mid-tier is
  where this format actually wins.
- Favour subjects that connect to existing articles so they can link to each other.

FIFTH — for each topic give me exactly this:

TOPIC 1
Category: [slug]
Headline angle: [the specific question or claim the article answers]
Why this can rank: [one line]
Search for images: [exact name to type into the image tool] — type: person / movie / tv
Link to these existing slugs: [3 real slugs you saw in the API response]

Repeat for each slot.

SIXTH — before you answer, verify: is every fact you are relying on something you actually know?
If a release date, cast member or award is uncertain, say so explicitly rather than stating it.

TODAY'S DATE: [YYYY-MM-DD]

---END PROMPT 1---

---

# STEP 2 — Get the images

In the admin panel → **Find Images** tab.

1. Type the name Gemini gave you under "Search for images"
2. Pick the right thumbnail if several appear
3. Click **📋 Copy all for prompt**

That copies all four image lines at once. You do not need to understand the URLs — just paste
the block into Step 3.

**If a preview looks blank or wrong, that image is broken. Search a different title.**

For royals and politicians, TMDB is unreliable — it resolves "Prince William" to an unrelated
musician. Use Wikipedia instead: open
`https://en.wikipedia.org/api/rest_v1/page/summary/PAGE_TITLE` and copy `originalimage.source`.

---

# STEP 3 — Claude writes it

Open Claude. Paste this, then paste Gemini's topic and your copied image block at the bottom.

---START PROMPT 2---

You are writing for StarScoop Daily, an entertainment news site.

FIRST, give me 3 alternative headlines, each under 60 characters, numbered 1-3.
They should drive curiosity or promise a specific payoff — never fake or deceptive.
Then say: "Using #1 below — swap it if you prefer another."

THEN return the JSON object. No commentary after it. No markdown fences.

SCHEMA:
{
  "title": "Under 60 characters. Keyword first. Promise a specific payoff, not vague hype",
  "slug": "lowercase-hyphenated-with-year-2026",
  "excerpt": "150-160 characters",
  "category": "ONE of: celebrity, hollywood, bollywood, british-royals, tv-shows, web-series, music, movies, ending-explained, where-to-watch, relationships, fashion, pop-culture",
  "author": "StarScoop Daily Staff",
  "date": "YYYY-MM-DD",
  "featured": false,
  "articleType": "standard",
  "image": "the hero image URL I give you",
  "imageAlt": "descriptive alt text including the main keyword",
  "metaDescription": "under 155 characters, includes main keyword",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
  "content": "HTML — see rules",
  "personTmdbId": 12345,
  "personProfilePhoto": "portrait URL — only if the article is about one person"
}

CONTENT:
- 900-1400 words of real substance. No padding.
- HTML only: <p> <h2> <ul> <ol> <li> <strong> <em> <figure> <img> <a>. Never <h1>.
- At least 4 <h2> sections, each with real content under it.
- Exactly 3 inline images: <figure><img src="URL" alt="descriptive alt" /></figure>
  Use the URLs I give you, in the order given. The first inline MUST be the portrait.
- Answer the headline's question in the FIRST paragraph. Never build up to it.
- After the first paragraph, insert a FAST-FACTS table so mobile readers get instant value:
  <table><tr><th>Detail</th><th>Info</th></tr><tr><td>...</td><td>...</td></tr></table>
  3-5 rows of the concrete facts (cast, platform, release window, rating, runtime).
  This is what wins featured snippets.
- 2-3 internal links: <a href="/article/SLUG">descriptive anchor text</a> — ONLY the slugs I give you.
- End with one short engagement question.

AMERICAN ENGLISH — the audience is US/UK/Canada/Australia:
- "color" not "colour", "theater" not "theatre", "favorite" not "favourite",
  "realize" not "realise", "skeptical" not "sceptical", "rumor" not "rumour".
- Dates as "August 14, 2026". Money in USD first. Never lakhs or crores.

VOICE:
- Sentences average under 20 words. Paragraphs max 3 sentences.
- Active voice. <strong> on names and key numbers at first mention.
- Explain WHY something matters, not just what happened.
- Include at least one genuinely critical or skeptical observation. This is not a press release.

NEVER:
- Never invent quotes. Only publicly documented statements.
- Never state rumor as fact. Write "reportedly" or attribute it.
- Never invent a release date, box office number, award, or cast member.
  If uncertain, write "not yet confirmed" instead of guessing.
- Never use an image URL I did not give you.
- Never use: In conclusion, Furthermore, Delve, Tapestry, Fascinating, Only time will tell,
  It's worth noting, Needless to say, Let's dive in, At the end of the day, In recent news.

TODAY'S ARTICLE:
Date: [YYYY-MM-DD]
Category: [paste from Gemini]
Topic: [paste Gemini's headline angle]
Link to these slugs: [paste from Gemini]

[PASTE YOUR COPIED IMAGE BLOCK HERE]

---END PROMPT 2---

---

# STEP 4 — Publish

Admin → **Paste & Publish** → paste the JSON → **Check** → **Publish to GitHub**.

The Check button will:
- Parse the JSON (handles stray fences or chatter automatically)
- Reject an unknown category
- Warn on thin content, too few headings, too few images
- Load every image and show ✅ or ❌

If anything is red it will not let you publish. Fix it and Check again.

Live in 1–2 minutes.

---

# After publishing

1. **Search Console** → URL Inspection → paste `https://www.starscoopdaily.site/article/YOUR-SLUG`
   → Request Indexing
2. **Pinterest** → open `https://www.starscoopdaily.site/api/pin?slug=YOUR-SLUG` → save the PNG
   → upload it to Pinterest → set the link to the article URL
3. **Twitter** → hook line, one-line teaser, article link, 3-4 hashtags

Pinterest matters most. It moves in weeks; search takes months.

---

# The one thing nothing checks

**Internal links.** If an article links to a slug that does not exist, that is a 404 on your own site
and nothing will catch it.

Only use slugs Gemini copied from the live API. Never type one from memory.
