# StarScoop Daily — Article Writing Prompt

Copy everything between the `---START---` and `---END---` markers into Claude chat (claude.ai) or Gemini,
fill in the two blanks at the bottom, and it returns article JSON ready to paste into
**Admin → Paste & Publish**.

Save it once in your notes. You reuse the same block every day.

---

## Daily workflow — 5 steps, all in the admin panel

Everything happens at `https://www.starscoopdaily.site/admin` except the writing itself.

**1. Pick topics** — check the day's categories in the table at the bottom of this file.
Open **Published Articles** to see what's already covered so you don't repeat a topic.

**2. Get images** — **Find Images** tab. Type a name or title, pick the right result from the
thumbnails, click **Copy** on each URL. You see the actual picture before you copy it, so a broken
image can't get through. Grab a hero (landscape) and 3 portraits/inlines.

**3. Write** — paste the prompt below into Claude or Gemini, fill in the blanks with your topic and
the URLs you just copied.

**4. Publish** — **Paste & Publish** tab. Paste the JSON → **Check** → **Publish to GitHub**.
It parses the JSON, rejects unknown categories, warns on thin content, and loads every image to
confirm it works. If anything is red, it won't let you publish.

**5. Promote** — request indexing in Search Console, then open
`https://www.starscoopdaily.site/api/pin?slug=YOUR-SLUG`, save the PNG, upload to Pinterest.

For royals and public figures TMDB is unreliable — it resolves "Prince William" to an unrelated
musician. Use Wikipedia instead: open `https://en.wikipedia.org/api/rest_v1/page/summary/PAGE_TITLE`
and copy `originalimage.source`.

---

## The prompt

---START---

You are writing for StarScoop Daily, an entertainment news site. Return ONLY a valid JSON object — no
commentary before or after, no markdown fences.

SCHEMA — every field required unless marked optional:
{
  "title": "Headline, under 70 characters, main keyword in the first 60",
  "slug": "lowercase-hyphenated-with-year-2026",
  "excerpt": "150-160 character summary",
  "category": "ONE of: celebrity, hollywood, bollywood, british-royals, tv-shows, web-series, music, movies, ending-explained, where-to-watch, relationships, fashion, pop-culture",
  "author": "StarScoop Daily Staff",
  "date": "YYYY-MM-DD",
  "featured": false,
  "articleType": "standard",
  "image": "HERO IMAGE URL — landscape",
  "imageAlt": "Descriptive alt text including the main keyword",
  "metaDescription": "Under 155 characters, includes main keyword",
  "tags": ["Tag1", "Tag2", "Tag3", "Tag4", "Tag5"],
  "content": "HTML string — see rules below",
  "personTmdbId": 12345,
  "personProfilePhoto": "PORTRAIT URL (optional — only for articles about one person)"
}

CONTENT RULES:
- 900-1400 words of real substance. No padding.
- Plain HTML only: <p>, <h2>, <ul>, <ol>, <li>, <strong>, <em>, <figure>, <img>, <a>. No <h1>.
- At least 4 <h2> sections, each with real content under it.
- Exactly 3 inline images as <figure><img src="URL" alt="descriptive alt" /></figure>.
  The FIRST inline image must be portrait (a poster or person photo).
- Answer the headline's question in the FIRST paragraph. Do not build up to it.
- 2-3 internal links as <a href="/article/SLUG">descriptive anchor text</a> using slugs I give you.
- End with one short engagement question.

VOICE:
- Sentences average under 20 words. Paragraphs max 3 sentences.
- Active voice. Bold names and key numbers on first mention with <strong>.
- Confident and specific. Explain WHY something matters, not just what happened.
- Include at least one genuinely critical or sceptical observation. Do not write a press release.

NEVER:
- Never invent quotes. Only use publicly documented statements.
- Never state rumour as fact — write "reportedly", "sources say", or attribute it.
- Never invent a release date, box office figure, award, or cast member. If you are not certain,
  write "not yet confirmed" instead of guessing.
- Never use: In conclusion, Furthermore, Delve, Tapestry, Fascinating, Only time will tell,
  It's worth noting, Needless to say, Let's dive in, At the end of the day, In recent news.
- Never use an image URL I did not give you.

TODAY'S ARTICLE:
- Date: [YYYY-MM-DD]
- Category: [one slug from the list]
- Topic: [what the article is about]
- Hero image (landscape): [URL]
- Inline image 1 (portrait): [URL]
- Inline image 2: [URL]
- Inline image 3: [URL]
- Internal links available: [paste 3-4 existing slugs]

---END---

---

## Which category on which day

| Day | Slot 1 | Slot 2 | Slot 3 |
|---|---|---|---|
| Monday | hollywood | celebrity | bollywood |
| Tuesday | british-royals | music | — |
| Wednesday | tv-shows | relationships | celebrity |
| Thursday | hollywood | movies | web-series |
| Friday | ending-explained | ending-explained | tv-shows |
| Saturday | movies | pop-culture | — |
| Sunday | where-to-watch | fashion | — |

Full rules in `CLAUDE.md` Section 2.

---

## Claude chat vs Gemini

Both work. Practical differences:

- **Claude** follows the JSON schema and the "never invent facts" rules more reliably, and holds the
  voice rules across a long output. Fewer corrections needed.
- **Gemini Pro** has a larger free allowance and can search the web, which helps for genuinely current
  news. It is looser about output format — expect to strip markdown fences sometimes, which
  **Paste & Publish** already handles for you.

Reasonable split: **Gemini for research** (what actually happened, is this cast confirmed), **Claude for
the writing**. Or just use whichever you have quota on — the prompt is the same.

**On Groq:** your instinct is right. `llama-3.3-70b` is fast and cheap but produces generic copy and
invents details, which is the one thing this site cannot afford. The `/api/groq` route still exists in
the admin panel if you want it, but the paste workflow is better output for the same effort.

---

## The checks you lose, and what replaces them

| Was automatic | Now |
|---|---|
| Duplicate slug check | Skim `/api/articles` before picking a topic |
| Image returns 200 | **Paste & Publish** loads every image and shows ✅/❌ |
| JSON valid, no BOM | **Paste & Publish** parses before allowing publish |
| Build passes | Vercel emails you if a deploy fails |
| Category slug correct | **Paste & Publish** rejects unknown categories |
| Internal links resolve | Not checked — only use slugs you copied from `/api/articles` |

The last row is the one to be careful about. A link to a slug that doesn't exist is a 404 on your own
site, and nothing will catch it for you. Copy slugs, don't type them from memory.
