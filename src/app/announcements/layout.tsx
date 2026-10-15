import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Announcements',
  description:
    'Official announcements from NPC Rwanda — important notices, deadlines, selection calls, and updates for athletes, coaches, and the para-sport community.',
  keywords: ['NPC Rwanda', 'announcements', 'notices', 'Paralympic', 'Rwanda'],
  alternates: { canonical: 'https://npcrwanda.org/announcements' },
  openGraph: {
    title: 'Announcements | NPC Rwanda',
    description: 'Official NPC Rwanda announcements and important notices.',
    url: 'https://npcrwanda.org/announcements',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function AnnouncementsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
