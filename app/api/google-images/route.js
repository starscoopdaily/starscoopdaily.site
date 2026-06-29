import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;

  console.log('Query:', query);
  console.log('API Key exists:', !!apiKey);
  console.log('CX exists:', !!cx);

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=6&imgSize=large&safe=active`;

    console.log('Fetching URL:', url);

    const response = await fetch(url);
    const data = await response.json();

    console.log('Response status:', response.status);
    console.log('Data:', JSON.stringify(data).slice(0, 500));

    if (data.error) {
      return NextResponse.json({
        error: data.error.message,
        details: data.error,
      }, { status: 400 });
    }

    const images = data.items?.map(item => ({
      url: item.link,
      thumbnail: item.image?.thumbnailLink,
      title: item.title,
      source: item.displayLink,
    })) || [];

    return NextResponse.json({ images });
  } catch (error) {
    console.log('Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
