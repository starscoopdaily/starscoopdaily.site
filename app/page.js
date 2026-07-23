import Link from 'next/link';
import Image from 'next/image';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';
import HeroCarousel from '@/components/HeroCarousel';
import NewsletterSignup from '@/components/NewsletterSignup';
import AdSlot from '@/components/AdSlot';
import { getCategoryConfig } from '@/lib/categories';
import { getLatestArticles, getArticlesByCategory } from '@/lib/articles';

export const metadata = {
  title: 'StarScoop Daily — Celebrity News, Hollywood, British Royals & Entertainment',
  description:
    'StarScoop Daily is your #1 source for the latest celebrity news, Hollywood scoops, British Royals gossip, UK celebrity news, and breaking entertainment news.',
  openGraph: {
    title: 'StarScoop Daily — Celebrity News, Hollywood & British Royals',
    description: 'Latest celebrity news, Hollywood, British Royals and UK entertainment news.',
    url: 'https://www.starscoopdaily.site',
    siteName: 'StarScoop Daily',
    type: 'website',
  },
};

const CATEGORY_SECTIONS = ['Hollywood', 'British Royals', 'Bollywood', 'TV Shows', 'Web Series', 'Music', 'Movies', 'Ending Explained', 'Where to Watch', 'Relationships', 'Fashion', 'Pop Culture'];

export default function HomePage() {
  const latest = getLatestArticles(6);
  const heroArticles = getLatestArticles(12).filter((a) => a.image).slice(0, 5);
  const categorySections = CATEGORY_SECTIONS.map((cat) => ({
    name: cat,
    articles: getArticlesByCategory(cat).slice(0, 3),
  })).filter((s) => s.articles.length > 0);

  return (
    <>
      {/* Hero Carousel */}
      {heroArticles.length > 0 && <HeroCarousel articles={heroArticles} />}

      {/* Mobile-only ad — below hero, above trending */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 sm:px-6 mt-4 flex flex-col items-center gap-1">
        <p className="text-[10px] uppercase tracking-widest text-gray-300 font-semibold">Advertisement</p>
        <AdSlot slot="homepage-top" />
      </div>

      {/* Trending Now Rail */}
      {latest.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-black text-gray-900 uppercase tracking-widest">🔥 Trending Now</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {latest.slice(0, 5).map((article, idx) => (
              <Link
                key={article.slug}
                href={`/article/${article.slug}`}
                className="flex-shrink-0 w-40 sm:w-48 group"
              >
                <div className="relative h-28 sm:h-32 rounded-xl overflow-hidden bg-gray-200">
                  {article.image && (
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="200px"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <span
                    className="absolute top-2 left-3 text-4xl font-black leading-none select-none"
                    style={{ color: 'rgba(255,255,255,0.9)', WebkitTextStroke: '1px rgba(0,0,0,0.35)', textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
                  >
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                </div>
                <p className="mt-2 text-xs font-bold text-gray-800 leading-snug line-clamp-2 group-hover:text-[#cc0000] transition-colors">
                  {article.title}
                </p>
              </Link>
            ))}
          </div>
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
              <div className="flex-1 h-0.5 bg-[#cc0000]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {latest.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>

            {/* Category Sections — first 2 */}
            {categorySections.slice(0, 2).map((section) => {
              const slug = section.name.toLowerCase().replace(/\s+/g, '-');
              const { color, icon } = getCategoryConfig(slug);
              return (
                <div key={section.name} className="mt-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{icon}</span>
                      <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                        {section.name}
                      </h2>
                      <div className="h-px w-16" style={{ background: color }} />
                    </div>
                    <Link
                      href={`/category/${slug}`}
                      className="text-sm font-semibold hover:underline whitespace-nowrap"
                      style={{ color }}
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
              );
            })}

            {/* Mid-page ad — between category sections */}
            <div className="mt-10 border-t border-b border-gray-100 py-4 flex flex-col items-center gap-1">
              <p className="text-[10px] uppercase tracking-widest text-gray-300 font-semibold">Advertisement</p>
              <AdSlot slot="homepage-top" />
            </div>

            {/* Category Sections — remaining */}
            {categorySections.slice(2).map((section) => {
              const slug = section.name.toLowerCase().replace(/\s+/g, '-');
              const { color, icon } = getCategoryConfig(slug);
              return (
                <div key={section.name} className="mt-10">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{icon}</span>
                      <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                        {section.name}
                      </h2>
                      <div className="h-px w-16" style={{ background: color }} />
                    </div>
                    <Link
                      href={`/category/${slug}`}
                      className="text-sm font-semibold hover:underline whitespace-nowrap"
                      style={{ color }}
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
              );
            })}
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
