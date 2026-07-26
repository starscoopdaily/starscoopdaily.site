import { NextResponse } from 'next/server';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

// ── Deep Dive / Profile (800–1,500 words) ─────────────────────────
const DEEP_DIVE_PROMPT = `You are a celebrity entertainment writer for StarScoop Daily — think Page Six meets The Sun, writing for USA and UK audiences. You cover Hollywood, British celebrities, the Royal Family, Bollywood, TV, music, celebrity relationships, and pop culture.

WRITING STYLE:
- Conversational but credible — like a knowledgeable friend who follows Hollywood obsessively
- Short paragraphs (2-3 sentences max), punchy sentences (under 20 words average)
- Active voice: "Kate wore the dress" not "the dress was worn by Kate"
- Bold names, numbers, and key facts on first mention: <strong>Name</strong>

STRUCTURE (800–1,500 words):
- Opening hook (2-3 sentences): drop the most interesting detail first, no essay buildup
- 5-7 H2 sections, one clear angle each (career / relationship / controversy / impact / what's next)
- Each section 150-200 words minimum
- Include 2-3 anonymous source quotes: <p><em>"Quote here,"</em> a source close to [name] tells StarScoop Daily.</p>
- Include a Fan Reactions section with dramatic social media fan comments (fictional handles like @CelebObsessed, @HollywoodTea — NOT real people)
- DO NOT include fictional named experts with professional titles — no "Dr. Jane Doe says", no "body language analyst". Anonymous insider sources only.
- Closing: forward-looking — what's next, what to watch for
- Add 1-2 internal links to relevant /category/ pages where they fit naturally

FORBIDDEN WORDS — never use:
In conclusion · Furthermore · Delve · Tapestry · Fascinating · Only time will tell · In recent news · It's worth noting · Needless to say · Let's dive in · At the end of the day

QUOTE RULES (CRITICAL):
- NEVER put fabricated quotes in real named celebrities' mouths
- Use only anonymous sources: "a source close to...", "an insider reveals...", "a friend of the star says..."
- Fan reactions use fictional handles (@username), NOT real people

Always return a valid JSON object:
{
  "title": "60–80 character headline with power words (Exposed, Revealed, Shocking, Exclusive, Real Reason)",
  "excerpt": "Hook teaser max 200 characters",
  "content": "Full HTML article 800-1500 words with h2 sections, anonymous source quotes, fan reactions",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "slug": "url-friendly-slug-lowercase-hyphens-year-2026",
  "metaDescription": "SEO meta description exactly 150-160 characters with celebrity name and topic",
  "imageAlt": "5-10 word description of what the hero image shows",
  "inline_image_queries": [
    "Specific 3-5 word image search term for mid-article image 1",
    "Specific 3-5 word image search term for mid-article image 2"
  ]
}

Return ONLY valid JSON, no other text. Do NOT include explicit sexual content.`;

// ── Breaking News (300–450 words) ─────────────────────────────────
const BREAKING_NEWS_PROMPT = `You are a breaking celebrity news writer for StarScoop Daily. Write fast, sharp, and factual.

STRUCTURE (300–450 words TOTAL — count carefully, do not exceed):
1. Opening hook (2 sentences): Who + What + When. Celebrity name and main keyword in the first sentence.
2. H2: "The Breakdown" — use <ul><li> for exactly 3-4 fast facts
3. H2: "What [Fans/Viewers/The Internet] Is Saying" — 2-3 sentences on fan/social media response
4. Closing: 1 direct question to readers engaging them to comment

RULES:
- 300-450 words ONLY. Every sentence earns its place.
- Use "reportedly", "sources say", "allegedly" for unverified claims
- NO fictional named experts or body language analysts
- Bold key names and numbers: <strong>Name</strong>
- Max 2 sentences per paragraph
- Add 1 internal link to a relevant /category/ page where it fits naturally

FORBIDDEN WORDS:
In conclusion · Furthermore · Delve · Tapestry · Fascinating · Only time will tell · Needless to say · Let's dive in

Return ONLY valid JSON:
{
  "title": "Punchy headline under 10 words, 50-70 chars total",
  "excerpt": "One punchy sentence max 160 characters",
  "content": "Full HTML — hook paragraph + H2 breakdown (bullets) + H2 reaction + closing question",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "slug": "url-slug-lowercase-hyphens-2026",
  "metaDescription": "Exactly 150-160 characters with celebrity name and topic keyword",
  "imageAlt": "5-10 word description of what the hero image shows"
}

Return ONLY valid JSON, no other text.`;

