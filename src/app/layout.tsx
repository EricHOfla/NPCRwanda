import type { Metadata, Viewport } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { ClientWrapper } from '@/components/ClientWrapper';
import {
  SITE_CONFIG,
  GLOBAL_KEYWORDS,
  getOrganizationJsonLd,
  getWebSiteJsonLd,
} from '@/lib/seo';

// NOTE: next/font/google was removed because Turbopack on the production
// server cannot resolve @vercel/turbopack-next internal font modules.
// Fonts are loaded via <link> tags in the <head> instead.

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F223D',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.siteUrl),
  title: {
    default: 'NPC Rwanda - National Paralympic Committee of Rwanda | Official Website',
    template: '%s | NPC Rwanda',
  },
  description: SITE_CONFIG.defaultDescription,
  applicationName: 'NPC Rwanda',
  keywords: GLOBAL_KEYWORDS,
  authors: [{ name: SITE_CONFIG.fullName, url: SITE_CONFIG.siteUrl }],
  creator: 'National Paralympic Committee of Rwanda (NPC Rwanda)',
  publisher: 'National Paralympic Committee of Rwanda (NPC Rwanda)',
  alternates: {
    canonical: SITE_CONFIG.siteUrl,
  },
  openGraph: {
    title: 'NPC Rwanda - National Paralympic Committee of Rwanda | Official Website',
    description: SITE_CONFIG.defaultDescription,
    url: SITE_CONFIG.siteUrl,
    siteName: 'National Paralympic Committee of Rwanda (NPC Rwanda)',
    locale: SITE_CONFIG.locale,
    type: 'website',
    images: [
      {
        url: 'https://npcrwanda.org/assets/img/logo.png',
        width: 1200,
        height: 630,
        alt: 'National Paralympic Committee of Rwanda (NPC Rwanda) Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'National Paralympic Committee of Rwanda (NPC Rwanda)',
    description: SITE_CONFIG.defaultDescription,
    site: '@npcrwanda',
    creator: '@npcrwanda',
    images: ['https://npcrwanda.org/assets/img/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/assets/img/logo.png', sizes: 'any', type: 'image/png' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    shortcut: '/assets/img/logo.png',
    apple: [
      { url: '/assets/img/logo.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = getOrganizationJsonLd();
  const websiteSchema = getWebSiteJsonLd();

  return (
    <html lang="en">
      <head>
        {/* Google Fonts — loaded via standard link tags (Turbopack compatible) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Source+Sans+3:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --font-display: 'Sora', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            --font-body: 'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }
        `}} />
        <link rel="icon" type="image/png" sizes="32x32" href="/assets/img/logo.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/assets/img/logo.png" />
        <link rel="shortcut icon" href="/assets/img/logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/assets/img/logo.png" />
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
          rel="stylesheet"
          precedence="default"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
