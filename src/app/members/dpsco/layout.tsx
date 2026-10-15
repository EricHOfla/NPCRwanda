import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DPSCO Members',
  description:
    'Disabled Persons Sports Clubs and Organisations (DPSCO) affiliated with NPC Rwanda — working at the grassroots to develop para-sport across Rwanda.',
  keywords: ['NPC Rwanda', 'DPSCO', 'disabled persons', 'sports clubs', 'Paralympic', 'Rwanda'],
  alternates: { canonical: 'https://npcrwanda.org/members/dpsco' },
  openGraph: {
    title: 'DPSCO Members | NPC Rwanda',
    description: 'Disabled Persons Sports Clubs and Organisations affiliated with NPC Rwanda.',
    url: 'https://npcrwanda.org/members/dpsco',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function DpscoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
