'use client';

import { useState } from 'react';

/**
 * Visual image picker. Search a person, film or show, see actual thumbnails,
 * click to copy the URL.
 *
 * Replaces the old workflow of opening /api/tmdb in a browser tab and reading
 * raw JSON to find image paths — which was the fiddliest part of writing an
 * article without tooling, and the easiest place to paste a broken URL.
 *
 * Hero URLs come back at w1280 (landscape) and portraits at w500 (2:3), which
 * is what the article schema and the Pinterest generator both expect.
 */

const TYPES = [
  { id: 'person', label: '👤 Person' },
  { id: 'movie', label: '🎬 Movie' },
  { id: 'tv', label: '📺 TV Show' },
];

function CopyRow({ label, url, hint }) {
  const [copied, setCopied] = useState(false);
  if (!url) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked — user can select the text below */ }
  };
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0">
      <div className="w-32 shrink-0">
        <p className="text-xs font-bold text-gray-700">{label}</p>
        {hint && <p className="text-[10px] text-gray-400">{hint}</p>}
      </div>
      <input
        readOnly
        value={url}
        onFocus={(e) => e.target.select()}
        className="flex-1 text-[11px] font-mono px-2 py-1 bg-gray-50 border border-gray-200 rounded truncate"
      />
      <button
        onClick={copy}
        className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded ${copied ? 'bg-green-600 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}

export default function ImagePicker() {
  const [type, setType] = useState('person');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [details, setDetails] = useState(null);
  const [error, setError] = useState('');
  const [copiedAll, setCopiedAll] = useState(false);

  const search = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setError(''); setResults([]); setDetails(null);
    try {
      const res = await fetch(`/api/tmdb?query=${encodeURIComponent(query)}&type=${type}`);
      const data = await res.json();
      const list = data.people || data.movies || data.shows || [];
      setResults(list);
      if (data.details) setDetails(data.details);
      if (!list.length && !data.details) setError('Nothing found. Try a different spelling, or the original title.');
    } catch (err) {
      setError('Search failed — ' + err.message);
    }
    setLoading(false);
  };

  // TMDB list thumbs come back at w185; swap the size segment for the one we want.
  const resize = (url, size) => (url ? url.replace(/\/w\d+\//, `/${size}/`) : '');

  const heroUrl = details ? resize(details.backdrop || details.profilePhoto, 'w1280') : '';
  const portraitUrl = details ? resize(details.poster || details.profilePhoto, 'w500') : '';
  const extraPhotos = (details?.photos || []).slice(1).map((p) => resize(p, 'w500'));

  return (
    <div>
      <h2 className="text-xl font-black text-gray-900 mb-1">Find Images</h2>
      <p className="text-gray-500 text-sm mb-4">
        Search, look at the picture, click Copy. Hero URLs are landscape, portraits are 2:3 for the first
        inline image.
      </p>

      <div className="flex flex-wrap gap-2 mb-3">
        {TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm border ${type === t.id ? 'bg-[#cc0000] text-white border-[#cc0000]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#cc0000]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={search} className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={type === 'person' ? 'e.g. Zendaya' : 'e.g. Dune: Part Two'}
          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
        />
        <button type="submit" className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-6 py-2.5 rounded-lg text-sm">
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {results.length > 1 && (
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
            Other matches — click if the one below is wrong
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {results.slice(0, 8).map((r, i) => (
              <button
                key={i}
                onClick={() => { setQuery(r.title || r.name); setTimeout(() => search(), 0); }}
                className="shrink-0 w-24 text-left group"
                title={r.title || r.name}
              >
                <div className="h-32 w-24 rounded-lg bg-gray-100 overflow-hidden">
                  {(r.poster || r.photo) && (
                    <img src={r.poster || r.photo} alt={r.title || r.name} className="w-full h-full object-cover group-hover:opacity-80" />
                  )}
                </div>
                <p className="text-[10px] mt-1 leading-tight text-gray-600 line-clamp-2">{r.title || r.name}</p>
                {r.year && <p className="text-[10px] text-gray-400">{r.year}</p>}
              </button>
            ))}
          </div>
        </div>
      )}

      {details && (
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <p className="font-black text-gray-900">{details.title || details.name}</p>
            <button
              onClick={async () => {
                const block = [
                  `Hero image (landscape): ${heroUrl}`,
                  `Inline image 1 (portrait): ${portraitUrl}`,
                  ...extraPhotos.map((p, i) => `Inline image ${i + 2}: ${p}`),
                  details.tmdbId && type === 'person' ? `personTmdbId: ${details.tmdbId}` : '',
                ].filter(Boolean).join('\n');
                try {
                  await navigator.clipboard.writeText(block);
                  setCopiedAll(true);
                  setTimeout(() => setCopiedAll(false), 2000);
                } catch { /* clipboard blocked — rows below still copy individually */ }
              }}
              className={`shrink-0 font-bold text-sm px-4 py-2 rounded-lg ${copiedAll ? 'bg-green-600 text-white' : 'bg-[#cc0000] hover:bg-[#aa0000] text-white'}`}
            >
              {copiedAll ? '✓ Copied all' : '📋 Copy all for prompt'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-3">
            One click copies every image line ready to paste into the Claude prompt.
          </p>

          <div className="flex gap-3 mb-4">
            {heroUrl && (
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Hero (landscape)</p>
                <img src={heroUrl} alt="hero preview" className="w-full rounded-lg border border-gray-100" />
              </div>
            )}
            {portraitUrl && (
              <div className="w-32 shrink-0">
                <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1">Portrait</p>
                <img src={portraitUrl} alt="portrait preview" className="w-full rounded-lg border border-gray-100" />
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg">
            <CopyRow label="Hero image" hint="article &quot;image&quot;" url={heroUrl} />
            <CopyRow label="Inline 1" hint="must be portrait" url={portraitUrl} />
            {extraPhotos.map((p, i) => (
              <CopyRow key={i} label={`Inline ${i + 2}`} url={p} />
            ))}
          </div>

          {details.tmdbId && type === 'person' && (
            <p className="text-[11px] text-gray-400 mt-3">
              personTmdbId: <span className="font-mono">{details.tmdbId}</span> — add this to the JSON for person articles.
            </p>
          )}

          {details.streamingPlatforms?.length > 0 && (
            <p className="text-[11px] text-gray-500 mt-2">
              <span className="font-bold">Streaming (US):</span> {details.streamingPlatforms.join(', ')}
            </p>
          )}

          <p className="text-[11px] text-amber-600 mt-3">
            If a preview above is blank, that image is broken — do not use it.
          </p>
        </div>
      )}
    </div>
  );
}
