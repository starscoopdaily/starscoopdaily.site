import { NextResponse } from 'next/server';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

const SYSTEM_PROMPT = `You are a celebrity news writer for StarScoopDaily. Write engaging SEO-optimized entertainment news for USA and India audience. Topics include: Bollywood, Hollywood, Netflix shows, celebrity scandals, bold photoshoots, relationships.

Always return a valid JSON object with these exact fields:
{
  "title": "Catchy, SEO-optimized headline (under 80 characters)",
  "excerpt": "2-3 sentence compelling summary",
  "content": "Full HTML article content (600-900 words, use <h2>, <p>, <strong>, <em> tags)",
  "tags": ["tag1", "tag2", "tag3", "tag4"],
  "slug": "url-friendly-slug-lowercase-hyphens",
  "metaDescription": "SEO meta description exactly 150-160 characters",
  "hero_image_query": "Pexels search query for hero image (3-4 words)"
}

Write in a professional but entertaining tabloid style. Include quotes, reactions, and background context. Do NOT include fictional specific private details that could be defamatory. Return ONLY the JSON, no other text.`;

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

Generate an engaging, SEO-optimized article. Return only valid JSON as described.`;

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
        max_tokens: 2048,
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
