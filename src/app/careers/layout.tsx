import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers & Vacancies',
  description:
    'Join NPC Rwanda — browse current job openings, coaching positions, volunteer opportunities, and internships in Rwanda\'s para-sport ecosystem.',
  keywords: ['NPC Rwanda', 'careers', 'jobs', 'vacancies', 'Paralympic', 'Rwanda', 'volunteer'],
  alternates: { canonical: 'https://npcrwanda.org/careers' },
  openGraph: {
    title: 'Careers & Vacancies | NPC Rwanda',
    description: 'Job openings and opportunities to work with Rwanda\'s National Paralympic Committee.',
    url: 'https://npcrwanda.org/careers',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function CareersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
