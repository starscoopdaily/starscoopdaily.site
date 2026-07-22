import Link from 'next/link';
import { getSmartLink } from '@/lib/adConfig';

export const metadata = { title: 'Page Not Found' };

export default function NotFound() {
  const smartlink = getSmartLink();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl font-black text-[#cc0000] mb-4">404</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        The celebrity scoop you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        {smartlink && (
          <a
            href={smartlink}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-black py-4 px-6 rounded-xl text-base transition-all group shadow-lg"
          >
            <span className="text-xl">🎬</span>
            <span>Watch Exclusive Content</span>
            <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </a>
        )}
        <Link
          href="/"
          className="bg-[#cc0000] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#aa0000] transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
