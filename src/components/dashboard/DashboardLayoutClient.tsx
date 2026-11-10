'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AppSidebar from '@/components/dashboard/AppSidebar';
import DashboardTopbar, { type DashboardUserProfile } from '@/components/dashboard/DashboardTopbar';
import { DashboardAuthProvider } from '@/context/DashboardAuthContext';
import { canAccessSection, normalizeRole, type DashboardSection } from '@/lib/rbac';

const pageTitles: Record<string, string> = {
  overview: 'Admin Overview',
  pages: 'Website Page Management',
  members: 'Members Directory',
  users: 'System User Management',
  volunteers: 'Volunteer Applications',
  contacts: 'Inbox & Feedback',
  subscribers: 'Newsletter Subscribers',
  settings: 'System Settings',
  profile: 'Profile Settings',
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

const editorRestrictedPages = new Set([
  'home',
  'about',
  'npc-background',
  'leadership',
  'governance',
  'partners',
  'contact',
]);

function getRequiredSection(pathname: string, tab: string): DashboardSection | null {
  if (pathname.endsWith('/profile')) return 'profile';
  if (pathname.endsWith('/community')) return 'community';
  if (pathname.endsWith('/donations')) return 'donations';

  const sectionByTab: Record<string, DashboardSection> = {
    overview: 'overview',
    pages: 'pages',
    members: 'members',
    users: 'users',
    volunteers: 'inbox',
    contacts: 'contacts',
    subscribers: 'subscribers',
    settings: 'settings',
    profile: 'profile',
  };

  return sectionByTab[tab] || null;
}

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  initialProfile: DashboardUserProfile;
}

export default function DashboardLayoutClient({
  children,
  initialProfile,
}: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Keep the full navigation visible on desktop, but start with the drawer
  // closed on phones so it never covers the dashboard content on first load.
  useEffect(() => {
    let isMobile = window.innerWidth < 992;
    setSidebarOpen(!isMobile);

    const handleViewportChange = () => {
      const nextIsMobile = window.innerWidth < 992;
      if (nextIsMobile !== isMobile) {
        isMobile = nextIsMobile;
        setSidebarOpen(!nextIsMobile);
      }
    };

    window.addEventListener('resize', handleViewportChange);
    return () => window.removeEventListener('resize', handleViewportChange);
  }, []);

  // Profile and role are provided by the authenticated server layout from the
  // signed login session. No extra /api/auth/profile request is needed.
  const profile = initialProfile;

  const tab = searchParams.get('tab') || 'overview';
  const page = searchParams.get('page') || 'home';

  const requiredSection = useMemo(
    () => getRequiredSection(pathname, tab),
    [pathname, tab]
  );

  const hasRouteAccess = useMemo(() => {
    if (!requiredSection) return false;
    const role = normalizeRole(profile.role);

    if (requiredSection === 'pages' && role === 'EDITOR' && editorRestrictedPages.has(page)) {
      return false;
    }

    return canAccessSection(role, requiredSection);
  }, [profile.role, requiredSection, page]);

  useEffect(() => {
    if (hasRouteAccess) return;

    window.alert('Access denied. You do not have permission to view this page. You are being returned to Admin Overview.');
    router.replace('/dashboard?tab=overview');
  }, [hasRouteAccess, router, pathname, queryString]);

  const activeId = useMemo(() => {
    if (pathname.endsWith('/profile')) return 'profile';
    if (pathname.endsWith('/community')) return 'community-sports';
    if (pathname.endsWith('/donations/logs')) return 'donations-logs';
    if (pathname.endsWith('/donations')) return 'donations-payments';
    return tab === 'pages' ? `page-${page}` : tab;
  }, [pathname, tab, page]);

  const title = useMemo(() => {
    if (pathname.endsWith('/profile')) return 'Profile Settings';
    if (pathname.endsWith('/community')) return 'Sports Development';
    if (pathname.endsWith('/donations')) return 'Donations & Contributions';
    return tab === 'pages'
      ? (pageLabels[page] || 'Website Page Management')
      : (pageTitles[tab] || 'Admin Dashboard');
  }, [pathname, tab, page]);

  // Never render restricted page content, even for the brief moment before redirect.
  if (!hasRouteAccess) {
    return null;
  }

  return (
    <div className="admin-dashboard-root" style={{ display: 'flex', height: '100vh', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      <AppSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeId={activeId}
        profile={profile}
        selectedAvatar={profile.avatar || 'avatar-1.svg'}
      />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        <DashboardTopbar
          title={title}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          userProfile={profile}
        />
        <div key={`${pathname}?${queryString}`} className="dashboard-layout-content" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <DashboardAuthProvider profile={profile}>{children}</DashboardAuthProvider>
        </div>
      </div>
    </div>
  );
}
