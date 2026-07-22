import Link from 'next/link';
import Image from 'next/image';
import { getCategoryConfig } from '@/lib/categories';

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/* ── Horizontal card — single-article category sections ── */
function HorizontalCard({ article, catColor }) {
  return (
    <Link href={`/article/${article.slug}`} className="group block article-card">
      <div className="article-hcard flex bg-white rounded-xl overflow-hidden">
        {/* Portrait image — fixed width */}
        <div className="relative flex-shrink-0 bg-gray-100 overflow-hidden" style={{ width: '160px', minHeight: '140px' }}>
          {article.image ? (
            <Image
              src={article.image}
              alt={article.imageAlt || article.title}
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
              sizes="160px"
            />
          ) : (
            <div className="absolute inset-0 bg-gray-100" />
          )}
        </div>
        {/* Text */}
        <div className="p-4 flex flex-col flex-1 min-w-0" style={{ borderLeft: `3px solid ${catColor}` }}>
          <span className="category-badge mb-2" style={{ background: catColor, alignSelf: 'flex-start' }}>
            {article.category}
          </span>
          <h2 className="font-black text-gray-900 group-hover:text-[#cc0000] transition-colors leading-snug text-base sm:text-lg line-clamp-3 mb-2">
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

/* ── Standard card — white card, portrait image, text below ── */
export default function ArticleCard({ article, size = 'normal', layout = 'vertical', showExcerpt = true }) {
  if (!article) return null;

  const catSlug = article.category?.toLowerCase().replace(/\s+/g, '-') || '';
  const { color: catColor } = getCategoryConfig(catSlug);

  if (layout === 'horizontal') return <HorizontalCard article={article} catColor={catColor} />;

  return (
    <Link href={`/article/${article.slug}`} className="group block article-card h-full">
      <div className="bg-white rounded-xl overflow-hidden h-full flex flex-col" style={{ border: '1px solid #e8e8e8', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>

        {/* Category colour top accent */}
        <div style={{ height: '3px', background: catColor, flexShrink: 0 }} />

        {/* Landscape image — fixed height, face shown via object-top */}
        <div className="relative overflow-hidden flex-shrink-0 bg-gray-100" style={{ height: '200px', width: '100%' }}>
          {article.image ? (
            <Image
              src={article.image}
              alt={article.imageAlt || article.title}
              fill
              className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50">
              <svg className="w-10 h-10 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {article.category && (
            <div className="absolute top-3 left-3">
              <span className="category-badge" style={{ background: catColor }}>{article.category}</span>
            </div>
          )}
        </div>

        {/* Text */}
        <div className="p-3 flex flex-col flex-1">
          <h2 className="font-black text-gray-900 group-hover:text-[#cc0000] transition-colors leading-snug line-clamp-3 text-sm sm:text-[15px] mb-1">
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
