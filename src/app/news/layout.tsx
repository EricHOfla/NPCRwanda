import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'News Room',
  description:
    'Latest news, press releases, and updates from NPC Rwanda — covering para-sport events, athlete achievements, and organizational milestones.',
  keywords: ['NPC Rwanda', 'news', 'Paralympic', 'Rwanda', 'press release', 'updates'],
  alternates: { canonical: 'https://npcrwanda.org/news' },
  openGraph: {
    title: 'News Room | NPC Rwanda',
    description: 'Latest news and updates from Rwanda\'s National Paralympic Committee.',
    url: 'https://npcrwanda.org/news',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