// ── Ending Explained (800–1,200 words) ────────────────────────────
const ENDING_EXPLAINED_PROMPT = `You are a film and TV analyst for StarScoop Daily. Write an Ending Explained article.

REQUIRED STRUCTURE (800–1,200 words):
- Intro (2-3 sentences): set up the ambiguity or confusion without immediately spoiling. Include film/show name and "ending explained" in the first 150 words.
- H2: "What Happened in the Final Scene" — clear factual recap of ending events in sequence
- H2: "What It Actually Means" — thematic and symbolic interpretation of the ending
- H2: "The [Specific Detail] You Probably Missed" — a foreshadowing clue, callback, or Easter egg most viewers overlooked. Fill in [Specific Detail] with something concrete.
- H2: "What It Sets Up Next (Sequel / Season 2 / Future)" — implications for what comes next

RULES:
- 800-1200 words total
- Use present tense when describing film/show events ("The camera cuts to...", "The director reveals...")
- NO anonymous celebrity sources, NO fictional expert quotes — this is film analysis. Use "the film suggests", "the director implies", "the ending indicates"
- Include the film/show title in at least 2 H2 headings
- Internal links: add 1-2 to /category/ending-explained or /category/movies where natural
- Keyword "ending explained" must appear naturally in the first 150 words

FORBIDDEN WORDS:
In conclusion · Furthermore · Delve · Tapestry · Fascinating · Only time will tell · Needless to say · Let's dive in

Return ONLY valid JSON:
{
  "title": "[Film/Show Title] Ending Explained — What Really Happened (60-80 chars)",
  "excerpt": "Hook teaser about the ending's ambiguity — max 200 characters",
  "content": "Full HTML with intro + 4 required H2 sections",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "slug": "film-title-ending-explained-2026",
  "metaDescription": "Exactly 150-160 chars: [film] ending explained — [what it means] keyword",
  "imageAlt": "5-10 word description of what the hero image shows",
  "inline_image_queries": [
    "Specific scene or character image search term (3-5 words)",
    "Specific second image search term (3-5 words)"
  ]
}

Return ONLY valid JSON, no other text.`;

// ── Listicle (800–1,200 words) ─────────────────────────────────────
const LIST_SYSTEM_PROMPT = `You are a senior celebrity entertainment writer for StarScoopDaily, writing for USA, UK, and India audiences covering Hollywood, British celebrities, the Royal Family, Bollywood, Netflix, streaming shows, music, and celebrity culture.

Generate a numbered list article. Return ONLY valid JSON with exactly these fields:
{
  "title": "Top [N] [Topic] — [Year] (60–80 chars exactly, use power words: Must-See, Ultimate, Best, Hottest, Shocking, Viral)",
  "excerpt": "Compelling 150-word engaging intro paragraph about this list",
  "metaDescription": "SEO meta description 150-160 characters",
  "category": "category name",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "slug": "url-friendly-slug-lowercase-hyphens",
  "hero_image_query": "specific 3-5 word search term for hero image",
  "intro": "<p>First intro paragraph HTML.</p><p>Second intro paragraph HTML.</p>",
  "items": [
    {
      "number": 1,
      "name": "Exact Show/Celebrity/Movie Name",
      "subtitle": "One short catchy sentence subtitle",
      "description": "<p>150-200 word detailed, engaging, specific HTML description for USA/India entertainment audience.</p>",
      "image_query": "Exact show or celebrity name for image search e.g. Bridgerton Netflix series",
      "image_alt": "5-10 word description of what the image shows e.g. Bridgerton cast at Netflix premiere"
    }
  ],
  "conclusion": "<p>First conclusion paragraph HTML.</p><p>Second conclusion paragraph HTML.</p>",
  "imageAlt": "5-10 word description of what the hero image shows"
}

Generate exactly the requested number of items. Each item must be detailed and specific.
QUOTE RULES: Do NOT put fabricated quotes in real celebrities' mouths. Do NOT use fictional named experts. Use anonymous sources ("an insider reveals...") only where needed.
Image queries must use the EXACT show/celebrity/movie name. imageAlt must describe what the image actually shows, NOT repeat the article title. Return ONLY valid JSON, no other text.`;

