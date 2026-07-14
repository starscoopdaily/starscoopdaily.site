/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  async redirects() {
    return [
      // www redirect — requires both starscoopdaily.site and www.starscoopdaily.site in Vercel domains
      {
        source: '/(.*)',
        has: [{ type: 'host', value: 'starscoopdaily.site' }],
        destination: 'https://www.starscoopdaily.site/:path*',
        permanent: true,
      },
      // Legacy HTML URLs
      { source: '/about.html', destination: '/about', permanent: true },
      { source: '/article.html', destination: '/', permanent: true },
      { source: '/privacy-policy.html', destination: '/privacy-policy', permanent: true },
      { source: '/terms-and-conditions.html', destination: '/terms', permanent: true },
      { source: '/disclaimer.html', destination: '/disclaimer', permanent: true },
      { source: '/contact.html', destination: '/contact', permanent: true },
      { source: '/category.html', destination: '/', permanent: true },
    ];
  },
};

module.exports = nextConfig;
