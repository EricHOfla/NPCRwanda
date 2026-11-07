'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export interface DashboardUserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface DashboardTopbarProps {
  title: string;
  breadcrumb?: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  userProfile?: DashboardUserProfile;
  children?: React.ReactNode;
}

export default function DashboardTopbar({
  title,
  breadcrumb = 'Dashboard',
  sidebarOpen,
  setSidebarOpen,
  userProfile: initialProfile,
  children,
}: DashboardTopbarProps) {
  const [profile, setProfile] = useState<DashboardUserProfile>(
    initialProfile || { name: 'Admin', email: '', role: 'ADMIN' }
  );
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Proceed to login anyway
    } finally {
      window.location.href = '/login';
    }
  };

  const isSuperAdmin = profile.role === 'SUPER_ADMIN';
  const isAdmin = profile.role === 'ADMIN' || isSuperAdmin;
  const avatarSrc = profile.avatar
    ? profile.avatar.startsWith('/')
      ? profile.avatar
      : `/assets/img/${profile.avatar}`
    : '/assets/img/avatar-1.svg';

  return (
    <header
      className="dashboard-topbar"
      style={{
        background: '#FFFFFF',
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
      {/* Left: Hamburger & Unified Breadcrumb / Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
        <button
          type="button"
          onClick={() => setSidebarOpen((prev) => !prev)}
          className="btn btn-sm btn-light border p-2"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#475569',
          }}
          aria-label="Toggle navigation menu"
        >
          <i className="fas fa-bars" style={{ fontSize: '0.95rem' }} />
        </button>

        <nav aria-label="breadcrumb" className="d-none d-sm-block">
          <ol className="breadcrumb mb-0" style={{ fontSize: '0.82rem' }}>
            <li className="breadcrumb-item">
              <Link href="/dashboard" className="text-decoration-none text-muted">
                {breadcrumb}
              </Link>
            </li>
            <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">
              {title}
            </li>
          </ol>
        </nav>

        <h1 className="dashboard-topbar-title d-sm-none" style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>
          {title}
        </h1>
      </div>

      {/* Right: Page-specific actions + Divider + User Profile dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {children && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {children}
          </div>
        )}

        <div style={{ borderLeft: '1px solid #E2E8F0', height: '32px' }} />

        {/* User Profile dropdown */}
        <div style={{ position: 'relative' }} ref={dropdownRef}>
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
            aria-expanded={profileDropdownOpen}
          >
            <span className="small fw-semibold text-dark d-none d-md-inline" style={{ fontSize: '0.82rem' }}>
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
            <i className="fas fa-chevron-down" style={{ fontSize: '0.7rem', color: '#64748B' }} />
          </button>

          {profileDropdownOpen && (
            <div
              style={{
                position: 'absolute',
                top: '44px',
                right: '0',
                width: '240px',
                background: '#FFFFFF',
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
                    width: '38px',
                    height: '38px',
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
                      fontSize: '0.85rem',
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
                      fontSize: '0.72rem',
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
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '20px',
                      background: isSuperAdmin
                        ? 'linear-gradient(135deg, #B45309, #F59E0B)'
                        : isAdmin
                        ? '#1E40AF'
                        : '#065F46',
                      color: '#FFFFFF',
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
                  href="/dashboard?tab=profile"
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

                {isSuperAdmin && (
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
