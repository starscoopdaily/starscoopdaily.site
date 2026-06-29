import Link from 'next/link';

export const metadata = { title: 'Page Not Found' };

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="text-8xl font-black text-[#cc0000] mb-4">404</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">Page Not Found</h1>
      <p className="text-gray-500 mb-8 max-w-md">
        The celebrity scoop you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <Link
        href="/"
        className="bg-[#cc0000] text-white px-8 py-3 rounded font-semibold hover:bg-[#aa0000] transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
