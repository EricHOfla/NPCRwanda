import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard | NPC Rwanda',
  description: 'NPC Rwanda administrative dashboard portal',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
