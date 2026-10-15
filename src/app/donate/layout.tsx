import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Donate & Support',
  description:
    'Support Rwanda\'s para-athletes by donating to NPC Rwanda. Your contribution funds training, equipment, travel, and life-changing opportunities for athletes with disabilities.',
  keywords: ['NPC Rwanda', 'donate', 'support', 'Paralympic', 'Rwanda', 'fund', 'charity'],
  alternates: { canonical: 'https://npcrwanda.org/donate' },
  openGraph: {
    title: 'Donate & Support NPC Rwanda',
    description: 'Help fund Rwanda\'s para-athletes — donate to the National Paralympic Committee.',
    url: 'https://npcrwanda.org/donate',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function DonateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
