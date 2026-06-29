'use client';

import { useState } from 'react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <section className="bg-gradient-to-r from-gray-900 via-[#cc0000] to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="text-4xl mb-3">⭐</div>
        <h2 className="text-white text-2xl sm:text-3xl font-black mb-2">
          Get Celebrity Scoops Daily
        </h2>
        <p className="text-red-200 text-sm sm:text-base mb-6">
          Join thousands of readers. Get the hottest celebrity news delivered to your inbox every morning.
          No spam, unsubscribe anytime.
        </p>

        {submitted ? (
          <div className="bg-white/20 backdrop-blur rounded-xl p-6 text-white">
            <div className="text-4xl mb-2">🎉</div>
            <h3 className="font-bold text-lg">You&apos;re in!</h3>
            <p className="text-red-100 text-sm mt-1">
              Welcome to the StarScoop family. Check your inbox for confirmation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-5 py-3.5 rounded-lg text-gray-900 text-sm font-medium focus:outline-none focus:ring-3 focus:ring-white shadow-lg"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-white text-[#cc0000] font-black px-8 py-3.5 rounded-lg text-sm hover:bg-gray-100 transition-colors disabled:opacity-70 whitespace-nowrap shadow-lg"
            >
              {loading ? 'Subscribing...' : 'Subscribe Free ✨'}
            </button>
          </form>
        )}

        <p className="text-red-300 text-xs mt-4">
          By subscribing, you agree to our{' '}
          <a href="/privacy-policy" className="underline hover:text-white">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </section>
  );
}
