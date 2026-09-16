import type { Metadata, Viewport } from 'next';
import { Sora, Source_Sans_3 } from 'next/font/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { ClientWrapper } from '@/components/ClientWrapper';
import {
  SITE_CONFIG,
  GLOBAL_KEYWORDS,
  getOrganizationJsonLd,
  getWebSiteJsonLd,
} from '@/lib/seo';

const sora = Sora({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
});

const sourceSans = Source_Sans_3({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0F223D',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.siteUrl),
  title: {
    default: 'NPC Rwanda (NPCRwanda) - National Paralympic Committee of Rwanda | Official Website',
    template: '%s | NPC Rwanda (NPCRwanda)',
  },
  description: SITE_CONFIG.defaultDescription,
  applicationName: 'NPC Rwanda (NPCRwanda)',
  keywords: GLOBAL_KEYWORDS,
  authors: [{ name: SITE_CONFIG.fullName, url: SITE_CONFIG.siteUrl }],
  creator: 'National Paralympic Committee of Rwanda (NPC Rwanda)',
  publisher: 'National Paralympic Committee of Rwanda (NPC Rwanda)',
  alternates: {
    canonical: SITE_CONFIG.siteUrl,
  },
  openGraph: {
    title: 'NPC Rwanda (NPCRwanda) - National Paralympic Committee of Rwanda | Official Website',
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
    title: 'NPC Rwanda (NPCRwanda) - National Paralympic Committee of Rwanda',
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
    <html lang="en" className={`${sora.variable} ${sourceSans.variable}`}>
      <head>
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
