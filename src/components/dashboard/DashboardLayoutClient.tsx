'use client';

import React, { useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import AppSidebar from '@/components/dashboard/AppSidebar';
import DashboardTopbar from '@/components/dashboard/DashboardTopbar';

const pageTitles: Record<string, string> = {
  overview: 'Admin Overview',
  pages: 'Website Page Management',
  members: 'Members Directory',
  users: 'System User Management',
  volunteers: 'Volunteer Applications',
  contacts: 'Inbox & Feedback',
  subscribers: 'Newsletter Subscribers',
  settings: 'System Settings',
};

const pageLabels: Record<string, string> = {
  home: 'Home Page Editor',
  about: 'About Us Page',
  'npc-background': 'NPC Background Page',
  leadership: 'Leadership Directory & Mandate',
  athletes: 'Athletes Directory',
  sports: 'Sports Programs',
  news: 'News Room',
  announcements: 'Official Announcements & Notices',
  events: 'Events Calendar',
  careers: 'Careers & Vacancies',
  contact: 'Contact & Footer Settings',
  governance: 'Governance & Policies',
  partners: 'Partners & Sponsors',
};

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const activeId = useMemo(() => {
    if (pathname.endsWith('/community')) return 'community-sports';
    if (pathname.endsWith('/donations')) return 'donations-payments';
    const tab = searchParams.get('tab') || 'overview';
    const page = searchParams.get('page') || 'home';
    return tab === 'pages' ? `page-${page}` : tab;
  }, [pathname, searchParams]);

  const title = useMemo(() => {
    if (pathname.endsWith('/community')) return 'Sports Development';
    if (pathname.endsWith('/donations')) return 'Donations & Contributions';
    const tab = searchParams.get('tab') || 'overview';
    const page = searchParams.get('page') || 'home';
    return tab === 'pages' ? (pageLabels[page] || 'Website Page Management') : (pageTitles[tab] || 'Admin Dashboard');
  }, [pathname, searchParams]);

  return (
    <div className="admin-dashboard-root" style={{ display: 'flex', height: '100vh', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      <AppSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeId={activeId} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <DashboardTopbar title={title} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div key={`${pathname}?${searchParams.toString()}`} className="dashboard-layout-content" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
