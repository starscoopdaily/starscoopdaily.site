import Link from 'next/link';
import Image from 'next/image';
import { getCategoryConfig } from '@/lib/categories';

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Full-image portrait card (default) ── */
export default function ArticleCard({ article, size = 'normal', layout = 'vertical', showExcerpt = true }) {
  if (!article) return null;

  const catSlug = article.category?.toLowerCase().replace(/\s+/g, '-') || '';
  const { color: catColor } = getCategoryConfig(catSlug);

  /* ── Horizontal card — single-article category sections ── */
  if (layout === 'horizontal') {
    return (
      <Link href={`/article/${article.slug}`} className="group block article-card">
        <div
          className="flex bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.08)', transition: 'box-shadow .2s' }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.14)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.08)'}
        >
          {/* Portrait image */}
          <div className="relative flex-shrink-0 overflow-hidden bg-gray-200" style={{ width: '160px', aspectRatio: '2/3' }}>
            {article.image ? (
              <Image src={article.image} alt={article.imageAlt || article.title} fill className="object-cover object-top group-hover:scale-105 transition-transform duration-500" sizes="160px" />
            ) : (
              <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${catColor}66, ${catColor}33)` }} />
            )}
          </div>
          {/* Text */}
          <div className="p-5 flex flex-col flex-1 min-w-0">
            <span className="category-badge mb-3" style={{ background: catColor, alignSelf: 'flex-start' }}>{article.category}</span>
            <h2 className="font-black text-gray-900 group-hover:text-[#cc0000] transition-colors leading-snug text-lg sm:text-xl line-clamp-3 mb-3">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">{article.excerpt}</p>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-auto">
              <span className="font-semibold text-gray-600">{article.author || 'StarScoop Daily Staff'}</span>
              <span>·</span>
              <span>{formatDate(article.date)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  /* ── Default: full-image portrait card with text overlay ── */
  return (
    <Link href={`/article/${article.slug}`} className="group block article-card h-full">
      <div className="relative rounded-2xl overflow-hidden h-full" style={{ aspectRatio: '2/3', boxShadow: '0 2px 12px rgba(0,0,0,0.10)' }}>

        {/* Image */}
        {article.image ? (
          <Image
            src={article.image}
            alt={article.imageAlt || article.title}
            fill
            className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, #1a1a2e, ${catColor}55)` }} />
        )}

        {/* Gradient — stronger at bottom for text legibility */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.08) 70%, transparent 100%)' }}
        />

        {/* Category badge — top left */}
        <div className="absolute top-3 left-3 z-10">
          <span className="category-badge" style={{ background: catColor, boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
            {article.category}
          </span>
        </div>

        {/* Text — bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-10">
          <h2
            className="font-black text-white leading-snug line-clamp-3 group-hover:text-red-200 transition-colors"
            style={{ fontSize: size === 'large' ? '18px' : '14px', textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}
          >
            {article.title}
          </h2>
          <p className="text-gray-400 text-xs mt-1.5 font-medium">{formatDate(article.date)}</p>
        </div>
      </div>
    </Link>
  );
}
