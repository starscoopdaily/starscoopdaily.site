import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getArticleBySlug, getAllArticles, getRelatedArticles } from '@/lib/articles';
import { getCategoryConfig } from '@/lib/categories';
import Sidebar from '@/components/Sidebar';
import ArticleCard from '@/components/ArticleCard';
import AdSlot from '@/components/AdSlot';
import StickyArticleBar from '@/components/StickyArticleBar';

function splitAtParagraph(html, n) {
  let count = 0;
  let i = 0;
  while (i < html.length && count < n) {
    const pos = html.indexOf('</p>', i);
    if (pos === -1) break;
    count++;
    i = pos + 4;
  }
  return [html.slice(0, i), html.slice(i)];
}

export async function generateStaticParams() {
  try {
    const articles = getAllArticles();
    return articles.map((a) => ({ slug: a.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const article = getArticleBySlug(params.slug);
  if (!article) return { title: 'Article Not Found' };

  return {
    title: article.title,
    description: article.metaDescription || article.excerpt?.slice(0, 160),
    keywords: article.tags?.join(', '),
    alternates: {
      canonical: `https://www.starscoopdaily.site/article/${article.slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.metaDescription || article.excerpt?.slice(0, 160),
      url: `https://www.starscoopdaily.site/article/${article.slug}`,
      siteName: 'StarScoop Daily',
      images: article.image ? [{ url: article.image, alt: article.imageAlt?.slice(0, 100) || article.title.slice(0, 100) }] : [],
      type: 'article',
      publishedTime: article.date,
      authors: [article.author],
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.metaDescription || article.excerpt?.slice(0, 160),
      images: article.image ? [article.image] : [],
    },
  };
}

function ShareButtons({ title, slug }) {
  const url = `https://www.starscoopdaily.site/article/${slug}`;
  const encoded = encodeURIComponent(url);
  const titleEncoded = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2 my-6">
      <span className="text-sm font-bold text-gray-600 uppercase tracking-wider">Share:</span>
      <a
        href={`https://twitter.com/intent/tweet?url=${encoded}&text=${titleEncoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 bg-black text-white text-xs font-bold px-4 py-2 rounded hover:bg-gray-800 transition-colors"
      >
        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.23H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.614L18.244 2.25z" />
        </svg>
        Twitter
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 bg-[#1877f2] text-white text-xs font-bold px-4 py-2 rounded hover:bg-[#166fe5] transition-colors"
      >
        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        Facebook
      </a>
      <a
        href={`https://wa.me/?text=${titleEncoded}%20${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 bg-[#25d366] text-white text-xs font-bold px-4 py-2 rounded hover:bg-[#20bd5a] transition-colors"
      >
        <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896.001-3.176-1.24-6.165-3.48-8.45z" />
        </svg>
        WhatsApp
      </a>
    </div>
  );
}

export default function ArticlePage({ params }) {
  const article = getArticleBySlug(params.slug);
  if (!article) notFound();

  const related = getRelatedArticles(article.slug, article.category, 3);
  const catSlug = article.category?.toLowerCase().replace(/\s+/g, '-') || '';
  const { color: catColor } = getCategoryConfig(catSlug);

  // Split content for in-content ads at paragraph 3 and paragraph 7
  const [contentPart1, contentRest] = splitAtParagraph(article.content || '', 3);
  const [contentPart2, contentPart3] = splitAtParagraph(contentRest, 4);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    image: article.image ? [article.image] : [],
    datePublished: article.date,
    dateModified: article.date,
    author: [{ '@type': 'Organization', name: article.author }],
    publisher: {
      '@type': 'Organization',
      name: 'StarScoop Daily',
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.starscoopdaily.site/opengraph-image',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://www.starscoopdaily.site/article/${article.slug}`,
    },
    keywords: article.tags?.join(', '),
  };

  return (
    <>
      <StickyArticleBar title={article.title} slug={article.slug} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Image */}
      {article.image && (
        <div className="relative w-full bg-gray-900" style={{ height: 'min(80vh, 560px)', minHeight: '320px' }}>
          {/* Blur backdrop — fills dead space for portrait images */}
          <Image
            src={article.image}
            alt=""
            fill
            aria-hidden="true"
            className="object-cover scale-110 blur-2xl brightness-75 opacity-70"
            sizes="100vw"
          />
          {/* Main image — object-contain shows full portrait without cropping */}
          <Image
            src={article.image}
            alt={article.imageAlt || article.title}
            fill
            className="object-contain relative z-10"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-20" />
        </div>
      )}

      {/* Article + Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Article */}
          <article className="lg:col-span-2">
            {/* Category + Date */}
            <div className="flex items-center flex-wrap gap-2 mb-4">
              {article.category && (
                <Link
                  href={`/category/${catSlug}`}
                  className="category-badge transition-colors"
                  style={{ background: catColor }}
                >
                  {article.category}
                </Link>
              )}
              {article.tags?.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-[2.6rem] font-black text-gray-900 leading-tight mb-4" style={{ letterSpacing: '-0.3px' }}>
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-lg sm:text-xl text-gray-600 leading-relaxed pl-5 mb-6" style={{ borderLeft: `4px solid ${catColor}`, fontWeight: 500 }}>
                {article.excerpt}
              </p>
            )}

            {/* Meta */}
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 bg-[#cc0000] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-black">S</span>
              </div>
              <div>
                <span className="font-semibold text-gray-800">{article.author}</span>
                <span className="mx-2">•</span>
                <span>
                  {article.date &&
                    new Date(article.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                </span>
              </div>
            </div>

            {/* Share */}
            <ShareButtons title={article.title} slug={article.slug} />

            {/* Article Content with in-content ads */}
            {article.articleType === 'list' ? (
              <div className="list-article-content">
                {article.intro && (
                  <div className="article-content mb-8" dangerouslySetInnerHTML={{ __html: article.intro }} />
                )}
                <div className="space-y-10">
                  {article.items?.map((item, idx) => (
                    <>
                      <div key={idx} className="border-b border-gray-100 pb-10 last:border-0 last:pb-0">
                        <div className="flex items-start gap-4 mb-4">
                          <span className="text-4xl sm:text-5xl font-black leading-none flex-shrink-0 w-14 sm:w-16 text-center tabular-nums" style={{ color: catColor }}>
                            {String(item.number).padStart(2, '0')}
                          </span>
                          <div className="pt-1">
                            <h2 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">{item.name}</h2>
                            {item.subtitle && (
                              <p className="font-semibold text-sm mt-1" style={{ color: catColor }}>{item.subtitle}</p>
                            )}
                          </div>
                        </div>
                        {item.image && (
                          <div className="relative w-full h-52 sm:h-72 rounded-xl overflow-hidden mb-5">
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 66vw"
                            />
                          </div>
                        )}
                        {item.description && (
                          <div className="article-content" dangerouslySetInnerHTML={{ __html: item.description }} />
                        )}
                      </div>
                      {idx === 2 && <AdSlot slot="article-top" />}
                      {idx === 6 && <AdSlot slot="article-middle" />}
                    </>
                  ))}
                </div>
                {article.conclusion && (
                  <div className="article-content mt-8 pt-8 border-t border-gray-100" dangerouslySetInnerHTML={{ __html: article.conclusion }} />
                )}
              </div>
            ) : (
              <>
                <div className="article-content" dangerouslySetInnerHTML={{ __html: contentPart1 }} />
                <AdSlot slot="article-top" />
                <div className="article-content" dangerouslySetInnerHTML={{ __html: contentPart2 }} />
                <AdSlot slot="article-middle" />
                <div className="article-content" dangerouslySetInnerHTML={{ __html: contentPart3 }} />
              </>
            )}

            {/* Tags */}
            {article.tags?.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full hover:bg-red-50 hover:text-[#cc0000] transition-colors cursor-default"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share (bottom) */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <ShareButtons title={article.title} slug={article.slug} />
            </div>

            {/* Related Articles */}
            {related.length > 0 && (
              <div className="mt-10">
                <div className="flex items-center gap-3 mb-5">
                  <h2 className="text-lg font-black uppercase tracking-tight">Related Stories</h2>
                  <div className="flex-1 h-px bg-[#cc0000]"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {related.map((rel) => (
                    <ArticleCard key={rel.slug} article={rel} showExcerpt={false} />
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <div>
            <Sidebar adContent={<AdSlot slot="sidebar" />} />
          </div>
        </div>
      </div>
    </>
  );
}
