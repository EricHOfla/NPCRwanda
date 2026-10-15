import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sports Programs',
  description:
    'Discover the Paralympic sports programs managed by NPC Rwanda — from athletics and swimming to wheelchair basketball and beyond.',
  keywords: ['NPC Rwanda', 'sports', 'Paralympic sports', 'Rwanda', 'programs', 'athletics'],
  alternates: { canonical: 'https://npcrwanda.org/sports' },
  openGraph: {
    title: 'Sports Programs | NPC Rwanda',
    description: 'Paralympic sports programs and disciplines managed by NPC Rwanda.',
    url: 'https://npcrwanda.org/sports',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function SportsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
