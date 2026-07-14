export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: 'https://www.starscoopdaily.site/sitemap.xml',
    host: 'https://www.starscoopdaily.site',
  };
}
