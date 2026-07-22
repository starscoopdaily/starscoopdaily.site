import './globals.css';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdSlot from '@/components/AdSlot';
import MonetizationScripts from '@/components/MonetizationScripts';
import ExitIntentPopup from '@/components/ExitIntentPopup';
import { getSmartLink } from '@/lib/adConfig';

export const metadata = {
  metadataBase: new URL('https://www.starscoopdaily.site'),
  title: {
    default: 'StarScoop Daily — Celebrity News, Hollywood, British Royals & Entertainment',
    template: '%s | StarScoop Daily',
  },
  description:
    'StarScoop Daily delivers the latest celebrity news, Hollywood scoops, British Royals gossip, UK celebrity news, TV show updates, and breaking entertainment news.',
  keywords: [
    'celebrity news',
    'hollywood news',
    'british celebrity news',
    'royal family news',
    'uk celebrity gossip',
    'entertainment news',
    'celebrity gossip',
    'TV shows',
    'music news',
    'StarScoop Daily',
  ],
  authors: [{ name: 'StarScoop Daily Staff' }],
  creator: 'StarScoop Daily',
  publisher: 'StarScoop Daily',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.starscoopdaily.site',
    siteName: 'StarScoop Daily',
    title: 'StarScoop Daily — Celebrity News, Hollywood, British Royals & Entertainment',
    description:
      'The latest celebrity news, Hollywood scoops, British Royals gossip, and UK entertainment news delivered daily.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'StarScoop Daily' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'StarScoop Daily',
    description: 'The latest celebrity news, Hollywood, British Royals & UK entertainment.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: 'https://www.starscoopdaily.site',
  },
  verification: {
    google: 'MkYepf3Ti69ImPKjKrfsbpNgk0ZhMG0Na_zTYLN7pzM',
    other: {
      'p:domain_verify': ['04c87b0a65edbe8487063d198b334c7a'],
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
};

export default function RootLayout({ children }) {
  const smartlink = getSmartLink();
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-152JNSZSJY"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-152JNSZSJY');
          `}
        </Script>
      </head>
      <body className="bg-white text-gray-900 font-inter">
        <Header />
        <AdSlot slot="header" />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <Script
          src="https://www.nexguild.in/nexguild-verify.js"
          data-site-slug="starscoopdaily"
          data-countdown="45"
          data-scroll="0.3"
          strategy="afterInteractive"
        />
        <MonetizationScripts />
        <ExitIntentPopup smartlink={smartlink} />
      </body>
    </html>
  );
}
