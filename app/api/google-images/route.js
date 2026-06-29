import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;

  try {
    const response = await fetch(
      `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=6&imgSize=large&safe=active`
    );
    const data = await response.json();

    const images = data.items?.map(item => ({
      url: item.link,
      thumbnail: item.image?.thumbnailLink,
      title: item.title,
      source: item.displayLink,
    })) || [];

    return NextResponse.json({ images });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
