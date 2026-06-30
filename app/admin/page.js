'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';

const ADMIN_PASSWORD = 'StarScoop@2026';
const CATEGORIES = ['Celebrity', 'Hollywood', 'Bollywood', 'TV Shows', 'Music', 'Relationships', 'Sports'];
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
          <p className="text-gray-500 text-sm">Fetch latest entertainment headlines from Google News RSS</p>
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
          <p className="font-medium">Click "Fetch Headlines" to load latest entertainment news</p>
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

// ─── Tab 2: Article Generator ────────────────────────────────────
function ArticleGenerator({ initialTopic = '' }) {
  const [topic, setTopic] = useState(initialTopic);
  const [category, setCategory] = useState('Celebrity');
  const [mode, setMode] = useState('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [article, setArticle] = useState(null);
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

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
  }, [initialTopic]);

  const generateArticle = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setArticle(null);
    setPreview(false);
    try {
      const groqKey = localStorage.getItem('ss_groq_key') || '';
      const res = await fetch('/api/groq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, category, apiKey: groqKey }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const a = { ...data.article, category, author: 'StarScoop Daily Staff', date: new Date().toISOString().split('T')[0] };
      setArticle(a);
      setImageQuery(a.title || a.hero_image_query || '');
      if (a.inline_image_queries?.[0]) setInlineImage1Query(a.inline_image_queries[0]);
      if (a.inline_image_queries?.[1]) setInlineImage2Query(a.inline_image_queries[1]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const searchImages = async (query, type) => {
    if (!query.trim()) return;
    const setLoading = type === 'hero' ? setPexelsLoading : type === 'inline1' ? setPexelsInline1Loading : setPexelsInline2Loading;
    const setImgs = type === 'hero' ? setPexelsImages : type === 'inline1' ? setPexelsInline1 : setPexelsInline2;
    setLoading(true);
    try {
      const res = await fetch(`/api/google-images?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.error) {
        alert('Image search error: ' + data.error);
        return;
      }
      if (!data.images || data.images.length === 0) {
        alert('No images found. Try different search terms.');
        return;
      }
      setImgs(data.images);
    } catch (err) {
      alert('Search failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const publishArticle = async () => {
    if (!article) return;
    const heroImage = imageMode === 'pexels' ? selectedImage?.url : manualImageUrl;
    const heroAlt = imageMode === 'pexels' ? (selectedImage?.title || article.title) : article.title;

    const inline1Url = inlineImage1Mode === 'pexels' ? selectedInlineImage1?.url : manualInlineImage1Url;
    const inline1Alt = inlineImage1Mode === 'pexels' ? (selectedInlineImage1?.title || article.title) : article.title;
    const inline2Url = inlineImage2Mode === 'pexels' ? selectedInlineImage2?.url : manualInlineImage2Url;
    const inline2Alt = inlineImage2Mode === 'pexels' ? (selectedInlineImage2?.title || article.title) : article.title;

    const makeFigure = (url, alt) =>
      `<figure><img src="${url}" alt="${alt}" style="width:100%;border-radius:8px;margin:20px 0"/><figcaption style="text-align:center;color:#666;font-size:14px;">${alt}</figcaption></figure>`;

    const injectInlineImages = (html) => {
      const parts = html.split('</h2>');
      return parts.map((part, i) => {
        let chunk = part;
        if (i < parts.length - 1) chunk += '</h2>';
        if (i === 1 && inline1Url) chunk += makeFigure(inline1Url, inline1Alt);
        if (i === 3 && inline2Url) chunk += makeFigure(inline2Url, inline2Alt);
        return chunk;
      }).join('');
    };

    const finalArticle = {
      ...article,
      image: heroImage || '',
      imageAlt: heroAlt || article.title,
      content: injectInlineImages(article.content || ''),
      featured: false,
    };

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
      setSuccess(`✅ Article published! Vercel will rebuild in 30-60 seconds. View at: ${data.url}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-black text-gray-900 mb-1">Article Generator</h2>
      <p className="text-gray-500 text-sm mb-6">Generate articles with AI (Groq) or write manually</p>

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
          <h3 className="font-bold text-gray-800">Edit Generated Article</h3>

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
            {['pexels', 'url'].map((m) => (
              <button
                key={m}
                onClick={() => setImageMode(m)}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors ${
                  imageMode === m ? 'bg-[#cc0000] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m === 'pexels' ? '🔍 Google Images' : '🔗 Direct URL'}
              </button>
            ))}
          </div>

          {imageMode === 'pexels' ? (
            <>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={imageQuery}
                  onChange={(e) => setImageQuery(e.target.value)}
                  placeholder="Search photos (e.g. celebrity red carpet)"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
                  onKeyDown={(e) => e.key === 'Enter' && searchImages(imageQuery, 'hero')}
                />
                <button
                  onClick={() => searchImages(imageQuery, 'hero')}
                  disabled={pexelsLoading}
                  className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-60"
                >
                  {pexelsLoading ? '...' : 'Search'}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pexelsImages.map((img) => (
                  <button
                    key={img.url}
                    onClick={() => setSelectedImage(img)}
                    className={`relative rounded-lg overflow-hidden aspect-video border-2 transition-all ${
                      selectedImage?.url === img.url
                        ? 'border-[#cc0000] ring-2 ring-[#cc0000]'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img src={img.thumbnail} alt={img.title} className="w-full h-full object-cover" />
                    {selectedImage?.url === img.url && (
                      <div className="absolute inset-0 bg-[#cc0000]/20 flex items-center justify-center">
                        <span className="text-white text-2xl">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {selectedImage && (
                <p className="text-xs text-gray-400 mt-2">
                  Selected: {selectedImage.title} — Source: {selectedImage.source}
                </p>
              )}
            </>
          ) : (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Image URL</label>
              <input
                type="url"
                value={manualImageUrl}
                onChange={(e) => setManualImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
              />
              {manualImageUrl && (
                <img src={manualImageUrl} alt="Preview" className="mt-3 rounded-lg max-h-48 object-cover" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Inline Image 1 */}
      {article && (
        <div className="mt-6 border border-gray-200 rounded-xl p-5">
          <h3 className="font-bold text-gray-800 mb-1">Inline Image 1 <span className="text-xs font-normal text-gray-400">(inserted after 2nd heading)</span></h3>
          <div className="flex gap-2 mb-4 mt-3">
            {['pexels', 'url'].map((m) => (
              <button key={m} onClick={() => setInlineImage1Mode(m)}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors ${inlineImage1Mode === m ? 'bg-[#cc0000] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {m === 'pexels' ? '🔍 Google Images' : '🔗 Direct URL'}
              </button>
            ))}
          </div>
          {inlineImage1Mode === 'pexels' ? (
            <>
              <div className="flex gap-2 mb-4">
                <input type="text" value={inlineImage1Query} onChange={(e) => setInlineImage1Query(e.target.value)}
                  placeholder="Search photos for inline image 1"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
                  onKeyDown={(e) => e.key === 'Enter' && searchImages(inlineImage1Query, 'inline1')} />
                <button onClick={() => searchImages(inlineImage1Query, 'inline1')} disabled={pexelsInline1Loading}
                  className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-60">
                  {pexelsInline1Loading ? '...' : 'Search'}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pexelsInline1.map((img) => (
                  <button key={img.url} onClick={() => setSelectedInlineImage1(img)}
                    className={`relative rounded-lg overflow-hidden aspect-video border-2 transition-all ${selectedInlineImage1?.url === img.url ? 'border-[#cc0000] ring-2 ring-[#cc0000]' : 'border-gray-200 hover:border-gray-400'}`}>
                    <img src={img.thumbnail} alt={img.title} className="w-full h-full object-cover" />
                    {selectedInlineImage1?.url === img.url && (
                      <div className="absolute inset-0 bg-[#cc0000]/20 flex items-center justify-center">
                        <span className="text-white text-2xl">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {selectedInlineImage1 && <p className="text-xs text-gray-400 mt-2">Selected: {selectedInlineImage1.title} — Source: {selectedInlineImage1.source}</p>}
            </>
          ) : (
            <div>
              <input type="url" value={manualInlineImage1Url} onChange={(e) => setManualInlineImage1Url(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]" />
              {manualInlineImage1Url && <img src={manualInlineImage1Url} alt="Preview" className="mt-3 rounded-lg max-h-48 object-cover" />}
            </div>
          )}
        </div>
      )}

      {/* Inline Image 2 */}
      {article && (
        <div className="mt-6 border border-gray-200 rounded-xl p-5">
          <h3 className="font-bold text-gray-800 mb-1">Inline Image 2 <span className="text-xs font-normal text-gray-400">(inserted after 4th heading)</span></h3>
          <div className="flex gap-2 mb-4 mt-3">
            {['pexels', 'url'].map((m) => (
              <button key={m} onClick={() => setInlineImage2Mode(m)}
                className={`px-4 py-2 rounded-lg font-semibold text-xs transition-colors ${inlineImage2Mode === m ? 'bg-[#cc0000] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                {m === 'pexels' ? '🔍 Google Images' : '🔗 Direct URL'}
              </button>
            ))}
          </div>
          {inlineImage2Mode === 'pexels' ? (
            <>
              <div className="flex gap-2 mb-4">
                <input type="text" value={inlineImage2Query} onChange={(e) => setInlineImage2Query(e.target.value)}
                  placeholder="Search photos for inline image 2"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
                  onKeyDown={(e) => e.key === 'Enter' && searchImages(inlineImage2Query, 'inline2')} />
                <button onClick={() => searchImages(inlineImage2Query, 'inline2')} disabled={pexelsInline2Loading}
                  className="bg-gray-900 text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-60">
                  {pexelsInline2Loading ? '...' : 'Search'}
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {pexelsInline2.map((img) => (
                  <button key={img.url} onClick={() => setSelectedInlineImage2(img)}
                    className={`relative rounded-lg overflow-hidden aspect-video border-2 transition-all ${selectedInlineImage2?.url === img.url ? 'border-[#cc0000] ring-2 ring-[#cc0000]' : 'border-gray-200 hover:border-gray-400'}`}>
                    <img src={img.thumbnail} alt={img.title} className="w-full h-full object-cover" />
                    {selectedInlineImage2?.url === img.url && (
                      <div className="absolute inset-0 bg-[#cc0000]/20 flex items-center justify-center">
                        <span className="text-white text-2xl">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {selectedInlineImage2 && <p className="text-xs text-gray-400 mt-2">Selected: {selectedInlineImage2.title} — Source: {selectedInlineImage2.source}</p>}
            </>
          ) : (
            <div>
              <input type="url" value={manualInlineImage2Url} onChange={(e) => setManualInlineImage2Url(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000]" />
              {manualInlineImage2Url && <img src={manualInlineImage2Url} alt="Preview" className="mt-3 rounded-lg max-h-48 object-cover" />}
            </div>
          )}
        </div>
      )}

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
            {publishing ? <><span className="animate-spin">⟳</span> Publishing...</> : '🚀 Publish Article'}
          </button>
        </div>
      )}

      {/* Preview */}
      {preview && article && (
        <div className="mt-6 border-2 border-[#cc0000] rounded-xl p-6 bg-white">
          <div className="text-xs font-bold uppercase text-[#cc0000] tracking-wider mb-4">Preview</div>
          {(selectedImage?.url || manualImageUrl) && (
            <img src={selectedImage?.url || manualImageUrl} alt={article.title} className="w-full h-48 object-cover rounded-lg mb-4" />
          )}
          <span className="category-badge mb-3 inline-block">{article.category}</span>
          <h1 className="text-2xl font-black text-gray-900 mb-3">{article.title}</h1>
          <p className="text-gray-500 mb-4">{article.excerpt}</p>
          <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
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
  'header': { label: 'Header', desc: 'Social bar / sticky header ad (loads on every page)' },
  'homepage-top': { label: 'Homepage Top', desc: 'Below latest news section on the homepage' },
  'article-top': { label: 'Article Top', desc: 'Above article content (after share buttons)' },
  'article-middle': { label: 'Article Middle', desc: 'Native banner injected within article' },
  'sidebar': { label: 'Sidebar', desc: 'Sidebar ad widget (homepage & article pages)' },
  'footer': { label: 'Footer', desc: 'Above the footer section' },
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

// ─── Main Admin Panel ────────────────────────────────────────────
const TABS = [
  { id: 'fetcher', label: '📡 News Fetcher' },
  { id: 'generator', label: '✍️ Article Generator' },
  { id: 'articles', label: '📋 Published Articles' },
  { id: 'controls', label: '⚙️ Site Controls' },
  { id: 'stats', label: '📊 Quick Stats' },
  { id: 'ads', label: '📢 Ads Manager' },
];

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [pwError, setPwError] = useState(false);
  const [activeTab, setActiveTab] = useState('fetcher');
  const [topicFromFetcher, setTopicFromFetcher] = useState('');

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-[#cc0000] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <span className="text-white font-black text-2xl">★</span>
            </div>
            <h1 className="font-black text-xl text-gray-900">StarScoop Admin</h1>
            <p className="text-gray-400 text-sm mt-1">Enter your admin password to continue</p>
          </div>
          <form onSubmit={login} className="space-y-4">
            <div>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                placeholder="Admin password"
                autoFocus
                className={`w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000] ${
                  pwError ? 'border-red-400 bg-red-50' : 'border-gray-200'
                }`}
              />
              {pwError && <p className="text-red-500 text-xs mt-1">Incorrect password. Try again.</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-[#cc0000] text-white py-3 rounded-lg font-bold hover:bg-[#aa0000] transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-gray-900 text-white px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#cc0000] rounded flex items-center justify-center">
            <span className="text-white font-black text-sm">★</span>
          </div>
          <span className="font-black text-sm">StarScoop Admin Panel</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="text-gray-400 hover:text-white text-xs transition-colors">View Site →</a>
          <button
            onClick={() => { setAuthed(false); localStorage.removeItem('ssd_admin_auth'); }}
            className="text-gray-400 hover:text-white text-xs transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 overflow-x-auto">
        <div className="flex min-w-max sm:max-w-7xl sm:mx-auto px-4 sm:px-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#cc0000] text-[#cc0000]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          {activeTab === 'fetcher' && <NewsFetcher onUseTopic={handleUseTopic} />}
          {activeTab === 'generator' && <ArticleGenerator initialTopic={topicFromFetcher} />}
          {activeTab === 'articles' && <PublishedArticles onEdit={(a) => { setActiveTab('generator'); }} />}
          {activeTab === 'controls' && <SiteControls />}
          {activeTab === 'stats' && <QuickStats />}
          {activeTab === 'ads' && <AdsManager />}
        </div>
      </div>
    </div>
  );
}
