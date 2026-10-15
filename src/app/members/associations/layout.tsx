import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Member Associations',
  description:
    'NPC Rwanda member associations — sports clubs and disability associations affiliated with the National Paralympic Committee of Rwanda.',
  keywords: ['NPC Rwanda', 'associations', 'members', 'clubs', 'Paralympic', 'Rwanda'],
  alternates: { canonical: 'https://npcrwanda.org/members/associations' },
  openGraph: {
    title: 'Member Associations | NPC Rwanda',
    description: 'Affiliated sports clubs and disability associations of NPC Rwanda.',
    url: 'https://npcrwanda.org/members/associations',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function AssociationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
