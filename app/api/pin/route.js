import { ImageResponse } from 'next/og';
import { getCategoryConfig, prettifyCategory } from '@/lib/categories';

/**
 * Pinterest pin generator.
 *
 * Pinterest ranks 2:3 vertical images with text overlay far above plain
 * landscape photos. Our og:image is 1200x630, which is exactly the wrong
 * shape — pasting an article URL into Pinterest pulls that and produces a
 * pin that gets buried.
 *
 * This returns a 1000x1500 pin built from the article's own hero image with
 * the headline burned in. Visit /api/pin?slug=SLUG, save the PNG, upload it
 * to Pinterest, and set the destination link to the article URL.
 *
 * Edge runtime: @vercel/og resolves fonts correctly there, and article data
 * comes from the existing /api/articles endpoint rather than the filesystem.
 */
export const runtime = 'edge';

const W = 1000;
const H = 1500;

function fitTitle(title) {
  // Scale to fit rather than truncating — the back half of a headline is
  // usually where the hook lives ("...Bollywood's Most Powerful Actress").
  const t = (title || '').trim();
  if (t.length <= 42) return { text: t, size: 80 };
  if (t.length <= 68) return { text: t, size: 70 };
  if (t.length <= 95) return { text: t, size: 60 };
  if (t.length <= 125) return { text: t, size: 52 };
  return { text: t.slice(0, 123).trim() + '…', size: 48 };
}

export async function GET(req) {
  const url = new URL(req.url);
  const slug = url.searchParams.get('slug');
  const articles = await fetch(`${url.origin}/api/articles`, {
    cache: 'no-store',
  })
    .then((r) => r.json())
    .catch(() => []);

  if (!slug) {
    const list = articles
      .slice(0, 40)
      .map((a) => `/api/pin?slug=${a.slug}`)
      .join('\n');
    return new Response(
      `Pinterest pin generator — 1000x1500\n\nPass ?slug=SLUG. Available:\n\n${list}\n`,
      { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  const article = articles.find((a) => a.slug === slug);
  if (!article) {
    return new Response(`No article with slug "${slug}"`, { status: 404 });
  }

  const catSlug = (article.category || '').toLowerCase().replace(/\s+/g, '-');
  const { color, icon } = getCategoryConfig(catSlug);
  const { text: title, size: titleSize } = fitTitle(article.title);

  // Prefer a portrait source when the article has one — it fills the frame
  // better than a 16:9 backdrop scaled up.
  const img = article.personProfilePhoto || article.image;

  return new ImageResponse(
    (
      <div
        style={{
          width: `${W}px`,
          height: `${H}px`,
          display: 'flex',
          flexDirection: 'column',
          background: '#0e0e0e',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Photo fills the frame; text sits over a gradient at the bottom */}
        {img && (
          <img
            src={img}
            width={W}
            height={H}
            style={{
              position: 'absolute',
              inset: 0,
              width: `${W}px`,
              height: `${H}px`,
              objectFit: 'cover',
              objectPosition: 'top center',
            }}
          />
        )}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            // Heavy at the base so white headlines stay legible over pale
            // photos as well as dark ones.
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.60) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.55) 52%, rgba(0,0,0,0.88) 72%, rgba(0,0,0,0.97) 100%)',
          }}
        />

        {/* Masthead */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            padding: '44px 52px 0',
            position: 'relative',
          }}
        >
          <div
            style={{
              background: '#cc0000',
              color: 'white',
              fontWeight: 900,
              fontSize: '34px',
              width: '58px',
              height: '58px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Emoji, not U+2605 — the default Noto Sans has no black-star
                glyph and renders it as a tofu box. */}
            ⭐
          </div>
          <div
            style={{
              color: 'white',
              fontWeight: 900,
              fontSize: '36px',
              letterSpacing: '-0.5px',
              display: 'flex',
              textShadow: '0 2px 14px rgba(0,0,0,0.6)',
            }}
          >
            StarScoop Daily
          </div>
        </div>

        {/* Headline block */}
        <div
          style={{
            marginTop: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '0 52px 56px',
            position: 'relative',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignSelf: 'flex-start',
              alignItems: 'center',
              gap: '10px',
              background: color,
              color: 'white',
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '10px 20px',
              borderRadius: '6px',
              marginBottom: '26px',
            }}
          >
            <span>{icon}</span>
            <span>{prettifyCategory(catSlug)}</span>
          </div>

          <div
            style={{
              color: 'white',
              fontSize: `${titleSize}px`,
              fontWeight: 900,
              lineHeight: 1.12,
              letterSpacing: '-1.5px',
              display: 'flex',
              textShadow: '0 4px 24px rgba(0,0,0,0.85)',
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              marginTop: '34px',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '5px',
                background: '#cc0000',
                borderRadius: '3px',
                display: 'flex',
              }}
            />
            <div
              style={{
                color: 'rgba(255,255,255,0.92)',
                fontSize: '26px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                display: 'flex',
              }}
            >
              starscoopdaily.site
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: W,
      height: H,
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Content-Disposition': `inline; filename="pin-${slug}.png"`,
      },
    }
  );
}
