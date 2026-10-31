import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sports Development & Opportunities',
  description: 'Explore NPC Rwanda training programmes, para-sport competition results, event registration and opportunities to get involved.',
  alternates: { canonical: '/sports-development' },
};

export default function SportsDevelopmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
