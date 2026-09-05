import type { Metadata, Viewport } from 'next';
import { Sora, Source_Sans_3 } from 'next/font/google';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import { ClientWrapper } from '@/components/ClientWrapper';
import { SITE_CONFIG, getOrganizationJsonLd } from '@/lib/seo';

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
    default: 'NPCRwanda | National Paralympic Committee of Rwanda',
    template: '%s | NPCRwanda',
  },
  description: SITE_CONFIG.defaultDescription,
  applicationName: SITE_CONFIG.siteName,
  authors: [{ name: SITE_CONFIG.fullName, url: SITE_CONFIG.siteUrl }],
  creator: SITE_CONFIG.fullName,
  publisher: SITE_CONFIG.fullName,
  alternates: {
    canonical: SITE_CONFIG.siteUrl,
  },
  openGraph: {
    title: 'NPCRwanda | National Paralympic Committee of Rwanda',
    description: SITE_CONFIG.defaultDescription,
    url: SITE_CONFIG.siteUrl,
    siteName: SITE_CONFIG.fullName,
    locale: SITE_CONFIG.locale,
    type: 'website',
    images: [
      {
        url: 'https://npcrwanda.org/assets/img/logo.png',
        width: 1200,
        height: 630,
        alt: 'National Paralympic Committee of Rwanda Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NPCRwanda | National Paralympic Committee of Rwanda',
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
    icon: '/favicon.ico',
    apple: '/assets/img/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = getOrganizationJsonLd();

  return (
    <html lang="en" className={`${sora.variable} ${sourceSans.variable}`}>
      <head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
          rel="stylesheet"
          precedence="default"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
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
