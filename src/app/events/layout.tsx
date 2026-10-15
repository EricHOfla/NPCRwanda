import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events Calendar',
  description:
    'Upcoming and past para-sport events organised by NPC Rwanda — competitions, training camps, community outreach, and international qualifiers.',
  keywords: ['NPC Rwanda', 'events', 'calendar', 'Paralympic', 'Rwanda', 'competitions'],
  alternates: { canonical: 'https://npcrwanda.org/events' },
  openGraph: {
    title: 'Events Calendar | NPC Rwanda',
    description: 'Para-sport events, competitions, and activities organised by NPC Rwanda.',
    url: 'https://npcrwanda.org/events',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
