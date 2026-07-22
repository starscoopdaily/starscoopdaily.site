export const metadata = {
  title: 'DMCA Policy — StarScoop Daily',
  description: 'DMCA copyright policy for StarScoop Daily. Submit copyright infringement notices here.',
};

export default function DMCAPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-black text-gray-900 mb-2">DMCA Policy</h1>
      <p className="text-sm text-gray-400 mb-8">Last updated: July 2026</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">

        <p>StarScoop Daily (<strong>starscoopdaily.site</strong>) respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 (<strong>DMCA</strong>), we will respond promptly to claims of copyright infringement that are reported to our designated copyright agent.</p>

        <h2 className="text-xl font-black text-gray-900 mt-8 mb-3">What We Publish</h2>
        <p>StarScoop Daily publishes original editorial commentary, news reporting, and criticism about entertainment, celebrities, movies, and television. All written content is original. Images used on this site are sourced from:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>TMDB (The Movie Database) API — used under their terms of service</li>
          <li>Pexels — royalty-free licensed images</li>
          <li>Official press kits and publicly released promotional materials</li>
        </ul>
        <p>We do not host pirated content, unauthorized streams, or full reproductions of copyrighted works.</p>

        <h2 className="text-xl font-black text-gray-900 mt-8 mb-3">Filing a DMCA Takedown Notice</h2>
        <p>If you believe that content on StarScoop Daily infringes your copyright, please send a written notice to our designated agent with the following information:</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>A physical or electronic signature of the copyright owner or authorized agent</li>
          <li>Identification of the copyrighted work you claim has been infringed</li>
          <li>The exact URL(s) on our site where the allegedly infringing material appears</li>
          <li>Your contact information — name, address, telephone number, and email address</li>
          <li>A statement that you have a good faith belief that the use is not authorized by the copyright owner, its agent, or the law</li>
          <li>A statement, made under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on their behalf</li>
        </ol>

        <h2 className="text-xl font-black text-gray-900 mt-8 mb-3">Where to Send Your Notice</h2>
        <p>Send DMCA notices by email to our designated copyright agent:</p>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 my-4">
          <p className="font-semibold text-gray-900">StarScoop Daily — DMCA Agent</p>
          <p>Email: <a href="mailto:contact@starscoopdaily.site" className="text-[#cc0000] hover:underline">contact@starscoopdaily.site</a></p>
          <p className="text-sm text-gray-500 mt-2">Please use subject line: <strong>DMCA Takedown Notice</strong></p>
        </div>
        <p>We will review all valid DMCA notices and respond within <strong>5–7 business days</strong>. If the claim is valid, the content will be removed promptly.</p>

        <h2 className="text-xl font-black text-gray-900 mt-8 mb-3">Counter-Notification</h2>
        <p>If you believe your content was removed by mistake or misidentification, you may file a counter-notification. Your counter-notice must include:</p>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Your physical or electronic signature</li>
          <li>Identification of the removed content and its location before removal</li>
          <li>A statement under penalty of perjury that the material was removed by mistake or misidentification</li>
          <li>Your name, address, and phone number</li>
          <li>Consent to jurisdiction of the federal court in your district</li>
        </ol>

        <h2 className="text-xl font-black text-gray-900 mt-8 mb-3">Repeat Infringers</h2>
        <p>StarScoop Daily will terminate the accounts of users who are repeat infringers in appropriate circumstances.</p>

        <h2 className="text-xl font-black text-gray-900 mt-8 mb-3">Fair Use</h2>
        <p>StarScoop Daily publishes news commentary and criticism, which may include limited quotations or references to copyrighted works under the <strong>fair use doctrine</strong> (17 U.S.C. § 107). We use the minimum necessary content to support original commentary and do not reproduce works in their entirety.</p>

      </div>
    </div>
  );
}
