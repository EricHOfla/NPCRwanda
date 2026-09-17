import type { Metadata } from 'next';
import HomeClient from '@/components/HomeClient';
import {
  SITE_CONFIG,
  GLOBAL_KEYWORDS,
  getOrganizationJsonLd,
  getWebSiteJsonLd,
} from '@/lib/seo';

export const metadata: Metadata = {
  title: {
    absolute: 'NPC Rwanda - National Paralympic Committee of Rwanda | Official Website',
  },
  description:
    'Official website of the National Paralympic Committee of Rwanda (NPC Rwanda). Empowering Rwandan para-athletes, promoting sitting volleyball and para-athletics, and driving inclusion across Rwanda.',
  alternates: {
    canonical: 'https://npcrwanda.org',
  },
  keywords: [
    'National Paralympic Committee of Rwanda',
    'NPC Rwanda',
    'NPCRwanda',
    'npcrwanda.org',
    'Rwanda Paralympic Committee',
    'Comité National Paralympique du Rwanda',
    'Sitting Volleyball Rwanda',
    'Para Athletics Rwanda',
    'Amahoro National Stadium',
    ...GLOBAL_KEYWORDS,
  ],
  openGraph: {
    title: 'National Paralympic Committee of Rwanda (NPC Rwanda) | Official Website',
    description:
      'Official website of the National Paralympic Committee of Rwanda (NPC Rwanda). Dedicated to Paralympic sports, sitting volleyball, empowering Rwandan para-athletes, and driving national inclusion through athletic excellence.',
    url: 'https://npcrwanda.org',
    siteName: 'National Paralympic Committee of Rwanda (NPC Rwanda)',
    locale: 'en_RW',
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
    description:
      'Official website of the National Paralympic Committee of Rwanda (NPC Rwanda). Empowering Rwandan para-athletes and fostering inclusion through athletic excellence.',
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
};

export default function HomePage() {
  const organizationSchema = getOrganizationJsonLd();
  const websiteSchema = getWebSiteJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <HomeClient />
    </>
  );
}
