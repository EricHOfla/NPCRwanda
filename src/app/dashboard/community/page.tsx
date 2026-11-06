'use client';

import AppSidebar from '@/components/dashboard/AppSidebar';
import React, { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

type Row = Record<string, any> & { id: string };
type Data = { 
  programmes: Row[]; 
  results: Row[]; 
  gallery: Row[]; 
  athleteEnquiries: Row[]; 
  eventRegistrations: Row[]; 
  sponsorEnquiries: Row[] 
};

const empty: Data = { 
  programmes: [], 
  results: [], 
  gallery: [], 
  athleteEnquiries: [], 
  eventRegistrations: [], 
  sponsorEnquiries: [] 
};

function CommunityManagementContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; role: string }>({ name: 'Admin', email: '', role: 'ADMIN' });

  // Data states
  const [data, setData] = useState<Data>(empty);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tab & Sub-tab navigation
  const initialTab = (searchParams.get('tab') as 'programmes' | 'results' | 'gallery' | 'enquiries') || 'programmes';
  const initialSub = (searchParams.get('sub') as 'athleteEnquiries' | 'eventRegistrations' | 'sponsorEnquiries') || 'athleteEnquiries';

  const [activeTab, setActiveTab] = useState<'programmes' | 'results' | 'gallery' | 'enquiries'>(initialTab);
  const [activeEnquirySubTab, setActiveEnquirySubTab] = useState<'athleteEnquiries' | 'eventRegistrations' | 'sponsorEnquiries'>(initialSub);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination per table
  const [tablePages, setTablePages] = useState<Record<string, number>>({});
  const pageSize = 10;

  // Modal states for creating new records
  const [showProgrammeModal, setShowProgrammeModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);

  // Form states
  const [programme, setProgramme] = useState({ 
    title: '', sport: '', description: '', location: '', schedule: '', 
    startDate: '', endDate: '', eligibility: '', contactEmail: '', status: 'Draft', featured: false 
  });
  const [result, setResult] = useState({ 
    eventTitle: '', competitionDate: '', athleteName: '', sport: '', 
    category: '', position: '', medal: '', result: '', notes: '', published: false 
  });
  const [gallery, setGallery] = useState({ 
    title: '', description: '', mediaUrl: '', mediaType: 'image', 
    category: 'General', eventDate: '', published: false 
  });

  // Fetch user profile for sidebar
  useEffect(() => {
    fetch('/api/auth/profile')
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json?.user) {
          setUserProfile({
            name: json.user.name || 'Admin',
            email: json.user.email || '',
            role: json.user.role || 'ADMIN'
          });
        }
      })
      .catch(() => {});
  }, []);

  // Fetch community data
  const load = useCallback(async () => {
    setLoading(true); 
    setError('');
    try {
      const response = await fetch('/api/admin/community', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to load community data');
      setData({ ...empty, ...payload });
    } catch (e) { 
      setError(e instanceof Error ? e.message : 'Unable to load data'); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  // Sync tab from URL if present
  useEffect(() => {
    const tab = searchParams.get('tab') as 'programmes' | 'results' | 'gallery' | 'enquiries';
    if (tab && ['programmes', 'results', 'gallery', 'enquiries'].includes(tab)) {
      setActiveTab(tab);
    }
    const sub = searchParams.get('sub') as 'athleteEnquiries' | 'eventRegistrations' | 'sponsorEnquiries';
    if (sub && ['athleteEnquiries', 'eventRegistrations', 'sponsorEnquiries'].includes(sub)) {
      setActiveEnquirySubTab(sub);
    }
  }, [searchParams]);

  // Reset pagination & filters on tab switch
  useEffect(() => {
    setSearchQuery('');
    setStatusFilter('ALL');
  }, [activeTab, activeEnquirySubTab]);

  // Save new content item
  async function saveContent(endpoint: string, values: Record<string, unknown>, label: string, reset: () => void, closeModal: () => void) {
    setBusy(label); 
    setError(''); 
    setSuccess('');
    try {
      const response = await fetch(endpoint, { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(values) 
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Save failed');
      reset(); 
      closeModal();
      setSuccess(`${label} created successfully.`); 
      await load();
    } catch (e) { 
      setError(e instanceof Error ? e.message : 'Save failed'); 
    } finally { 
      setBusy(''); 
    }
  }

  // Update item status/visibility
  async function update(type: string, item: Row, values: Record<string, unknown>) {
    setBusy(item.id); 
    setError(''); 
    setSuccess('');
    try {
      const response = await fetch('/api/admin/community', { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ type, id: item.id, ...values }) 
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Update failed');
      setSuccess('Record updated successfully.'); 
      await load();
    } catch (e) { 
      setError(e instanceof Error ? e.message : 'Update failed'); 
    } finally { 
      setBusy(''); 
    }
  }

  // Delete item
  async function remove(type: string, item: Row) {
    if (!window.confirm('Delete this record permanently?')) return;
    setBusy(item.id); 
    setError(''); 
    setSuccess('');
    try {
      const response = await fetch('/api/admin/community', { 
        method: 'DELETE', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ type, id: item.id }) 
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Delete failed');
      setSuccess('Record deleted.'); 
      await load();
    } catch (e) { 
      setError(e instanceof Error ? e.message : 'Delete failed'); 
    } finally { 
      setBusy(''); 
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch {
      router.push('/login');
    }
  };

  // Render Table Helper
  const renderTable = (
    title: string, 
    type: keyof Data, 
    columns: { label: string; key: string; format?: (val: any, row: Row) => React.ReactNode }[], 
    statusOptions?: string[]
  ) => {
    const rawList = data[type] || [];
    
    // Filter list
    const filtered = rawList.filter(item => {
      const matchesSearch = !searchQuery.trim() || Object.values(item).some(
        val => typeof val === 'string' && val.toLowerCase().includes(searchQuery.toLowerCase())
      );
      const matchesStatus = statusFilter === 'ALL' || (
        type === 'programmes' ? item.status === statusFilter :
        ['results', 'gallery'].includes(type) ? (statusFilter === 'Published' ? item.published : !item.published) :
        item.status === statusFilter
      );
      return matchesSearch && matchesStatus;
    });

    const currentPage = tablePages[type] || 1;
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
      <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }} key={type}>
        {/* Table Header & Search Filter Bar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }} className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{title}</h3>
            <span className="badge rounded-pill bg-light text-secondary border px-2 py-1" style={{ fontSize: '0.72rem' }}>
              {total} {total === 1 ? 'record' : 'records'}
            </span>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            <div className="input-group input-group-sm" style={{ width: '220px' }}>
              <span className="input-group-text bg-white border-end-0 text-muted">
                <i className="fas fa-search" style={{ fontSize: '0.75rem' }} />
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setTablePages(prev => ({ ...prev, [type]: 1 })); }}
              />
            </div>

            <select
              className="form-select form-select-sm"
              style={{ width: '130px', fontSize: '0.78rem' }}
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setTablePages(prev => ({ ...prev, [type]: 1 })); }}
            >
              <option value="ALL">All Status</option>
              {type === 'programmes' ? (
                <>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </>
              ) : ['results', 'gallery'].includes(type) ? (
                <>
                  <option value="Published">Published</option>
                  <option value="Hidden">Hidden</option>
                </>
              ) : (
                (statusOptions || ['New', 'Contacted', 'Closed']).map(st => (
                  <option key={st} value={st}>{st}</option>
                ))
              )}
            </select>
          </div>
        </div>

        {total === 0 ? (
          <div className="text-center py-5 text-muted" style={{ fontSize: '0.86rem' }}>
            <i className="far fa-folder-open fa-2x mb-2 d-block text-secondary opacity-50" />
            {rawList.length === 0 ? 'No entries recorded in this category yet.' : 'No entries matched your search criteria.'}
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.86rem' }}>
                <thead style={{ background: '#F8FAFC', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <tr>
                    {columns.map(c => <th key={c.key} style={{ padding: '12px 18px' }}>{c.label}</th>)}
                    <th style={{ padding: '12px 18px', minWidth: '140px' }}>Status / Visibility</th>
                    <th className="text-end" style={{ paddingRight: '18px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      {columns.map(c => (
                        <td key={c.key} style={{ minWidth: 140, padding: '12px 18px' }}>
                          {c.format ? (
                            c.format(item[c.key], item)
                          ) : (
                            <span className="text-dark fw-medium">{String(item[c.key] ?? '—').slice(0, 120)}</span>
                          )}
                        </td>
                      ))}
                      <td style={{ minWidth: 140, padding: '12px 18px' }}>
                        {type === 'programmes' ? (
                          <select 
                            className="form-select form-select-sm" 
                            value={item.status} 
                            disabled={busy === item.id} 
                            onChange={e => void update(type, item, { status: e.target.value })}
                            style={{ fontSize: '0.78rem', borderRadius: '6px' }}
                          >
                            <option>Draft</option>
                            <option>Published</option>
                            <option>Archived</option>
                          </select>
                        ) : ['results', 'gallery'].includes(type) ? (
                          <button 
                            type="button"
                            className={`btn btn-sm ${item.published ? 'btn-success-subtle text-success border border-success-subtle' : 'btn-light border text-muted'}`} 
                            disabled={busy === item.id} 
                            onClick={() => void update(type, item, { published: !item.published })}
                            style={{ fontSize: '0.74rem', fontWeight: 600, borderRadius: '20px', padding: '3px 12px' }}
                          >
                            <i className={`fas ${item.published ? 'fa-check' : 'fa-eye-slash'} me-1`} />
                            {item.published ? 'Published' : 'Hidden'}
                          </button>
                        ) : (
                          <select 
                            className="form-select form-select-sm" 
                            value={item.status} 
                            disabled={busy === item.id} 
                            onChange={e => void update(type, item, { status: e.target.value })}
                            style={{ fontSize: '0.78rem', borderRadius: '6px' }}
                          >
                            {(statusOptions || ['New', 'Contacted', 'Closed']).map(s => <option key={s}>{s}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="text-end" style={{ paddingRight: '18px' }}>
                        <button 
                          type="button"
                          className="btn btn-sm btn-outline-danger p-1 px-2" 
                          disabled={busy === item.id} 
                          onClick={() => void remove(type, item)} 
                          title="Delete record"
                          aria-label="Delete record"
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-3 py-2 border-top bg-light">
                <span className="small text-muted" style={{ fontSize: '0.78rem' }}>
                  Showing <strong>{(currentPage - 1) * pageSize + 1}</strong> to <strong>{Math.min(currentPage * pageSize, total)}</strong> of <strong>{total}</strong>
                </span>
                <nav>
                  <ul className="pagination pagination-sm mb-0 gap-1">
                    <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setTablePages(prev => ({ ...prev, [type]: Math.max(1, currentPage - 1) }))} disabled={currentPage <= 1}>
                        <i className="fas fa-chevron-left" />
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <li key={p} className={`page-item ${p === currentPage ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => setTablePages(prev => ({ ...prev, [type]: p }))}>
                          {p}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" onClick={() => setTablePages(prev => ({ ...prev, [type]: Math.min(totalPages, currentPage + 1) }))} disabled={currentPage >= totalPages}>
                        <i className="fas fa-chevron-right" />
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC' }}>
      {/* ── System Sidebar (Unified with main dashboard) ── */}
      <AppSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeId="community-sports"
        profile={userProfile}
      />

      {/* ── Main Dashboard Workspace ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Bar */}
        <header style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '14px 28px', position: 'sticky', top: 0, zIndex: 100 }}>
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3">
              <button 
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="btn btn-sm btn-light border p-2"
                style={{ width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                title="Toggle Sidebar"
              >
                <i className="fas fa-bars" style={{ fontSize: '0.9rem' }} />
              </button>

              <nav aria-label="breadcrumb" className="d-none d-sm-block">
                <ol className="breadcrumb mb-0" style={{ fontSize: '0.8rem' }}>
                  <li className="breadcrumb-item"><Link href="/dashboard" className="text-decoration-none text-muted">Dashboard</Link></li>
                  <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">Sports Development & Community</li>
                </ol>
              </nav>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Link 
                href="/dashboard/donations" 
                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2 fw-semibold"
                style={{ borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem' }}
              >
                <i className="fas fa-hand-holding-heart text-primary" /> Donation Payments
              </Link>
              <button 
                type="button"
                className="btn btn-sm btn-light border d-inline-flex align-items-center gap-2 fw-semibold text-secondary"
                onClick={() => void load()} 
                disabled={loading}
                style={{ borderRadius: '8px', padding: '6px 14px', fontSize: '0.8rem' }}
              >
                <i className={`fas fa-rotate ${loading ? 'fa-spin' : ''}`} /> Refresh
              </button>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="py-4 px-3 px-lg-4" style={{ flex: 1, maxWidth: 1600, width: '100%', margin: '0 auto' }}>
          {/* Notification Alerts */}
          {error && (
            <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center justify-content-between mb-4" style={{ borderRadius: '10px' }}>
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-circle-exclamation text-danger" /> <span>{error}</span>
              </div>
              <button type="button" onClick={() => setError('')} className="btn-close" aria-label="Close" />
            </div>
          )}
          {success && (
            <div className="alert alert-success border-0 shadow-sm d-flex align-items-center justify-content-between mb-4" style={{ borderRadius: '10px' }}>
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-check-circle text-success" /> <span>{success}</span>
              </div>
              <button type="button" onClick={() => setSuccess('')} className="btn-close" aria-label="Close" />
            </div>
          )}

          {/* Hero Banner with Quick Creation Buttons */}
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #074783 0%, #0b63b6 60%, #083866 100%)',
              borderRadius: '16px',
              padding: '24px 28px',
              color: '#ffffff',
              marginBottom: '24px',
              boxShadow: '0 8px 24px rgba(11, 99, 182, 0.16)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', right: '-10px', bottom: '-25px', opacity: 0.12, fontSize: '8.5rem', color: '#fff', pointerEvents: 'none' }}>
              <i className="fas fa-volleyball" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', position: 'relative', zIndex: 2 }}>
              <div>
                <span className="badge mb-2" style={{ background: 'rgba(255, 215, 0, 0.2)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.35)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Sports Desk & Community Center
                </span>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
                  Sports Development & Community Desk
                </h1>
                <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0, maxWidth: '640px', lineHeight: '1.45' }}>
                  Manage grassroots training programmes, athlete competition results, intake registrations, and media photo gallery.
                </p>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <button 
                  type="button"
                  onClick={() => setShowProgrammeModal(true)}
                  className="btn btn-sm"
                  style={{ background: '#FFD700', color: '#000000', fontWeight: 700, borderRadius: '8px', border: 'none', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                >
                  <i className="fas fa-plus" /> New Programme
                </button>
                <button 
                  type="button"
                  onClick={() => setShowResultModal(true)}
                  className="btn btn-sm"
                  style={{ background: 'rgba(255, 255, 255, 0.16)', color: '#ffffff', fontWeight: 600, borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fas fa-medal" /> Add Result
                </button>
                <button 
                  type="button"
                  onClick={() => setShowGalleryModal(true)}
                  className="btn btn-sm"
                  style={{ background: 'rgba(255, 255, 255, 0.16)', color: '#ffffff', fontWeight: 600, borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.25)', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fas fa-camera" /> Upload Media
                </button>
              </div>
            </div>
          </div>

          {/* Interactive KPI Counter Strip */}
          <div className="row g-3 mb-4">
            {[
              { id: 'programmes', label: 'Training Programmes', count: data.programmes.length, icon: 'fa-dumbbell', color: '#0072C6', bg: '#E0F2FE' },
              { id: 'results', label: 'Competition Results', count: data.results.length, icon: 'fa-trophy', color: '#F59E0B', bg: '#FEF3C7' },
              { id: 'gallery', label: 'Gallery Media', count: data.gallery.length, icon: 'fa-images', color: '#10B981', bg: '#D1FAE5' },
              { id: 'athleteEnquiries', isEnquiry: true, subKey: 'athleteEnquiries', label: 'Athlete Intake', count: data.athleteEnquiries.length, icon: 'fa-person-running', color: '#6366F1', bg: '#EDE9FE' },
              { id: 'eventRegistrations', isEnquiry: true, subKey: 'eventRegistrations', label: 'Event Signups', count: data.eventRegistrations.length, icon: 'fa-calendar-check', color: '#EC4899', bg: '#FCE7F3' },
              { id: 'sponsorEnquiries', isEnquiry: true, subKey: 'sponsorEnquiries', label: 'Sponsor Leads', count: data.sponsorEnquiries.length, icon: 'fa-handshake', color: '#0284C7', bg: '#E0F2FE' },
            ].map(k => (
              <div className="col-6 col-md-4 col-xl-2" key={k.id}>
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (k.isEnquiry) {
                      setActiveTab('enquiries');
                      setActiveEnquirySubTab(k.subKey as any);
                    } else {
                      setActiveTab(k.id as any);
                    }
                  }}
                  style={{ 
                    background: '#FFFFFF', 
                    borderRadius: '12px', 
                    border: '1px solid #E2E8F0', 
                    padding: '16px', 
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = k.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.transform = 'none'; }}
                  title={`View ${k.label}`}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>{k.label}</span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`fas ${k.icon}`} style={{ color: k.color, fontSize: '0.8rem' }} />
                    </div>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
                    {k.count}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab Navigation Navigation Bar */}
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
            <div className="nav nav-pills gap-2" role="tablist">
              {[
                { id: 'programmes', label: 'Training Programmes', icon: 'fa-dumbbell', count: data.programmes.length },
                { id: 'results', label: 'Competition Results', icon: 'fa-trophy', count: data.results.length },
                { id: 'gallery', label: 'Gallery Media', icon: 'fa-images', count: data.gallery.length },
                { 
                  id: 'enquiries', 
                  label: 'Public Enquiries & Intake', 
                  icon: 'fa-clipboard-list', 
                  count: data.athleteEnquiries.length + data.eventRegistrations.length + data.sponsorEnquiries.length 
                },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  className={`btn btn-sm d-flex align-items-center gap-2 fw-semibold ${activeTab === tab.id ? 'btn-primary' : 'btn-light border text-secondary'}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{ borderRadius: '8px', padding: '8px 14px', fontSize: '0.82rem' }}
                >
                  <i className={`fas ${tab.icon}`} />
                  <span>{tab.label}</span>
                  <span className={`badge rounded-pill ${activeTab === tab.id ? 'bg-white text-primary' : 'bg-secondary text-white'}`} style={{ fontSize: '0.68rem' }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* Quick Action Button for Active Tab */}
            {activeTab === 'programmes' && (
              <button 
                type="button" 
                onClick={() => setShowProgrammeModal(true)} 
                className="btn btn-sm btn-primary fw-semibold d-flex align-items-center gap-2"
                style={{ borderRadius: '8px', padding: '8px 16px', background: '#0b63b6' }}
              >
                <i className="fas fa-plus" /> Add Training Programme
              </button>
            )}
            {activeTab === 'results' && (
              <button 
                type="button" 
                onClick={() => setShowResultModal(true)} 
                className="btn btn-sm btn-warning fw-semibold text-dark d-flex align-items-center gap-2"
                style={{ borderRadius: '8px', padding: '8px 16px' }}
              >
                <i className="fas fa-medal" /> Add Competition Result
              </button>
            )}
            {activeTab === 'gallery' && (
              <button 
                type="button" 
                onClick={() => setShowGalleryModal(true)} 
                className="btn btn-sm btn-success fw-semibold d-flex align-items-center gap-2"
                style={{ borderRadius: '8px', padding: '8px 16px' }}
              >
                <i className="fas fa-camera" /> Add Gallery Media
              </button>
            )}
          </div>

          {/* Sub-tab selection for Public Enquiries */}
          {activeTab === 'enquiries' && (
            <div className="d-flex flex-wrap gap-2 mb-3 p-2 bg-white rounded border">
              <span className="small fw-bold text-muted d-flex align-items-center px-2">Sub-queue:</span>
              {[
                { key: 'athleteEnquiries', label: 'Athlete Intake Enquiries', icon: 'fa-person-running', count: data.athleteEnquiries.length },
                { key: 'eventRegistrations', label: 'Public Event Registrations', icon: 'fa-calendar-check', count: data.eventRegistrations.length },
                { key: 'sponsorEnquiries', label: 'Partnership Requests', icon: 'fa-handshake', count: data.sponsorEnquiries.length },
              ].map(sub => (
                <button
                  key={sub.key}
                  type="button"
                  className={`btn btn-xs fw-semibold ${activeEnquirySubTab === sub.key ? 'btn-primary' : 'btn-light border text-secondary'}`}
                  onClick={() => setActiveEnquirySubTab(sub.key as any)}
                  style={{ borderRadius: '6px', padding: '5px 12px', fontSize: '0.78rem' }}
                >
                  <i className={`fas ${sub.icon} me-1`} /> {sub.label} ({sub.count})
                </button>
              ))}
            </div>
          )}

          {/* Main Content Tables */}
          {loading ? (
            <div className="text-center py-5 text-muted" role="status">
              <i className="fas fa-circle-notch fa-spin fa-2x mb-3 text-primary d-block" />
              <span className="small fw-semibold">Loading community management desk records...</span>
            </div>
          ) : (
            <>
              {/* Tab 1: Programmes */}
              {activeTab === 'programmes' && renderTable('Grassroots Training Programmes', 'programmes', [
                { label: 'Programme Title', key: 'title', format: (val, item) => (
                  <div>
                    <span className="text-dark fw-bold d-block">{val}</span>
                    {item.featured && <span className="badge bg-warning text-dark" style={{ fontSize: '0.62rem' }}>Featured</span>}
                  </div>
                )},
                { label: 'Sport', key: 'sport' },
                { label: 'Location', key: 'location' },
                { label: 'Schedule', key: 'schedule' },
                { label: 'Contact', key: 'contactEmail' },
              ])}

              {/* Tab 2: Results */}
              {activeTab === 'results' && renderTable('Competition & Paralympic Results', 'results', [
                { label: 'Event / Competition', key: 'eventTitle', format: (val, item) => (
                  <div>
                    <span className="text-dark fw-bold d-block">{val}</span>
                    <span className="small text-muted">{item.competitionDate}</span>
                  </div>
                )},
                { label: 'Athlete Name', key: 'athleteName' },
                { label: 'Sport / Category', key: 'sport', format: (val, item) => (
                  <span>{val} {item.category ? `(${item.category})` : ''}</span>
                )},
                { label: 'Medal', key: 'medal', format: (val) => {
                  if (!val) return <span className="text-muted">—</span>;
                  const isGold = val.toLowerCase().includes('gold');
                  const isSilver = val.toLowerCase().includes('silver');
                  const isBronze = val.toLowerCase().includes('bronze');
                  return (
                    <span className="badge" style={{ 
                      background: isGold ? '#FEF08A' : isSilver ? '#E2E8F0' : isBronze ? '#FED7AA' : '#F1F5F9',
                      color: isGold ? '#854D0E' : isSilver ? '#475569' : isBronze ? '#9A3412' : '#334155',
                      fontSize: '0.72rem',
                      fontWeight: 700
                    }}>
                      <i className="fas fa-medal me-1" />{val}
                    </span>
                  );
                }},
                { label: 'Rank / Result', key: 'position', format: (val, item) => (
                  <span>{val || item.result || '—'}</span>
                )},
              ])}

              {/* Tab 3: Gallery */}
              {activeTab === 'gallery' && renderTable('Photo & Video Media Gallery', 'gallery', [
                { label: 'Thumbnail / Preview', key: 'mediaUrl', format: (val, item) => (
                  <div style={{ width: '60px', height: '42px', borderRadius: '6px', background: '#E2E8F0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.mediaType === 'video' ? (
                      <i className="fas fa-video text-secondary" />
                    ) : val ? (
                      <img src={val} alt={item.title || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as any).style.display = 'none'; }} />
                    ) : (
                      <i className="fas fa-image text-secondary" />
                    )}
                  </div>
                )},
                { label: 'Media Title', key: 'title', format: (val, item) => (
                  <div>
                    <span className="text-dark fw-bold d-block">{val}</span>
                    <span className="small text-muted" style={{ fontSize: '0.72rem' }}>{item.description || 'No description'}</span>
                  </div>
                )},
                { label: 'Category', key: 'category' },
                { label: 'Media Type', key: 'mediaType', format: (val) => (
                  <span className="badge bg-light text-dark border text-uppercase" style={{ fontSize: '0.68rem' }}>
                    {val === 'video' ? '🎬 Video' : '📷 Image'}
                  </span>
                )},
              ])}

              {/* Tab 4: Public Enquiries */}
              {activeTab === 'enquiries' && (
                <>
                  {activeEnquirySubTab === 'athleteEnquiries' && renderTable('Athlete Intake Enquiries', 'athleteEnquiries', [
                    { label: 'Athlete Full Name', key: 'fullName', format: (val, item) => (
                      <div>
                        <span className="text-dark fw-bold d-block">{val}</span>
                        <span className="small text-muted" style={{ fontSize: '0.7rem' }}>Age: {item.ageRange || 'Not provided'}</span>
                      </div>
                    )},
                    { label: 'Email Address', key: 'email' },
                    { label: 'Phone', key: 'phone' },
                    { label: 'Sport & District', key: 'sport', format: (val, item) => (
                      <span>{val} · {item.district}</span>
                    )},
                    { label: 'Message / Notes', key: 'message', format: (val) => (
                      <span className="small text-muted" title={val}>{val ? val.slice(0, 80) + '...' : '—'}</span>
                    )}
                  ], ['New', 'Contacted', 'Accepted', 'Closed'])}

                  {activeEnquirySubTab === 'eventRegistrations' && renderTable('Public Event Registrations', 'eventRegistrations', [
                    { label: 'Target Event', key: 'eventTitle', format: (val) => (
                      <span className="text-dark fw-bold">{val}</span>
                    )},
                    { label: 'Participant Name', key: 'fullName' },
                    { label: 'Email', key: 'email' },
                    { label: 'Phone', key: 'phone' },
                    { label: 'Organization', key: 'organization' },
                  ], ['Pending', 'Confirmed', 'Waitlisted', 'Cancelled'])}

                  {activeEnquirySubTab === 'sponsorEnquiries' && renderTable('Sponsor & Institutional Partnership Requests', 'sponsorEnquiries', [
                    { label: 'Organisation', key: 'organization', format: (val) => (
                      <span className="text-dark fw-bold">{val}</span>
                    )},
                    { label: 'Contact Person', key: 'contactName' },
                    { label: 'Email Address', key: 'email' },
                    { label: 'Phone', key: 'phone' },
                    { label: 'Nature of Support', key: 'supportType' },
                  ], ['New', 'In Discussion', 'Confirmed', 'Closed'])}
                </>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Modal: Add Training Programme ── */}
      {showProgrammeModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1080 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header text-white" style={{ background: '#0b63b6' }}>
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-plus me-2" /> Add Grassroots Training Programme
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowProgrammeModal(false)} aria-label="Close" />
              </div>
              <form onSubmit={(e: FormEvent) => {
                e.preventDefault();
                void saveContent(
                  '/api/training-programs', 
                  programme, 
                  'Training programme', 
                  () => setProgramme({ title: '', sport: '', description: '', location: '', schedule: '', startDate: '', endDate: '', eligibility: '', contactEmail: '', status: 'Draft', featured: false }),
                  () => setShowProgrammeModal(false)
                );
              }}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Programme Title *</label>
                    <input className="form-control" required value={programme.title} onChange={e => setProgramme(s => ({ ...s, title: e.target.value }))} placeholder="e.g. Grassroots Sitting Volleyball Youth Academy" />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Sport Discipline *</label>
                      <input className="form-control" required value={programme.sport} onChange={e => setProgramme(s => ({ ...s, sport: e.target.value }))} placeholder="Sitting Volleyball / Para Athletics" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Location / Venue *</label>
                      <input className="form-control" required value={programme.location} onChange={e => setProgramme(s => ({ ...s, location: e.target.value }))} placeholder="Amahoro Stadium / Huye Gymnasium" />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Start Date</label>
                      <input className="form-control" type="date" value={programme.startDate} onChange={e => setProgramme(s => ({ ...s, startDate: e.target.value }))} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">End Date</label>
                      <input className="form-control" type="date" value={programme.endDate} onChange={e => setProgramme(s => ({ ...s, endDate: e.target.value }))} />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Schedule Frequency</label>
                      <input className="form-control" value={programme.schedule} onChange={e => setProgramme(s => ({ ...s, schedule: e.target.value }))} placeholder="Every Saturday 9:00 AM" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Contact Email</label>
                      <input className="form-control" type="email" value={programme.contactEmail} onChange={e => setProgramme(s => ({ ...s, contactEmail: e.target.value }))} placeholder="programmes@npcrwanda.org" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description * (Minimum 10 characters)</label>
                    <textarea className="form-control" rows={3} required minLength={10} value={programme.description} onChange={e => setProgramme(s => ({ ...s, description: e.target.value }))} placeholder="Describe training goals, target age group, and participation guidelines..." />
                  </div>
                  <div className="d-flex align-items-center justify-content-between p-3 bg-light rounded border">
                    <div>
                      <span className="fw-bold small d-block">Feature on Website Portal</span>
                      <small className="text-muted">Display prominently on the public sports development page</small>
                    </div>
                    <div className="form-check form-switch">
                      <input className="form-check-input" type="checkbox" role="switch" checked={programme.featured} onChange={e => setProgramme(s => ({ ...s, featured: e.target.checked }))} id="programme-feat-switch" />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowProgrammeModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm px-4 fw-semibold" style={{ background: '#0b63b6' }} disabled={busy === 'Training programme'}>
                    {busy === 'Training programme' ? <><i className="fas fa-spinner fa-spin me-1" /> Saving...</> : 'Save Programme'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Add Competition Result ── */}
      {showResultModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1080 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header text-dark" style={{ background: '#FFD700' }}>
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-trophy me-2" /> Add Competition Result
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowResultModal(false)} aria-label="Close" />
              </div>
              <form onSubmit={(e: FormEvent) => {
                e.preventDefault();
                void saveContent(
                  '/api/competition-results', 
                  result, 
                  'Competition result', 
                  () => setResult({ eventTitle: '', competitionDate: '', athleteName: '', sport: '', category: '', position: '', medal: '', result: '', notes: '', published: false }),
                  () => setShowResultModal(false)
                );
              }}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Competition / Event Title *</label>
                    <input className="form-control" required value={result.eventTitle} onChange={e => setResult(s => ({ ...s, eventTitle: e.target.value }))} placeholder="e.g. Paris 2024 Paralympic Games / World Para Athletics Championships" />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Athlete Name *</label>
                      <input className="form-control" required value={result.athleteName} onChange={e => setResult(s => ({ ...s, athleteName: e.target.value }))} placeholder="Hermas Cliff Muvunyi" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Sport Discipline *</label>
                      <input className="form-control" required value={result.sport} onChange={e => setResult(s => ({ ...s, sport: e.target.value }))} placeholder="Para Athletics / Sitting Volleyball" />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Medal Won</label>
                      <select className="form-select" value={result.medal} onChange={e => setResult(s => ({ ...s, medal: e.target.value }))}>
                        <option value="">No Medal (Finalist/Participant)</option>
                        <option value="Gold">Gold Medal 🥇</option>
                        <option value="Silver">Silver Medal 🥈</option>
                        <option value="Bronze">Bronze Medal 🥉</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Position / Rank</label>
                      <input className="form-control" value={result.position} onChange={e => setResult(s => ({ ...s, position: e.target.value }))} placeholder="1st Place / 5th in Final" />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">Competition Date *</label>
                      <input className="form-control" type="date" required value={result.competitionDate} onChange={e => setResult(s => ({ ...s, competitionDate: e.target.value }))} />
                    </div>
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Classification Category</label>
                      <input className="form-control" value={result.category} onChange={e => setResult(s => ({ ...s, category: e.target.value }))} placeholder="T46 Men's 400m / Sitting Volleyball Women" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Time / Mark Score</label>
                      <input className="form-control" value={result.result} onChange={e => setResult(s => ({ ...s, result: e.target.value }))} placeholder="49.04s / 3-1 Sets" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Notes / Highlights</label>
                    <textarea className="form-control" rows={2} value={result.notes} onChange={e => setResult(s => ({ ...s, notes: e.target.value }))} placeholder="Additional details, national record, personal best..." />
                  </div>
                  <div className="form-check p-3 bg-light rounded border">
                    <input className="form-check-input ms-0 me-2" type="checkbox" checked={result.published} onChange={e => setResult(s => ({ ...s, published: e.target.checked }))} id="res-published-switch" />
                    <label className="form-check-label fw-semibold small" htmlFor="res-published-switch">Publish result immediately on website</label>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowResultModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-warning btn-sm px-4 fw-semibold text-dark" disabled={busy === 'Competition result'}>
                    {busy === 'Competition result' ? <><i className="fas fa-spinner fa-spin me-1" /> Saving...</> : 'Save Result'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Add Gallery Media ── */}
      {showGalleryModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1080 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header text-white" style={{ background: '#10B981' }}>
                <h5 className="modal-title fw-bold">
                  <i className="fas fa-camera me-2" /> Upload Gallery Media
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowGalleryModal(false)} aria-label="Close" />
              </div>
              <form onSubmit={(e: FormEvent) => {
                e.preventDefault();
                void saveContent(
                  '/api/gallery', 
                  gallery, 
                  'Gallery item', 
                  () => setGallery({ title: '', description: '', mediaUrl: '', mediaType: 'image', category: 'General', eventDate: '', published: false }),
                  () => setShowGalleryModal(false)
                );
              }}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Media Title *</label>
                    <input className="form-control" required value={gallery.title} onChange={e => setGallery(s => ({ ...s, title: e.target.value }))} placeholder="e.g. National Sitting Volleyball Championships Final 2024" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Media URL / Image Path *</label>
                    <input className="form-control" required value={gallery.mediaUrl} onChange={e => setGallery(s => ({ ...s, mediaUrl: e.target.value }))} placeholder="/assets/img/... or https://..." />
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Media Type</label>
                      <select className="form-select" value={gallery.mediaType} onChange={e => setGallery(s => ({ ...s, mediaType: e.target.value }))}>
                        <option value="image">Photo / Image</option>
                        <option value="video">Video Recording</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Category</label>
                      <input className="form-control" value={gallery.category} onChange={e => setGallery(s => ({ ...s, category: e.target.value }))} placeholder="Sitting Volleyball / Para Athletics / Community" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Description</label>
                    <textarea className="form-control" rows={2} value={gallery.description} onChange={e => setGallery(s => ({ ...s, description: e.target.value }))} placeholder="Context, photographers, event location..." />
                  </div>
                  <div className="form-check p-3 bg-light rounded border">
                    <input className="form-check-input ms-0 me-2" type="checkbox" checked={gallery.published} onChange={e => setGallery(s => ({ ...s, published: e.target.checked }))} id="gal-published-switch" />
                    <label className="form-check-label fw-semibold small" htmlFor="gal-published-switch">Publish immediately to public gallery</label>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowGalleryModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-success btn-sm px-4 fw-semibold" disabled={busy === 'Gallery item'}>
                    {busy === 'Gallery item' ? <><i className="fas fa-spinner fa-spin me-1" /> Saving...</> : 'Save Gallery Media'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CommunityManagementPage() {
  return (
    <Suspense fallback={
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#F8FAFC' }}>
        <div className="text-center">
          <i className="fas fa-circle-notch fa-spin fa-2x text-primary mb-3" />
          <p className="small text-muted fw-semibold">Loading Community Desk...</p>
        </div>
      </div>
    }>
      <CommunityManagementContent />
    </Suspense>
  );
}
