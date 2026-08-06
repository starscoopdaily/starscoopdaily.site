'use client';

import { useState } from 'react';
import { ALL_KNOWN_CATEGORIES } from '@/lib/categories';
import { buildSocialKit } from '@/lib/social';

/**
 * Paste a complete article JSON (from Claude chat, Gemini, anywhere) and
 * publish it straight to GitHub.
 *
 * Exists because the manual generator needs ~15 fields filled one at a time.
 * When the article is already written elsewhere, that's pure friction — and
 * it's the step most likely to introduce a typo into a slug or category.
 *
 * Validates the schema, checks every image actually loads, then publishes.
 */

const REQUIRED = ['title', 'slug', 'excerpt', 'category', 'date', 'image', 'imageAlt', 'metaDescription', 'content'];

function extractJson(raw) {
  const t = (raw || '').trim();
  if (!t) return null;
  // Tolerate ```json fences that chat models add
  const fenced = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  const body = fenced ? fenced[1] : t;
  // Tolerate leading prose before the object
  const start = body.indexOf('{');
  const end = body.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  return body.slice(start, end + 1);
}

function collectImages(a) {
  const urls = [];
  if (a.image) urls.push(a.image);
  if (a.personProfilePhoto) urls.push(a.personProfilePhoto);
  const inline = [...String(a.content || '').matchAll(/<img[^>]+src="([^"]+)"/g)].map((m) => m[1]);
  return [...new Set([...urls, ...inline])];
}

function loadImage(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ url, ok: true, w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => resolve({ url, ok: false });
    img.src = url;
  });
}

