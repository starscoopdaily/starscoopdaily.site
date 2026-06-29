export const metadata = {
  title: 'Terms of Service — StarScoop Daily',
  description: 'Terms of Service for StarScoop Daily — the rules and guidelines for using our entertainment news website.',
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <span className="category-badge mb-3 inline-block">Legal</span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-gray-400 text-sm">Last updated: June 23, 2026</p>
        <div className="h-1 w-16 bg-[#cc0000] rounded mt-4"></div>
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        <p>
          By accessing and using <strong>StarScoop Daily</strong> (starscoopdaily.site), you agree to be bound by
          these Terms of Service. Please read them carefully before using our website.
        </p>

        {[
          {
            title: '1. Acceptance of Terms',
            content: `By using StarScoop Daily, you confirm that you are at least 13 years old and agree to these Terms
            of Service and our Privacy Policy. If you do not agree, please do not use our website.`,
          },
          {
            title: '2. Intellectual Property',
            content: `All content on StarScoop Daily, including text, images, graphics, logos, and design, is owned by
            StarScoop Daily or licensed from third parties and is protected by copyright and intellectual property laws.
            You may not reproduce, distribute, or create derivative works without express written permission.`,
          },
          {
            title: '3. User Conduct',
            content: `You agree not to: use the website for any unlawful purpose; attempt to gain unauthorized access to
            our systems; scrape or harvest data from our website in an automated manner; use our content for commercial
            purposes without permission; post or transmit harmful, offensive, or illegal content.`,
          },
          {
            title: '4. Content Disclaimer',
            content: `StarScoop Daily publishes entertainment news and opinion content. While we strive for accuracy,
            we do not guarantee the completeness or accuracy of all information. Content should be considered for
            entertainment and informational purposes. We are not responsible for decisions made based on our content.`,
          },
          {
            title: '5. Third-Party Links',
            content: `Our website may contain links to third-party websites. We are not responsible for the content,
            privacy practices, or terms of those websites. Accessing third-party links is at your own risk.`,
          },
          {
            title: '6. Advertising',
            content: `StarScoop Daily displays advertisements served by third-party networks including Adsterra.
            We are not responsible for the content of these advertisements. Clicking on ads is at your own discretion.`,
          },
          {
            title: '7. Limitation of Liability',
            content: `To the fullest extent permitted by law, StarScoop Daily shall not be liable for any indirect,
            incidental, special, or consequential damages arising from your use of the website, including loss of data,
            profits, or business opportunities.`,
          },
          {
            title: '8. Indemnification',
            content: `You agree to indemnify and hold StarScoop Daily harmless from any claims, losses, or damages
            (including legal fees) arising from your use of the website or violation of these Terms.`,
          },
          {
            title: '9. Modifications',
            content: `We reserve the right to modify these Terms at any time. Changes become effective immediately upon
            posting. Continued use of the website constitutes acceptance of the modified Terms.`,
          },
          {
            title: '10. Governing Law',
            content: `These Terms shall be governed by applicable laws. Disputes shall be resolved through binding
            arbitration, except where prohibited by law.`,
          },
          {
            title: '11. Contact',
            content: `For questions about these Terms, contact us at: contact@starscoopdaily.site`,
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
