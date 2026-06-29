import { getAllArticles, getAllCategories } from '@/lib/articles';

export default function sitemap() {
  const baseUrl = 'https://starscoopdaily.site';

  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${baseUrl}/privacy-policy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/disclaimer`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  let articlePages = [];
  let categoryPages = [];

  try {
    const articles = getAllArticles();
    articlePages = articles.map((article) => ({
      url: `${baseUrl}/article/${article.slug}`,
      lastModified: new Date(article.date),
      changeFrequency: 'weekly',
      priority: article.featured ? 0.9 : 0.8,
    }));

    const categories = getAllCategories();
    categoryPages = categories.map((cat) => ({
      url: `${baseUrl}/category/${cat.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    }));
  } catch {
    // No articles yet
  }

  return [...staticPages, ...articlePages, ...categoryPages];
}
