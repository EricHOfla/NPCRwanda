import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Leadership',
  description:
    'Meet the NPC Rwanda leadership team — the board members, executives, and officials steering Rwanda\'s Paralympic movement forward.',
  keywords: ['NPC Rwanda', 'leadership', 'board', 'Paralympic', 'Rwanda', 'officials'],
  alternates: { canonical: 'https://npcrwanda.org/leaders' },
  openGraph: {
    title: 'Our Leadership | NPC Rwanda',
    description: 'Meet the board and executives leading Rwanda\'s National Paralympic Committee.',
    url: 'https://npcrwanda.org/leaders',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function LeadersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
