import Link from 'next/link';
import Image from 'next/image';

export default function ArticleCard({ article, size = 'normal', showExcerpt = true }) {
  if (!article) return null;

  const isLarge = size === 'large';

  return (
    <Link href={`/article/${article.slug}`} className="group block article-card">
      <div className={`bg-white border border-gray-100 rounded-lg overflow-hidden h-full ${isLarge ? 'shadow-md' : ''}`}>
        {/* Image */}
        <div className={`relative overflow-hidden ${isLarge ? 'h-64 sm:h-80' : 'h-48'} bg-gray-100`}>
          {article.image ? (
            <Image
              src={article.image}
              alt={article.imageAlt || article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes={isLarge ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Category Badge over image */}
          {article.category && (
            <div className="absolute top-3 left-3">
              <span className="category-badge">{article.category}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`p-4 ${isLarge ? 'p-5' : ''}`}>
          <h2
            className={`font-bold text-gray-900 group-hover:text-[#cc0000] transition-colors leading-snug mb-2 ${
              isLarge ? 'text-xl sm:text-2xl' : 'text-base sm:text-lg'
            }`}
          >
            {article.title}
          </h2>

          {showExcerpt && article.excerpt && (
            <p className="text-gray-500 text-sm leading-relaxed mb-3 line-clamp-2">
              {article.excerpt}
            </p>
          )}

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>{article.author || 'StarScoop Daily Staff'}</span>
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
