export const metadata = {
  title: 'Disclaimer — StarScoop Daily',
  description: 'Read the full disclaimer for StarScoop Daily regarding entertainment news content, accuracy, and liability.',
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <span className="category-badge mb-3 inline-block">Legal</span>
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">Disclaimer</h1>
        <p className="text-gray-400 text-sm">Last updated: June 23, 2026</p>
        <div className="h-1 w-16 bg-[#cc0000] rounded mt-4"></div>
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        {[
          {
            title: 'Entertainment Purposes',
            content: `StarScoop Daily is an entertainment news and media website. All content published on this website is
            intended for entertainment, informational, and journalistic purposes only. Readers are encouraged to use their
            own judgment when consuming celebrity and entertainment news.`,
          },
          {
            title: 'Accuracy of Information',
            content: `While we make every effort to ensure the accuracy of information published on StarScoop Daily,
            we cannot guarantee that all information is complete, current, or error-free. Celebrity news and entertainment
            reporting is fast-moving, and details may change rapidly. We will endeavor to correct factual errors promptly
            when brought to our attention.`,
          },
          {
            title: 'Opinions and Commentary',
            content: `Some content on StarScoop Daily may constitute opinion, commentary, or editorial content.
            Such content does not necessarily represent verified facts and should be understood as the perspective of
            the writer or the publication. Opinion pieces will generally be labeled as such.`,
          },
          {
            title: 'Third-Party Content and Links',
            content: `StarScoop Daily may link to or reference third-party websites, sources, and content. We do not
            endorse, control, or take responsibility for the accuracy, content, or practices of third-party sites.
            Accessing third-party links is at the user&apos;s own risk.`,
          },
          {
            title: 'AI-Generated Content',
            content: `Some articles on StarScoop Daily may be written or assisted by artificial intelligence tools.
            All AI-generated content is reviewed and edited by our team before publication. We take responsibility
            for all published content regardless of how it was produced.`,
          },
          {
            title: 'Copyright and Image Credits',
            content: `Images used on StarScoop Daily are sourced from licensed stock photo providers (including Pexels)
            or credited where applicable. We respect intellectual property rights and respond promptly to legitimate
            takedown requests. Contact us at contact@starscoopdaily.site for copyright concerns.`,
          },
          {
            title: 'No Professional Advice',
            content: `Nothing on StarScoop Daily constitutes legal, financial, medical, or professional advice.
            The information provided is for general informational and entertainment purposes only.`,
          },
          {
            title: 'Limitation of Liability',
            content: `StarScoop Daily, its owners, editors, and contributors shall not be held liable for any errors,
            omissions, or inaccuracies in the content, or for any actions taken in reliance thereon.
            Your use of this website is at your sole risk.`,
          },
          {
            title: 'Contact for Corrections',
            content: `If you believe any content on StarScoop Daily is inaccurate, defamatory, or violates your rights,
            please contact us immediately at contact@starscoopdaily.site. We are committed to responsible reporting
            and will address legitimate concerns promptly.`,
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
