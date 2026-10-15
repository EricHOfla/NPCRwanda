import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Athletes Directory',
  description:
    'Browse Rwanda\'s para-athletes — their sports, achievements, and stories as they represent Rwanda on the continental and global Paralympic stage.',
  keywords: ['NPC Rwanda', 'athletes', 'para-athletes', 'Paralympic', 'Rwanda', 'sports'],
  alternates: { canonical: 'https://npcrwanda.org/athletes' },
  openGraph: {
    title: 'Athletes Directory | NPC Rwanda',
    description: 'Meet Rwanda\'s para-athletes competing at the highest levels.',
    url: 'https://npcrwanda.org/athletes',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function AthletesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