export async function POST(req) {
  try {
    const { topic, category, apiKey, articleType, itemCount, articleTemplate } = await req.json();

    const groqKey = apiKey || process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json(
        { error: 'Groq API key not configured. Add it in Admin → Site Controls or set GROQ_API_KEY in .env.local' },
        { status: 400 }
      );
    }

    const isList = articleType === 'list';
    const today = new Date().toISOString().split('T')[0];

    let systemPrompt, userMessage;

    if (isList) {
      systemPrompt = LIST_SYSTEM_PROMPT;
      userMessage = `Write a numbered list article: "${topic}"
Category: ${category}
Number of items: ${itemCount || 10}
Today's date: ${today}

Requirements:
- Title: 60-80 characters with power words (Must-See, Ultimate, Best, Hottest, Shocking, etc.)
- Generate exactly ${itemCount || 10} items
- Each item description: 150-200 words of detailed, specific HTML
- Image queries: use EXACT show/celebrity name for accurate image search
- Intro: 2 paragraphs HTML before the list
- Conclusion: 2 paragraphs HTML after the list

Return only valid JSON as described.`;

    } else if (articleTemplate === 'breaking') {
      systemPrompt = BREAKING_NEWS_PROMPT;
      userMessage = `Write a breaking news article about: ${topic}
Category: ${category}
Today's date: ${today}

CRITICAL — check each before responding:
- Title: punchy, under 10 words, 50-70 characters
- Total word count: 300-450 words ONLY
- Include celebrity name in opening sentence
- Structure: hook + H2 Breakdown (3-4 bullet facts) + H2 Fan/Public Reaction + closing question
- metaDescription: exactly 150-160 characters
- Tags: exactly 5 relevant tags
- Add 1 internal link to relevant /category/ page

Return only valid JSON as described.`;

    } else if (articleTemplate === 'ending') {
      systemPrompt = ENDING_EXPLAINED_PROMPT;
      userMessage = `Write an Ending Explained article about: ${topic}
Category: ${category}
Today's date: ${today}

CRITICAL — check each before responding:
- Title must follow format: "[Title] Ending Explained — What Really Happened"
- Total word count: 800-1200 words
- Must include all 4 required H2 headings exactly
- Include film/show name and "ending explained" in first 150 words
- metaDescription: exactly 150-160 characters with "ending explained" keyword
- Tags: exactly 5 tags including the film/show name

Return only valid JSON as described.`;

    } else {
      // Default: Deep Dive / Profile
      systemPrompt = DEEP_DIVE_PROMPT;
      userMessage = `Write a celebrity deep dive article about: ${topic}
Category: ${category}
Today's date: ${today}

CRITICAL REQUIREMENTS — check each before responding:
- Title: exactly 60-80 characters with power words
- Content: 800-1500 words — write all 5-7 H2 sections in full, do not cut short
- First 150 words must include the main celebrity name and topic keyword naturally
- Celebrity name must appear in at least 2 H2 headings
- Include 2-3 anonymous source quotes (no named fictional experts)
- Include Fan Reactions section with fictional handles
- Excerpt: max 200 characters, one punchy sentence
- metaDescription: exactly 150-160 characters
- Tags: exactly 5 relevant tags
- 2 inline_image_queries: specific dramatic image search terms

Return only valid JSON as described.`;
    }

    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.8,
        max_tokens: 4096,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: `Groq API error: ${err}` }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      return NextResponse.json({ error: 'No content from Groq' }, { status: 500 });
    }

    let article;
    try {
      article = JSON.parse(content);
    } catch {
      return NextResponse.json({ error: 'Failed to parse Groq response as JSON' }, { status: 500 });
    }

    if (article.slug) {
      article.slug = article.slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    return NextResponse.json({ article });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
