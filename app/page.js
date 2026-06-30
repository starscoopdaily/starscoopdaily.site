import Link from 'next/link';
import Image from 'next/image';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';
import NewsletterSignup from '@/components/NewsletterSignup';
import AdSlot from '@/components/AdSlot';
import {
  getFeaturedArticle,
  getLatestArticles,
  getArticlesByCategory,
} from '@/lib/articles';

export const metadata = {
  title: 'StarScoop Daily — Celebrity News, Bollywood, Hollywood & Entertainment',
  description:
    'StarScoop Daily is your #1 source for the latest celebrity news, Bollywood gossip, Hollywood scoops, TV show updates, and breaking entertainment news.',
  openGraph: {
    title: 'StarScoop Daily — Celebrity News & Entertainment',
    description: 'Latest celebrity news, Bollywood, Hollywood and entertainment news.',
    url: 'https://starscoopdaily.site',
    siteName: 'StarScoop Daily',
    type: 'website',
  },
};

const CATEGORY_SECTIONS = ['Bollywood', 'Hollywood', 'TV Shows', 'Music'];

export default function HomePage() {
  const featured = getFeaturedArticle();
  const latest = getLatestArticles(6);
  const categorySections = CATEGORY_SECTIONS.map((cat) => ({
    name: cat,
    articles: getArticlesByCategory(cat).slice(0, 3),
  })).filter((s) => s.articles.length > 0);

  return (
    <>
      {/* Hero Featured Article */}
      {featured && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
          <Link href={`/article/${featured.slug}`} className="group block">
            <div className="relative rounded-xl overflow-hidden h-80 sm:h-[28rem] bg-gray-200 shadow-xl">
              {featured.image && (
                <Image
                  src={featured.image}
                  alt={featured.imageAlt || featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                  priority
                  sizes="100vw"
                />
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-[#cc0000] text-white text-xs font-black uppercase px-3 py-1 rounded tracking-wider pulse-red">
                    Featured
                  </span>
                  {featured.category && (
                    <span className="bg-white/20 backdrop-blur text-white text-xs font-semibold uppercase px-3 py-1 rounded tracking-wider">
                      {featured.category}
                    </span>
                  )}
                </div>
                <h1 className="text-white font-black text-xl sm:text-3xl lg:text-4xl leading-tight mb-3 max-w-3xl group-hover:text-red-100 transition-colors">
                  {featured.title}
                </h1>
                <p className="text-gray-200 text-sm sm:text-base line-clamp-2 max-w-2xl hidden sm:block">
                  {featured.excerpt}
                </p>
                <div className="flex items-center gap-3 mt-3 text-gray-300 text-xs">
                  <span>{featured.author}</span>
                  <span>•</span>
                  <span>
                    {featured.date &&
                      new Date(featured.date).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* Main Content + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Latest Articles Grid */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                Latest News
              </h2>
              <div className="flex-1 h-px bg-[#cc0000]"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {latest.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>

            {/* Homepage Top Ad */}
            <div className="mt-6">
              <AdSlot slot="homepage-top" />
            </div>

            {/* Category Sections */}
            {categorySections.map((section) => (
              <div key={section.name} className="mt-10">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                      {section.name}
                    </h2>
                    <div className="flex-1 h-px bg-gray-200 w-16"></div>
                  </div>
                  <Link
                    href={`/category/${section.name.toLowerCase().replace(' ', '-')}`}
                    className="text-[#cc0000] text-sm font-semibold hover:underline whitespace-nowrap"
                  >
                    See All →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {section.articles.map((article) => (
                    <ArticleCard key={article.slug} article={article} showExcerpt={false} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div>
            <Sidebar adContent={<AdSlot slot="sidebar" />} />
          </div>
        </div>
      </div>

      {/* Newsletter */}
      <NewsletterSignup />
    </>
  );
}
