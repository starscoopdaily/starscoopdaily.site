'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const ADMIN_PASSWORD = 'StarScoop@2026';
const CATEGORIES = ['Celebrity', 'Hollywood', 'British Royals', 'Bollywood', 'TV Shows', 'Web Series', 'Music', 'Movies', 'Ending Explained', 'Where to Watch', 'Relationships', 'Fashion', 'Pop Culture'];
const LAUNCH_DATE = new Date('2026-06-23');

// ─── Utility ────────────────────────────────────────────────────
function toSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function daysSinceLaunch() {
  const diff = new Date() - LAUNCH_DATE;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function extractQueryFromTopic(topic, type) {
  if (!topic) return '';
  let s = topic.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').trim();
  // Strip leading label like "Box Office: " or "Review: "
  const stripped = s.replace(/^[A-Za-z][a-z\s]{1,18}:\s*/, '').trim();
  // Quoted text is almost always the title (for movies/TV)
  if (type !== 'person') {
    const q = (stripped || s).match(/['"]([^'"]{2,50})['"]/);
    if (q) return q[1].trim();
  }
  // Person: grab first 2–3 consecutive Title-Case words from the original topic
  if (type === 'person') {
    const words = s.split(/\s+/);
    const name = [];
    for (const w of words) {
      if (/^[A-Z][a-z]/.test(w)) name.push(w.replace(/[^a-zA-Z'.-]/g, ''));
      else if (name.length > 0) break;
    }
    if (name.length >= 1) return name.slice(0, 3).join(' ');
  }
  // Fallback: first 4 words of stripped or original
  return (stripped || s).split(/\s+/).slice(0, 4).join(' ');
}

// ─── Tab 1: News Fetcher ────────────────────────────────────────
function NewsFetcher({ onUseTopic }) {
  const [headlines, setHeadlines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchNews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/news-rss');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setHeadlines(data.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-black text-gray-900">News Fetcher</h2>
          <p className="text-gray-500 text-sm">TMZ · Page Six · Daily Mail · E! · People · RadarOnline · Bollywood — sorted by scandal score 🔥</p>
        </div>
        <button
          onClick={fetchNews}
          disabled={loading}
          className="bg-[#cc0000] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#aa0000] transition-colors disabled:opacity-60 flex items-center gap-2"
        >
          {loading ? (
            <><span className="animate-spin">⟳</span> Fetching...</>
          ) : (
            <><span>📡</span> Fetch Headlines</>
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {headlines.length === 0 && !loading && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📰</div>
          <p className="font-medium">Click "Fetch Headlines" to load today&apos;s hottest celebrity gossip &amp; scandals</p>
        </div>
      )}

      <div className="space-y-2">
        {headlines.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-[#cc0000] transition-colors group"
          >
            <span className="flex-shrink-0 w-6 h-6 bg-gray-100 group-hover:bg-red-50 rounded text-center text-xs font-bold text-gray-400 group-hover:text-[#cc0000] flex items-center justify-center">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 leading-snug">{item.title}</p>
              {item.source && <p className="text-xs text-gray-400 mt-0.5">{item.source}</p>}
            </div>
            <button
              onClick={() => onUseTopic(item.title)}
              className="flex-shrink-0 bg-[#cc0000] text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-[#aa0000] transition-colors whitespace-nowrap"
            >
              Use This Topic
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SEO Score Calculator ────────────────────────────────────────
function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countWords(html) {
  return stripHtml(html).split(/\s+/).filter(Boolean).length;
}

function countH2s(html) {
  return (html || '').match(/<h2/gi)?.length || 0;
}

function countInternalLinks(html) {
  return (html || '').match(/href="\/category\//gi)?.length || 0 +
    ((html || '').match(/href="\/article\//gi)?.length || 0);
}

function keywordInOpening(html, title) {
  const firstWords = stripHtml(html).split(/\s+/).slice(0, 30).join(' ').toLowerCase();
  const mainWord = (title || '').split(/\s+/).find(w => w.length > 4)?.toLowerCase() || '';
  return mainWord && firstWords.includes(mainWord);
}

function calcSEOScore(article, listItems, listIntro, listConclusion, subType) {
  const checks = [];

  // Title length (ideal 60-80 chars)
  const titleLen = (article.title || '').length;
  const titleScore = titleLen >= 60 && titleLen <= 80 ? 15 : titleLen >= 50 && titleLen <= 100 ? 10 : titleLen > 0 ? 5 : 0;
  checks.push({ label: 'Title length', value: `${titleLen} chars`, score: titleScore, max: 15, status: titleScore === 15 ? 'good' : titleScore >= 10 ? 'warn' : 'bad', tip: 'Ideal: 60–80 characters' });

  // Meta description (ideal 150-160 chars)
  const metaLen = (article.metaDescription || '').length;
  const metaScore = metaLen >= 150 && metaLen <= 160 ? 15 : metaLen >= 130 && metaLen <= 170 ? 10 : metaLen > 0 ? 5 : 0;
  checks.push({ label: 'Meta description', value: `${metaLen} chars`, score: metaScore, max: 15, status: metaScore === 15 ? 'good' : metaScore >= 10 ? 'warn' : 'bad', tip: 'Ideal: 150–160 characters' });

  // Word count (ideal 1200+)
  let wordCount = 0;
  if (subType === 'list') {
    wordCount += countWords(listIntro) + countWords(listConclusion);
    listItems.forEach(item => { wordCount += countWords(item.description); });
  } else {
    wordCount = countWords(article.content);
  }
  const wordScore = wordCount >= 1200 ? 20 : wordCount >= 800 ? 14 : wordCount >= 500 ? 8 : wordCount > 0 ? 4 : 0;
  checks.push({ label: 'Word count', value: `${wordCount.toLocaleString()} words`, score: wordScore, max: 20, status: wordScore === 20 ? 'good' : wordScore >= 14 ? 'warn' : 'bad', tip: 'Ideal: 1200+ words' });

  // H2 headings (ideal 4+)
  const h2Count = subType === 'list' ? listItems.length : countH2s(article.content);
  const h2Score = h2Count >= 4 ? 15 : h2Count >= 2 ? 10 : h2Count >= 1 ? 5 : 0;
  checks.push({ label: subType === 'list' ? 'List items' : 'H2 headings', value: `${h2Count}`, score: h2Score, max: 15, status: h2Score === 15 ? 'good' : h2Score >= 10 ? 'warn' : 'bad', tip: 'Ideal: 4+ headings/items' });

  // Tags (ideal 5)
  const tagCount = article.tags?.length || 0;
  const tagScore = tagCount >= 5 ? 10 : tagCount >= 3 ? 7 : tagCount >= 1 ? 4 : 0;
  checks.push({ label: 'Tags', value: `${tagCount} tags`, score: tagScore, max: 10, status: tagScore === 10 ? 'good' : tagScore >= 7 ? 'warn' : 'bad', tip: 'Ideal: 5 tags' });

  // Slug
  const slugOk = /^[a-z0-9-]+$/.test(article.slug || '');
  checks.push({ label: 'URL slug', value: article.slug || '—', score: slugOk ? 10 : 0, max: 10, status: slugOk ? 'good' : 'bad', tip: 'Must be lowercase with hyphens only' });

  // Image alt text (not empty, not equal to title)
  const altOk = article.imageAlt && article.imageAlt !== article.title && article.imageAlt.length > 5;
  checks.push({ label: 'Image alt text', value: altOk ? 'Descriptive ✓' : 'Missing or is title', score: altOk ? 10 : 0, max: 10, status: altOk ? 'good' : 'bad', tip: 'Should describe image content, not repeat title' });

  // Excerpt
  const excerptLen = (article.excerpt || '').length;
  const excerptOk = excerptLen > 50 && excerptLen <= 300;
  checks.push({ label: 'Excerpt', value: `${excerptLen} chars`, score: excerptOk ? 5 : excerptLen > 0 ? 3 : 0, max: 5, status: excerptOk ? 'good' : 'warn', tip: 'Keep under 300 characters for best preview' });

  // Internal links (ideal 1-2 links to /category/ pages)
  const fullContent = subType === 'list' ? (listIntro + listConclusion + listItems.map(i => i.description).join('')) : (article.content || '');
  const internalLinks = countInternalLinks(fullContent);
  const linkScore = internalLinks >= 1 ? 10 : 0;
  checks.push({ label: 'Internal links', value: internalLinks === 0 ? 'None found' : `${internalLinks} link${internalLinks > 1 ? 's' : ''} to /category/`, score: linkScore, max: 10, status: internalLinks >= 1 ? 'good' : 'bad', tip: 'Add 1-2 links to relevant /category/ pages' });

  // Keyword in opening (first ~150 words)
  const kwOk = keywordInOpening(fullContent, article.title);
  checks.push({ label: 'Keyword in opening', value: kwOk ? 'Found in first 150 words ✓' : 'Not in opening paragraph', score: kwOk ? 5 : 0, max: 5, status: kwOk ? 'good' : 'bad', tip: 'Main keyword must appear in first 150 words' });

  const total = checks.reduce((s, c) => s + c.score, 0);
  const maxTotal = checks.reduce((s, c) => s + c.max, 0);
  return { checks, total, maxTotal, wordCount, readingTime: Math.ceil(wordCount / 200) };
}

function SEOScorePanel({ article, listItems, listIntro, listConclusion, subType }) {
  if (!article) return null;
  const { checks, total, maxTotal, wordCount, readingTime } = calcSEOScore(article, listItems, listIntro, listConclusion, subType);
  const pct = Math.round((total / maxTotal) * 100);
  const color = pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626';
  const label = pct >= 80 ? 'Good' : pct >= 60 ? 'Needs Work' : 'Poor';

  return (
    <div className="mt-6 bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black" style={{ color }}>📊 SEO Score</span>
          <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: color + '20', color }}>{label}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>📝 {wordCount.toLocaleString()} words</span>
          <span>⏱ {readingTime} min read</span>
        </div>
      </div>

      {/* Score bar */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-end gap-3 mb-2">
          <span className="text-4xl font-black leading-none" style={{ color }}>{total}</span>
          <span className="text-gray-400 text-sm mb-1">/ {maxTotal}</span>
          <div className="flex-1 ml-2">
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        </div>
      </div>

      {/* Checks */}
      <div className="px-5 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {checks.map((c, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5">
            <span className="text-base flex-shrink-0">
              {c.status === 'good' ? '✅' : c.status === 'warn' ? '⚠️' : '❌'}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-700">{c.label}</span>
                <span className="text-xs font-bold" style={{ color: c.status === 'good' ? '#16a34a' : c.status === 'warn' ? '#d97706' : '#dc2626' }}>
                  {c.score}/{c.max}
                </span>
              </div>
              <div className="text-[11px] text-gray-400 truncate">{c.value} · {c.tip}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tab 2: Article Generator ────────────────────────────────────
function ArticleGenerator({ initialTopic = '', editArticle = null }) {
  const [topic, setTopic] = useState(initialTopic);
  const [category, setCategory] = useState('Celebrity');
  const [mode, setMode] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [article, setArticle] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [imageMode, setImageMode] = useState('pexels');
  const [imageQuery, setImageQuery] = useState('');
  const [pexelsImages, setPexelsImages] = useState([]);
  const [pexelsLoading, setPexelsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [inlineImage1Mode, setInlineImage1Mode] = useState('pexels');
  const [inlineImage1Query, setInlineImage1Query] = useState('');
  const [pexelsInline1, setPexelsInline1] = useState([]);
  const [pexelsInline1Loading, setPexelsInline1Loading] = useState(false);
  const [selectedInlineImage1, setSelectedInlineImage1] = useState(null);
  const [manualInlineImage1Url, setManualInlineImage1Url] = useState('');
  const [inlineImage2Mode, setInlineImage2Mode] = useState('pexels');
  const [inlineImage2Query, setInlineImage2Query] = useState('');
  const [pexelsInline2, setPexelsInline2] = useState([]);
  const [pexelsInline2Loading, setPexelsInline2Loading] = useState(false);
  const [selectedInlineImage2, setSelectedInlineImage2] = useState(null);
  const [manualInlineImage2Url, setManualInlineImage2Url] = useState('');
  const [preview, setPreview] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [heroUploadUrl, setHeroUploadUrl] = useState('');
  const [inline1UploadUrl, setInline1UploadUrl] = useState('');
  const [inline2UploadUrl, setInline2UploadUrl] = useState('');
  const [articleSubType, setArticleSubType] = useState('standard');
  const [listItemCount, setListItemCount] = useState(10);
  const [listItems, setListItems] = useState([]);
  const [listIntro, setListIntro] = useState('');
  const [listConclusion, setListConclusion] = useState('');
  const [todayTopics, setTodayTopics] = useState([]);
  const [topicsLoading, setTopicsLoading] = useState(false);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbError, setTmdbError] = useState('');
  const [tmdbResults, setTmdbResults] = useState([]);
  const [tmdbDetails, setTmdbDetails] = useState(null);
  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tvLoading, setTvLoading] = useState(false);
  const [tvError, setTvError] = useState('');
  const [tvResults, setTvResults] = useState([]);
  const [tvDetails, setTvDetails] = useState(null);
  const [tvQuery, setTvQuery] = useState('');
  const [personLoading, setPersonLoading] = useState(false);
  const [personError, setPersonError] = useState('');
  const [personResults, setPersonResults] = useState([]);
  const [personDetails, setPersonDetails] = useState(null);
  const [personQuery, setPersonQuery] = useState('');

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
  }, [initialTopic]);

  useEffect(() => {
    setTopicsLoading(true);
    fetch('/api/news-rss')
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data.items)) setTodayTopics(data.items.slice(0, 15)); })
      .catch(() => {})
      .finally(() => setTopicsLoading(false));
  }, []);

  useEffect(() => {
    if (!editArticle) return;
    setIsEditing(true);
    setMode('manual');
    setArticle(editArticle);
    setTopic(editArticle.title || '');
    setCategory(editArticle.category || 'Celebrity');
    setImageQuery(editArticle.title || '');
    if (editArticle.image) {
      setImageMode('url');
      setManualImageUrl(editArticle.image);
    } else {
      setImageMode('pexels');
      setManualImageUrl('');
      setSelectedImage(null);
    }
    setSelectedInlineImage1(null);
    setManualInlineImage1Url('');
    setSelectedInlineImage2(null);
    setManualInlineImage2Url('');
    setPexelsImages([]);
    setHeroUploadUrl('');
    setInline1UploadUrl('');
    setInline2UploadUrl('');
    setListItems([]);
    setListIntro('');
    setListConclusion('');
    setArticleSubType('standard');
    setPreview(false);
    setSuccess('');
    setError('');
  }, [editArticle]);

  const applyTmdbDetails = (details) => {
    setTmdbDetails(details);
    setArticle((prev) => ({
      ...(prev || {}),
      director: details.director || prev?.director || '',
      runtime: details.runtime || prev?.runtime || '',
      releaseYear: details.releaseYear || prev?.releaseYear || '',
      genre: details.genre?.length ? details.genre : prev?.genre || [],
      cast: details.cast?.length ? details.cast : prev?.cast || [],
      streamingPlatforms: details.streamingPlatforms?.length ? details.streamingPlatforms : prev?.streamingPlatforms || [],
      tmdbId: details.tmdbId,
      tmdbRating: details.tmdbRating,
      imdbRating: details.imdbRating || prev?.imdbRating || null,
      rtScore: details.rtScore || prev?.rtScore || null,
      metacritic: details.metacritic || prev?.metacritic || null,
      excerpt: prev?.excerpt || details.tagline || '',
      metaDescription: prev?.metaDescription || (details.overview ? details.overview.slice(0, 160) : ''),
    }));
    const heroImg = details.backdrop || details.omdbPoster || details.poster;
    if (heroImg) { setManualImageUrl(heroImg); setImageMode('url'); }
    // Auto-set inline image 1 to poster (portrait) for Pinterest compatibility
    if (details.poster) { setManualInlineImage1Url(details.poster); setInlineImage1Mode('url'); }
  };

  const fetchTmdbById = async (id) => {
    setTmdbLoading(true);
    setTmdbError('');
    try {
      const r = await fetch(`/api/tmdb?id=${id}`);
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      if (data.details) applyTmdbDetails(data.details);
      setTmdbResults([]);
    } catch (e) {
      setTmdbError(e.message);
    } finally {
      setTmdbLoading(false);
    }
  };

  const fetchFromTmdb = async (overrideQuery) => {
    const q = (overrideQuery || tmdbQuery).trim();
    if (!q) return;
    if (overrideQuery) setTmdbQuery(overrideQuery);
    setTmdbLoading(true);
    setTmdbError('');
    setTmdbResults([]);
    setTmdbDetails(null);
    try {
      const r = await fetch(`/api/tmdb?query=${encodeURIComponent(q)}`);
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      setTmdbResults(data.movies || []);
      if (data.details) applyTmdbDetails(data.details);
    } catch (e) {
      setTmdbError(e.message);
    } finally {
      setTmdbLoading(false);
    }
  };

  // ── TV Show TMDB ──
  const applyTvDetails = (details) => {
    setTvDetails(details);
    setArticle((prev) => ({
      ...(prev || {}),
      showStatus: details.status || prev?.showStatus || '',
      networkName: details.networkName || prev?.networkName || '',
      seasonCount: details.seasonCount || prev?.seasonCount || '',
      episodeCount: details.episodeCount || prev?.episodeCount || '',
      firstAirYear: details.firstAirYear || prev?.firstAirYear || '',
      creators: details.creators?.length ? details.creators : prev?.creators || [],
      cast: details.cast?.length ? details.cast : prev?.cast || [],
      genre: details.genre?.length ? details.genre : prev?.genre || [],
      streamingPlatforms: details.streamingPlatforms?.length ? details.streamingPlatforms : prev?.streamingPlatforms || [],
      tvTmdbId: details.tmdbId,
      tvTmdbRating: details.tmdbRating,
      excerpt: prev?.excerpt || details.tagline || '',
      metaDescription: prev?.metaDescription || (details.overview ? details.overview.slice(0, 160) : ''),
    }));
    const heroImgTv = details.backdrop || details.poster;
    if (heroImgTv) { setManualImageUrl(heroImgTv); setImageMode('url'); }
    // Auto-set inline image 1 to poster (portrait) for Pinterest compatibility
    if (details.poster) { setManualInlineImage1Url(details.poster); setInlineImage1Mode('url'); }
  };

  const fetchTvById = async (id) => {
    setTvLoading(true);
    setTvError('');
    try {
      const r = await fetch(`/api/tmdb?type=tv&id=${id}`);
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      if (data.details) applyTvDetails(data.details);
      setTvResults([]);
    } catch (e) {
      setTvError(e.message);
    } finally {
      setTvLoading(false);
    }
  };

  const fetchFromTmdbTv = async (overrideQuery) => {
    const q = (overrideQuery || tvQuery).trim();
    if (!q) return;
    if (overrideQuery) setTvQuery(overrideQuery);
    setTvLoading(true);
    setTvError('');
    setTvResults([]);
    setTvDetails(null);
    try {
      const r = await fetch(`/api/tmdb?type=tv&query=${encodeURIComponent(q)}`);
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      setTvResults(data.shows || []);
      if (data.details) applyTvDetails(data.details);
    } catch (e) {
      setTvError(e.message);
    } finally {
      setTvLoading(false);
    }
  };

  // ── Person TMDB ──
  const applyPersonDetails = (details) => {
    setPersonDetails(details);
    setArticle((prev) => ({
      ...(prev || {}),
      personBirthday: details.birthday || prev?.personBirthday || '',
      personBirthplace: details.birthplace || prev?.personBirthplace || '',
      personBio: details.biography ? details.biography.slice(0, 500) : prev?.personBio || '',
      personProfilePhoto: details.profilePhoto || prev?.personProfilePhoto || '',
      personWikiPhoto: details.wikiPhoto || prev?.personWikiPhoto || '',
      personKnownFor: details.knownFor?.length ? details.knownFor : prev?.personKnownFor || [],
      personTmdbId: details.tmdbId,
      excerpt: prev?.excerpt || (details.biography ? details.biography.slice(0, 200) : ''),
    }));
    if (details.profilePhoto) { setManualImageUrl(details.profilePhoto); setImageMode('url'); }
    // Auto-set inline image 1 to profile photo (portrait) for Pinterest compatibility
    if (details.profilePhoto) { setManualInlineImage1Url(details.profilePhoto); setInlineImage1Mode('url'); }
  };

  const fetchPersonById = async (id) => {
    setPersonLoading(true);
    setPersonError('');
    try {
      const r = await fetch(`/api/tmdb?type=person&id=${id}`);
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      if (data.details) applyPersonDetails(data.details);
      setPersonResults([]);
    } catch (e) {
      setPersonError(e.message);
    } finally {
      setPersonLoading(false);
    }
  };

  const fetchFromTmdbPerson = async (overrideQuery) => {
    const q = (overrideQuery || personQuery).trim();
    if (!q) return;
    if (overrideQuery) setPersonQuery(overrideQuery);
    setPersonLoading(true);
    setPersonError('');
    setPersonResults([]);
    setPersonDetails(null);
    try {
      const r = await fetch(`/api/tmdb?type=person&query=${encodeURIComponent(q)}`);
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      setPersonResults(data.people || []);
      if (data.details) applyPersonDetails(data.details);
    } catch (e) {
      setPersonError(e.message);
    } finally {
      setPersonLoading(false);
    }
  };

  const generateArticle = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setArticle(null);
    setListItems([]);
    setPreview(false);
    setTmdbDetails(null); setTmdbResults([]); setTmdbQuery('');
    setTvDetails(null); setTvResults([]); setTvQuery('');
    setPersonDetails(null); setPersonResults([]); setPersonQuery('');
    setManualImageUrl(''); setSelectedImage(null); setImageMode('pexels');
    setManualInlineImage1Url(''); setInlineImage1Mode('pexels');
    setManualInlineImage2Url(''); setInlineImage2Mode('pexels');
    try {
      const groqKey = localStorage.getItem('ss_groq_key') || '';
      const body = { topic, category, apiKey: groqKey };
      if (articleSubType === 'list') { body.articleType = 'list'; body.itemCount = listItemCount; }
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const a = { ...data.article, category, author: 'StarScoop Daily Staff', date: new Date().toISOString().split('T')[0] };
      setArticle(a);
      setImageQuery(a.hero_image_query || a.title || '');
      // Auto-fetch TMDB metadata for relevant categories
      const _movieCats = ['Movies', 'Ending Explained', 'Where to Watch', 'Hollywood', 'Bollywood'];
      const _tvCats = ['TV Shows', 'Web Series'];
      const _personCats = ['Celebrity', 'Hollywood', 'Bollywood', 'British Royals'];
      if (_movieCats.includes(category)) {
        const tq = extractQueryFromTopic(topic, 'movie');
        if (tq) fetchFromTmdb(tq);
      }
      if (_tvCats.includes(category)) {
        const tq = extractQueryFromTopic(topic, 'tv');
        if (tq) fetchFromTmdbTv(tq);
      }
      if (_personCats.includes(category)) {
        const tq = extractQueryFromTopic(topic, 'person');
        if (tq) fetchFromTmdbPerson(tq);
      }
      if (articleSubType === 'list' && a.items) {
        setListItems(a.items.map((item) => ({ ...item, imageMode: 'google', imageUrl: '', uploadUrl: '' })));
        setListIntro(a.intro || '');
        setListConclusion(a.conclusion || '');
      } else {
        if (a.inline_image_queries?.[0]) setInlineImage1Query(a.inline_image_queries[0]);
        if (a.inline_image_queries?.[1]) setInlineImage2Query(a.inline_image_queries[1]);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (file, setter) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setter(e.target.result);
    reader.readAsDataURL(file);
  };

  const publishArticle = async () => {
    if (!article) return;
    const heroImage = imageMode === 'upload' ? heroUploadUrl : manualImageUrl;

    let finalArticle;
    if (articleSubType === 'list') {
      finalArticle = {
        ...article,
        articleType: 'list',
        image: heroImage || '',
        imageAlt: article.title,
        intro: listIntro,
        items: listItems.map((item) => ({
          number: item.number,
          name: item.name,
          subtitle: item.subtitle || '',
          description: item.description || '',
          image: item.imageMode === 'upload' ? item.uploadUrl : item.imageUrl,
        })),
        conclusion: listConclusion,
        content: '',
        featured: false,
      };
    } else {
      const inline1Url = inlineImage1Mode === 'upload' ? inline1UploadUrl : manualInlineImage1Url;
      const inline2Url = inlineImage2Mode === 'upload' ? inline2UploadUrl : manualInlineImage2Url;

      const makeFigure = (url, alt) =>
        `<figure><img src="${url}" alt="${alt}" style="max-width:100%;height:auto;display:block;margin:20px auto;border-radius:8px"/><figcaption style="text-align:center;color:#666;font-size:14px;">${alt}</figcaption></figure>`;

      const injectInlineImages = (html) => {
        // Strip existing inline figures first to avoid duplicates on re-publish
        const stripped = html.replace(/<figure>[\s\S]*?<\/figure>/gi, '');
        const parts = stripped.split('</h2>');
        return parts.map((part, i) => {
          let chunk = part;
          if (i < parts.length - 1) chunk += '</h2>';
          if (i === 1 && inline1Url) chunk += makeFigure(inline1Url, article.title);
          if (i === 3 && inline2Url) chunk += makeFigure(inline2Url, article.title);
          return chunk;
        }).join('');
      };

      finalArticle = {
        ...article,
        image: heroImage || '',
        imageAlt: article.title,
        content: injectInlineImages(article.content || ''),
        featured: false,
      };
    }

    setPublishing(true);
    setError('');
    setSuccess('');
    try {
      const githubToken = localStorage.getItem('ssd_gh_token');
      const githubUser = localStorage.getItem('ssd_gh_user');
      const githubRepo = localStorage.getItem('ssd_gh_repo');

      if (!githubToken || !githubUser || !githubRepo) {
        throw new Error('GitHub credentials missing. Add them in Site Controls tab.');
      }

      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article: finalArticle, githubToken, githubUser, githubRepo }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSuccess(`✅ Article ${isEditing ? 'updated' : 'published'}! Vercel will rebuild in 30-60 seconds. View at: ${data.url}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-black text-gray-900 mb-1">Article Generator</h2>
      <p className="text-gray-500 text-sm mb-4">Generate articles with AI (Groq) or write manually</p>

      {/* Today's Topic Suggestions */}
      <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-black uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            🔥 Today&apos;s Trending Topics
          </span>
          <button
            onClick={() => {
              setTopicsLoading(true);
              fetch('/api/news-rss')
                .then((r) => r.json())
                .then((data) => { if (Array.isArray(data.items)) setTodayTopics(data.items.slice(0, 15)); })
                .catch(() => {})
                .finally(() => setTopicsLoading(false));
            }}
            className="text-xs text-[#cc0000] font-semibold hover:underline flex items-center gap-1"
          >
            {topicsLoading ? <span className="animate-spin inline-block">⟳</span> : '↻'} Refresh
          </button>
        </div>
        {topicsLoading && todayTopics.length === 0 ? (
          <div className="flex gap-2 flex-wrap">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-7 w-32 rounded-full bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : todayTopics.length === 0 ? (
          <p className="text-xs text-gray-400">No topics loaded — click Refresh to fetch today&apos;s headlines.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {todayTopics.map((item, i) => (
              <button
                key={i}
                onClick={() => setTopic(item.title)}
                title={item.title}
                className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors text-left w-full ${
                  topic === item.title
                    ? 'bg-[#cc0000] text-white border-[#cc0000]'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-[#cc0000] hover:text-[#cc0000]'
                }`}
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 text-center text-[10px] font-black text-gray-400 flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="flex-1 leading-snug">{item.score > 2 ? '🔥 ' : ''}{item.title}</span>
                {item.source && (
                  <span className="flex-shrink-0 text-[10px] opacity-50 font-normal mt-0.5 ml-1">{item.source}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Article Type Toggle */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {[{ id: 'standard', label: '📝 Standard Article' }, { id: 'list', label: '🔢 List Article' }].map(({ id, label }) => (
          <button key={id} onClick={() => setArticleSubType(id)}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-colors ${articleSubType === id ? 'bg-[#cc0000] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {label}
          </button>
        ))}
        {articleSubType === 'list' && (
          <div className="flex items-center gap-2 ml-1">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Items:</label>
            <select value={listItemCount} onChange={(e) => setListItemCount(Number(e.target.value))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000] bg-white">
              {[5, 10, 15, 20].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-6">
        {['auto', 'manual'].map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${
              mode === m ? 'bg-[#cc0000] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {m === 'auto' ? '🤖 Auto (AI)' : '✍️ Manual'}
          </button>
        ))}
      </div>

      {/* Topic + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Topic / Headline</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Taylor Swift announces India tour 2026"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000] bg-white"
          >
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {mode === 'auto' ? (
        <button
          onClick={generateArticle}
          disabled={loading || !topic.trim()}
          className="bg-[#cc0000] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#aa0000] transition-colors disabled:opacity-60 flex items-center gap-2 mb-6"
        >
          {loading ? <><span className="animate-spin inline-block">⟳</span> Generating...</> : '🤖 Generate with AI'}
        </button>
      ) : (
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1.5">Article Content (HTML)</label>
          <textarea
            rows={12}
            value={article?.content || ''}
            onChange={(e) => setArticle((prev) => ({ ...(prev || { slug: toSlug(topic), title: topic, category, author: 'StarScoop Daily Staff', date: new Date().toISOString().split('T')[0] }), content: e.target.value }))}
            placeholder="<p>Write your article content here...</p>"
            className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
          />
          {!article && (
            <button
              onClick={() => setArticle({ slug: toSlug(topic), title: topic, excerpt: '', content: '', category, author: 'StarScoop Daily Staff', date: new Date().toISOString().split('T')[0], tags: [], metaDescription: '' })}
              className="mt-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              Start Writing
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-4 break-all">
          {success}
        </div>
      )}

      {/* Generated Article Edit Fields */}
      {article && (
        <div className="space-y-4 border border-gray-200 rounded-xl p-5 bg-gray-50">
          <h3 className="font-bold text-gray-800">{isEditing ? '✏️ Editing Article' : 'Edit Generated Article'}</h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Title</label>
            <input
              type="text"
              value={article.title || ''}
              onChange={(e) => setArticle((p) => ({ ...p, title: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000] bg-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Slug (URL)</label>
              <input
                type="text"
                value={article.slug || ''}
                onChange={(e) => setArticle((p) => ({ ...p, slug: toSlug(e.target.value) }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#cc0000] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Date</label>
              <input
                type="date"
                value={article.date || ''}
                onChange={(e) => setArticle((p) => ({ ...p, date: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000] bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Excerpt</label>
            <textarea
              rows={2}
              value={article.excerpt || ''}
              onChange={(e) => setArticle((p) => ({ ...p, excerpt: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Meta Description</label>
            <textarea
              rows={2}
              value={article.metaDescription || ''}
              onChange={(e) => setArticle((p) => ({ ...p, metaDescription: e.target.value }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000] bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={Array.isArray(article.tags) ? article.tags.join(', ') : ''}
              onChange={(e) => setArticle((p) => ({ ...p, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000] bg-white"
            />
          </div>

          {/* Movie Fields — shown for movie/Hollywood/Bollywood categories */}
          {['Movies', 'Ending Explained', 'Where to Watch', 'Hollywood', 'Bollywood'].includes(article.category) && (
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-black uppercase tracking-wider text-amber-700 mb-2">🎬 Movie Details</p>

              {/* TMDB Auto-fill */}
              <div className="pb-3 border-b border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <img src="/tmdb-logo.svg" alt="TMDB" className="h-3.5 w-auto opacity-80" />
                  <span className="text-xs font-bold text-amber-800">Auto-fill from TMDB</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tmdbQuery}
                    onChange={(e) => setTmdbQuery(e.target.value)}
                    placeholder={`e.g. ${topic.split(':')[0].replace(/[''']/g, '').trim() || 'Movie title...'}`}
                    className="flex-1 border border-amber-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  />
                  <button
                    onClick={fetchFromTmdb}
                    disabled={tmdbLoading}
                    className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap flex items-center gap-1.5"
                  >
                    {tmdbLoading ? <><span className="animate-spin inline-block">⟳</span> Fetching...</> : '🔍 Fetch from TMDB'}
                  </button>
                </div>
                {tmdbError && <p className="text-red-600 text-xs mt-1.5">{tmdbError}</p>}

                {/* Search results */}
                {tmdbResults.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-56 overflow-y-auto rounded-lg border border-amber-200 bg-white p-1.5">
                    <p className="text-[10px] text-amber-700 font-bold uppercase px-1 mb-1">Select the correct movie:</p>
                    {tmdbResults.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => fetchTmdbById(m.id)}
                        className="flex items-center gap-2 w-full text-left bg-amber-50 hover:bg-amber-100 border border-amber-100 hover:border-amber-300 rounded-lg px-2 py-1.5 transition-colors"
                      >
                        {m.poster
                          ? <img src={m.poster} alt={m.title} className="w-7 h-10 object-cover rounded flex-shrink-0" />
                          : <div className="w-7 h-10 bg-amber-200 rounded flex-shrink-0 flex items-center justify-center text-amber-600 text-[10px]">?</div>
                        }
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{m.title}</p>
                          <p className="text-[10px] text-gray-400">{m.year}{m.tmdbRating ? ` · ★ ${m.tmdbRating}/5` : ''}</p>
                        </div>
                        <span className="text-[10px] text-amber-700 font-bold flex-shrink-0">Use →</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Applied badge */}
                {tmdbDetails && (
                  <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    {tmdbDetails.poster && <img src={tmdbDetails.poster} alt="" className="w-6 h-9 object-cover rounded flex-shrink-0" />}
                    <div>
                      <p className="text-xs font-bold text-green-800">✓ Filled: {tmdbDetails.title} ({tmdbDetails.releaseYear})</p>
                      {tmdbDetails.tmdbRating && (
                        <p className="text-[10px] text-green-600">TMDB community: ★ {tmdbDetails.tmdbRating}/5 ({tmdbDetails.tmdbVotes?.toLocaleString()} votes)</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Our Rating (/5)</label>
                  <input
                    type="number" min="0" max="5" step="0.5"
                    value={article.movieRating || ''}
                    onChange={(e) => setArticle((p) => ({ ...p, movieRating: e.target.value ? parseFloat(e.target.value) : undefined }))}
                    placeholder="e.g. 4.5"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Director</label>
                  <input
                    type="text"
                    value={article.director || ''}
                    onChange={(e) => setArticle((p) => ({ ...p, director: e.target.value }))}
                    placeholder="e.g. Christopher Nolan"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Runtime</label>
                  <input
                    type="text"
                    value={article.runtime || ''}
                    onChange={(e) => setArticle((p) => ({ ...p, runtime: e.target.value }))}
                    placeholder="e.g. 2h 28m"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Release Year</label>
                  <input
                    type="text"
                    value={article.releaseYear || ''}
                    onChange={(e) => setArticle((p) => ({ ...p, releaseYear: e.target.value }))}
                    placeholder="e.g. 2025"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Genre</label>
                  <input
                    type="text"
                    value={Array.isArray(article.genre) ? article.genre.join(', ') : ''}
                    onChange={(e) => setArticle((p) => ({ ...p, genre: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))}
                    placeholder="Action, Thriller"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Cast</label>
                  <input
                    type="text"
                    value={Array.isArray(article.cast) ? article.cast.join(', ') : ''}
                    onChange={(e) => setArticle((p) => ({ ...p, cast: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))}
                    placeholder="Actor 1, Actor 2"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Streaming Platforms</label>
                <input
                  type="text"
                  value={Array.isArray(article.streamingPlatforms) ? article.streamingPlatforms.join(', ') : ''}
                  onChange={(e) => setArticle((p) => ({ ...p, streamingPlatforms: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))}
                  placeholder="Netflix, Amazon Prime, Disney+"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                />
              </div>
            </div>
          )}

          {/* TV Show Details */}
          {article.category === 'TV Shows' && (
            <div className="border border-sky-200 bg-sky-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-black uppercase tracking-wider text-sky-700 mb-2">📺 TV Show Details</p>

              {/* TMDB Auto-fill */}
              <div className="pb-3 border-b border-sky-200">
                <div className="flex items-center gap-2 mb-2">
                  <img src="/tmdb-logo.svg" alt="TMDB" className="h-3.5 w-auto opacity-80" />
                  <span className="text-xs font-bold text-sky-800">Auto-fill from TMDB</span>
                </div>
                <div className="flex gap-2">
                  <input type="text" value={tvQuery} onChange={(e) => setTvQuery(e.target.value)}
                    placeholder={`e.g. ${topic.split(':')[0].trim() || 'Show title...'}`} className="flex-1 border border-sky-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
                  <button onClick={fetchFromTmdbTv} disabled={tvLoading}
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap flex items-center gap-1.5">
                    {tvLoading ? <><span className="animate-spin inline-block">⟳</span> Fetching...</> : '🔍 Fetch from TMDB'}
                  </button>
                </div>
                {tvError && <p className="text-red-600 text-xs mt-1.5">{tvError}</p>}
                {tvResults.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-56 overflow-y-auto rounded-lg border border-sky-200 bg-white p-1.5">
                    <p className="text-[10px] text-sky-700 font-bold uppercase px-1 mb-1">Select the correct show:</p>
                    {tvResults.map((s) => (
                      <button key={s.id} onClick={() => fetchTvById(s.id)}
                        className="flex items-center gap-2 w-full text-left bg-sky-50 hover:bg-sky-100 border border-sky-100 hover:border-sky-300 rounded-lg px-2 py-1.5 transition-colors">
                        {s.poster
                          ? <img src={s.poster} alt={s.title} className="w-7 h-10 object-cover rounded flex-shrink-0" />
                          : <div className="w-7 h-10 bg-sky-200 rounded flex-shrink-0 flex items-center justify-center text-sky-600 text-[10px]">?</div>}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{s.title}</p>
                          <p className="text-[10px] text-gray-400">{s.year}{s.tmdbRating ? ` · ★ ${s.tmdbRating}/5` : ''}</p>
                        </div>
                        <span className="text-[10px] text-sky-700 font-bold flex-shrink-0">Use →</span>
                      </button>
                    ))}
                  </div>
                )}
                {tvDetails && (
                  <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    {tvDetails.poster && <img src={tvDetails.poster} alt="" className="w-6 h-9 object-cover rounded flex-shrink-0" />}
                    <div>
                      <p className="text-xs font-bold text-green-800">✓ Filled: {tvDetails.title}</p>
                      {tvDetails.tmdbRating && <p className="text-[10px] text-green-600">TMDB: ★ {tvDetails.tmdbRating}/5 · {tvDetails.seasonCount} seasons · {tvDetails.episodeCount} eps</p>}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Status</label>
                  <input type="text" value={article.showStatus || ''} onChange={(e) => setArticle((p) => ({ ...p, showStatus: e.target.value }))}
                    placeholder="Returning Series" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Network</label>
                  <input type="text" value={article.networkName || ''} onChange={(e) => setArticle((p) => ({ ...p, networkName: e.target.value }))}
                    placeholder="HBO, Netflix" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">First Aired</label>
                  <input type="text" value={article.firstAirYear || ''} onChange={(e) => setArticle((p) => ({ ...p, firstAirYear: e.target.value }))}
                    placeholder="2019" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Seasons</label>
                  <input type="number" value={article.seasonCount || ''} onChange={(e) => setArticle((p) => ({ ...p, seasonCount: e.target.value ? Number(e.target.value) : '' }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Episodes</label>
                  <input type="number" value={article.episodeCount || ''} onChange={(e) => setArticle((p) => ({ ...p, episodeCount: e.target.value ? Number(e.target.value) : '' }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">TMDB Rating</label>
                  <input type="number" min="0" max="5" step="0.1" value={article.tvTmdbRating || ''} onChange={(e) => setArticle((p) => ({ ...p, tvTmdbRating: e.target.value ? parseFloat(e.target.value) : '' }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Creators</label>
                <input type="text" value={Array.isArray(article.creators) ? article.creators.join(', ') : ''}
                  onChange={(e) => setArticle((p) => ({ ...p, creators: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))}
                  placeholder="Creator 1, Creator 2" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Main Cast</label>
                <input type="text" value={Array.isArray(article.cast) ? article.cast.join(', ') : ''}
                  onChange={(e) => setArticle((p) => ({ ...p, cast: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))}
                  placeholder="Actor 1, Actor 2" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Genre</label>
                <input type="text" value={Array.isArray(article.genre) ? article.genre.join(', ') : ''}
                  onChange={(e) => setArticle((p) => ({ ...p, genre: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))}
                  placeholder="Drama, Thriller" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Streaming Platforms</label>
                <input type="text" value={Array.isArray(article.streamingPlatforms) ? article.streamingPlatforms.join(', ') : ''}
                  onChange={(e) => setArticle((p) => ({ ...p, streamingPlatforms: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) }))}
                  placeholder="Netflix, HBO Max" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white" />
              </div>
            </div>
          )}

          {/* Person / Celebrity Details */}
          {['Celebrity', 'Hollywood', 'Bollywood', 'British Royals'].includes(article.category) && (
            <div className="border border-purple-200 bg-purple-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-black uppercase tracking-wider text-purple-700 mb-2">⭐ Person Details <span className="font-normal text-purple-400 normal-case tracking-normal">(optional — fill if article is about a specific person)</span></p>

              {/* TMDB Auto-fill */}
              <div className="pb-3 border-b border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <img src="/tmdb-logo.svg" alt="TMDB" className="h-3.5 w-auto opacity-80" />
                  <span className="text-xs font-bold text-purple-800">Auto-fill from TMDB</span>
                </div>
                <div className="flex gap-2">
                  <input type="text" value={personQuery} onChange={(e) => setPersonQuery(e.target.value)}
                    placeholder={`e.g. ${topic.split(':')[0].trim() || 'Person name...'}`} className="flex-1 border border-purple-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white" />
                  <button onClick={fetchFromTmdbPerson} disabled={personLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap flex items-center gap-1.5">
                    {personLoading ? <><span className="animate-spin inline-block">⟳</span> Fetching...</> : '🔍 Fetch from TMDB'}
                  </button>
                </div>
                {personError && <p className="text-red-600 text-xs mt-1.5">{personError}</p>}
                {personResults.length > 0 && (
                  <div className="mt-2 space-y-1 max-h-56 overflow-y-auto rounded-lg border border-purple-200 bg-white p-1.5">
                    <p className="text-[10px] text-purple-700 font-bold uppercase px-1 mb-1">Select the correct person:</p>
                    {personResults.map((p) => (
                      <button key={p.id} onClick={() => fetchPersonById(p.id)}
                        className="flex items-center gap-2 w-full text-left bg-purple-50 hover:bg-purple-100 border border-purple-100 hover:border-purple-300 rounded-lg px-2 py-1.5 transition-colors">
                        {p.photo
                          ? <img src={p.photo} alt={p.name} className="w-7 h-10 object-cover rounded-full flex-shrink-0" />
                          : <div className="w-7 h-7 bg-purple-200 rounded-full flex-shrink-0 flex items-center justify-center text-purple-600 text-[10px]">?</div>}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{p.name}</p>
                          <p className="text-[10px] text-gray-400">{p.department}{p.topWork ? ` · ${p.topWork}` : ''}</p>
                        </div>
                        <span className="text-[10px] text-purple-700 font-bold flex-shrink-0">Use →</span>
                      </button>
                    ))}
                  </div>
                )}
                {personDetails && (
                  <div className="mt-2 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    {personDetails.profilePhoto && <img src={personDetails.profilePhoto} alt="" className="w-6 h-9 object-cover rounded-full flex-shrink-0" />}
                    <div>
                      <p className="text-xs font-bold text-green-800">✓ Filled: {personDetails.name}</p>
                      {personDetails.birthday && <p className="text-[10px] text-green-600">Born: {personDetails.birthday}{personDetails.birthplace ? ` · ${personDetails.birthplace}` : ''}</p>}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Birthday</label>
                  <input type="text" value={article.personBirthday || ''} onChange={(e) => setArticle((p) => ({ ...p, personBirthday: e.target.value }))}
                    placeholder="1989-12-13" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Birthplace</label>
                  <input type="text" value={article.personBirthplace || ''} onChange={(e) => setArticle((p) => ({ ...p, personBirthplace: e.target.value }))}
                    placeholder="Los Angeles, CA, USA" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Bio Snippet</label>
                <textarea rows={3} value={article.personBio || ''} onChange={(e) => setArticle((p) => ({ ...p, personBio: e.target.value }))}
                  placeholder="Short biography..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">Profile Photo URL</label>
                <input type="url" value={article.personProfilePhoto || ''} onChange={(e) => setArticle((p) => ({ ...p, personProfilePhoto: e.target.value }))}
                  placeholder="https://..." className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white" />
                {article.personProfilePhoto && <img src={article.personProfilePhoto} alt="Profile" className="mt-2 h-28 w-auto object-cover rounded-lg" />}
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={article.featured || false}
                onChange={(e) => setArticle((p) => ({ ...p, featured: e.target.checked }))}
                className="w-4 h-4 accent-[#cc0000]"
              />
              <span className="text-sm font-medium text-gray-700">Set as Featured Article (Homepage Hero)</span>
            </label>
          </div>
        </div>
      )}

      {/* Image Section */}
      {article && (
        <div className="mt-6 border border-gray-200 rounded-xl p-5">
          <h3 className="font-bold text-gray-800 mb-4">Hero Image</h3>
          <div className="flex gap-2 mb-4">
            {[{ id: 'pexels', label: '🔍 Google Images' }, { id: 'url', label: '🔗 Direct URL' }, { id: 'upload', label: '📤 Upload' }].map(({ id, label }) => (
              <button key={id} onClick={() => setImageMode(id)}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors ${imageMode === id ? 'bg-[#cc0000] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {label}
              </button>
            ))}
          </div>
          {imageMode === 'pexels' && (
            <>
              <div className="flex gap-2 mb-3">
                <input type="text" value={imageQuery} onChange={(e) => setImageQuery(e.target.value)}
                  placeholder="Search photos (e.g. celebrity red carpet)"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]" />
                <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(imageQuery)}&tbm=isch`, '_blank')}
                  className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors whitespace-nowrap">
                  🔍 Search Google Images
                </button>
              </div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Paste Image URL from Google</label>
              <input type="url" value={manualImageUrl} onChange={(e) => setManualImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]" />
              {manualImageUrl && <img src={manualImageUrl} alt="Preview" className="mt-3 rounded-lg max-h-48 object-cover" />}
            </>
          )}
          {imageMode === 'url' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Image URL</label>
              <input type="url" value={manualImageUrl} onChange={(e) => setManualImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]" />
              {manualImageUrl && <img src={manualImageUrl} alt="Preview" className="mt-3 rounded-lg max-h-48 object-cover" />}
            </div>
          )}
          {imageMode === 'upload' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Upload Image</label>
              <input type="file" accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0], setHeroUploadUrl)}
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-700 cursor-pointer" />
              {heroUploadUrl && <img src={heroUploadUrl} alt="Preview" className="mt-3 rounded-lg max-h-48 object-cover" />}
            </div>
          )}
        </div>
      )}

      {/* List Items Editor */}
      {article && articleSubType === 'list' && listItems.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="font-bold text-gray-800 text-base">List Items ({listItems.length})</h3>

          <div className="border border-gray-200 rounded-xl p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Intro (HTML)</label>
            <textarea rows={3} value={listIntro} onChange={(e) => setListIntro(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#cc0000]" />
          </div>

          {listItems.map((item, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl p-5 space-y-3 bg-gray-50">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-[#cc0000] w-10 flex-shrink-0 text-center tabular-nums">
                  {String(item.number).padStart(2, '0')}
                </span>
                <input type="text" value={item.name}
                  onChange={(e) => setListItems((prev) => prev.map((it, i) => i === idx ? { ...it, name: e.target.value } : it))}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
                  placeholder="Item name" />
              </div>
              <input type="text" value={item.subtitle || ''}
                onChange={(e) => setListItems((prev) => prev.map((it, i) => i === idx ? { ...it, subtitle: e.target.value } : it))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#cc0000] bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
                placeholder="Subtitle (optional)" />
              <textarea rows={4} value={item.description || ''}
                onChange={(e) => setListItems((prev) => prev.map((it, i) => i === idx ? { ...it, description: e.target.value } : it))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
                placeholder="Description HTML" />
              <div>
                <div className="flex gap-2 mb-2">
                  {[{ id: 'google', label: '🔍 Google' }, { id: 'url', label: '🔗 URL' }, { id: 'upload', label: '📤 Upload' }].map(({ id, label }) => (
                    <button key={id} onClick={() => setListItems((prev) => prev.map((it, i) => i === idx ? { ...it, imageMode: id } : it))}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${item.imageMode === id ? 'bg-[#cc0000] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                      {label}
                    </button>
                  ))}
                </div>
                {item.imageMode === 'google' && (
                  <>
                    <div className="flex gap-2 mb-2">
                      <input type="text" value={item.image_query || item.name}
                        onChange={(e) => setListItems((prev) => prev.map((it, i) => i === idx ? { ...it, image_query: e.target.value } : it))}
                        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
                        placeholder="Image search query" />
                      <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(item.image_query || item.name)}&tbm=isch`, '_blank')}
                        className="bg-gray-900 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-gray-700 whitespace-nowrap">
                        Search →
                      </button>
                    </div>
                    <input type="url" value={item.imageUrl || ''} placeholder="Paste image URL from Google"
                      onChange={(e) => setListItems((prev) => prev.map((it, i) => i === idx ? { ...it, imageUrl: e.target.value } : it))}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]" />
                  </>
                )}
                {item.imageMode === 'url' && (
                  <input type="url" value={item.imageUrl || ''} placeholder="https://example.com/image.jpg"
                    onChange={(e) => setListItems((prev) => prev.map((it, i) => i === idx ? { ...it, imageUrl: e.target.value } : it))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-[#cc0000]" />
                )}
                {item.imageMode === 'upload' && (
                  <input type="file" accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (ev) => setListItems((prev) => prev.map((it, i) => i === idx ? { ...it, uploadUrl: ev.target.result } : it));
                      reader.readAsDataURL(file);
                    }}
                    className="block w-full text-xs text-gray-500 file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-700 cursor-pointer" />
                )}
                {((item.imageMode === 'upload' ? item.uploadUrl : item.imageUrl)) && (
                  <img src={item.imageMode === 'upload' ? item.uploadUrl : item.imageUrl} alt={item.name} className="mt-2 rounded-lg max-h-32 object-cover" />
                )}
              </div>
            </div>
          ))}

          <div className="border border-gray-200 rounded-xl p-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Conclusion (HTML)</label>
            <textarea rows={3} value={listConclusion} onChange={(e) => setListConclusion(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#cc0000]" />
          </div>
        </div>
      )}

      {/* Inline Image 1 — standard articles only */}
      {article && articleSubType === 'standard' && (
        <div className="mt-6 border border-gray-200 rounded-xl p-5">
          <h3 className="font-bold text-gray-800 mb-1">Inline Image 1 <span className="text-xs font-normal text-gray-400">(inserted after 2nd heading)</span></h3>
          <div className="flex gap-2 mb-4 mt-3">
            {[{ id: 'pexels', label: '🔍 Google Images' }, { id: 'url', label: '🔗 Direct URL' }, { id: 'upload', label: '📤 Upload' }].map(({ id, label }) => (
              <button key={id} onClick={() => setInlineImage1Mode(id)}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors ${inlineImage1Mode === id ? 'bg-[#cc0000] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {label}
              </button>
            ))}
          </div>
          {inlineImage1Mode === 'pexels' && (
            <>
              <div className="flex gap-2 mb-3">
                <input type="text" value={inlineImage1Query} onChange={(e) => setInlineImage1Query(e.target.value)}
                  placeholder="Search photos for inline image 1"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]" />
                <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(inlineImage1Query)}&tbm=isch`, '_blank')}
                  className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors whitespace-nowrap">
                  🔍 Search Google Images
                </button>
              </div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Paste Image URL from Google</label>
              <input type="url" value={manualInlineImage1Url} onChange={(e) => setManualInlineImage1Url(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]" />
              {manualInlineImage1Url && <img src={manualInlineImage1Url} alt="Preview" className="mt-3 rounded-lg max-h-48 object-cover" />}
            </>
          )}
          {inlineImage1Mode === 'url' && (
            <div>
              <input type="url" value={manualInlineImage1Url} onChange={(e) => setManualInlineImage1Url(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]" />
              {manualInlineImage1Url && <img src={manualInlineImage1Url} alt="Preview" className="mt-3 rounded-lg max-h-48 object-cover" />}
            </div>
          )}
          {inlineImage1Mode === 'upload' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Upload Image</label>
              <input type="file" accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0], setInline1UploadUrl)}
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-700 cursor-pointer" />
              {inline1UploadUrl && <img src={inline1UploadUrl} alt="Preview" className="mt-3 rounded-lg max-h-48 object-cover" />}
            </div>
          )}
        </div>
      )}

      {/* Inline Image 2 — standard articles only */}
      {article && articleSubType === 'standard' && (
        <div className="mt-6 border border-gray-200 rounded-xl p-5">
          <h3 className="font-bold text-gray-800 mb-1">Inline Image 2 <span className="text-xs font-normal text-gray-400">(inserted after 4th heading)</span></h3>
          <div className="flex gap-2 mb-4 mt-3">
            {[{ id: 'pexels', label: '🔍 Google Images' }, { id: 'url', label: '🔗 Direct URL' }, { id: 'upload', label: '📤 Upload' }].map(({ id, label }) => (
              <button key={id} onClick={() => setInlineImage2Mode(id)}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors ${inlineImage2Mode === id ? 'bg-[#cc0000] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {label}
              </button>
            ))}
          </div>
          {inlineImage2Mode === 'pexels' && (
            <>
              <div className="flex gap-2 mb-3">
                <input type="text" value={inlineImage2Query} onChange={(e) => setInlineImage2Query(e.target.value)}
                  placeholder="Search photos for inline image 2"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]" />
                <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(inlineImage2Query)}&tbm=isch`, '_blank')}
                  className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors whitespace-nowrap">
                  🔍 Search Google Images
                </button>
              </div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Paste Image URL from Google</label>
              <input type="url" value={manualInlineImage2Url} onChange={(e) => setManualInlineImage2Url(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]" />
              {manualInlineImage2Url && <img src={manualInlineImage2Url} alt="Preview" className="mt-3 rounded-lg max-h-48 object-cover" />}
            </>
          )}
          {inlineImage2Mode === 'url' && (
            <div>
              <input type="url" value={manualInlineImage2Url} onChange={(e) => setManualInlineImage2Url(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]" />
              {manualInlineImage2Url && <img src={manualInlineImage2Url} alt="Preview" className="mt-3 rounded-lg max-h-48 object-cover" />}
            </div>
          )}
          {inlineImage2Mode === 'upload' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Upload Image</label>
              <input type="file" accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0], setInline2UploadUrl)}
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-900 file:text-white hover:file:bg-gray-700 cursor-pointer" />
              {inline2UploadUrl && <img src={inline2UploadUrl} alt="Preview" className="mt-3 rounded-lg max-h-48 object-cover" />}
            </div>
          )}
        </div>
      )}

      {/* SEO Score Panel */}
      <SEOScorePanel
        article={article}
        listItems={listItems}
        listIntro={listIntro}
        listConclusion={listConclusion}
        subType={articleSubType}
      />

      {/* Preview + Publish */}
      {article && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => setPreview(!preview)}
            className="bg-gray-100 text-gray-700 px-5 py-3 rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors"
          >
            {preview ? 'Hide Preview' : '👁️ Preview Article'}
          </button>
          <button
            onClick={publishArticle}
            disabled={publishing}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {publishing ? <><span className="animate-spin">⟳</span> {isEditing ? 'Updating...' : 'Publishing...'}</> : isEditing ? '✏️ Update Article' : '🚀 Publish Article'}
          </button>
        </div>
      )}

      {/* Preview */}
      {preview && article && (
        <div className="mt-6 border-2 border-[#cc0000] rounded-xl p-6 bg-white">
          <div className="text-xs font-bold uppercase text-[#cc0000] tracking-wider mb-4">Preview</div>
          {(heroUploadUrl || manualImageUrl) && (
            <img src={heroUploadUrl || manualImageUrl} alt={article.title} className="w-full h-48 object-cover rounded-lg mb-4" />
          )}
          <span className="category-badge mb-3 inline-block">{article.category}</span>
          <h1 className="text-2xl font-black text-gray-900 mb-3">{article.title}</h1>
          <p className="text-gray-500 mb-4">{article.excerpt}</p>

          {articleSubType === 'list' ? (
            <div>
              {listIntro && (
                <div className="article-content mb-6" dangerouslySetInnerHTML={{ __html: listIntro }} />
              )}
              <div className="space-y-8">
                {listItems.map((item, idx) => {
                  const itemImg = item.imageMode === 'upload' ? item.uploadUrl : item.imageUrl;
                  return (
                    <div key={idx} className="border-b border-gray-100 pb-8 last:border-0 last:pb-0">
                      <div className="flex items-start gap-4 mb-3">
                        <span className="text-4xl font-black text-[#cc0000] leading-none flex-shrink-0 w-14 text-center tabular-nums">
                          {String(item.number).padStart(2, '0')}
                        </span>
                        <div className="pt-1">
                          <h2 className="text-xl font-black text-gray-900 leading-tight">{item.name}</h2>
                          {item.subtitle && (
                            <p className="text-[#cc0000] font-semibold text-sm mt-0.5">{item.subtitle}</p>
                          )}
                        </div>
                      </div>
                      {itemImg && (
                        <img src={itemImg} alt={item.name} className="w-full h-44 object-cover rounded-xl mb-4" />
                      )}
                      {item.description && (
                        <div className="article-content" dangerouslySetInnerHTML={{ __html: item.description }} />
                      )}
                    </div>
                  );
                })}
              </div>
              {listConclusion && (
                <div className="article-content mt-6 pt-6 border-t border-gray-100" dangerouslySetInnerHTML={{ __html: listConclusion }} />
              )}
            </div>
          ) : (
            <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tab 3: Published Articles ────────────────────────────────────
function PublishedArticles({ onEdit }) {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/articles');
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const deleteArticle = async (slug) => {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    setDeleting(slug);
    try {
      const githubToken = localStorage.getItem('ssd_gh_token');
      const githubUser = localStorage.getItem('ssd_gh_user');
      const githubRepo = localStorage.getItem('ssd_gh_repo');

      if (githubToken && githubUser && githubRepo) {
        await fetch('/api/publish', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, githubToken, githubUser, githubRepo }),
        });
      }
      await load();
    } catch {}
    finally { setDeleting(''); }
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-400"><div className="text-4xl animate-pulse mb-3">📰</div><p>Loading articles...</p></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-black text-gray-900">Published Articles</h2>
          <p className="text-gray-500 text-sm">{articles.length} article{articles.length !== 1 ? 's' : ''} total</p>
        </div>
        <button onClick={load} className="text-[#cc0000] text-sm font-semibold hover:underline">↻ Refresh</button>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">📭</div>
          <p>No articles published yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase tracking-wider hidden md:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-bold text-gray-600 text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.map((a) => (
                <tr key={a.slug} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-800 leading-snug max-w-xs truncate">{a.title}</div>
                    <div className="text-xs text-gray-400 font-mono mt-0.5">{a.slug}</div>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className="category-badge">{a.category}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell whitespace-nowrap">
                    {a.date ? new Date(a.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {a.featured ? (
                      <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded">⭐ Featured</span>
                    ) : (
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">Published</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <a href={`/article/${a.slug}`} target="_blank" rel="noopener" className="text-gray-400 hover:text-gray-700 p-1" title="View">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                      </a>
                      <button onClick={() => onEdit(a)} className="text-blue-500 hover:text-blue-700 text-xs font-semibold">Edit</button>
                      <button
                        onClick={() => deleteArticle(a.slug)}
                        disabled={deleting === a.slug}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold disabled:opacity-50"
                      >
                        {deleting === a.slug ? '...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Tab 4: Site Controls ────────────────────────────────────────
function SiteControls() {
  const [ticker, setTicker] = useState('');
  const [trending, setTrending] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [githubOwner, setGithubOwner] = useState('');
  const [githubRepo, setGithubRepo] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');

  useEffect(() => {
    // Load site config
    fetch('/api/site-config').then((r) => r.json()).then((data) => {
      setTicker((data.breakingTicker || []).join('\n'));
      setTrending((data.trendingArticles || []).join('\n'));
    }).catch(() => {});

    // Load from localStorage
    setGithubToken(localStorage.getItem('ssd_gh_token') || '');
    setGithubOwner(localStorage.getItem('ssd_gh_user') || '');
    setGithubRepo(localStorage.getItem('ssd_gh_repo') || '');
    setGroqKey(localStorage.getItem('ss_groq_key') || '');
  }, []);

  const saveConfig = async () => {
    setSaving(true);
    setSaved('');
    try {
      const config = {
        breakingTicker: ticker.split('\n').map((s) => s.trim()).filter(Boolean),
        trendingArticles: trending.split('\n').map((s) => s.trim()).filter(Boolean),
      };
      const res = await fetch('/api/site-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved('✅ Site config saved!');
    } catch (e) {
      setSaved(`❌ Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  const saveCredentials = () => {
    localStorage.setItem('ssd_gh_token', githubToken);
    localStorage.setItem('ssd_gh_user', githubOwner);
    localStorage.setItem('ssd_gh_repo', githubRepo);
    localStorage.setItem('ss_groq_key', groqKey);
    setSaved('✅ Credentials saved to browser storage!');
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]";

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-black text-gray-900 mb-1">Site Controls</h2>
        <p className="text-gray-500 text-sm">Manage breaking ticker, trending, and API credentials</p>
      </div>

      {saved && (
        <div className={`px-4 py-3 rounded-lg text-sm ${saved.startsWith('✅') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {saved}
        </div>
      )}

      {/* Breaking Ticker */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-800 mb-1">Breaking News Ticker</h3>
        <p className="text-xs text-gray-400 mb-3">One item per line. Displayed in the header ticker.</p>
        <textarea
          rows={5}
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="BREAKING: Taylor Swift announces India tour..."
          className={inputClass}
        />
      </div>

      {/* Trending Articles */}
      <div className="border border-gray-200 rounded-xl p-5">
        <h3 className="font-bold text-gray-800 mb-1">Trending Articles</h3>
        <p className="text-xs text-gray-400 mb-3">One article slug per line (e.g. taylor-swift-india-tour-2026)</p>
        <textarea
          rows={5}
          value={trending}
          onChange={(e) => setTrending(e.target.value)}
          placeholder="taylor-swift-india-tour-2026"
          className={`${inputClass} font-mono`}
        />
      </div>

      <button
        onClick={saveConfig}
        disabled={saving}
        className="bg-[#cc0000] text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#aa0000] transition-colors disabled:opacity-60"
      >
        {saving ? 'Saving...' : '💾 Save Site Config'}
      </button>

      {/* API Credentials */}
      <div className="border border-gray-200 rounded-xl p-5 space-y-4">
        <div>
          <h3 className="font-bold text-gray-800 mb-1">API Credentials</h3>
          <p className="text-xs text-gray-400">Stored in your browser only. Never sent to server except as needed.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">GitHub Personal Access Token</label>
            <input type="password" value={githubToken} onChange={(e) => setGithubToken(e.target.value)} placeholder="ghp_xxxxxxxxxxxx" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">GitHub Username</label>
            <input type="text" value={githubOwner} onChange={(e) => setGithubOwner(e.target.value)} placeholder="yourusername" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">GitHub Repo Name</label>
            <input type="text" value={githubRepo} onChange={(e) => setGithubRepo(e.target.value)} placeholder="starscoop-daily" className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Groq API Key</label>
            <input type="password" value={groqKey} onChange={(e) => setGroqKey(e.target.value)} placeholder="gsk_xxxxxxxxxxxx" className={inputClass} />
          </div>
        </div>

        <button
          onClick={saveCredentials}
          className="bg-gray-900 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-700 transition-colors"
        >
          💾 Save Credentials
        </button>
      </div>
    </div>
  );
}

// ─── Tab 5: Quick Stats ──────────────────────────────────────────
function QuickStats() {
  const [articleCount, setArticleCount] = useState(null);

  useEffect(() => {
    fetch('/api/articles').then((r) => r.json()).then((data) => {
      setArticleCount(Array.isArray(data) ? data.length : 0);
    }).catch(() => setArticleCount(0));
  }, []);

  const LINKS = [
    { label: 'Google Analytics', url: 'https://analytics.google.com', icon: '📊', color: 'bg-orange-50 border-orange-200 text-orange-700' },
    { label: 'Google Search Console', url: 'https://search.google.com/search-console', icon: '🔍', color: 'bg-blue-50 border-blue-200 text-blue-700' },
    { label: 'Adsterra Dashboard', url: 'https://adsterra.com', icon: '💰', color: 'bg-green-50 border-green-200 text-green-700' },
    { label: 'Vercel Dashboard', url: 'https://vercel.com/dashboard', icon: '▲', color: 'bg-gray-50 border-gray-200 text-gray-700' },
    { label: 'Groq Console', url: 'https://console.groq.com', icon: '🤖', color: 'bg-purple-50 border-purple-200 text-purple-700' },
    { label: 'Pexels', url: 'https://www.pexels.com', icon: '📷', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  ];

  return (
    <div>
      <h2 className="text-xl font-black text-gray-900 mb-6">Quick Stats</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#cc0000] text-white rounded-xl p-6 text-center">
          <div className="text-5xl font-black mb-1">{daysSinceLaunch()}</div>
          <div className="text-red-100 text-sm font-semibold">Days Since Launch</div>
          <div className="text-red-200 text-xs mt-1">Launched June 23, 2026</div>
        </div>
        <div className="bg-gray-900 text-white rounded-xl p-6 text-center">
          <div className="text-5xl font-black mb-1">{articleCount ?? '...'}</div>
          <div className="text-gray-300 text-sm font-semibold">Total Articles</div>
          <div className="text-gray-400 text-xs mt-1">Published on StarScoop Daily</div>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-xl p-6 text-center">
          <div className="text-5xl font-black mb-1">G4</div>
          <div className="text-blue-100 text-sm font-semibold">Analytics Active</div>
          <div className="text-blue-200 text-xs mt-1">GA4 ID: G-152JNSZSJY</div>
        </div>
      </div>

      <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wider">Quick Links</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {LINKS.map((link) => (
          <a
            key={link.label}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 border rounded-xl p-4 font-semibold text-sm hover:shadow-md transition-all ${link.color}`}
          >
            <span className="text-2xl">{link.icon}</span>
            <span>{link.label}</span>
            <svg className="w-4 h-4 ml-auto opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        ))}
      </div>

      <div className="mt-6 bg-gray-50 rounded-xl p-4 text-xs text-gray-400 space-y-1">
        <p><strong className="text-gray-600">Domain:</strong> starscoopdaily.site</p>
        <p><strong className="text-gray-600">Contact:</strong> contact@starscoopdaily.site</p>
        <p><strong className="text-gray-600">GA4:</strong> G-152JNSZSJY</p>
        <p><strong className="text-gray-600">Launch Date:</strong> June 23, 2026</p>
      </div>
    </div>
  );
}

// ─── Tab 6: Ads Manager ─────────────────────────────────────────
const SLOT_LABELS = {
  'header': { label: 'Header (Push/Social Bar)', desc: '⚠️ Disabled — conflicts with Monetag push ads. Only re-enable if Monetag is removed.' },
  'homepage-top': { label: 'Homepage Top', desc: 'Shows on homepage (desktop: between category sections · mobile: below hero carousel)' },
  'article-top': { label: 'Article Top', desc: 'Shows in every article (desktop: mid-content · mobile: below article title)' },
  'article-middle': { label: 'Article Middle', desc: 'Native banner injected mid-article body (desktop & mobile)' },
  'sidebar': { label: 'Sidebar', desc: 'Sidebar widget — desktop & tablet only (sidebar stacks below content on mobile)' },
  'footer': { label: 'Footer', desc: 'Above the footer section — all devices' },
};

function Toggle({ enabled, onChange }) {
  return (
    <div onClick={onChange} className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${enabled ? 'bg-[#cc0000]' : 'bg-gray-300'}`}>
      <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  );
}

function AdsManager() {
  const [config, setConfig] = useState({ slots: {} });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [newSlotName, setNewSlotName] = useState('');

  useEffect(() => {
    fetch('/api/ad-config')
      .then((r) => r.json())
      .then((data) => { setConfig(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const updateSlot = (slotName, field, value) => {
    setConfig((prev) => ({
      ...prev,
      slots: { ...prev.slots, [slotName]: { ...prev.slots[slotName], [field]: value } },
    }));
  };

  const updateSmartLink = (val) => setConfig((prev) => ({ ...prev, smartlink: val }));

  const addSlot = () => {
    const name = newSlotName.trim().toLowerCase().replace(/\s+/g, '-');
    if (!name || config.slots[name]) return;
    setConfig((prev) => ({
      ...prev,
      slots: { ...prev.slots, [name]: { enabled: true, code: '' } },
    }));
    setNewSlotName('');
  };

  const saveConfig = async () => {
    const githubToken = localStorage.getItem('ssd_gh_token');
    const githubUser = localStorage.getItem('ssd_gh_user');
    const githubRepo = localStorage.getItem('ssd_gh_repo');

    if (!githubToken || !githubUser || !githubRepo) {
      setSaved('❌ GitHub credentials missing. Set them in Site Controls tab.');
      return;
    }

    setSaving(true);
    setSaved('');
    try {
      const res = await fetch('/api/ad-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config, githubToken, githubUser, githubRepo }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSaved('✅ Saved! Site rebuilding in 30-60 seconds...');
    } catch (e) {
      setSaved(`❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-gray-400"><div className="animate-pulse text-4xl mb-3">📢</div><p>Loading ad config...</p></div>;
  }

  const slots = Object.entries(config.slots || {});

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-1">Ads Manager</h2>
          <p className="text-gray-500 text-sm">Toggle slots and update ad code. Save pushes to GitHub and triggers a Vercel rebuild.</p>
        </div>
        <button
          onClick={saveConfig}
          disabled={saving}
          className="flex-shrink-0 bg-[#cc0000] text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-[#aa0000] transition-colors disabled:opacity-60"
        >
          {saving ? '⟳ Saving...' : '💾 Save All Ad Settings'}
        </button>
      </div>

      {saved && (
        <div className={`px-4 py-3 rounded-lg text-sm ${saved.startsWith('✅') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
          {saved}
        </div>
      )}

      {/* SmartLink URL */}
      <div className="border border-blue-200 bg-blue-50 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">🔗</span>
          <h3 className="font-black text-blue-900 text-sm">SmartLink URL</h3>
        </div>
        <p className="text-xs text-blue-600 mb-3">Used in article CTA buttons, exit popup, 404 page, and empty category pages. Change here to update everywhere instantly.</p>
        <input
          type="url"
          value={config.smartlink || ''}
          onChange={(e) => updateSmartLink(e.target.value)}
          placeholder="https://your-smartlink-url.com/..."
          className="w-full border border-blue-200 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />
      </div>

      {/* Slot cards */}
      {slots.map(([slotName, slot]) => {
        const meta = SLOT_LABELS[slotName];
        return (
          <div key={slotName} className="border border-gray-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-bold text-gray-800">{meta?.label || slotName}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{meta?.desc || ''} <span className="font-mono text-gray-300">· slot="{slotName}"</span></p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-xs font-semibold ${slot.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                  {slot.enabled ? 'On' : 'Off'}
                </span>
                <Toggle enabled={slot.enabled} onChange={() => updateSlot(slotName, 'enabled', !slot.enabled)} />
              </div>
            </div>
            <textarea
              rows={3}
              value={slot.code || ''}
              onChange={(e) => updateSlot(slotName, 'code', e.target.value)}
              placeholder="<!-- Paste ad script/HTML here -->"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#cc0000] bg-gray-50"
            />
            {slot.code?.trim() && (
              <details className="text-xs">
                <summary className="text-gray-400 cursor-pointer hover:text-gray-600 select-none">▸ Preview code</summary>
                <pre className="mt-2 bg-gray-100 rounded p-3 overflow-x-auto text-gray-600 whitespace-pre-wrap break-all">{slot.code}</pre>
              </details>
            )}
          </div>
        );
      })}

      {/* Add New Slot */}
      <div className="border border-dashed border-gray-300 rounded-xl p-5">
        <h3 className="font-bold text-gray-700 mb-3 text-sm">Add New Ad Slot</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newSlotName}
            onChange={(e) => setNewSlotName(e.target.value)}
            placeholder="e.g. category-page-top"
            onKeyDown={(e) => e.key === 'Enter' && addSlot()}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
          />
          <button
            onClick={addSlot}
            className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-bold hover:bg-gray-700 transition-colors whitespace-nowrap"
          >
            + Add Slot
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Use it with <code className="bg-gray-100 px-1 rounded">&lt;AdSlot slot="your-slot-name" /&gt;</code> in any page/component.</p>
      </div>
    </div>
  );
}

// ─── Tab 7: Image Fixer ─────────────────────────────────────────
function ImageFixer() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [images, setImages] = useState([]);
  const [tmdbQueries, setTmdbQueries] = useState({});
  const [tmdbResults, setTmdbResults] = useState({});
  const [tmdbLoading, setTmdbLoading] = useState({});
  const [newImages, setNewImages] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(data => { setArticles(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const selectArticle = (a) => {
    setSelected(a);
    setSavedMsg('');
    setNewImages({});
    setTmdbResults({});
    setTmdbQueries({});
    const imgs = [];
    if (a.image) imgs.push({ slot: 'hero', src: a.image, alt: a.imageAlt || a.title });
    const matches = [...(a.content || '').matchAll(/<img[^>]+src="([^"]+)"[^>]*alt="([^"]*)"[^>]*/gi)];
    matches.forEach((m, i) => imgs.push({ slot: `inline-${i}`, src: m[1], alt: m[2] }));
    (a.items || []).forEach((item, i) => { if (item.image) imgs.push({ slot: `item-${i}`, src: item.image, alt: item.name }); });
    setImages(imgs);
  };

  const searchTmdb = async (slot, type) => {
    const q = (tmdbQueries[slot] || '').trim();
    if (!q) return;
    setTmdbLoading(p => ({ ...p, [slot]: true }));
    setTmdbResults(p => ({ ...p, [slot]: [] }));
    try {
      const r = await fetch(`/api/tmdb?query=${encodeURIComponent(q)}&type=${type}`);
      const data = await r.json();
      const imgs = [];
      const add = (src, label) => { if (src) imgs.push({ src, label }); };
      if (type === 'person') {
        (data.people || []).slice(0, 8).forEach(p => add(p.photo, p.name));
        if (data.details?.profilePhoto) add(data.details.profilePhoto, data.details.name);
      } else if (type === 'tv') {
        (data.shows || []).slice(0, 5).forEach(s => { add(s.poster, `${s.title} poster`); add(s.backdrop, `${s.title} backdrop`); });
        if (data.details) { add(data.details.poster, 'Poster'); add(data.details.backdrop, 'Backdrop'); }
      } else {
        (data.movies || []).slice(0, 5).forEach(m => { add(m.poster, `${m.title} poster`); add(m.backdrop, `${m.title} backdrop`); });
        if (data.details) { add(data.details.poster, 'Poster'); add(data.details.backdrop, 'Backdrop'); }
      }
      setTmdbResults(p => ({ ...p, [slot]: imgs }));
    } catch {}
    finally { setTmdbLoading(p => ({ ...p, [slot]: false })); }
  };

  const save = async () => {
    if (!selected || Object.keys(newImages).length === 0) return;
    const githubToken = localStorage.getItem('ssd_gh_token');
    const githubUser = localStorage.getItem('ssd_gh_user');
    const githubRepo = localStorage.getItem('ssd_gh_repo');
    if (!githubToken || !githubUser || !githubRepo) {
      setSavedMsg('❌ GitHub credentials missing. Set them in Site Controls tab.');
      return;
    }
    setSaving(true);
    setSavedMsg('');
    try {
      let updated = { ...selected };
      if (newImages['hero']) updated.image = newImages['hero'];
      let imgIdx = 0;
      updated.content = (updated.content || '').replace(/<img([^>]+?)src="([^"]+)"([^>]*?)>/gi, (match, pre, oldSrc, post) => {
        const key = `inline-${imgIdx++}`;
        return newImages[key] ? `<img${pre}src="${newImages[key]}"${post}>` : match;
      });
      if (updated.items) {
        updated.items = updated.items.map((item, i) => newImages[`item-${i}`] ? { ...item, image: newImages[`item-${i}`] } : item);
      }
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article: updated, githubToken, githubUser, githubRepo }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSavedMsg(`✅ Updated! Site rebuilding in ~30 seconds.`);
      setSelected(updated);
      setNewImages({});
      setTmdbResults({});
    } catch (e) {
      setSavedMsg(`❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-400"><div className="text-4xl animate-pulse mb-3">🖼️</div><p>Loading articles...</p></div>;

  return (
    <div>
      <h2 className="text-xl font-black text-gray-900 mb-1">Image Fixer</h2>
      <p className="text-gray-500 text-sm mb-6">Select an article, view all its images, search TMDB to replace broken or wrong ones.</p>

      {!selected ? (
        <div className="space-y-2">
          {articles.map(a => (
            <button key={a.slug} onClick={() => selectArticle(a)}
              className="w-full flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-[#cc0000] hover:bg-red-50 transition-colors text-left group">
              <div className="w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                {a.image
                  ? <img src={a.image} alt="" className="w-full h-full object-cover" onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='<span style="font-size:20px;display:flex;align-items:center;justify-content:center;height:100%;color:#ef4444">❌</span>'; }} />
                  : <span className="flex items-center justify-center h-full text-gray-300 text-xl">🖼️</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">{a.title}</p>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{a.slug}</p>
              </div>
              <span className="text-[#cc0000] text-xs font-bold flex-shrink-0 group-hover:underline">Fix Images →</span>
            </button>
          ))}
        </div>
      ) : (
        <div>
          <button onClick={() => setSelected(null)} className="mb-5 text-sm text-gray-500 hover:text-gray-800 font-medium flex items-center gap-1">
            ← Back to Articles
          </button>
          <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2">
            <p className="text-sm font-semibold text-gray-700 truncate">{selected.title}</p>
            <p className="text-xs text-gray-400 font-mono">{selected.slug}</p>
          </div>

          {savedMsg && (
            <div className={`px-4 py-3 rounded-lg text-sm mb-5 ${savedMsg.startsWith('✅') ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {savedMsg}
            </div>
          )}

          <div className="space-y-5">
            {images.map(({ slot, src, alt }) => (
              <div key={slot} className={`border rounded-xl p-5 space-y-3 ${newImages[slot] ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                    {slot === 'hero' ? '🖼️ Hero' : slot.startsWith('inline') ? `📷 Inline ${parseInt(slot.split('-')[1]) + 1}` : `📋 List Item ${parseInt(slot.split('-')[1]) + 1}`}
                  </span>
                  {newImages[slot] && <span className="text-xs font-bold text-green-600">✓ Changed</span>}
                </div>

                <div className="flex gap-4 items-start">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">Current</p>
                    <img src={src} alt={alt} className="w-20 h-20 object-cover rounded-lg border border-gray-200 bg-gray-100"
                      onError={e => { e.target.style.background='#fee2e2'; e.target.style.outline='2px solid #ef4444'; }} />
                  </div>
                  {newImages[slot] && (
                    <div>
                      <p className="text-[10px] font-bold uppercase text-green-600 mb-1">New ✓</p>
                      <img src={newImages[slot]} alt="new" className="w-20 h-20 object-cover rounded-lg border-2 border-green-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-gray-400 mb-1.5 truncate">{alt}</p>
                    <input type="url" value={newImages[slot] || ''}
                      onChange={e => setNewImages(p => ({ ...p, [slot]: e.target.value }))}
                      placeholder="Paste any image URL directly..."
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#cc0000] bg-white" />
                  </div>
                </div>

                <div className="bg-white border border-gray-100 rounded-lg p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Search TMDB to Replace</p>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <input type="text" value={tmdbQueries[slot] || ''}
                      onChange={e => setTmdbQueries(p => ({ ...p, [slot]: e.target.value }))}
                      onKeyDown={e => { if (e.key === 'Enter') searchTmdb(slot, 'person'); }}
                      placeholder="Actor, movie, or show name..."
                      className="flex-1 min-w-[140px] border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#cc0000] bg-white" />
                    {[{ t: 'person', l: '👤 Person' }, { t: 'movie', l: '🎬 Movie' }, { t: 'tv', l: '📺 TV' }].map(({ t, l }) => (
                      <button key={t} onClick={() => searchTmdb(slot, t)} disabled={tmdbLoading[slot]}
                        className="bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap disabled:opacity-50">
                        {tmdbLoading[slot] ? '⟳' : l}
                      </button>
                    ))}
                  </div>
                  {(tmdbResults[slot] || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(tmdbResults[slot] || []).map((img, i) => (
                        <button key={i} onClick={() => setNewImages(p => ({ ...p, [slot]: img.src }))} title={img.label}
                          className={`relative rounded-lg overflow-hidden border-2 transition-all ${newImages[slot] === img.src ? 'border-green-400 ring-2 ring-green-300' : 'border-gray-200 hover:border-[#cc0000]'}`}>
                          <img src={img.src} alt={img.label} className="w-16 h-20 object-cover" />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[8px] px-1 py-0.5 text-center truncate leading-tight">{img.label}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {Object.keys(newImages).length > 0 && (
            <div className="mt-6 flex items-center gap-3">
              <button onClick={save} disabled={saving}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold text-sm transition-colors disabled:opacity-60 flex items-center gap-2">
                {saving ? <><span className="animate-spin inline-block">⟳</span> Saving...</> : `💾 Save ${Object.keys(newImages).length} Image Change${Object.keys(newImages).length > 1 ? 's' : ''}`}
              </button>
              <button onClick={() => { setNewImages({}); setTmdbResults({}); }}
                className="text-gray-500 text-sm font-semibold hover:text-gray-800 transition-colors">
                Reset
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Panel ────────────────────────────────────────────
const TABS = [
  { id: 'fetcher', icon: '📡', label: 'News Fetcher' },
  { id: 'generator', icon: '✍️', label: 'Article Generator' },
  { id: 'articles', icon: '📋', label: 'Published Articles' },
  { id: 'imgfixer', icon: '🖼️', label: 'Image Fixer' },
  { id: 'controls', icon: '⚙️', label: 'Site Controls' },
  { id: 'stats', icon: '📊', label: 'Quick Stats' },
  { id: 'ads', icon: '📢', label: 'Ads Manager' },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [activeTab, setActiveTab] = useState('fetcher');
  const [topicFromFetcher, setTopicFromFetcher] = useState('');
  const [editArticleData, setEditArticleData] = useState(null);

  useEffect(() => {
    if (localStorage.getItem('ssd_admin_auth') === 'true') setAuthed(true);
  }, []);

  const login = (e) => {
    e.preventDefault();
    if (pw === ADMIN_PASSWORD) {
      setAuthed(true);
      setPwError(false);
      localStorage.setItem('ssd_admin_auth', 'true');
    } else {
      setPwError(true);
    }
  };

  const handleUseTopic = (topic) => {
    setTopicFromFetcher(topic);
    setActiveTab('generator');
  };

  if (!authed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: '#0f0f1a' }}>
        <div className="rounded-2xl shadow-2xl p-8 w-full max-w-sm border" style={{ background: '#1a1a2e', borderColor: 'rgba(255,255,255,0.08)' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#cc0000] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-black text-3xl">★</span>
            </div>
            <h1 className="font-black text-xl text-white">StarScoop Daily</h1>
            <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Admin Login</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9ca3af' }}>Password</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Enter admin password"
                autoFocus
                className="w-full rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000] text-white placeholder-gray-500"
                style={{ background: pwError ? 'rgba(220,38,38,0.15)' : '#0f0f1a', border: pwError ? '1px solid #dc2626' : '1px solid rgba(255,255,255,0.1)' }}
              />
              {pwError && <p className="text-red-400 text-xs mt-1.5">Incorrect password. Try again.</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-[#cc0000] hover:bg-[#aa0000] text-white py-3 rounded-lg font-bold text-sm transition-colors mt-1"
            >
              Sign In →
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden" style={{ background: '#f5f5f5', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Top Bar */}
      <div className="flex-shrink-0 h-14 flex items-center justify-between px-5" style={{ background: '#16213e' }}>
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#cc0000] rounded flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-sm">★</span>
          </div>
          <span className="text-white font-black text-sm tracking-tight">StarScoop Daily Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" target="_blank" className="text-blue-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1">
            View Site <span>↗</span>
          </a>
          <button
            onClick={() => { setAuthed(false); localStorage.removeItem('ssd_admin_auth'); }}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 flex flex-col overflow-y-auto hidden sm:flex" style={{ background: '#1a1a2e' }}>
          <nav className="p-3 flex-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="w-full text-left px-3 py-2.5 rounded-lg mb-1 text-sm font-medium transition-colors flex items-center gap-3"
                style={{
                  background: activeTab === tab.id ? '#cc0000' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : '#9ca3af',
                }}
                onMouseEnter={(e) => { if (activeTab !== tab.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; } }}
                onMouseLeave={(e) => { if (activeTab !== tab.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9ca3af'; } }}
              >
                <span className="text-base leading-none">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            <p className="text-xs text-center" style={{ color: '#4b5563' }}>StarScoop Daily v1.0</p>
          </div>
        </aside>

        {/* Mobile Tab Bar */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex overflow-x-auto" style={{ background: '#1a1a2e', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {TABS.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="flex-1 min-w-0 flex flex-col items-center justify-center py-2 text-xs"
              style={{ color: activeTab === tab.id ? '#cc0000' : '#6b7280' }}>
              <span className="text-base leading-none mb-0.5">{tab.icon}</span>
              <span className="truncate text-[9px] font-medium w-full text-center px-1">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 pb-20 sm:pb-6">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-8">
              {activeTab === 'fetcher' && <NewsFetcher onUseTopic={handleUseTopic} />}
              {activeTab === 'generator' && <ArticleGenerator initialTopic={topicFromFetcher} editArticle={editArticleData} />}
              {activeTab === 'articles' && <PublishedArticles onEdit={(a) => { setEditArticleData(a); setActiveTab('generator'); }} />}
              {activeTab === 'imgfixer' && <ImageFixer />}
              {activeTab === 'controls' && <SiteControls />}
              {activeTab === 'stats' && <QuickStats />}
              {activeTab === 'ads' && <AdsManager />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
