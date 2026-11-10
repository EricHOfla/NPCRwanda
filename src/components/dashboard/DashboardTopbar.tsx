'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { hasPermission } from '@/lib/rbac';

export interface DashboardUserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface NotificationItem {
  id: string;
  type: string;
  sender: string;
  snippet: string;
  date: string;
  color: string;
  href: string;
}

interface DashboardTopbarProps {
  title: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  userProfile?: DashboardUserProfile;
  children?: React.ReactNode;
}

export default function DashboardTopbar({
  title,
  sidebarOpen,
  setSidebarOpen,
  userProfile: initialProfile,
  children,
}: DashboardTopbarProps) {
  const [profile, setProfile] = useState<DashboardUserProfile>(
    initialProfile || { name: 'Admin', email: '', role: 'ADMIN' }
  );
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const profileRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  const canViewInbox = hasPermission(profile.role, 'inbox.view');
  const canViewSystemSettings = hasPermission(profile.role, 'system-settings.view');

  // Sync initialProfile if updated from parent
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  // Fetch profile if initialProfile wasn't fully populated
  useEffect(() => {
    if (!profile.email) {
      fetch('/api/auth/profile')
        .then((res) => (res.ok ? res.json() : null))
        .then((d) => {
          if (d?.user) {
            setProfile({
              name: d.user.name || 'Admin',
              email: d.user.email || '',
              role: d.user.role || 'ADMIN',
              avatar: d.user.avatar || 'avatar-1.svg',
            });
          }
        })
        .catch(() => {});
    }
  }, [profile.email]);

  // Refresh the notification bell on load, while open, and periodically.
  useEffect(() => {
    if (!canViewInbox) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    let active = true;
    const loadNotifications = async () => {
      try {
        const response = await fetch('/api/dashboard/notifications', { cache: 'no-store' });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Unable to load notifications');
        if (!active) return;
        setNotifications(Array.isArray(payload.items) ? payload.items : []);
        setUnreadCount(Number(payload.unreadCount) || 0);
      } catch {
        if (!active) return;
        setNotifications([]);
        setUnreadCount(0);
      }
    };

    void loadNotifications();
    const refreshInterval = window.setInterval(loadNotifications, 30000);

    return () => {
      active = false;
      window.clearInterval(refreshInterval);
    };
  }, [canViewInbox, bellOpen]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Proceed to login
    } finally {
      window.location.href = '/login';
    }
  };

  const isSuperAdmin = profile.role === 'SUPER_ADMIN';
  const isAdmin = profile.role === 'ADMIN' || isSuperAdmin;
  const avatarSrc = profile.avatar
    ? (profile.avatar.startsWith('/') || profile.avatar.startsWith('http'))
      ? profile.avatar
      : `/assets/img/${profile.avatar}`
    : '/assets/img/avatar-1.svg';

  return (
    <header
      className="dashboard-topbar"
      style={{
        background: '#fff',
        borderBottom: '1px solid #E2E8F0',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        zIndex: 1020,
      }}
    >
      {/* Left: Hamburger & Exact Title as Dashboard Overview */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: '#4A5568',
            padding: '6px 8px',
          }}
          aria-label="Toggle navigation menu"
        >
          <i className="fas fa-bars" />
        </button>

        <h1
          className="dashboard-topbar-title"
          style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}
        >
          {title}
        </h1>
      </div>

      {/* Right: Actions + Bell Dropdown + Divider + Profile Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {children && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {children}
          </div>
        )}

        {/* Inbox bell count & dropdown (Exact matching overview topbar) */}
        {canViewInbox && <div style={{ position: 'relative' }} ref={bellRef} data-bell-dropdown>
          <button
            type="button"
            onClick={() => setBellOpen((prev) => !prev)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: '6px',
            }}
            aria-label="Notifications"
          >
            <i className="far fa-bell text-secondary fa-lg" />
            {unreadCount > 0 && (
              <span
                className="badge bg-danger rounded-circle position-absolute top-0 end-0"
                style={{
                  fontSize: '0.62rem',
                  transform: 'translate(2px, -2px)',
                  padding: '3px 6px',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {bellOpen && (
            <div
              style={{
                position: 'absolute',
                top: '40px',
                right: '0',
                width: '320px',
                background: '#ffffff',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                zIndex: 1050,
                padding: '8px 0',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#0F172A' }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    className="badge bg-danger-subtle text-danger"
                    style={{ fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    {unreadCount} New
                  </span>
                )}
              </div>

              <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
                    <i className="far fa-bell-slash" style={{ fontSize: '1.5rem', marginBottom: '8px', display: 'block' }} />
                    No new notifications
                  </div>
                ) : (
                  notifications.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      onClick={() => setBellOpen(false)}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        textAlign: 'left',
                        background: 'transparent',
                        textDecoration: 'none',
                        borderBottom: '1px solid #F8FAFC',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.78rem', color: item.color }}>
                          {item.type}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>{item.date}</span>
                      </div>
                      <span
                        style={{
                          fontSize: '0.76rem',
                          fontWeight: 600,
                          color: '#0F172A',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          width: '100%',
                          display: 'block',
                        }}
                      >
                        From {item.sender}
                      </span>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          color: '#64748B',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          width: '100%',
                          display: 'block',
                        }}
                      >
                        {item.snippet}
                      </span>
                    </Link>
                  ))
                )}
              </div>

              <div style={{ padding: '8px 16px', borderTop: '1px solid #F1F5F9', textAlign: 'center' }}>
                <Link
                  href="/dashboard?tab=contacts"
                  onClick={() => setBellOpen(false)}
                  style={{
                    color: '#0b63b6',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                  }}
                >
                  View all inbox notifications
                </Link>
              </div>
            </div>
          )}
        </div>}

        <div style={{ borderLeft: '1px solid #E2E8F0', height: '32px' }} />

        {/* Profile avatar dropdown (Exact matching overview topbar) */}
        <div style={{ position: 'relative' }} ref={profileRef} data-profile-dropdown>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '8px',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F1F5F9')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <span className="small fw-semibold text-dark d-none d-sm-inline">
              {profile.name || 'Admin'}
            </span>
            <img
              src={avatarSrc}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
                background: '#F1F5F9',
                border: '1px solid rgba(0,0,0,0.08)',
              }}
              alt="Admin avatar"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/img/avatar-1.svg';
              }}
            />
            <i className="fas fa-chevron-down" style={{ fontSize: '0.75rem', color: '#64748B' }} />
          </button>

          {profileDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: '0',
                width: '240px',
                background: '#ffffff',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                zIndex: 1050,
                padding: '12px 0',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  padding: '0 16px 12px 16px',
                  borderBottom: '1px solid #F1F5F9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <img
                  src={avatarSrc}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    background: '#F1F5F9',
                    border: '1px solid rgba(0,0,0,0.08)',
                  }}
                  alt="Admin avatar"
                />
                <div style={{ minWidth: 0 }}>
                  <span
                    style={{
                      fontWeight: 700,
                      fontSize: '0.88rem',
                      color: '#0F172A',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {profile.name || 'Admin User'}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#64748B',
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {profile.email || 'admin@npcrwanda.org'}
                  </span>
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: '4px',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '20px',
                      background: isSuperAdmin
                        ? 'linear-gradient(135deg, #B45309, #F59E0B)'
                        : isAdmin
                        ? '#1E40AF'
                        : '#065F46',
                      color: '#fff',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {isSuperAdmin ? '👑 Super Admin' : isAdmin ? '🛡 Administrator' : '✏️ Editor'}
                  </span>
                </div>
              </div>

              <div style={{ padding: '4px 0' }}>
                <Link
                  href="/dashboard/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    textAlign: 'left',
                    background: 'transparent',
                    textDecoration: 'none',
                    fontSize: '0.8rem',
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <i className="fas fa-user-cog" style={{ color: '#64748B', width: '16px' }} />
                  Profile Settings
                </Link>

                {canViewSystemSettings && (
                  <Link
                    href="/dashboard?tab=settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    style={{
                      width: '100%',
                      padding: '8px 16px',
                      textAlign: 'left',
                      background: 'transparent',
                      textDecoration: 'none',
                      fontSize: '0.8rem',
                      color: '#334155',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8FAFC')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <i className="fas fa-sliders" style={{ color: '#64748B', width: '16px' }} />
                    System Settings
                  </Link>
                )}
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', padding: '4px 0 0 0', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    handleLogout();
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 16px',
                    textAlign: 'left',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.8rem',
                    color: '#DC2626',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FEF2F2')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <i className="fas fa-arrow-right-from-bracket" style={{ color: '#DC2626', width: '16px' }} />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
