import { NextResponse } from 'next/server';

const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';

function formatRuntime(minutes) {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function toFiveScale(voteAverage) {
  return Math.round((voteAverage / 2) * 10) / 10;
}

export async function GET(request) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'TMDB_API_KEY not set on server' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const id = searchParams.get('id');
  const country = searchParams.get('country') || 'US';

  if (!query && !id) {
    return NextResponse.json({ error: 'Provide ?query= or ?id=' }, { status: 400 });
  }

  try {
    let movieId = id;
    let movies = [];

    if (query) {
      const r = await fetch(
        `${BASE}/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`,
        { next: { revalidate: 3600 } }
      );
      const data = await r.json();
      movies = (data.results || []).slice(0, 6).map((m) => ({
        id: m.id,
        title: m.title,
        year: m.release_date?.slice(0, 4) || '',
        poster: m.poster_path ? `${IMG}/w185${m.poster_path}` : null,
        overview: (m.overview || '').slice(0, 140),
        tmdbRating: m.vote_average ? toFiveScale(m.vote_average) : null,
      }));
      if (!movieId && movies.length > 0) movieId = movies[0].id;
    }

    if (!movieId) {
      return NextResponse.json({ movies, details: null });
    }

    const r = await fetch(
      `${BASE}/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,watch%2Fproviders`,
      { next: { revalidate: 3600 } }
    );
    const d = await r.json();

    const director = (d.credits?.crew || [])
      .filter((c) => c.job === 'Director')
      .map((c) => c.name)
      .join(', ');

    const cast = (d.credits?.cast || []).slice(0, 8).map((c) => c.name);

    const wp = d['watch/providers']?.results;
    const regionProviders = wp?.[country] || wp?.['US'] || {};
    const flatrate = (regionProviders.flatrate || []).map((p) => p.provider_name);
    const rent = (regionProviders.rent || []).map((p) => p.provider_name);
    const buy = (regionProviders.buy || []).map((p) => p.provider_name);
    const streamingPlatforms = [...new Set([...flatrate, ...rent, ...buy])];

    const details = {
      tmdbId: d.id,
      title: d.title,
      tagline: d.tagline || '',
      overview: d.overview || '',
      director,
      runtime: formatRuntime(d.runtime),
      releaseYear: d.release_date?.slice(0, 4) || '',
      genre: (d.genres || []).map((g) => g.name),
      cast,
      poster: d.poster_path ? `${IMG}/w500${d.poster_path}` : null,
      backdrop: d.backdrop_path ? `${IMG}/w1280${d.backdrop_path}` : null,
      tmdbRating: d.vote_average ? toFiveScale(d.vote_average) : null,
      tmdbVotes: d.vote_count || 0,
      streamingPlatforms,
    };

    return NextResponse.json({ movies, details });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
