import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Partners & Sponsors',
  description:
    'Meet the organisations, institutions, and sponsors supporting NPC Rwanda\'s mission to develop para-sport and empower athletes with disabilities across Rwanda.',
  keywords: ['NPC Rwanda', 'partners', 'sponsors', 'Paralympic', 'Rwanda', 'support'],
  alternates: { canonical: 'https://npcrwanda.org/partners' },
  openGraph: {
    title: 'Partners & Sponsors | NPC Rwanda',
    description: 'Partners and sponsors enabling Rwanda\'s Paralympic movement.',
    url: 'https://npcrwanda.org/partners',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function PartnersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
