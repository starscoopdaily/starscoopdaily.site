import Link from 'next/link';
import Image from 'next/image';
import ArticleCard from '@/components/ArticleCard';
import NewsletterSignup from '@/components/NewsletterSignup';
import AdSlot from '@/components/AdSlot';
import { getCategoryConfig } from '@/lib/categories';
import { getFeaturedArticle, getLatestArticles, getArticlesByCategory } from '@/lib/articles';

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

const CATEGORY_SECTIONS = ['Hollywood', 'British Royals', 'Bollywood', 'TV Shows', 'Music', 'Fashion', 'Pop Culture'];

function SectionHeading({ name, slug, color, icon }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-1 h-7 rounded-full flex-shrink-0" style={{ background: color }} />
        {icon && <span className="text-lg leading-none">{icon}</span>}
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{name}</h2>
      </div>
      <Link
        href={`/category/${slug}`}
        className="text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full transition-colors"
        style={{ color, border: `1.5px solid ${color}` }}
      >
        See All →
      </Link>
    </div>
  );
}

export default function HomePage() {
  const featured = getFeaturedArticle();
  const latest = getLatestArticles(8);
  const categorySections = CATEGORY_SECTIONS.map((cat) => ({
    name: cat,
    articles: getArticlesByCategory(cat).slice(0, 3),
  })).filter((s) => s.articles.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6">

      {/* ── Hero Featured Article ── */}
      {featured && (
        <section className="pt-6 pb-4">
          <Link href={`/article/${featured.slug}`} className="group block">
            <div className="relative rounded-2xl overflow-hidden bg-gray-900 shadow-xl isolate" style={{ aspectRatio: '16/7', minHeight: '240px' }}>
              {featured.image && (
                <Image
                  src={featured.image}
                  alt={featured.imageAlt || featured.title}
                  fill
                  className="object-cover object-top group-hover:scale-105 transition-transform duration-700"
                  priority
                  sizes="100vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-30 flex gap-2">
                <span style={{ background: '#cc0000', color: '#fff', fontWeight: 700, padding: '4px 12px', borderRadius: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Featured
                </span>
                {featured.category && (
                  <span style={{ background: 'rgba(0,0,0,0.65)', color: '#fff', fontWeight: 700, padding: '4px 12px', borderRadius: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {featured.category}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 z-20">
                <h1 className="text-white font-black text-xl sm:text-3xl lg:text-4xl leading-tight mb-2 max-w-4xl group-hover:text-red-100 transition-colors" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.4)' }}>
                  {featured.title}
                </h1>
                <p className="text-gray-300 text-sm hidden sm:block max-w-2xl line-clamp-1">{featured.excerpt}</p>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* ── Trending Now — horizontal scroll chips ── */}
      {latest.length > 0 && (
        <section className="py-3 border-b border-gray-100">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-1">
            <span className="flex-shrink-0 text-xs font-black text-white uppercase tracking-widest bg-[#cc0000] px-3 py-1.5 rounded">
              🔥 Trending
            </span>
            {latest.slice(0, 6).map((a, i) => (
              <Link
                key={a.slug}
                href={`/article/${a.slug}`}
                className="flex-shrink-0 flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-[#cc0000] transition-colors whitespace-nowrap"
              >
                <span className="font-black text-gray-300">{String(i + 1).padStart(2, '0')}</span>
                {a.title.length > 45 ? a.title.slice(0, 45) + '…' : a.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Latest News — portrait card grid ── */}
      {latest.length > 0 && (
        <section className="py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-7 rounded-full bg-[#cc0000] flex-shrink-0" />
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Latest News</h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* 4-column portrait grid — cards are tall with full portrait images */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {latest.map((article) => (
              <ArticleCard key={article.slug} article={article} showExcerpt={false} />
            ))}
          </div>

          <div className="mt-6">
            <AdSlot slot="homepage-top" />
          </div>
        </section>
      )}

      {/* ── Category Sections ── */}
      {categorySections.map((section) => {
        const slug = section.name.toLowerCase().replace(/\s+/g, '-');
        const { color, icon } = getCategoryConfig(slug);
        const count = section.articles.length;

        return (
          <section key={section.name} className="py-6 border-t border-gray-100">
            <SectionHeading name={section.name} slug={slug} color={color} icon={icon} />

            {count === 1 ? (
              /* Single article — horizontal wide card */
              <ArticleCard article={section.articles[0]} layout="horizontal" />
            ) : (
              /* 2 or 3 articles — matching columns */
              <div className={`grid grid-cols-2 ${count === 3 ? 'sm:grid-cols-3' : ''} gap-4`}>
                {section.articles.map((article) => (
                  <ArticleCard key={article.slug} article={article} showExcerpt={false} />
                ))}
              </div>
            )}
          </section>
        );
      })}

      {/* ── Newsletter ── */}
      <div className="py-6 border-t border-gray-100">
        <NewsletterSignup />
      </div>

    </div>
  );
}
