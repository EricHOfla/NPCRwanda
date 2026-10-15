import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Volunteer With Us',
  description:
    'Volunteer with NPC Rwanda and make a direct impact in Rwanda\'s para-sport community. Support events, coaching, administration, and athlete development programmes.',
  keywords: ['NPC Rwanda', 'volunteer', 'Rwanda', 'Paralympic', 'community', 'para-sport'],
  alternates: { canonical: 'https://npcrwanda.org/volunteer' },
  openGraph: {
    title: 'Volunteer With NPC Rwanda',
    description: 'Make an impact — volunteer with Rwanda\'s National Paralympic Committee.',
    url: 'https://npcrwanda.org/volunteer',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function VolunteerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
