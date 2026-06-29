import { NextResponse } from 'next/server';

const PEXELS_API = 'https://api.pexels.com/v1/search';
const DEFAULT_KEY = process.env.PEXELS_API_KEY || 'PVAMj2LIMVlTlUwJSw4L9BzDbqNM4g1jhzGbMnxAZwrYEvTYS';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query') || 'celebrity entertainment';
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '6'), 15);

    const res = await fetch(
      `${PEXELS_API}?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,
      {
        headers: { Authorization: DEFAULT_KEY },
        next: { revalidate: 300 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({ error: 'Pexels API error' }, { status: res.status });
    }

    const data = await res.json();
    const photos = (data.photos || []).map((p) => ({
      id: p.id,
      url: p.src.large2x || p.src.large,
      thumb: p.src.medium,
      alt: p.alt || query,
      photographer: p.photographer,
      pexels_url: p.url,
    }));

    return NextResponse.json({ photos, total: data.total_results });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
