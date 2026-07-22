import { NextResponse } from 'next/server';

const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p';

function formatRuntime(min) {
  if (!min) return '';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function toFive(n) {
  return Math.round((n / 2) * 10) / 10;
}

function getProviders(d, country) {
  const wp = d['watch/providers']?.results;
  const reg = wp?.[country] || wp?.['US'] || {};
  return [...new Set([
    ...(reg.flatrate || []).map((p) => p.provider_name),
    ...(reg.rent || []).map((p) => p.provider_name),
    ...(reg.buy || []).map((p) => p.provider_name),
  ])];
}

async function handleMovie(apiKey, query, id, country) {
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
      tmdbRating: m.vote_average ? toFive(m.vote_average) : null,
    }));
    if (!movieId && movies.length > 0) movieId = movies[0].id;
  }

  if (!movieId) return { movies, details: null };

  const r = await fetch(
    `${BASE}/movie/${movieId}?api_key=${apiKey}&append_to_response=credits,watch%2Fproviders,images`,
    { next: { revalidate: 3600 } }
  );
  const d = await r.json();

  // Extra backdrops for inline article images (skip duplicates of main backdrop)
  const extraBackdrops = (d.images?.backdrops || [])
    .filter((b) => b.file_path !== d.backdrop_path)
    .slice(0, 2)
    .map((b) => `${IMG}/w1280${b.file_path}`);

  // OMDb — IMDB rating, Rotten Tomatoes %, Metacritic (optional, graceful if key missing)
  let imdbRating = null, rtScore = null, metacritic = null, omdbPoster = null;
  const omdbKey = process.env.OMDB_API_KEY;
  if (omdbKey && (d.imdb_id || d.title)) {
    try {
      // Prefer IMDB ID (exact match) over title search
      const omdbQ = d.imdb_id
        ? `i=${d.imdb_id}`
        : `t=${encodeURIComponent(d.title)}&y=${d.release_date?.slice(0, 4) || ''}`;
      const or = await fetch(
        `https://www.omdbapi.com/?${omdbQ}&plot=short&apikey=${omdbKey}`,
        { next: { revalidate: 3600 } }
      );
      const od = await or.json();
      if (od.Response === 'True') {
        if (od.imdbRating && od.imdbRating !== 'N/A') imdbRating = od.imdbRating;
        if (od.Poster && od.Poster !== 'N/A') omdbPoster = od.Poster;
        for (const rating of (od.Ratings || [])) {
          if (rating.Source === 'Rotten Tomatoes') rtScore = rating.Value;
          if (rating.Source === 'Metacritic') metacritic = rating.Value;
        }
      }
    } catch {}
  }

  return {
    movies,
    details: {
      tmdbId: d.id,
      title: d.title,
      tagline: d.tagline || '',
      overview: d.overview || '',
      director: (d.credits?.crew || []).filter((c) => c.job === 'Director').map((c) => c.name).join(', '),
      runtime: formatRuntime(d.runtime),
      releaseYear: d.release_date?.slice(0, 4) || '',
      genre: (d.genres || []).map((g) => g.name),
      cast: (d.credits?.cast || []).slice(0, 8).map((c) => c.name),
      poster: d.poster_path ? `${IMG}/w500${d.poster_path}` : null,
      backdrop: d.backdrop_path ? `${IMG}/w1280${d.backdrop_path}` : null,
      extraBackdrops,
      tmdbRating: d.vote_average ? toFive(d.vote_average) : null,
      tmdbVotes: d.vote_count || 0,
      streamingPlatforms: getProviders(d, country),
      imdbRating,
      rtScore,
      metacritic,
      omdbPoster,
    },
  };
}

