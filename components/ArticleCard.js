import Link from 'next/link';
import Image from 'next/image';
import { getCategoryConfig } from '@/lib/categories';

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Standard card — portrait image, text below ── */
export default function ArticleCard({ article, size = 'normal', layout = 'vertical', showExcerpt = true }) {
  if (!article) return null;

  const catSlug = article.category?.toLowerCase().replace(/\s+/g, '-') || '';
  const { color: catColor } = getCategoryConfig(catSlug);

  /* Horizontal layout — used for single-article category sections */
  if (layout === 'horizontal') {
    return (
      <Link href={`/article/${article.slug}`} className="group block article-card">
        <div className="flex bg-white rounded-xl overflow-hidden" style={{ border: '1px solid #eee', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
          {/* Portrait image — fixed width, full natural height */}
          <div className="relative flex-shrink-0 bg-gray-100 overflow-hidden" style={{ width: '140px', aspectRatio: '2/3' }}>
            {article.image ? (
              <Image
                src={article.image}
                alt={article.imageAlt || article.title}
                fill
                className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                sizes="140px"
              />
            ) : (
              <div className="w-full h-full bg-gray-100" />
            )}
          </div>
          {/* Text */}
          <div className="p-4 flex flex-col flex-1 min-w-0" style={{ borderLeft: `3px solid ${catColor}` }}>
            <span className="category-badge mb-2" style={{ background: catColor, alignSelf: 'flex-start' }}>
              {article.category}
            </span>
            <h2 className="font-black text-gray-900 group-hover:text-[#cc0000] transition-colors leading-snug text-base sm:text-lg line-clamp-4 mb-2">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-3">{article.excerpt}</p>
            )}
            <div className="text-xs text-gray-400 mt-auto">{formatDate(article.date)}</div>
          </div>
        </div>
      </Link>
    );
  }

  /* Large card — first article in Latest News, portrait image left */
  if (size === 'large') {
    return (
      <Link href={`/article/${article.slug}`} className="group block article-card">
        <div
          className="flex flex-col sm:flex-row bg-white rounded-xl overflow-hidden"
          style={{ border: '1px solid #eee', boxShadow: '0 2px 10px rgba(0,0,0,0.07)' }}
        >
          {/* Portrait image */}
          <div className="relative flex-shrink-0 bg-gray-100 overflow-hidden" style={{ width: '100%', aspectRatio: '4/3' }}>
            <div className="sm:hidden" style={{ position: 'relative', width: '100%', aspectRatio: '4/3' }}>
              {article.image && (
                <Image src={article.image} alt={article.imageAlt || article.title} fill className="object-cover object-top" sizes="100vw" priority />
              )}
            </div>
            <div className="hidden sm:block" style={{ position: 'relative', width: '300px', height: '100%', minHeight: '240px' }}>
              {article.image && (
                <Image src={article.image} alt={article.imageAlt || article.title} fill className="object-cover object-top" sizes="300px" priority />
              )}
            </div>
            <div className="absolute top-3 left-3">
              <span className="category-badge" style={{ background: catColor }}>{article.category}</span>
            </div>
          </div>
          {/* Text */}
          <div className="p-5 flex flex-col" style={{ borderTop: `3px solid ${catColor}` }}>
            <h2 className="font-black text-gray-900 group-hover:text-[#cc0000] transition-colors leading-tight text-xl sm:text-2xl mb-3 line-clamp-3">
              {article.title}
            </h2>
            {article.excerpt && (
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed line-clamp-3 mb-4 flex-1">{article.excerpt}</p>
            )}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-medium">{article.author || 'StarScoop Daily Staff'}</span>
              <span>{formatDate(article.date)}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  /* Default grid card — portrait image takes up most of the card */
  return (
    <Link href={`/article/${article.slug}`} className="group block article-card h-full">
      <div className="bg-white rounded-xl overflow-hidden h-full flex flex-col" style={{ border: '1px solid #eee', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

        {/* Portrait image — aspect ratio 2:3 shows the whole photo */}
        <div className="relative overflow-hidden flex-shrink-0 bg-gray-100" style={{ aspectRatio: '2/3', width: '100%' }}>
          {article.image ? (
            <Image
              src={article.image}
              alt={article.imageAlt || article.title}
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Category badge */}
          {article.category && (
            <div className="absolute top-3 left-3">
              <span className="category-badge" style={{ background: catColor }}>{article.category}</span>
            </div>
          )}
        </div>

        {/* Text — compact strip at bottom */}
        <div className="p-3 flex flex-col flex-1" style={{ borderTop: `3px solid ${catColor}` }}>
          <h2 className="font-black text-gray-900 group-hover:text-[#cc0000] transition-colors leading-snug line-clamp-3 text-sm sm:text-base">
            {article.title}
          </h2>
          {showExcerpt && article.excerpt && (
            <p className="text-gray-400 text-xs leading-relaxed mt-1 line-clamp-2">{article.excerpt}</p>
          )}
          <div className="text-xs text-gray-400 mt-auto pt-2">{formatDate(article.date)}</div>
        </div>
      </div>
    </Link>
  );
}
