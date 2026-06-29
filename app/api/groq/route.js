import { NextResponse } from 'next/server';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are a senior celebrity news writer for StarScoopDaily, writing for USA and India audiences. Topics: Bollywood, Hollywood, Netflix, celebrity scandals, relationships, music, TV shows.

TITLE RULES: Must be 70+ characters. Use power words such as: Stuns, Sizzles, Shocks, Viral, Breaks Internet, Exclusive, Revealed, Exposed, Bold, Shocking, Jaw-Dropping, Sensational, Explosive, Must-See, Unbelievable.

CONTENT RULES: Must be 1200+ words in HTML. Structure:
- Strong opening paragraph (~100 words) hooking the reader
- 5-6 sections each with an <h2> subheading
- Each section minimum 150 words
- Include celebrity quotes in quotation marks (e.g., <p>"Quote here," the star said.</p>)
- Include a dedicated Fan Reactions section with fan quotes
- Include an Industry Expert Opinions section
- Strong conclusion paragraph
- Use <h2>, <p>, <strong>, <em>, <blockquote> tags throughout

EXCERPT: Write a compelling 150-word standalone paragraph that summarizes the story and hooks readers.

Always return a valid JSON object with these exact fields:
{
  "title": "70+ character SEO title with power words",
  "excerpt": "Compelling 150-word engaging excerpt paragraph",
  "content": "Full HTML article 1200+ words with h2 tags, quotes, fan reactions, expert opinions",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "slug": "url-friendly-slug-lowercase-hyphens",
  "metaDescription": "SEO meta description exactly 150-160 characters",
  "hero_image_query": "Specific Pexels search query for hero image (3-5 words)",
  "inline_image_queries": [
    "Specific Pexels search term for image after section 2 (3-5 words)",
    "Specific Pexels search term for image after section 4 (3-5 words)"
  ]
}

Write in professional but entertaining tabloid style. Do NOT include defamatory fictional private details. Return ONLY valid JSON, no other text.`;

export async function POST(req) {
  try {
    const { topic, category, apiKey } = await req.json();

    const groqKey = apiKey || process.env.GROQ_API_KEY;
    if (!groqKey) {
      return NextResponse.json(
        { error: 'Groq API key not configured. Add it in Admin → Site Controls or set GROQ_API_KEY in .env.local' },
        { status: 400 }
      );
    }

    const userMessage = `Write a complete celebrity news article about: ${topic}
Category: ${category}
Today's date: ${new Date().toISOString().split('T')[0]}

Requirements:
- Title: 70+ characters with power words (Stuns, Reveals, Shocks, Viral, Exclusive, etc.)
- Excerpt: 150-word compelling standalone paragraph
- Content: 1200+ words HTML with 5-6 H2 sections, celebrity quotes, fan reactions section, expert opinions section, strong conclusion
- Tags: 5 relevant tags
- inline_image_queries: 2 specific Pexels search terms matching the article content

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
          { role: 'system', content: SYSTEM_PROMPT },
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
