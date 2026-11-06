'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { hasPermission } from '@/lib/rbac';

export interface SidebarNavItem {
  id: string;
  type: 'tab' | 'page' | 'link';
  tabId?: string;
  pageId?: string;
  href?: string;
  label: string;
  icon: string;
}

export interface SidebarHeaderItem {
  type: 'header';
  label: string;
}

export type SidebarItem = SidebarNavItem | SidebarHeaderItem;

export interface AppSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  activeId: string;
  onNavigate?: (item: SidebarNavItem) => void;
  profile?: {
    name?: string;
    email?: string;
    role?: string;
  };
  selectedAvatar?: string;
  onLogout?: () => void;
}

export default function AppSidebar({
  sidebarOpen,
  setSidebarOpen,
  activeId,
  onNavigate,
  profile: propProfile,
  selectedAvatar: propAvatar,
  onLogout,
}: AppSidebarProps) {
  const router = useRouter();

  // Local state for profile and avatar if not passed in props
  const [internalProfile, setInternalProfile] = useState<{ name: string; email: string; role: string }>({
    name: 'Admin',
    email: '',
    role: 'ADMIN',
  });
  const [internalAvatar, setInternalAvatar] = useState<string>('avatar-1.svg');

  useEffect(() => {
    if (!propProfile) {
      fetch('/api/auth/profile')
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (json?.user) {
            setInternalProfile({
              name: json.user.name || 'Admin',
              email: json.user.email || '',
              role: json.user.role || 'ADMIN',
            });
          }
        })
        .catch(() => {});
    }
    if (!propAvatar) {
      try {
        const saved = localStorage.getItem('admin_avatar');
        if (saved) setInternalAvatar(saved);
      } catch {}
    }
  }, [propProfile, propAvatar]);

  const activeProfile = propProfile || internalProfile;
  const activeAvatar = propAvatar || internalAvatar;

  const role = (activeProfile.role || 'ADMIN').toUpperCase();
  const isSuperAdmin = role === 'SUPER_ADMIN';
  const isAdmin = role === 'ADMIN' || isSuperAdmin;
  const isEditor = role === 'EDITOR';

  const roleLabel = isSuperAdmin
    ? 'Super Administrator'
    : isAdmin
    ? 'Administrator'
    : role === 'MANAGER'
    ? 'Manager'
    : role === 'STAFF'
    ? 'Staff Member'
    : 'Content Editor';

  // Granular Permission Gates for Navigation
  const canAccessSettings = hasPermission(role, 'system-settings.view');
  const canAccessUsers = hasPermission(role, 'users.view');
  const canAccessDonations = hasPermission(role, 'donations.view');
  const canAccessCommunity = hasPermission(role, 'community.view');
  const canAccessMembers = hasPermission(role, 'members.view');
  const canAccessInbox = hasPermission(role, 'inbox.view');
  const canAccessSubscribers = hasPermission(role, 'subscribers.view');
  const canAccessContent = hasPermission(role, 'content.view');

  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
      return;
    }
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        try {
          localStorage.removeItem('admin_active_tab');
          localStorage.removeItem('admin_active_page');
          localStorage.removeItem('admin_inbox_subtab');
        } catch {}
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems: SidebarItem[] = [
    { id: 'overview', type: 'tab', tabId: 'overview', href: '/dashboard', label: 'Overview', icon: 'fa-chart-pie' },

    // Section: Website Pages (CMS)
    ...(canAccessContent
      ? [
          { type: 'header' as const, label: 'WEBSITE PAGES' },
          ...(!isEditor
            ? [
                { id: 'page-home', type: 'page' as const, tabId: 'pages', pageId: 'home', href: '/dashboard?tab=pages&page=home', label: 'Home Page', icon: 'fa-house' },
                { id: 'page-about', type: 'page' as const, tabId: 'pages', pageId: 'about', href: '/dashboard?tab=pages&page=about', label: 'About Us', icon: 'fa-circle-info' },
                { id: 'page-background', type: 'page' as const, tabId: 'pages', pageId: 'npc-background', href: '/dashboard?tab=pages&page=npc-background', label: 'NPC Background', icon: 'fa-book-open' },
                { id: 'page-leadership', type: 'page' as const, tabId: 'pages', pageId: 'leadership', href: '/dashboard?tab=pages&page=leadership', label: 'Leadership', icon: 'fa-users' },
              ]
            : []),
          { id: 'page-athletes', type: 'page' as const, tabId: 'pages', pageId: 'athletes', href: '/dashboard?tab=pages&page=athletes', label: 'Athletes Directory', icon: 'fa-person-running' },
          { id: 'page-sports', type: 'page' as const, tabId: 'pages', pageId: 'sports', href: '/dashboard?tab=pages&page=sports', label: 'Sports Programs', icon: 'fa-volleyball' },
          { id: 'page-news', type: 'page' as const, tabId: 'pages', pageId: 'news', href: '/dashboard?tab=pages&page=news', label: 'News Room', icon: 'fa-newspaper' },
          { id: 'page-announcements', type: 'page' as const, tabId: 'pages', pageId: 'announcements', href: '/dashboard?tab=pages&page=announcements', label: 'Announcements', icon: 'fa-bullhorn' },
          { id: 'page-events', type: 'page' as const, tabId: 'pages', pageId: 'events', href: '/dashboard?tab=pages&page=events', label: 'Events Calendar', icon: 'fa-calendar-days' },
          { id: 'page-careers', type: 'page' as const, tabId: 'pages', pageId: 'careers', href: '/dashboard?tab=pages&page=careers', label: 'Careers & Vacancies', icon: 'fa-briefcase' },
          ...(!isEditor
            ? [
                { id: 'page-governance', type: 'page' as const, tabId: 'pages', pageId: 'governance', href: '/dashboard?tab=pages&page=governance', label: 'Governance & Policies', icon: 'fa-scale-balanced' },
                { id: 'page-partners', type: 'page' as const, tabId: 'pages', pageId: 'partners', href: '/dashboard?tab=pages&page=partners', label: 'Partners & Sponsors', icon: 'fa-handshake' },
                { id: 'page-contact', type: 'page' as const, tabId: 'pages', pageId: 'contact', href: '/dashboard?tab=pages&page=contact', label: 'Contact & Footer', icon: 'fa-address-card' },
              ]
            : []),
        ]
      : []),

    // Section: Management (Controlled via granular permissions)
    ...((canAccessCommunity || canAccessDonations || canAccessMembers || canAccessUsers || canAccessInbox || canAccessSubscribers)
      ? [
          { type: 'header' as const, label: 'MANAGEMENT' },
          ...(canAccessCommunity ? [{ id: 'community-sports', type: 'link' as const, href: '/dashboard/community', label: 'Sports & Community', icon: 'fa-people-group' }] : []),
          ...(canAccessDonations ? [{ id: 'donations-payments', type: 'link' as const, href: '/dashboard/donations', label: 'Donation Payments', icon: 'fa-hand-holding-heart' }] : []),
          ...(canAccessMembers ? [{ id: 'members', type: 'tab' as const, tabId: 'members', href: '/dashboard?tab=members', label: 'Members Directory', icon: 'fa-users-cog' }] : []),
          ...(canAccessUsers ? [{ id: 'users', type: 'tab' as const, tabId: 'users', href: '/dashboard?tab=users', label: 'User Management', icon: 'fa-user-shield' }] : []),
          ...(canAccessInbox ? [{ id: 'contacts', type: 'tab' as const, tabId: 'contacts', href: '/dashboard?tab=contacts', label: 'Inbox Messages', icon: 'fa-envelope' }] : []),
          ...(canAccessSubscribers ? [{ id: 'subscribers', type: 'tab' as const, tabId: 'subscribers', href: '/dashboard?tab=subscribers', label: 'Subscribers', icon: 'fa-bell' }] : []),
        ]
      : []),

    // Section: Configuration (Only users with system-settings.view — strictly Super Admin)
    ...(canAccessSettings
      ? [
          { type: 'header' as const, label: 'CONFIGURATION' },
          { id: 'settings', type: 'tab' as const, tabId: 'settings', href: '/dashboard?tab=settings', label: 'System Settings', icon: 'fa-sliders' },
        ]
      : []),
  ];

  return (
    <>
      {/* ── Mobile Sidebar Backdrop ── */}
      {sidebarOpen && (
        <div
          className="dashboard-sidebar-backdrop d-lg-none"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`dashboard-sidebar ${sidebarOpen ? 'sidebar-open-mobile' : ''}`}
        style={{
          width: sidebarOpen ? '260px' : '72px',
          background: '#0F172A',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
          flexShrink: 0,
          zIndex: 1060,
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        {/* Logo block */}
        <div
          style={{
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
            <img src="/assets/img/logo.png" style={{ height: '32px', width: 'auto', flexShrink: 0 }} alt="NPC Logo" />
            {sidebarOpen && (
              <span style={{ fontWeight: 800, fontSize: '0.92rem', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                NPC DASHBOARD
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="d-lg-none btn btn-sm text-white-50 p-1"
            style={{ background: 'none', border: 'none', fontSize: '1.2rem', lineHeight: 1 }}
            title="Close menu"
          >
            <i className="fas fa-times" />
          </button>
        </div>

        {/* Links Navigation */}
        <nav
          className="dashboard-sidebar-nav"
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            padding: '12px 0',
            overflowY: 'auto',
          }}
        >
          {navItems.map((item, idx) => {
            if (item.type === 'header') {
              if (!sidebarOpen) {
                return (
                  <div
                    key={`sep-${idx}`}
                    style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '8px 12px' }}
                  />
                );
              }
              return (
                <div
                  key={`header-${idx}`}
                  style={{
                    padding: '14px 24px 6px',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    color: 'rgba(255, 255, 255, 0.45)',
                    textTransform: 'uppercase',
                  }}
                >
                  {item.label}
                </div>
              );
            }

            const isActive = activeId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (onNavigate) {
                    onNavigate(item);
                  } else {
                    if (item.href) {
                      router.push(item.href);
                    }
                    if (typeof window !== 'undefined' && window.innerWidth < 992) {
                      setSidebarOpen(false);
                    }
                  }
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.color = '#FFF';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.7)';
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: sidebarOpen ? '10px 24px' : '12px 0',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  background: isActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  border: 'none',
                  color: isActive ? '#FFF' : 'rgba(255,255,255,0.7)',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  fontWeight: isActive ? 600 : 400,
                  borderLeft: isActive ? '4px solid #FFA000' : '4px solid transparent',
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                }}
              >
                <i
                  className={`fas ${item.icon}`}
                  style={{
                    fontSize: '0.95rem',
                    width: '20px',
                    textAlign: 'center',
                    color: isActive ? '#FFA000' : 'inherit',
                  }}
                />
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Logout & Profile Info */}
        <div
          style={{
            padding: '16px',
            borderTop: '1px solid rgba(255,255,255,.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 8px' }}>
              <img
                src={`/assets/img/${activeAvatar}`}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  background: '#F1F5F9',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
                alt="Admin avatar"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/img/avatar-1.svg';
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#fff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {activeProfile.name || 'Admin'}
                </span>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'rgba(255,255,255,0.5)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {roleLabel}
                </span>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFA000')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,.7)')}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,.7)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              transition: 'color 0.2s',
            }}
          >
            <i className="fas fa-sign-out-alt" />
            {sidebarOpen && <span>Logout Account</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
