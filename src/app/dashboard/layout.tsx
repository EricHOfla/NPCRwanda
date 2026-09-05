import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | NPC Rwanda',
  description: 'NPC Rwanda administrative dashboard portal',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
