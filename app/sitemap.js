import { getAllArticles, getAllCategories } from '@/lib/articles';
import { ALL_KNOWN_CATEGORIES } from '@/lib/categories';

export default function sitemap() {
  const baseUrl = 'https://www.starscoopdaily.site';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  // All known category pages — included even if no articles yet so Google indexes them
  const knownCategoryPages = ALL_KNOWN_CATEGORIES.map((slug) => ({
    url: `${baseUrl}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  let articlePages = [];
  let extraCategoryPages = [];

  try {
    const articles = getAllArticles();
    articlePages = articles.map((article) => ({
      url: `${baseUrl}/article/${article.slug}`,
      lastModified: new Date(article.date),
      changeFrequency: 'weekly',
      priority: article.featured ? 0.9 : 0.8,
    }));

    // Any categories from articles not already in the known list
    const knownSlugs = new Set(ALL_KNOWN_CATEGORIES);
    const articleCats = getAllCategories();
    extraCategoryPages = articleCats
      .map((cat) => cat.toLowerCase().replace(/\s+/g, '-'))
      .filter((slug) => !knownSlugs.has(slug))
      .map((slug) => ({
        url: `${baseUrl}/category/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      }));
  } catch {
    // No articles yet
  }

  return [...staticPages, ...knownCategoryPages, ...extraCategoryPages, ...articlePages];
}
