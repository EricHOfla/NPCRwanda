import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard | NPC Rwanda',
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-vh-100 d-flex align-items-center justify-content-center">Loading dashboard...</div>}>
      <DashboardLayoutClient>{children}</DashboardLayoutClient>
    </Suspense>
  );
}
