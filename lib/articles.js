import fs from 'fs';
import path from 'path';

const articlesDir = path.join(process.cwd(), 'data', 'articles');

function getArticlesDir() {
  if (!fs.existsSync(articlesDir)) {
    fs.mkdirSync(articlesDir, { recursive: true });
  }
  return articlesDir;
}

export function getAllArticles() {
  const dir = getArticlesDir();
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
  const articles = files
    .map((file) => {
      try {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        return JSON.parse(content);
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  return articles.sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getArticleBySlug(slug) {
  const filePath = path.join(articlesDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

export function getArticlesByCategory(category) {
  const all = getAllArticles();
  return all.filter(
    (a) => a.category?.toLowerCase() === category.toLowerCase()
  );
}

export function getFeaturedArticle() {
  const all = getAllArticles();
  return all.find((a) => a.featured) || all[0] || null;
}

export function getLatestArticles(count = 6) {
  return getAllArticles().slice(0, count);
}

export function getRelatedArticles(slug, category, count = 4) {
  const all = getAllArticles();
  return all
    .filter((a) => a.slug !== slug && a.category === category)
    .slice(0, count);
}

export function getAllCategories() {
  const all = getAllArticles();
  const cats = [...new Set(all.map((a) => a.category).filter(Boolean))];
  return cats;
}

export function getSiteConfig() {
  const configPath = path.join(process.cwd(), 'data', 'site-config.json');
  if (!fs.existsSync(configPath)) {
    return { breakingTicker: [], trendingArticles: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch {
    return { breakingTicker: [], trendingArticles: [] };
  }
}

export function getTrendingArticles(count = 5) {
  const config = getSiteConfig();
  const all = getAllArticles();
  if (config.trendingArticles?.length) {
    const slugs = config.trendingArticles.slice(0, count);
    const found = slugs.map((s) => all.find((a) => a.slug === s)).filter(Boolean);
    if (found.length) return found;
  }
  return all.slice(0, count);
}
