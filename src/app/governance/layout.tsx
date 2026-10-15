import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Governance & Policies',
  description:
    'NPC Rwanda governance documents — board structure, annual reports, policies, strategic plans, and the regulatory framework guiding Rwanda\'s Paralympic movement.',
  keywords: ['NPC Rwanda', 'governance', 'policies', 'board', 'reports', 'strategic plan', 'Rwanda'],
  alternates: { canonical: 'https://npcrwanda.org/governance' },
  openGraph: {
    title: 'Governance & Policies | NPC Rwanda',
    description: 'Governance framework, board, reports and policies of Rwanda\'s National Paralympic Committee.',
    url: 'https://npcrwanda.org/governance',
    images: [{ url: 'https://npcrwanda.org/assets/img/og-default.jpg', width: 1200, height: 630 }],
  },
};

export default function GovernanceLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
