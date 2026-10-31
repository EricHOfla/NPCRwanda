import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <>
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 px-3 py-2 border-bottom bg-white">
      <span className="small fw-semibold text-muted">NPC Rwanda Administration</span>
      <Link href="/dashboard/community" className="btn btn-sm btn-outline-primary">
        <i className="fas fa-people-group me-2" aria-hidden="true" />Sports & Community Management
      </Link>
    </div>
    {children}
  </>;
}
