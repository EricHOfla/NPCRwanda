'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import AppSidebar from '@/components/dashboard/AppSidebar';
import DashboardTopbar, { type DashboardUserProfile } from '@/components/dashboard/DashboardTopbar';
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

function DashboardLoading() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{ background: '#F8FAFC' }}>
      <div className="text-center text-muted">
        <i className="fas fa-circle-notch fa-spin fa-2x mb-3" />
        <p className="small fw-semibold mb-0">Checking dashboard access...</p>
      </div>
    </div>
  );
}

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profile, setProfile] = useState<DashboardUserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    let active = true;

    fetch('/api/auth/profile', { credentials: 'same-origin', cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('UNAUTHENTICATED');
        const data = await response.json();
        if (!data?.user) throw new Error('UNAUTHENTICATED');
        if (!active) return;

        setProfile({
          name: data.user.name || 'Admin',
          email: data.user.email || '',
          role: data.user.role || 'EDITOR',
          avatar: data.user.avatar || 'avatar-1.svg',
        });
        setProfileLoading(false);
      })
      .catch(() => {
        if (!active) return;
        router.replace('/login');
      });

    return () => {
      active = false;
    };
  }, [router]);

  const tab = searchParams.get('tab') || 'overview';
  const page = searchParams.get('page') || 'home';

  const requiredSection = useMemo(
    () => getRequiredSection(pathname, tab),
    [pathname, tab]
  );

  const hasRouteAccess = useMemo(() => {
    if (!profile || !requiredSection) return false;
    const role = normalizeRole(profile.role);

    if (requiredSection === 'pages' && role === 'EDITOR' && editorRestrictedPages.has(page)) {
      return false;
    }

    return canAccessSection(role, requiredSection);
  }, [profile, requiredSection, page]);

  useEffect(() => {
    if (!profile || profileLoading || hasRouteAccess) return;

    window.alert('Access denied. You do not have permission to view this page. You are being returned to Admin Overview.');
    router.replace('/dashboard?tab=overview');
  }, [profile, profileLoading, hasRouteAccess, router, pathname, queryString]);

  const activeId = useMemo(() => {
    if (pathname.endsWith('/community')) return 'community-sports';
    if (pathname.endsWith('/donations')) return 'donations-payments';
    return tab === 'pages' ? `page-${page}` : tab;
  }, [pathname, tab, page]);

  const title = useMemo(() => {
    if (pathname.endsWith('/community')) return 'Sports Development';
    if (pathname.endsWith('/donations')) return 'Donations & Contributions';
    return tab === 'pages'
      ? (pageLabels[page] || 'Website Page Management')
      : (pageTitles[tab] || 'Admin Dashboard');
  }, [pathname, tab, page]);

  if (profileLoading || !profile || !hasRouteAccess) {
    return <DashboardLoading />;
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
          {children}
        </div>
      </div>
    </div>
  );
}
