export const metadata = {
  title: 'About Us — StarScoop Daily',
  description:
    'Learn about StarScoop Daily — your trusted source for celebrity news, Bollywood gossip, Hollywood updates, and entertainment news from around the world.',
};

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <span className="category-badge mb-3 inline-block">About</span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">About StarScoop Daily</h1>
        <div className="h-1 w-16 bg-[#cc0000] rounded"></div>
      </div>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
        <p className="text-lg">
          <strong>StarScoop Daily</strong> is a premier entertainment news destination delivering the latest celebrity
          gossip, Bollywood and Hollywood scoops, TV show updates, music news, and relationship stories — all in one
          place.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Our Mission</h2>
        <p>
          At StarScoop Daily, our mission is simple: deliver fast, accurate, and engaging entertainment news to fans
          across India, the United States, and the world. We cover the stars you love — from Bollywood royalty to
          Hollywood icons — with the speed and excitement that celebrity culture deserves.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">What We Cover</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Celebrity News:</strong> The latest from the world&apos;s biggest stars</li>
          <li><strong>Bollywood:</strong> Film announcements, actor updates, and industry gossip from India</li>
          <li><strong>Hollywood:</strong> Box office news, award shows, and A-list drama</li>
          <li><strong>TV Shows:</strong> Netflix, Prime, Hotstar, HBO, and more</li>
          <li><strong>Music:</strong> New releases, tours, and chart-toppers</li>
          <li><strong>Relationships:</strong> Couples, breakups, and celebrity romance</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Our Commitment</h2>
        <p>
          We are committed to responsible reporting. All stories published on StarScoop Daily are clearly labeled as
          news, opinion, or entertainment content. We strive to attribute all quotes and information to credible
          sources and will promptly correct any errors brought to our attention.
        </p>

        <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Contact Us</h2>
        <p>
          Have a tip, correction, or partnership inquiry? We&apos;d love to hear from you.
          Email us at{' '}
          <a href="mailto:contact@starscoopdaily.site" className="text-[#cc0000] hover:underline font-medium">
            contact@starscoopdaily.site
          </a>
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mt-8">
          <h3 className="font-bold text-gray-900 mb-2">Quick Facts</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>🌐 <strong>Website:</strong> starscoopdaily.site</li>
            <li>📅 <strong>Launched:</strong> June 23, 2026</li>
            <li>📍 <strong>Audience:</strong> USA, India & Global</li>
            <li>📧 <strong>Email:</strong> contact@starscoopdaily.site</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
