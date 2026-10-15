import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Download official NPC Rwanda resources — forms, rulebooks, classification guides, athlete manuals, and other documents for the Rwandan para-sport community.',
  keywords: ['NPC Rwanda', 'resources', 'downloads', 'documents', 'Paralympic', 'Rwanda'],
  alternates: { canonical: 'https://npcrwanda.org/resources' },
  openGraph: {
    title: 'Resources | NPC Rwanda',
    description: 'Official documents, forms and resources from Rwanda\'s National Paralympic Committee.',
    url: 'https://npcrwanda.org/resources',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function ResourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
