import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About NPC Rwanda',
  description:
    'Learn about the National Paralympic Committee of Rwanda — our history, mission, vision, core values, and the people driving para-sport excellence across Rwanda.',
  keywords: ['NPC Rwanda', 'about', 'Paralympic', 'Rwanda', 'para-sport', 'mission', 'vision'],
  alternates: { canonical: 'https://npcrwanda.org/about' },
  openGraph: {
    title: 'About NPC Rwanda',
    description:
      'Discover the history, mission, and values behind Rwanda\'s National Paralympic Committee.',
    url: 'https://npcrwanda.org/about',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
