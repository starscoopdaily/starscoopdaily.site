import Link from 'next/link';
import AdSlot from '@/components/AdSlot';

const CATEGORIES = [
  { label: 'Celebrity', href: '/category/celebrity' },
  { label: 'Hollywood', href: '/category/hollywood' },
  { label: 'Bollywood', href: '/category/bollywood' },
  { label: 'British Royals', href: '/category/british-royals' },
  { label: 'TV Shows', href: '/category/tv-shows' },
  { label: 'Web Series', href: '/category/web-series' },
  { label: 'Music', href: '/category/music' },
  { label: 'Movies', href: '/category/movies' },
  { label: 'Ending Explained', href: '/category/ending-explained' },
  { label: 'Where to Watch', href: '/category/where-to-watch' },
  { label: 'Relationships', href: '/category/relationships' },
  { label: 'Fashion', href: '/category/fashion' },
  { label: 'Pop Culture', href: '/category/pop-culture' },
];

const LEGAL_LINKS = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Disclaimer', href: '/disclaimer' },
  { label: 'DMCA', href: '/dmca' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="bg-white py-4 flex justify-center">
        <AdSlot slot="footer" />
      </div>
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#cc0000] text-white font-black text-lg px-2 py-0.5 rounded">★</div>
              <div>
                <div className="text-white font-black text-xl leading-none">StarScoop Daily</div>
                <div className="text-gray-400 text-xs tracking-widest uppercase">Celebrity News</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4 max-w-xs">
              Your #1 source for the latest celebrity news, Bollywood gossip, Hollywood scoops, and
              entertainment breaking news from around the world.
            </p>
            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { label: 'Twitter/X', icon: 'M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.23H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.614L18.244 2.25z', href: 'https://x.com/StarScoop_Daily' },
                { label: 'Facebook', icon: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z', href: 'https://facebook.com/starscoopdaily' },
                { label: 'Instagram', icon: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z', href: 'https://instagram.com/starscoopdaily' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-9 h-9 bg-gray-700 hover:bg-[#cc0000] rounded-full flex items-center justify-center transition-colors"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">
              Categories
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.href}>
                  <Link
                    href={cat.href}
                    className="text-gray-400 hover:text-[#ff4444] text-sm transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 border-b border-gray-700 pb-2">
              Company
            </h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-[#ff4444] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-500">
                Contact:{' '}
                <a
                  href="mailto:contact@starscoopdaily.site"
                  className="hover:text-gray-300 transition-colors"
                >
                  contact@starscoopdaily.site
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-gray-500 text-xs text-center sm:text-left">
            © {year} StarScoop Daily. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs">
            Entertainment news for informational purposes only.
          </p>
        </div>
      </div>
    </footer>
  );
}
