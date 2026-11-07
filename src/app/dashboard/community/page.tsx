'use client';

import AccessRestricted from '@/components/shared/AccessRestricted';
import { hasPermission } from '@/lib/rbac';
import { useDebounce } from '@/hooks/useDebounce';
import React, { FormEvent, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { useSearchParams } from 'next/navigation';

type Row = Record<string, any> & { id: string };
type Data = { 
  programmes: Row[]; 
  athleteEnquiries: Row[]; 
};

const empty: Data = { 
  programmes: [], 
  athleteEnquiries: [], 
};

function CommunityManagementContent() {
  const searchParams = useSearchParams();

  const userProfile = useDashboardAuth();

  // Data states
  const [data, setData] = useState<Data>(empty);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Tab navigation — Default to 'athleteEnquiries' because that is where the live public submissions are!
  const paramTab = searchParams.get('tab') as 'athleteEnquiries' | 'programmes';
  const initialTab = paramTab && ['athleteEnquiries', 'programmes'].includes(paramTab) ? paramTab : 'athleteEnquiries';
  const [activeTab, setActiveTab] = useState<'athleteEnquiries' | 'programmes'>(initialTab);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination per table
  const [tablePages, setTablePages] = useState<Record<string, number>>({});
  const pageSize = 10;

  // Modal states
  const [showProgrammeModal, setShowProgrammeModal] = useState(false);
  const [editingProgrammeId, setEditingProgrammeId] = useState<string | null>(null);
  const [selectedAthleteEnquiry, setSelectedAthleteEnquiry] = useState<Row | null>(null);

  // Form states for Training Programme
  const [programme, setProgramme] = useState({ 
    title: '', sport: '', description: '', location: '', schedule: '', 
    startDate: '', endDate: '', eligibility: '', contactEmail: '', status: 'Draft', featured: false 
  });

  const resetProgrammeForm = () => setProgramme({
    title: '', sport: '', description: '', location: '', schedule: '',
    startDate: '', endDate: '', eligibility: '', contactEmail: '', status: 'Draft', featured: false,
  });

  const openNewProgramme = () => {
    setEditingProgrammeId(null);
    resetProgrammeForm();
    setShowProgrammeModal(true);
  };

  const openEditProgramme = (item: Row) => {
    setEditingProgrammeId(item.id);
    setProgramme({
      title: item.title || '',
      sport: item.sport || '',
      description: item.description || '',
      location: item.location || '',
      schedule: item.schedule || '',
      startDate: item.startDate || '',
      endDate: item.endDate || '',
      eligibility: item.eligibility || '',
      contactEmail: item.contactEmail || '',
      status: item.status || 'Draft',
      featured: Boolean(item.featured),
    });
    setShowProgrammeModal(true);
  };

  // Track whether we've already kicked off the initial data load
  const dataFetchedRef = useRef(false);

  // Derived permission
  const isAuthorized = hasPermission(userProfile.role, 'community.view');

  // Fetch sports development data
  const load = useCallback(async () => {
    setLoading(true); 
    setError('');
    try {
      const response = await fetch('/api/admin/community', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to load sports development data');
      setData({
        programmes: Array.isArray(payload.programmes) ? payload.programmes : [],
        athleteEnquiries: Array.isArray(payload.athleteEnquiries) ? payload.athleteEnquiries : [],
      });
    } catch (e) { 
      setError(e instanceof Error ? e.message : 'Unable to load data'); 
    } finally { 
      setLoading(false); 
    }
  }, []);

  // Single mount effect
  useEffect(() => {
    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    void load();
  }, [load]);

  // Sync tab from URL if present
  useEffect(() => {
    const tab = searchParams.get('tab') as 'athleteEnquiries' | 'programmes';
    if (tab && ['athleteEnquiries', 'programmes'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Reset pagination & filters on tab switch
  useEffect(() => {
    setSearchQuery('');
    setStatusFilter('ALL');
  }, [activeTab]);

  // Save new training programme
  async function saveProgramme(e: FormEvent) {
    e.preventDefault();
    setBusy('programme'); 
    setError(''); 
    setSuccess('');
    try {
      const response = await fetch('/api/training-programs', { 
        method: editingProgrammeId ? 'PATCH' : 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(editingProgrammeId ? { ...programme, id: editingProgrammeId } : programme) 
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Save failed');
      resetProgrammeForm();
      setEditingProgrammeId(null);
      setShowProgrammeModal(false);
      setSuccess(editingProgrammeId ? 'Training programme updated successfully.' : 'Training programme created successfully.'); 
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

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Render Table Helper
  const renderTable = (
    title: string, 
    type: keyof Data, 
    columns: { label: string; key: string; format?: (val: any, row: Row) => React.ReactNode }[], 
    statusOptions?: string[]
  ) => {
    const rawItems = data[type] || [];
    
    // Filter by status & search
    const filtered = rawItems.filter(item => {
      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      if (!matchesStatus) return false;

      if (!debouncedSearchQuery) return true;
      const query = debouncedSearchQuery.toLowerCase();
      return Object.values(item).some(val => 
        val && typeof val === 'string' && val.toLowerCase().includes(query)
      );
    });

    const total = filtered.length;
    const currentPage = tablePages[type] || 1;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
      <div className="bg-white rounded-4 shadow-sm border mb-4" style={{ borderColor: '#E2E8F0', overflow: 'hidden' }}>
        {/* Table Top Toolbar */}
        <div className="p-3 p-md-4 border-bottom bg-light d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <h3 className="h6 fw-bold mb-1 text-dark d-flex align-items-center gap-2">
              <span>{title}</span>
              <span className="badge bg-secondary rounded-pill" style={{ fontSize: '0.72rem' }}>{total}</span>
            </h3>
            <p className="small text-muted mb-0" style={{ fontSize: '0.78rem' }}>
              Official records for Sports Development talent identification and training academies.
            </p>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2">
            {/* Search Input */}
            <div className="input-group input-group-sm" style={{ width: '220px' }}>
              <span className="input-group-text bg-white border-end-0">
                <i className="fas fa-search text-muted" style={{ fontSize: '0.75rem' }} />
              </span>
              <input 
                type="text" 
                className="form-control border-start-0" 
                placeholder="Search..." 
                value={searchQuery}
                onChange={e => {
                  setSearchQuery(e.target.value);
                  setTablePages(prev => ({ ...prev, [type]: 1 }));
                }}
                style={{ fontSize: '0.8rem' }}
              />
            </div>

            {/* Status Filter */}
            {statusOptions && (
              <select 
                className="form-select form-select-sm" 
                value={statusFilter} 
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setTablePages(prev => ({ ...prev, [type]: 1 }));
                }}
                style={{ width: 'auto', fontSize: '0.8rem' }}
              >
                <option value="ALL">All Status</option>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}

            {/* Create Action if Programmes */}
            {type === 'programmes' && (
              <button 
                type="button" 
                onClick={openNewProgramme} 
                className="btn btn-sm btn-primary fw-semibold d-inline-flex align-items-center gap-1.5"
                style={{ background: '#0B5F9F', borderColor: '#0B5F9F', fontSize: '0.8rem' }}
              >
                <i className="fas fa-plus" /> New Programme
              </button>
            )}
          </div>
        </div>

        {/* Table Body */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <i className="fas fa-circle-notch fa-spin fa-2x mb-3 text-primary d-block" />
            <span className="small fw-semibold">Loading records...</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-5 text-muted">
            <i className="fas fa-inbox fa-3x mb-3 text-secondary opacity-25 d-block" />
            <p className="mb-0 fw-semibold">No entries recorded in this category yet.</p>
            {type === 'programmes' && (
              <button 
                type="button" 
                onClick={openNewProgramme} 
                className="btn btn-sm btn-outline-primary mt-3 fw-semibold"
              >
                <i className="fas fa-plus me-1" /> Create First Training Programme
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.85rem' }}>
                <thead className="table-light" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <tr>
                    {columns.map(col => <th key={col.key} style={{ padding: '12px 18px', fontWeight: 700 }}>{col.label}</th>)}
                    <th style={{ padding: '12px 18px', fontWeight: 700 }}>Status</th>
                    <th className="text-end" style={{ padding: '12px 18px', fontWeight: 700 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(item => (
                    <tr key={item.id}>
                      {columns.map(col => (
                        <td key={col.key} style={{ padding: '12px 18px' }}>
                          {col.format ? col.format(item[col.key], item) : (item[col.key] || '—')}
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
                        ) : (
                          <select 
                            className="form-select form-select-sm" 
                            value={item.status} 
                            disabled={busy === item.id} 
                            onChange={e => void update(type, item, { status: e.target.value })}
                            style={{ fontSize: '0.78rem', borderRadius: '6px' }}
                          >
                            {(statusOptions || ['New', 'Contacted', 'Accepted', 'Closed']).map(s => <option key={s}>{s}</option>)}
                          </select>
                        )}
                      </td>
                      <td className="text-end" style={{ paddingRight: '18px' }}>
                        {type === 'programmes' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary p-1 px-2 me-1"
                            disabled={busy === item.id}
                            onClick={() => openEditProgramme(item)}
                            title="Edit programme"
                            aria-label={`Edit ${item.title || 'training programme'}`}
                          >
                            <i className="fas fa-pen" />
                          </button>
                        )}
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

            {/* Pagination Controls */}
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
    <>
      <main className="dashboard-main-content" style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <div className="d-flex justify-content-end mb-3">
            <button type="button" className="btn btn-sm btn-light border d-inline-flex align-items-center gap-2 fw-semibold text-secondary" onClick={() => void load()} disabled={loading} style={{ borderRadius: '8px', padding: '6px 14px', fontSize: '0.82rem' }}>
              <i className={`fas fa-rotate ${loading ? 'fa-spin' : ''}`} /> Refresh
            </button>
          </div>
          <div style={{ maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          {!isAuthorized ? (
            <AccessRestricted returnHref="/dashboard" returnLabel="Return to Dashboard" />
          ) : (
            <>
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

              {/* Hero Banner */}
              <div 
                style={{ 
                  background: 'linear-gradient(135deg, #074783 0%, #0B5F9F 60%, #032b50 100%)',
                  borderRadius: '16px',
                  padding: '24px 28px',
                  color: '#ffffff',
                  marginBottom: '24px',
                  boxShadow: '0 8px 24px rgba(11, 95, 159, 0.16)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', right: '-10px', bottom: '-25px', opacity: 0.12, fontSize: '8.5rem', color: '#fff', pointerEvents: 'none' }}>
                  <i className="fas fa-chart-line" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', position: 'relative', zIndex: 2 }}>
                  <div>
                    <span className="badge mb-2" style={{ background: 'rgba(255, 215, 0, 0.2)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.35)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Sports Development Management
                    </span>
                    <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px' }}>
                      Sports Development Desk
                    </h1>
                    <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0, maxWidth: '680px', lineHeight: '1.45' }}>
                      Review aspiring athlete talent submissions, manage scouting profiles, and create official grassroots training programmes.
                    </p>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <button 
                      type="button"
                      onClick={openNewProgramme}
                      className="btn btn-sm"
                      style={{ background: '#FFD700', color: '#000000', fontWeight: 700, borderRadius: '8px', border: 'none', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
                    >
                      <i className="fas fa-plus" /> New Programme
                    </button>
                  </div>
                </div>
              </div>

              {/* Exact 2 Highlight KPI Summary Cards */}
              <div className="row g-3 mb-4">
                <div className="col-12 col-md-6">
                  <div 
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveTab('athleteEnquiries')}
                    style={{ 
                      background: '#FFFFFF', 
                      borderRadius: '14px', 
                      border: activeTab === 'athleteEnquiries' ? '2px solid #0B5F9F' : '1.5px solid #CBD5E1', 
                      padding: '20px', 
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="small fw-bold text-uppercase text-muted" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                          Public Submissions
                        </div>
                        <div className="fw-black my-1" style={{ fontSize: '1.85rem', color: '#0B5F9F' }}>
                          {data.athleteEnquiries.length}
                        </div>
                        <div className="small fw-bold text-dark">
                          Athlete Talent Scouting Profiles
                        </div>
                      </div>
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '52px', height: '52px', background: '#EFF6FF', color: '#0B5F9F', fontSize: '1.35rem' }}
                      >
                        <i className="fas fa-person-running" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-md-6">
                  <div 
                    role="button"
                    tabIndex={0}
                    onClick={() => setActiveTab('programmes')}
                    style={{ 
                      background: '#FFFFFF', 
                      borderRadius: '14px', 
                      border: activeTab === 'programmes' ? '2px solid #059669' : '1.5px solid #CBD5E1', 
                      padding: '20px', 
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="small fw-bold text-uppercase text-muted" style={{ fontSize: '0.72rem', letterSpacing: '0.05em' }}>
                          Public Content
                        </div>
                        <div className="fw-black my-1" style={{ fontSize: '1.85rem', color: '#059669' }}>
                          {data.programmes.length}
                        </div>
                        <div className="small fw-bold text-dark">
                          Published Training Programmes
                        </div>
                      </div>
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '52px', height: '52px', background: '#ECFDF5', color: '#059669', fontSize: '1.35rem' }}
                      >
                        <i className="fas fa-dumbbell" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Selector Bar */}
              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
                <div className="nav nav-pills gap-2" role="tablist">
                  <button
                    type="button"
                    className={`btn btn-sm d-flex align-items-center gap-2 fw-semibold ${activeTab === 'athleteEnquiries' ? 'btn-primary' : 'btn-light border text-secondary'}`}
                    onClick={() => setActiveTab('athleteEnquiries')}
                    style={{ borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', background: activeTab === 'athleteEnquiries' ? '#0B5F9F' : undefined }}
                  >
                    <i className="fas fa-person-running" />
                    <span>Athlete Talent Scouting Profiles</span>
                    <span className={`badge rounded-pill ${activeTab === 'athleteEnquiries' ? 'bg-white text-primary' : 'bg-secondary text-white'}`} style={{ fontSize: '0.7rem' }}>
                      {data.athleteEnquiries.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    className={`btn btn-sm d-flex align-items-center gap-2 fw-semibold ${activeTab === 'programmes' ? 'btn-primary' : 'btn-light border text-secondary'}`}
                    onClick={() => setActiveTab('programmes')}
                    style={{ borderRadius: '8px', padding: '8px 16px', fontSize: '0.85rem', background: activeTab === 'programmes' ? '#059669' : undefined, borderColor: activeTab === 'programmes' ? '#059669' : undefined }}
                  >
                    <i className="fas fa-dumbbell" />
                    <span>Training Programmes &amp; Academies</span>
                    <span className={`badge rounded-pill ${activeTab === 'programmes' ? 'bg-white text-dark' : 'bg-secondary text-white'}`} style={{ fontSize: '0.7rem' }}>
                      {data.programmes.length}
                    </span>
                  </button>
                </div>

                {activeTab === 'programmes' && (
                  <button 
                    type="button" 
                    onClick={openNewProgramme} 
                    className="btn btn-sm btn-success fw-semibold d-flex align-items-center gap-2"
                    style={{ borderRadius: '8px', padding: '8px 16px', background: '#059669', borderColor: '#059669' }}
                  >
                    <i className="fas fa-plus" /> Add Training Programme
                  </button>
                )}
              </div>

              {/* Main Content Displays */}
              {activeTab === 'athleteEnquiries' && (
                renderTable('Athlete Talent Scouting Submissions', 'athleteEnquiries', [
                  { 
                    label: 'Athlete Full Name', 
                    key: 'fullName', 
                    format: (val, item) => (
                      <div>
                        <span className="text-dark fw-bold d-block">{val}</span>
                        <span className="badge bg-light text-dark border mt-1" style={{ fontSize: '0.7rem' }}>
                          {item.ageRange || 'General Category'}
                        </span>
                      </div>
                    )
                  },
                  { 
                    label: 'Sport of Interest', 
                    key: 'sport', 
                    format: (val) => (
                      <span className="badge px-2.5 py-1.5 fw-bold" style={{ background: '#E0F2FE', color: '#075985', fontSize: '0.8rem' }}>
                        {val}
                      </span>
                    )
                  },
                  { 
                    label: 'District', 
                    key: 'district', 
                    format: (val) => (
                      <span className="fw-semibold text-dark">
                        <i className="fas fa-location-dot me-1 text-danger" />
                        {val}
                      </span>
                    )
                  },
                  { 
                    label: 'Contact Info', 
                    key: 'email', 
                    format: (val, item) => (
                      <div className="small">
                        <a href={`mailto:${val}`} className="d-block text-primary text-decoration-none fw-semibold">
                          <i className="fas fa-envelope me-1" />{val}
                        </a>
                        {item.phone && (
                          <a href={`tel:${item.phone}`} className="text-secondary text-decoration-none">
                            <i className="fas fa-phone me-1" />{item.phone}
                          </a>
                        )}
                      </div>
                    )
                  },
                  { 
                    label: 'Profile / Details', 
                    key: 'message', 
                    format: (val, item) => (
                      <div>
                        <span className="small text-dark d-block text-truncate" style={{ maxWidth: '240px' }} title={val}>
                          {val || '—'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedAthleteEnquiry(item)}
                          className="btn btn-link btn-sm p-0 fw-bold"
                          style={{ fontSize: '0.75rem', textDecoration: 'none' }}
                        >
                          View Full Profile <i className="fas fa-expand ms-1" />
                        </button>
                      </div>
                    )
                  },
                  { 
                    label: 'Received', 
                    key: 'createdAt', 
                    format: (val) => (
                      <span className="small text-muted">
                        {val ? new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                      </span>
                    )
                  },
                ], ['New', 'Contacted', 'Accepted', 'Closed'])
              )}

              {activeTab === 'programmes' && (
                <>
                  <div className="alert alert-info py-2.5 px-3 small d-flex align-items-center gap-2 mb-3 border-0 shadow-sm" style={{ borderRadius: '10px', background: '#EFF6FF', color: '#1E40AF' }}>
                    <i className="fas fa-info-circle text-primary flex-shrink-0" />
                    <span>Programmes with <strong>Published</strong> status are immediately displayed on the public Sports Development portal.</span>
                  </div>
                  {renderTable('Grassroots Training Programmes', 'programmes', [
                    { 
                      label: 'Programme Title', 
                      key: 'title', 
                      format: (val, item) => (
                        <div>
                          <span className="text-dark fw-bold d-block">{val}</span>
                          {item.featured && <span className="badge bg-warning text-dark" style={{ fontSize: '0.62rem' }}>Featured</span>}
                        </div>
                      )
                    },
                    { label: 'Sport Discipline', key: 'sport' },
                    { label: 'Location / Venue', key: 'location' },
                    { label: 'Schedule / Time', key: 'schedule' },
                    { label: 'Contact Email', key: 'contactEmail' },
                  ], ['Draft', 'Published', 'Archived'])}
                </>
              )}
            </>
          )}
          </div>
        </main>

      {/* ── Modal: View Athlete Talent Scouting Profile ── */}
      {selectedAthleteEnquiry && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1080 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div className="modal-header text-white" style={{ background: '#0B5F9F' }}>
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-id-card" style={{ fontSize: '1.2rem' }} />
                  <div>
                    <h5 className="modal-title fw-bold mb-0">Athlete Talent Profile</h5>
                    <span className="small opacity-75">Submitted via public Sports Development portal</span>
                  </div>
                </div>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedAthleteEnquiry(null)} aria-label="Close" />
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="text-muted small fw-bold text-uppercase d-block mb-1">Full Name</label>
                    <div className="fs-5 fw-bold text-dark">{selectedAthleteEnquiry.fullName}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small fw-bold text-uppercase d-block mb-1">Age Category</label>
                    <div className="fw-semibold text-dark">{selectedAthleteEnquiry.ageRange || 'Not specified'}</div>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small fw-bold text-uppercase d-block mb-1">Sport of Interest</label>
                    <span className="badge bg-primary px-2.5 py-1.5" style={{ fontSize: '0.85rem' }}>
                      {selectedAthleteEnquiry.sport}
                    </span>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small fw-bold text-uppercase d-block mb-1">District</label>
                    <div className="fw-semibold text-dark">
                      <i className="fas fa-location-dot me-1 text-danger" />
                      {selectedAthleteEnquiry.district}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small fw-bold text-uppercase d-block mb-1">Email Address</label>
                    <a href={`mailto:${selectedAthleteEnquiry.email}`} className="text-primary fw-semibold text-decoration-none">
                      <i className="fas fa-envelope me-1" />
                      {selectedAthleteEnquiry.email}
                    </a>
                  </div>
                  <div className="col-md-6">
                    <label className="text-muted small fw-bold text-uppercase d-block mb-1">Phone / WhatsApp</label>
                    {selectedAthleteEnquiry.phone ? (
                      <a href={`tel:${selectedAthleteEnquiry.phone}`} className="text-dark fw-semibold text-decoration-none">
                        <i className="fas fa-phone me-1 text-success" />
                        {selectedAthleteEnquiry.phone}
                      </a>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-muted small fw-bold text-uppercase d-block mb-2">Impairment Details &amp; Athletic Background</label>
                  <div className="p-3 rounded-3" style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0', fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {selectedAthleteEnquiry.message || 'No additional details provided.'}
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-between pt-3 border-top">
                  <div className="d-flex align-items-center gap-2">
                    <label className="fw-bold small mb-0">Status:</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedAthleteEnquiry.status}
                      disabled={busy === selectedAthleteEnquiry.id}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        await update('athleteEnquiries', selectedAthleteEnquiry, { status: newStatus });
                        setSelectedAthleteEnquiry((prev) => prev ? { ...prev, status: newStatus } : null);
                      }}
                      style={{ width: '140px', fontSize: '0.82rem' }}
                    >
                      <option>New</option>
                      <option>Contacted</option>
                      <option>Accepted</option>
                      <option>Closed</option>
                    </select>
                  </div>
                  <button type="button" className="btn btn-secondary btn-sm px-3" onClick={() => setSelectedAthleteEnquiry(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Redesigned Training Programme Form ── */}
      {showProgrammeModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1080 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div
                className="modal-header text-white"
                style={{
                  background: 'linear-gradient(135deg, #074783 0%, #0B5F9F 100%)',
                  padding: '20px 24px',
                }}
              >
                <div className="d-flex align-items-center gap-2.5">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.18)', fontSize: '1.15rem' }}
                  >
                    <i className="fas fa-dumbbell" />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold mb-0" style={{ fontSize: '1.2rem' }}>
                      {editingProgrammeId ? 'Edit Training Programme' : 'Create Training Programme'}
                    </h5>
                    <span className="small opacity-75" style={{ fontSize: '0.8rem' }}>
                      Publish official grassroots academies, youth training clinics &amp; training camps
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => { setShowProgrammeModal(false); setEditingProgrammeId(null); resetProgrammeForm(); }}
                  aria-label="Close"
                />
              </div>

              <form onSubmit={saveProgramme}>
                <div className="modal-body p-4" style={{ background: '#FFFFFF', maxHeight: '70vh', overflowY: 'auto' }}>
                  {/* Section 1: Basic Information */}
                  <div className="mb-4">
                    <span className="badge px-2.5 py-1 text-uppercase fw-bold mb-2" style={{ background: '#EFF6FF', color: '#0B5F9F', fontSize: '0.7rem' }}>
                      1. General Details
                    </span>
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label small fw-bold text-dark mb-1">
                          Programme Title <span className="text-danger">*</span>
                        </label>
                        <input
                          className="form-control py-2.5 rounded-3"
                          required
                          value={programme.title}
                          onChange={e => setProgramme(s => ({ ...s, title: e.target.value }))}
                          placeholder="e.g. Grassroots Sitting Volleyball Youth Academy"
                          style={{ border: '1.5px solid #CBD5E1', fontSize: '0.9rem' }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">
                          Sport Discipline <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select py-2.5 rounded-3"
                          required
                          value={programme.sport}
                          onChange={e => setProgramme(s => ({ ...s, sport: e.target.value }))}
                          style={{ border: '1.5px solid #CBD5E1', fontSize: '0.9rem' }}
                        >
                          <option value="">Select sport discipline</option>
                          <option value="Sitting Volleyball">Sitting Volleyball</option>
                          <option value="Para-Athletics">Para-Athletics (Track &amp; Field)</option>
                          <option value="Wheelchair Basketball">Wheelchair Basketball</option>
                          <option value="Para-Powerlifting">Para-Powerlifting</option>
                          <option value="Goalball">Goalball</option>
                          <option value="Para-Swimming">Para-Swimming</option>
                          <option value="Multi-Sport Grassroots Clinic">Multi-Sport Grassroots Clinic</option>
                          <option value="Other Para-Sport">Other Para-Sport</option>
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">
                          Location / Venue <span className="text-danger">*</span>
                        </label>
                        <input
                          className="form-control py-2.5 rounded-3"
                          required
                          value={programme.location}
                          onChange={e => setProgramme(s => ({ ...s, location: e.target.value }))}
                          placeholder="e.g. Amahoro National Stadium Compound, Kigali"
                          style={{ border: '1.5px solid #CBD5E1', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Timing & Schedule */}
                  <div className="mb-4">
                    <span className="badge px-2.5 py-1 text-uppercase fw-bold mb-2" style={{ background: '#FEF3C7', color: '#92400E', fontSize: '0.7rem' }}>
                      2. Dates &amp; Schedule
                    </span>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Start Date</label>
                        <input
                          className="form-control py-2.5 rounded-3"
                          type="date"
                          value={programme.startDate}
                          onChange={e => setProgramme(s => ({ ...s, startDate: e.target.value }))}
                          style={{ border: '1.5px solid #CBD5E1', fontSize: '0.9rem' }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">End Date</label>
                        <input
                          className="form-control py-2.5 rounded-3"
                          type="date"
                          value={programme.endDate}
                          onChange={e => setProgramme(s => ({ ...s, endDate: e.target.value }))}
                          style={{ border: '1.5px solid #CBD5E1', fontSize: '0.9rem' }}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-bold text-dark mb-1">Training Frequency / Schedule</label>
                        <input
                          className="form-control py-2.5 rounded-3"
                          value={programme.schedule}
                          onChange={e => setProgramme(s => ({ ...s, schedule: e.target.value }))}
                          placeholder="e.g. Every Saturday & Sunday (09:00 - 12:30 CAT)"
                          style={{ border: '1.5px solid #CBD5E1', fontSize: '0.9rem' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Eligibility & Coordination */}
                  <div className="mb-4">
                    <span className="badge px-2.5 py-1 text-uppercase fw-bold mb-2" style={{ background: '#ECFDF5', color: '#065F46', fontSize: '0.7rem' }}>
                      3. Requirements &amp; Contact
                    </span>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Eligibility Criteria</label>
                        <input
                          className="form-control py-2.5 rounded-3"
                          value={programme.eligibility}
                          onChange={e => setProgramme(s => ({ ...s, eligibility: e.target.value }))}
                          placeholder="e.g. Open to youth aged 12-25 with physical impairments"
                          style={{ border: '1.5px solid #CBD5E1', fontSize: '0.9rem' }}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-bold text-dark mb-1">Coordinator Email</label>
                        <input
                          className="form-control py-2.5 rounded-3"
                          type="email"
                          value={programme.contactEmail}
                          onChange={e => setProgramme(s => ({ ...s, contactEmail: e.target.value }))}
                          placeholder="development@npcrwanda.org"
                          style={{ border: '1.5px solid #CBD5E1', fontSize: '0.9rem' }}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-bold text-dark mb-1">Programme Overview &amp; Description</label>
                        <textarea
                          className="form-control rounded-3"
                          rows={3}
                          value={programme.description}
                          onChange={e => setProgramme(s => ({ ...s, description: e.target.value }))}
                          placeholder="Describe the training syllabus, coaching team, facilities, equipment provided, and pathway opportunities..."
                          style={{ border: '1.5px solid #CBD5E1', fontSize: '0.9rem', resize: 'vertical' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Publishing Status */}
                  <div
                    className="p-3 rounded-3 d-flex flex-wrap align-items-center justify-content-between gap-3"
                    style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}
                  >
                    <div>
                      <div className="fw-bold small text-dark mb-0.5">Publication Status</div>
                      <div className="small text-muted" style={{ fontSize: '0.78rem' }}>
                        Set to <strong>Published</strong> to display on the public Sports Development portal.
                      </div>
                    </div>
                    <select
                      className="form-select form-select-sm fw-bold w-auto"
                      value={programme.status}
                      onChange={e => setProgramme(s => ({ ...s, status: e.target.value }))}
                      style={{ border: '1.5px solid #CBD5E1', borderRadius: '8px', padding: '6px 14px' }}
                    >
                      <option value="Draft">Draft (Saved Privately)</option>
                      <option value="Published">Published (Public)</option>
                      <option value="Archived">Archived (Closed)</option>
                    </select>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="modal-footer bg-light px-4 py-3 d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-light border px-4 py-2 fw-semibold rounded-3"
                    onClick={() => { setShowProgrammeModal(false); setEditingProgrammeId(null); resetProgrammeForm(); }}
                    style={{ fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 py-2 fw-bold rounded-3 d-inline-flex align-items-center gap-2"
                    style={{ background: '#0B5F9F', borderColor: '#0B5F9F', fontSize: '0.85rem' }}
                    disabled={busy === 'programme'}
                  >
                    {busy === 'programme' ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                        <span>Saving Programme...</span>
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check" />
                        <span>{editingProgrammeId ? 'Save Changes' : 'Create Training Programme'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default function CommunityManagementPage() {
  return (
    <Suspense fallback={
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#F8FAFC' }}>
        <div className="text-center">
          <i className="fas fa-circle-notch fa-spin fa-2x text-primary mb-3" />
          <p className="small text-muted fw-semibold">Loading Sports Development Desk...</p>
        </div>
      </div>
    }>
      <CommunityManagementContent />
    </Suspense>
  );
}
