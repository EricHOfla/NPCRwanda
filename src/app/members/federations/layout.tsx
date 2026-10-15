import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Member Federations',
  description:
    'Paralympic sports federations affiliated with NPC Rwanda — governing bodies for individual Paralympic sports disciplines in Rwanda.',
  keywords: ['NPC Rwanda', 'federations', 'sports federations', 'Paralympic', 'Rwanda'],
  alternates: { canonical: 'https://npcrwanda.org/members/federations' },
  openGraph: {
    title: 'Member Federations | NPC Rwanda',
    description: 'Paralympic sports federations affiliated with NPC Rwanda.',
    url: 'https://npcrwanda.org/members/federations',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function FederationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
