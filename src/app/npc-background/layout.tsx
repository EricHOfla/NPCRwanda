import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'NPC Background & SWOT',
  description:
    'Explore the institutional background, SWOT analysis, and strategic context of Rwanda\'s National Paralympic Committee.',
  keywords: ['NPC Rwanda', 'background', 'SWOT', 'Paralympic', 'strategy', 'Rwanda'],
  alternates: { canonical: 'https://npcrwanda.org/npc-background' },
  openGraph: {
    title: 'NPC Background & SWOT | NPC Rwanda',
    description: 'Institutional background and strategic overview of Rwanda\'s National Paralympic Committee.',
    url: 'https://npcrwanda.org/npc-background',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function NpcBackgroundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
