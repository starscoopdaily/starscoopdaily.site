import Link from 'next/link';
import Image from 'next/image';
import { getCategoryConfig } from '@/lib/categories';

export default function ArticleCard({ article, size = 'normal', showExcerpt = true }) {
  if (!article) return null;

  const isLarge = size === 'large';
  const catSlug = article.category?.toLowerCase().replace(/\s+/g, '-') || '';
  const { color: catColor } = getCategoryConfig(catSlug);

  return (
    <Link href={`/article/${article.slug}`} className="group block article-card h-full">
      <div
        className="bg-white rounded-xl overflow-hidden h-full flex flex-col"
        style={{ border: '1px solid #eee', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
      >
        {/* Top accent line in category color */}
        <div style={{ height: '3px', background: catColor, flexShrink: 0 }} />

        {/* Image */}
        <div className={`relative overflow-hidden flex-shrink-0 bg-gray-900 ${isLarge ? 'h-64 sm:h-80' : 'h-52'}`}>
          {article.image ? (
            <>
              {/* Blurred background — same image, zoomed + blurred to fill space */}
              <Image
                src={article.image}
                alt=""
                fill
                aria-hidden="true"
                className="object-cover scale-110 blur-2xl brightness-90 opacity-80"
                sizes="50vw"
              />
              {/* Main image — full portrait, no crop */}
              <Image
                src={article.image}
                alt={article.imageAlt || article.title}
                fill
                className="object-contain relative z-10 group-hover:scale-105 transition-transform duration-500"
                sizes={isLarge ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Category badge */}
          {article.category && (
            <div className="absolute top-3 left-3 z-20">
              <span className="category-badge" style={{ background: catColor }}>
                {article.category}
              </span>
            </div>
          )}

          {/* Star rating badge — movie reviews */}
          {article.movieRating && (
            <div className="absolute bottom-3 right-3 z-20 bg-black/75 text-yellow-400 text-xs font-black px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
              <span>★</span>
              <span>{article.movieRating}/5</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h2
            className={`font-black text-gray-900 group-hover:text-[#cc0000] transition-colors leading-snug mb-2 line-clamp-3 ${
              isLarge ? 'text-xl sm:text-2xl' : 'text-base sm:text-[17px]'
            }`}
          >
            {article.title}
          </h2>

          {showExcerpt && article.excerpt && (
            <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-2 flex-1">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-3 border-t border-gray-50">
            <span className="font-medium">{article.author || 'StarScoop Daily Staff'}</span>
            <span>
              {article.date
                ? new Date(article.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : ''}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