export default function JsonImport() {
  const [raw, setRaw] = useState('');
  const [article, setArticle] = useState(null);
  const [problems, setProblems] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [images, setImages] = useState([]);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [kit, setKit] = useState(null);

  const check = async () => {
    setStatus(''); setArticle(null); setImages([]);
    const jsonText = extractJson(raw);
    if (!jsonText) { setProblems(['No JSON object found. Paste the whole { ... } block.']); setWarnings([]); return; }

    let a;
    try { a = JSON.parse(jsonText); }
    catch (e) { setProblems(['Invalid JSON — ' + e.message]); setWarnings([]); return; }

    const probs = [];
    const warns = [];

    REQUIRED.forEach((f) => { if (!a[f] || !String(a[f]).trim()) probs.push(`Missing required field: ${f}`); });

    if (a.category && !ALL_KNOWN_CATEGORIES.includes(a.category)) {
      probs.push(`Unknown category "${a.category}". Must be one of: ${ALL_KNOWN_CATEGORIES.join(', ')}`);
    }
    if (a.slug && !/^[a-z0-9-]+$/.test(a.slug)) probs.push('Slug must be lowercase letters, numbers and hyphens only.');
    if (a.date && !/^\d{4}-\d{2}-\d{2}$/.test(a.date)) probs.push('Date must be YYYY-MM-DD.');

    if (a.metaDescription && a.metaDescription.length > 160) warns.push(`metaDescription is ${a.metaDescription.length} chars — keep under 160.`);
    if (a.slug && !/\d{4}/.test(a.slug)) warns.push('Slug has no year. Usually worth including one.');
    if (!a.author) warns.push('No author — will default to StarScoop Daily Staff.');
    if (!a.tags?.length) warns.push('No tags.');
    const words = String(a.content || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
    if (words < 400) warns.push(`Content is ~${words} words. Aim for 400+.`);
    const h2 = (String(a.content || '').match(/<h2/g) || []).length;
    if (h2 < 3) warns.push(`Only ${h2} H2 headings. Aim for 3+.`);
    const imgCount = (String(a.content || '').match(/<img/g) || []).length;
    if (imgCount < 2) warns.push(`Only ${imgCount} inline images. Aim for 2+ plus the hero.`);

    setProblems(probs); setWarnings(warns);
    if (probs.length) return;

    a.author = a.author || 'StarScoop Daily Staff';
    if (a.featured === undefined) a.featured = false;
    if (!a.articleType) a.articleType = 'standard';
    setArticle(a);

    setChecking(true);
    const urls = collectImages(a);
    const results = await Promise.all(urls.map(loadImage));
    setImages(results);
    setChecking(false);
  };

  const publish = async () => {
    if (!article) return;
    const githubToken = localStorage.getItem('ssd_gh_token');
    const githubUser = localStorage.getItem('ssd_gh_user');
    const githubRepo = localStorage.getItem('ssd_gh_repo');
    if (!githubToken || !githubUser || !githubRepo) {
      setStatus('❌ GitHub credentials missing — set them in Site Controls first.');
      return;
    }
    setPublishing(true); setStatus('Publishing…');
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article, githubToken, githubUser, githubRepo }),
      });
      const data = await res.json();
      if (!res.ok) setStatus('❌ ' + (data.error || 'Publish failed'));
      else {
        setStatus(`✅ Published. Live in ~1–2 min at /article/${article.slug}`);
        setKit(buildSocialKit(article));
      }
    } catch (e) {
      setStatus('❌ ' + e.message);
    }
    setPublishing(false);
  };

  const badImages = images.filter((i) => !i.ok);
  const canPublish = article && !problems.length && !checking && !badImages.length;

  return (
    <div>
      <h2 className="text-xl font-black text-gray-900 mb-1">Paste &amp; Publish</h2>
      <p className="text-gray-500 text-sm mb-4">
        Paste a complete article JSON written anywhere — Claude, Gemini, by hand. Validates the schema,
        confirms every image loads, then pushes to GitHub.
      </p>

      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={'{\n  "title": "...",\n  "slug": "...",\n  "category": "celebrity",\n  ...\n}'}
        spellCheck={false}
        className="w-full h-64 font-mono text-xs p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cc0000]"
      />

      <div className="flex gap-2 mt-3">
        <button onClick={check} className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-5 py-2.5 rounded-lg text-sm">
          Check
        </button>
        <button
          onClick={publish}
          disabled={!canPublish || publishing}
          className={`font-bold px-5 py-2.5 rounded-lg text-sm ${canPublish && !publishing ? 'bg-[#cc0000] hover:bg-[#aa0000] text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
        >
          {publishing ? 'Publishing…' : 'Publish to GitHub'}
        </button>
      </div>

      {problems.length > 0 && (
        <div className="mt-4 border border-red-200 bg-red-50 rounded-lg p-3">
          <p className="font-bold text-red-700 text-sm mb-1">Must fix</p>
          <ul className="text-sm text-red-700 list-disc ml-5 space-y-0.5">
            {problems.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-3 border border-amber-200 bg-amber-50 rounded-lg p-3">
          <p className="font-bold text-amber-700 text-sm mb-1">Worth checking</p>
          <ul className="text-sm text-amber-700 list-disc ml-5 space-y-0.5">
            {warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {checking && <p className="mt-3 text-sm text-gray-500">Checking images…</p>}

      {images.length > 0 && (
        <div className="mt-4">
          <p className="font-bold text-gray-700 text-sm mb-2">
            Images — {images.filter((i) => i.ok).length}/{images.length} loaded
          </p>
          <div className="space-y-1">
            {images.map((im, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span>{im.ok ? '✅' : '❌'}</span>
                <span className="text-gray-400 shrink-0">{im.ok ? `${im.w}×${im.h}` : 'failed'}</span>
                <span className="truncate text-gray-600">{im.url}</span>
              </div>
            ))}
          </div>
          {badImages.length > 0 && (
            <p className="text-xs text-red-600 mt-2">Fix the failed images before publishing.</p>
          )}
        </div>
      )}

      {article && !problems.length && (
        <div className="mt-4 border border-gray-200 rounded-lg p-3 bg-gray-50">
          <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-1">Preview</p>
          <p className="font-black text-gray-900">{article.title}</p>
          <p className="text-xs text-gray-500 mt-1">
            {article.category} · {article.date} · /article/{article.slug}
          </p>
        </div>
      )}

      {status && <p className="mt-3 text-sm font-semibold">{status}</p>}

      {kit && (
        <div className="mt-5 border-2 border-green-200 bg-green-50 rounded-xl p-4">
          <h3 className="font-black text-green-900 mb-1">Now promote it — 3 steps</h3>
          <p className="text-xs text-green-700 mb-4">
            Pinterest matters most. It moves in weeks; search takes months.
          </p>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">
                1 · Google — request indexing
              </p>
              <CopyBox value={kit.url} />
              <p className="text-[11px] text-gray-500 mt-1">
                Search Console → URL Inspection → paste → Request Indexing
              </p>
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">
                2 · Pinterest — board: <span className="text-[#cc0000]">{kit.board}</span>
              </p>
              <a
                href={kit.pinImage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-[#cc0000] hover:bg-[#aa0000] text-white font-bold text-xs px-4 py-2 rounded-lg mb-2"
              >
                🖼️ Open pin image → save the PNG
              </a>
              <CopyBox value={kit.pinterest} rows={11} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">
                3 · Twitter / X — single post
              </p>
              <CopyBox value={kit.twitter} rows={6} />
            </div>

            <div>
              <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-1">
                4 · Twitter / X — thread (better reach)
              </p>
              {kit.thread?.map((t, i) => (
                <div key={i} className="mb-1.5">
                  <p className="text-[10px] text-gray-400 font-bold mb-0.5">Tweet {i + 1}</p>
                  <CopyBox value={t} rows={4} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CopyBox({ value, rows = 1 }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked — the field is selectable */ }
  };
  return (
    <div className="flex gap-2 items-start">
      {rows > 1 ? (
        <textarea
          readOnly
          rows={rows}
          value={value}
          onFocus={(e) => e.target.select()}
          className="flex-1 text-[11px] font-mono px-2 py-1.5 bg-white border border-gray-200 rounded resize-none"
        />
      ) : (
        <input
          readOnly
          value={value}
          onFocus={(e) => e.target.select()}
          className="flex-1 text-[11px] font-mono px-2 py-1.5 bg-white border border-gray-200 rounded"
        />
      )}
      <button
        onClick={copy}
        className={`shrink-0 text-xs font-bold px-3 py-1.5 rounded ${copied ? 'bg-green-600 text-white' : 'bg-gray-900 hover:bg-gray-800 text-white'}`}
      >
        {copied ? '✓' : 'Copy'}
      </button>
    </div>
  );
}
