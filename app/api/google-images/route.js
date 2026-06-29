import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images&format=json`,
      { headers: { 'User-Agent': 'StarScoopDaily/1.0' } }
    );
    const data = await response.json();

    const images = (data.Results || []).slice(0, 6).map(item => ({
      url: item.FirstURL,
      thumbnail: item.Icon?.URL || item.FirstURL,
      title: item.Text,
      source: 'DuckDuckGo',
    }));

    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
