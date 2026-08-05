# Reusable Content System — any site, any niche

Generic version of the StarScoop workflow. Replace the bracketed parts.

**The core idea:** one model decides *what* to write, a different one *writes* it, and something
mechanical checks the output before it goes live. Doing all three in one prompt is where quality drops.

---

## PROMPT 1 — Research (Gemini, or anything that can browse)

Gemini is better here because it can fetch live pages. Claude is better at Prompt 2.

```
You are the editor for [SITE NAME], a [NICHE] site at [DOMAIN].

FIRST — fetch [URL THAT LISTS YOUR EXISTING CONTENT] and note every title and topic
already covered. Never suggest a repeat.

SECOND — today is [DATE]. Today's content types are: [TYPE A], [TYPE B].

THIRD — pick one topic per slot. Rules:
- Prefer SPECIFIC ANSWERABLE QUESTIONS over broad topics. A new site has no authority
  and cannot outrank established competitors on head terms. It can win narrow ones.
  Bad: "[BROAD TOPIC]"   Good: "[SPECIFIC QUESTION ABOUT IT]"
- Do not invent news. If unsure something happened, pick an evergreen angle.
- Favour topics that connect to existing content so they can link to each other.

FOURTH — for each, give exactly:
TOPIC
Type: [slot]
Angle: the specific question the piece answers
Why it can rank: one line
Sources: 2-3 real URLs backing the key facts
Link to: 3 existing URLs/slugs from what you fetched

FIFTH — before answering, check: is every fact something you actually know?
Flag anything uncertain rather than stating it.
```

---

## PROMPT 2 — Write (Claude)

```
You are writing for [SITE NAME]. Return ONLY [valid JSON matching the schema below |
clean HTML | markdown]. No commentary, no code fences.

[PASTE YOUR EXACT OUTPUT SCHEMA HERE]

CONTENT:
- [N] words of real substance. No padding.
- At least [N] sections, each with real content under it.
- Answer the headline's question in the FIRST paragraph. Never build up to it.
- [N] internal links using ONLY the URLs I give you.
- End with [your standard closer].

VOICE:
- Sentences average under 20 words. Paragraphs max 3 sentences.
- Active voice. Explain WHY something matters, not just what happened.
- Include at least one genuinely critical or sceptical observation.
  This is not a press release.

NEVER:
- Never invent quotes, dates, numbers, names or statistics.
  If uncertain write "not confirmed" instead of guessing.
- Never state rumour as fact — attribute it.
- Never use a URL or image I did not give you.
- Never use: In conclusion, Furthermore, Delve, Tapestry, Fascinating,
  It's worth noting, Needless to say, Let's dive in, At the end of the day.

TODAY'S PIECE:
[paste Prompt 1's output verbatim]
[paste any assets — image URLs, data]
```

---

## The two rules that matter most

**Split research from writing.** A model doing both will quietly invent facts to fit the story it
started telling. Separating them means the writer only works with what the researcher verified.

**Never let the writer supply its own facts or assets.** Give it the URLs, the images, the sources.
Anything it produces from memory is the thing that will be wrong.

---

## Validate before publishing

Whatever the platform, check mechanically rather than by eye:

| Check | Why |
|---|---|
| Output parses (JSON/HTML valid) | A stray character silently breaks the file |
| No BOM at the start of the file | Breaks `JSON.parse` invisibly — cost this site 3 weeks of indexing |
| Required fields all present | Missing meta = no search snippet |
| Category/tag values are from your allowed list | Typos create orphan pages |
| Every image URL actually loads | Broken images ship silently |
| Internal links point at pages that exist | Otherwise you create 404s on your own site |
| Word count and heading count above minimum | Thin pages get ignored |

The last one on internal links is the easiest to miss and the most damaging.

---

## Generate promo from the content, not from a model

Social captions can be built deterministically from title, excerpt, tags and URL. No AI call needed,
no daily chat required, consistent every time. See `lib/social.js` in this repo for a working example.

---

## What this system does not fix

Traffic. A perfect pipeline publishing into a new domain still takes **3–6 months** to show search
movement. Pick one distribution channel that moves in weeks — Pinterest, Reddit, a newsletter, YouTube —
and work it daily from day one. The content system is necessary and not sufficient.
