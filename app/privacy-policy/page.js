export const metadata = {
  title: 'Privacy Policy — StarScoop Daily',
  description: 'StarScoop Daily Privacy Policy — how we collect, use, and protect your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <span className="category-badge mb-3 inline-block">Legal</span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm">Last updated: June 23, 2026</p>
        <div className="h-1 w-16 bg-[#cc0000] rounded mt-4"></div>
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <p>
          Welcome to <strong>StarScoop Daily</strong> (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal
          information and your right to privacy. This Privacy Policy describes how we collect, use, and share
          information when you visit our website at starscoopdaily.site.
        </p>

        {[
          {
            title: '1. Information We Collect',
            content: `We collect information you voluntarily provide (such as your email address when you subscribe to our newsletter),
            information automatically collected when you visit our site (including IP address, browser type, pages visited, and time spent),
            and information collected through cookies and similar tracking technologies for analytics and advertising purposes.`,
          },
          {
            title: '2. How We Use Your Information',
            content: `We use your information to: deliver and maintain our website; send newsletter and updates (with your consent);
            analyze usage to improve our content; display personalized advertisements through our advertising partners (including Adsterra);
            comply with legal obligations; and prevent fraudulent activity.`,
          },
          {
            title: '3. Cookies and Tracking',
            content: `We use cookies and similar tracking technologies to personalize your experience and analyze site traffic.
            We use Google Analytics (GA4) to understand how visitors interact with our website.
            Our advertising partner Adsterra may also use cookies to serve targeted advertisements.
            You may disable cookies through your browser settings, though this may affect website functionality.`,
          },
          {
            title: '4. Third-Party Services',
            content: `We use third-party services including: Google Analytics (analytics), Adsterra (advertising),
            and Vercel (hosting). These services may collect information independently under their own privacy policies.
            We do not sell your personal data to third parties.`,
          },
          {
            title: '5. Data Retention',
            content: `We retain personal data only as long as necessary for the purposes outlined in this policy.
            Newsletter subscriber data is retained until you unsubscribe. Analytics data is retained per Google Analytics settings (default 26 months).`,
          },
          {
            title: '6. Your Rights',
            content: `Depending on your location, you may have rights including: access to your data, correction of inaccurate data,
            deletion of your data, withdrawal of consent, and data portability. To exercise these rights,
            contact us at contact@starscoopdaily.site.`,
          },
          {
            title: '7. Children\'s Privacy',
            content: `StarScoop Daily is not directed at children under 13. We do not knowingly collect personal information
            from children under 13. If you believe a child has provided us personal information, please contact us immediately.`,
          },
          {
            title: '8. Changes to This Policy',
            content: `We may update this Privacy Policy from time to time. The updated version will be indicated by a revised
            "Last updated" date. Continued use of the website after changes constitutes acceptance of the updated policy.`,
          },
          {
            title: '9. Contact Us',
            content: `If you have questions about this Privacy Policy, please contact us at: contact@starscoopdaily.site`,
          },
        ].map((section) => (
          <div key={section.title}>
            <h2 className="text-lg font-bold text-gray-900 mb-2">{section.title}</h2>
            <p>{section.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