async function handleTV(apiKey, query, id, country) {
  let showId = id;
  let shows = [];

  if (query) {
    const r = await fetch(
      `${BASE}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`,
      { next: { revalidate: 3600 } }
    );
    const data = await r.json();
    shows = (data.results || []).slice(0, 6).map((s) => ({
      id: s.id,
      title: s.name,
      year: s.first_air_date?.slice(0, 4) || '',
      poster: s.poster_path ? `${IMG}/w185${s.poster_path}` : null,
      overview: (s.overview || '').slice(0, 140),
      tmdbRating: s.vote_average ? toFive(s.vote_average) : null,
    }));
    if (!showId && shows.length > 0) showId = shows[0].id;
  }

  if (!showId) return { shows, details: null };

  const r = await fetch(
    `${BASE}/tv/${showId}?api_key=${apiKey}&append_to_response=credits,watch%2Fproviders`,
    { next: { revalidate: 3600 } }
  );
  const d = await r.json();

  return {
    shows,
    details: {
      tmdbId: d.id,
      title: d.name,
      tagline: d.tagline || '',
      overview: d.overview || '',
      creators: (d.created_by || []).map((c) => c.name),
      cast: (d.credits?.cast || []).slice(0, 8).map((c) => c.name),
      networkName: (d.networks || []).map((n) => n.name).join(', '),
      seasonCount: d.number_of_seasons || 0,
      episodeCount: d.number_of_episodes || 0,
      status: d.status || '',
      firstAirYear: d.first_air_date?.slice(0, 4) || '',
      lastAirYear: d.last_air_date?.slice(0, 4) || '',
      genre: (d.genres || []).map((g) => g.name),
      poster: d.poster_path ? `${IMG}/w500${d.poster_path}` : null,
      backdrop: d.backdrop_path ? `${IMG}/w1280${d.backdrop_path}` : null,
      tmdbRating: d.vote_average ? toFive(d.vote_average) : null,
      tmdbVotes: d.vote_count || 0,
      streamingPlatforms: getProviders(d, country),
    },
  };
}

async function handlePerson(apiKey, query, id) {
  let personId = id;
  let people = [];

  if (query) {
    const r = await fetch(
      `${BASE}/search/person?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`,
      { next: { revalidate: 3600 } }
    );
    const data = await r.json();
    people = (data.results || []).slice(0, 6).map((p) => ({
      id: p.id,
      name: p.name,
      department: p.known_for_department || '',
      photo: p.profile_path ? `${IMG}/w185${p.profile_path}` : null,
      topWork: p.known_for?.[0]?.title || p.known_for?.[0]?.name || '',
    }));
    if (!personId && people.length > 0) personId = people[0].id;
  }

  if (!personId) return { people, details: null };

  const r = await fetch(
    `${BASE}/person/${personId}?api_key=${apiKey}&append_to_response=combined_credits,images`,
    { next: { revalidate: 3600 } }
  );
  const d = await r.json();

  const knownFor = (d.combined_credits?.cast || [])
    .filter((w) => w.poster_path)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 5)
    .map((w) => ({
      id: w.id,
      title: w.title || w.name,
      year: (w.release_date || w.first_air_date || '').slice(0, 4),
      poster: `${IMG}/w185${w.poster_path}`,
      type: w.media_type,
    }));

  // Wikipedia — higher-res celebrity photo + bio supplement
  let wikiPhoto = null, wikiExtract = '';
  try {
    const wn = encodeURIComponent((d.name || '').replace(/ /g, '_'));
    const wr = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${wn}`,
      { next: { revalidate: 3600 } }
    );
    if (wr.ok) {
      const wd = await wr.json();
      if (wd.thumbnail?.source) wikiPhoto = wd.thumbnail.source;
      if (wd.extract) wikiExtract = wd.extract.slice(0, 400);
    }
  } catch {}

  return {
    people,
    details: {
      tmdbId: d.id,
      name: d.name,
      biography: d.biography || wikiExtract || '',
      birthday: d.birthday || '',
      deathday: d.deathday || '',
      birthplace: d.place_of_birth || '',
      department: d.known_for_department || '',
      alsoKnownAs: (d.also_known_as || []).slice(0, 3),
      profilePhoto: d.profile_path ? `${IMG}/w500${d.profile_path}` : null,
      wikiPhoto,
      photos: (d.images?.profiles || []).slice(0, 3).map((i) => `${IMG}/w500${i.file_path}`),
      knownFor,
    },
  };
}

export async function GET(request) {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'TMDB_API_KEY not set on server' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const id = searchParams.get('id');
  const type = searchParams.get('type') || 'movie';
  const country = searchParams.get('country') || 'US';

  if (!query && !id) {
    return NextResponse.json({ error: 'Provide ?query= or ?id=' }, { status: 400 });
  }

  try {
    if (type === 'tv') return NextResponse.json(await handleTV(apiKey, query, id, country));
    if (type === 'person') return NextResponse.json(await handlePerson(apiKey, query, id));
    return NextResponse.json(await handleMovie(apiKey, query, id, country));
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
