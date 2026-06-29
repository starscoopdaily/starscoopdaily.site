'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  const inputClass = "w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#cc0000] transition-all";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <span className="category-badge mb-3 inline-block">Contact</span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">Get In Touch</h1>
        <p className="text-gray-500">Have a tip, question, or partnership inquiry? We&apos;d love to hear from you.</p>
        <div className="h-1 w-16 bg-[#cc0000] rounded mt-4"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="space-y-4">
          {[
            { icon: '📧', label: 'Email', value: 'contact@starscoopdaily.site', href: 'mailto:contact@starscoopdaily.site' },
            { icon: '🌐', label: 'Website', value: 'starscoopdaily.site', href: 'https://starscoopdaily.site' },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl">{item.icon}</span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">{item.label}</p>
                <a href={item.href} className="text-[#cc0000] font-semibold text-sm hover:underline">
                  {item.value}
                </a>
              </div>
            </div>
          ))}

          <div className="bg-[#cc0000] text-white rounded-xl p-5 mt-4">
            <h3 className="font-bold mb-2">Submit a Tip</h3>
            <p className="text-red-100 text-sm">
              Got the inside scoop on a celebrity story? Email us with &quot;TIP:&quot; in the subject line. We protect all sources.
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2">
          {submitted ? (
            <div className="text-center py-16 bg-green-50 rounded-xl border border-green-100">
              <div className="text-5xl mb-3">✅</div>
              <h2 className="font-black text-xl text-gray-900 mb-2">Message Sent!</h2>
              <p className="text-gray-500 text-sm">We&apos;ll get back to you within 24-48 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Name *</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Your name" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Email *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} placeholder="your@email.com" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Subject *</label>
                <select required value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} className={`${inputClass} bg-white`}>
                  <option value="">Select a subject</option>
                  <option>General Inquiry</option>
                  <option>Submit a Tip</option>
                  <option>Press/Partnership</option>
                  <option>Advertising</option>
                  <option>Correction Request</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Message *</label>
                <textarea required rows={6} value={form.message} onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))} placeholder="Tell us what's on your mind..." className={inputClass} />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#cc0000] text-white py-3.5 rounded-lg font-bold hover:bg-[#aa0000] transition-colors disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send Message →'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
