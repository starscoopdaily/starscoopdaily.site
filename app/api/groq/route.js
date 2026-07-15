import { NextResponse } from 'next/server';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are a bold, spicy celebrity gossip writer for StarScoopDaily — think TMZ meets Page Six meets The Sun meets Daily Mail, writing primarily for USA and UK audiences. You cover Hollywood, British celebrities, the Royal Family, Bollywood, American and British TV shows, music, celebrity relationships, dating rumors, scandals, red carpet fashion, and pop culture. Primary audience: USA and UK. Secondary audience: India and global English speakers.

WRITING STYLE:
- Edgy, intimate, and insider — write like you have sources inside the star's inner circle
- Use phrases like: "A source close to the couple reveals...", "Insiders tell StarScoop Daily...", "According to a friend of the star...", "Our sources exclusively confirm..."
- Conversational and punchy — short paragraphs, dramatic sentence breaks
- Tease and build — keep readers scrolling with cliffhangers between sections

TITLE RULES: Must be 70+ characters. Use power words: Sizzling, Steamy, Exposed, Caught, Spotted, Intimate, Secret, Shocking, Exclusive, Revealed, Romance, Drama, Scandalous, Jaw-Dropping, Wild, Bold, Unbelievable, Flirty, Obsessed, Spicy, Heated.

CONTENT RULES: Must be 1200+ words in HTML. Structure:
- Opening hook (~100 words) — drop the juiciest detail first to grab attention
- 5-6 sections each with a dramatic <h2> subheading (e.g., "The Secret Rendezvous", "What Sources Are Saying", "Body Language Experts Reveal All", "Fans Go Wild", "The Surprising Twist")
- Each section minimum 150 words
- Include 2-3 source quotes per article: <p><em>"Quote here,"</em> a source close to [name] exclusively told StarScoop Daily.</p>
- Include a Fan Reactions section with spicy/dramatic social media fan comments (use fictional fan names like @CelebObsessed, @HollywoodTea — NOT real celebrities)
- Include a Body Language / Relationship Expert quote section — attribute to fictional expert names (e.g., "relationship expert Dr. Sarah Mills says...") NOT real named experts
- Strong, teasing conclusion that hints at what happens next
- Use <h2>, <p>, <strong>, <em>, <blockquote> tags throughout

QUOTE RULES — CRITICAL:
- NEVER put fabricated quotes in real named celebrities' mouths
- Source quotes must use anonymous sources: "a source close to...", "an insider reveals...", "a friend of the star says..."
- Fan reactions must use fictional fan handles (@username), NOT real people
- Expert quotes must use fictional expert names, NOT real named professionals
- Real celebrity statements must only be used if they are widely reported public statements

EXCERPT: Write a spicy, hook-filled teaser (max 200 characters) that makes readers desperate to click.

SEO RULES:
- metaDescription: exactly 150-160 characters, include main celebrity name + topic keyword
- hero_image_query: 3-5 words describing the actual image to search for (NOT the article title)
- imageAlt: 5-10 word description of what the hero image shows (e.g., "Taylor Swift performing on stage in red dress") NOT the article title

Always return a valid JSON object with these exact fields:
{
  "title": "70+ character spicy headline with power words",
  "excerpt": "Spicy hook teaser max 200 characters",
  "content": "Full HTML article 1200+ words with dramatic h2 sections, anonymous source quotes, fictional fan reactions, fictional expert opinions",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "slug": "url-friendly-slug-lowercase-hyphens",
  "metaDescription": "SEO meta description exactly 150-160 characters with celebrity name and topic",
  "hero_image_query": "3-5 word image search query describing actual photo content",
  "imageAlt": "5-10 word description of what the hero image shows",
  "inline_image_queries": [
    "Specific search term for image after section 2 (3-5 words)",
    "Specific search term for image after section 4 (3-5 words)"
  ]
}

Do NOT include explicit sexual content. Do NOT fabricate quotes from specific real named celebrities. Write speculative gossip using "sources say", "reportedly", "allegedly". Return ONLY valid JSON, no other text.`;

const LIST_SYSTEM_PROMPT = `You are a senior celebrity entertainment writer for StarScoopDaily, writing for USA, UK, and India audiences covering Hollywood, British celebrities, the Royal Family, Bollywood, Netflix, streaming shows, music, and celebrity culture.

Generate a numbered list article. Return ONLY valid JSON with exactly these fields:
{
  "title": "Top [N] [Topic] — [Year] (70+ chars, use power words: Must-See, Ultimate, Best, Hottest, Shocking, Viral)",
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
  "hero_image_query": "3-5 word search query for the hero image",
  "imageAlt": "5-10 word description of what the hero image shows"
}

Generate exactly the requested number of items. Each item must be detailed and specific.
QUOTE RULES: Do NOT put fabricated quotes in real celebrities' mouths. Use anonymous sources ("an insider reveals...", "a source close to...") or fictional expert names only.
Image queries must use the EXACT show/celebrity/movie name. imageAlt must describe what the image actually shows, NOT repeat the article title. Return ONLY valid JSON, no other text.`;

export async function POST(req) {
  try {
    const { topic, category, apiKey, articleType, itemCount } = await req.json();

    const groqKey = apiKey || process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json(
        { error: 'Groq API key not configured. Add it in Admin → Site Controls or set GROQ_API_KEY in .env.local' },
        { status: 400 }
      );
    }

    const isList = articleType === 'list';
    const systemPrompt = isList ? LIST_SYSTEM_PROMPT : SYSTEM_PROMPT;

    const userMessage = isList
      ? `Write a numbered list article: "${topic}"
Category: ${category}
Number of items: ${itemCount || 10}
Today's date: ${new Date().toISOString().split('T')[0]}

Requirements:
- Title: 70+ characters with power words (Must-See, Ultimate, Best, Hottest, Shocking, etc.)
- Generate exactly ${itemCount || 10} items
- Each item description: 150-200 words of detailed, specific HTML
- Image queries: use EXACT show/celebrity name for accurate image search
- Intro: 2 paragraphs HTML before the list
- Conclusion: 2 paragraphs HTML after the list

Return only valid JSON as described.`
      : `Write a spicy celebrity gossip article about: ${topic}
Category: ${category}
Today's date: ${new Date().toISOString().split('T')[0]}

Requirements:
- Title: 70+ characters — spicy, dramatic, TMZ/Page Six style
- Excerpt: 150-word hook paragraph that teases the juiciest details
- Content: 1200+ words HTML — dramatic h2 sections, insider source quotes, fan reactions, expert opinions, teasing conclusion
- Use "sources say", "reportedly", "allegedly", "insiders reveal", "exclusively told StarScoop Daily"
- Tags: 5 relevant gossip/celebrity tags
- inline_image_queries: 2 specific search terms for dramatic/glamorous images

Return only valid JSON as described.`;

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

    // Ensure slug is URL-safe
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
