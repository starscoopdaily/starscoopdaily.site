import { notFound } from 'next/navigation';
import { getArticlesByCategory, getAllCategories } from '@/lib/articles';
import { getCategoryConfig, ALL_KNOWN_CATEGORIES } from '@/lib/categories';
import ArticleCard from '@/components/ArticleCard';
import Sidebar from '@/components/Sidebar';
import AdSlot from '@/components/AdSlot';

export async function generateStaticParams() {
  const KNOWN_CATEGORIES = ALL_KNOWN_CATEGORIES;
  try {
    const cats = getAllCategories();
    const all = [...new Set([...KNOWN_CATEGORIES, ...cats.map((c) => c.toLowerCase().replace(/\s+/g, '-'))])];
    return all.map((name) => ({ name }));
  } catch {
    return KNOWN_CATEGORIES.map((name) => ({ name }));
  }
}

function prettifyCategory(name) {
  return name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }) {
  const pretty = prettifyCategory(params.name);
  return {
    title: `${pretty} News — StarScoop Daily`,
    description: `Latest ${pretty} news, gossip, and stories — updated daily on StarScoop Daily.`,
    openGraph: {
      title: `${pretty} News`,
      description: `Latest ${pretty} news and gossip on StarScoop Daily.`,
      type: 'website',
    },
  };
}

export default function CategoryPage({ params }) {
  const { name } = params;
  const pretty = prettifyCategory(name);
  const { color, icon, description: catDesc } = getCategoryConfig(name);

  // Normalize category name for matching
  const normalized = pretty.replace(/-/g, ' ');
  let articles = [];
  try {
    articles = getArticlesByCategory(normalized);
    if (articles.length === 0) articles = getArticlesByCategory(pretty);
  } catch {}

  const description = catDesc || `Latest ${pretty} news and entertainment.`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Category Header */}
      <div className="rounded-xl p-6 sm:p-8 mb-8 text-white" style={{ background: `linear-gradient(135deg, ${color} 0%, rgba(0,0,0,0.25) 100%), ${color}` }}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{icon}</span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">{pretty}</h1>
            <p className="text-white/80 text-sm mt-1">{description}</p>
          </div>
        </div>
        <p className="text-white/70 text-sm mt-3">
          {articles.length} article{articles.length !== 1 ? 's' : ''} in this category
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Articles Grid */}
        <div className="lg:col-span-2">
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {articles.map((article) => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">{icon}</div>
              <h2 className="text-xl font-bold text-gray-700 mb-2">No articles yet</h2>
              <p className="text-gray-400 text-sm mb-6">
                Check back soon — new {pretty} stories are on the way!
              </p>
              <a href="/" className="text-[#cc0000] font-semibold hover:underline">
                ← Back to Home
              </a>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <Sidebar adContent={<AdSlot slot="sidebar" />} />
        </div>
      </div>
    </div>
  );
}
