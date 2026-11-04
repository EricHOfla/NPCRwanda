'use client';

import React, { FormEvent, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type Row = Record<string, any> & { id: string };
type Data = { programmes: Row[]; results: Row[]; gallery: Row[]; athleteEnquiries: Row[]; eventRegistrations: Row[]; sponsorEnquiries: Row[] };
const empty: Data = { programmes: [], results: [], gallery: [], athleteEnquiries: [], eventRegistrations: [], sponsorEnquiries: [] };

export default function CommunityManagementPage() {
  const [data, setData] = useState<Data>(empty);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'programmes' | 'results' | 'gallery' | 'enquiries'>('programmes');
  const [tablePages, setTablePages] = useState<Record<string, number>>({});
  const pageSize = 10;

  // Form states
  const [programme, setProgramme] = useState({ title: '', sport: '', description: '', location: '', schedule: '', startDate: '', endDate: '', eligibility: '', contactEmail: '', status: 'Draft', featured: false });
  const [result, setResult] = useState({ eventTitle: '', competitionDate: '', athleteName: '', sport: '', category: '', position: '', medal: '', result: '', notes: '', published: false });
  const [gallery, setGallery] = useState({ title: '', description: '', mediaUrl: '', mediaType: 'image', category: 'General', eventDate: '', published: false });

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/community', { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'Unable to load community data');
      setData({ ...empty, ...payload });
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load data'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function saveContent(endpoint: string, values: Record<string, unknown>, label: string, reset: () => void) {
    setBusy(label); setError(''); setSuccess('');
    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(values) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Save failed');
      reset(); setSuccess(label + ' saved successfully.'); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed'); }
    finally { setBusy(''); }
  }

  async function update(type: string, item: Row, values: Record<string, unknown>) {
    setBusy(item.id); setError(''); setSuccess('');
    try {
      const response = await fetch('/api/admin/community', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, id: item.id, ...values }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Update failed');
      setSuccess('Record updated.'); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Update failed'); }
    finally { setBusy(''); }
  }

  async function remove(type: string, item: Row) {
    if (!window.confirm('Delete this record permanently?')) return;
    setBusy(item.id); setError(''); setSuccess('');
    try {
      const response = await fetch('/api/admin/community', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, id: item.id }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Delete failed');
      setSuccess('Record deleted.'); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Delete failed'); }
    finally { setBusy(''); }
  }

  const renderTable = (title: string, type: keyof Data, columns: { label: string; key: string }[], statusOptions?: string[]) => {
    const list = data[type] || [];
    const currentPage = tablePages[type] || 1;
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const paginated = list.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
    <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }} key={type}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9' }} className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-2">
          <h2 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{title}</h2>
          <span className="badge rounded-pill bg-light text-secondary border px-2 py-1" style={{ fontSize: '0.72rem' }}>
            {total} records
          </span>
        </div>
      </div>
      {total === 0 ? (
        <div className="text-center py-5 text-muted" style={{ fontSize: '0.86rem' }}>
          <i className="far fa-folder-open fa-2x mb-2 d-block text-secondary opacity-50" />
          No entries recorded yet.
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.86rem' }}>
              <thead style={{ background: '#F8FAFC', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <tr>
                  {columns.map(c => <th key={c.key} style={{ padding: '12px 18px' }}>{c.label}</th>)}
                  <th>Status / Visibility</th>
                  <th className="text-end" style={{ paddingRight: '18px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    {columns.map(c => (
                      <td key={c.key} style={{ minWidth: 140, padding: '12px 18px' }}>
                        <span className="text-dark fw-medium">{String(item[c.key] ?? '—').slice(0, 120)}</span>
                      </td>
                    ))}
                    <td style={{ minWidth: 150 }}>
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
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Bar */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '16px 28px' }}>
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div className="d-flex align-items-center gap-3">
            <Link 
              href="/dashboard" 
              className="btn btn-sm btn-light border d-inline-flex align-items-center gap-2 text-decoration-none fw-semibold"
              style={{ color: '#475569', borderRadius: '8px', padding: '6px 12px' }}
            >
              <i className="fas fa-arrow-left" style={{ fontSize: '0.8rem' }} /> Back to Dashboard
            </Link>
            <div style={{ borderLeft: '1px solid #E2E8F0', height: '24px' }} />
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                Sports Development & Community Desk
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                Manage grassroots training programmes, competition results, athlete intake and media gallery
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Link 
              href="/dashboard/donations" 
              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-2 fw-semibold"
              style={{ borderRadius: '8px', padding: '7px 14px' }}
            >
              <i className="fas fa-hand-holding-heart text-primary" /> Donation Payments
            </Link>
            <button 
              className="btn btn-sm btn-light border d-inline-flex align-items-center gap-2 fw-semibold text-secondary"
              onClick={() => void load()} 
              disabled={loading}
              style={{ borderRadius: '8px', padding: '7px 14px' }}
            >
              <i className={`fas fa-rotate ${loading ? 'fa-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <main className="container-fluid py-4 px-3 px-lg-4" style={{ maxWidth: 1600 }}>
        {error && (
          <div className="alert alert-danger border-0 shadow-sm d-flex align-items-center gap-2 mb-4" style={{ borderRadius: '10px' }}>
            <i className="fas fa-circle-exclamation text-danger" /> {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success border-0 shadow-sm d-flex align-items-center gap-2 mb-4" style={{ borderRadius: '10px' }}>
            <i className="fas fa-check-circle text-success" /> {success}
          </div>
        )}

        {/* Counter KPI Strip */}
        <div className="row g-3 mb-4">
          {[
            { key: 'programmes', label: 'Training Programmes', icon: 'fa-dumbbell', color: '#0072C6', bg: '#E0F2FE' },
            { key: 'results', label: 'Competition Results', icon: 'fa-trophy', color: '#F59E0B', bg: '#FEF3C7' },
            { key: 'gallery', label: 'Gallery Media', icon: 'fa-images', color: '#10B981', bg: '#D1FAE5' },
            { key: 'athleteEnquiries', label: 'Athlete Enquiries', icon: 'fa-user-plus', color: '#6366F1', bg: '#EDE9FE' },
            { key: 'eventRegistrations', label: 'Event Registrations', icon: 'fa-ticket', color: '#EC4899', bg: '#FCE7F3' },
            { key: 'sponsorEnquiries', label: 'Partnership Requests', icon: 'fa-handshake', color: '#0284C7', bg: '#E0F2FE' },
          ].map(k => (
            <div className="col-6 col-md-4 col-xl-2" key={k.key}>
              <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748B' }}>{k.label}</span>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: k.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`fas ${k.icon}`} style={{ color: k.color, fontSize: '0.8rem' }} />
                  </div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A' }}>
                  {data[k.key as keyof Data].length}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Accordion / Form Tabs */}
        <div className="row g-4 mb-4">
          {/* Form 1: Add Programme */}
          <div className="col-12 col-xl-4">
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', height: '100%' }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-plus text-primary" style={{ fontSize: '0.85rem' }} />
                </div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>New Training Programme</h2>
              </div>
              <form onSubmit={(e: FormEvent) => { e.preventDefault(); void saveContent('/api/training-programs', programme, 'Training programme', () => setProgramme({ title: '', sport: '', description: '', location: '', schedule: '', startDate: '', endDate: '', eligibility: '', contactEmail: '', status: 'Draft', featured: false })); }}>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Title</label>
                  <input className="form-control form-control-sm" required value={programme.title} onChange={e => setProgramme(s => ({ ...s, title: e.target.value }))} placeholder="e.g. Grassroots Sitting Volleyball Camp" />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Sport</label>
                    <input className="form-control form-control-sm" required value={programme.sport} onChange={e => setProgramme(s => ({ ...s, sport: e.target.value }))} placeholder="Sitting Volleyball" />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Location</label>
                    <input className="form-control form-control-sm" required value={programme.location} onChange={e => setProgramme(s => ({ ...s, location: e.target.value }))} placeholder="Amahoro Stadium" />
                  </div>
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Start Date</label>
                    <input className="form-control form-control-sm" type="date" value={programme.startDate} onChange={e => setProgramme(s => ({ ...s, startDate: e.target.value }))} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">End Date</label>
                    <input className="form-control form-control-sm" type="date" value={programme.endDate} onChange={e => setProgramme(s => ({ ...s, endDate: e.target.value }))} />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Schedule & Contact Email</label>
                  <div className="row g-2">
                    <div className="col-6">
                      <input className="form-control form-control-sm" value={programme.schedule} onChange={e => setProgramme(s => ({ ...s, schedule: e.target.value }))} placeholder="Sat & Sun 9:00 AM" />
                    </div>
                    <div className="col-6">
                      <input className="form-control form-control-sm" type="email" value={programme.contactEmail} onChange={e => setProgramme(s => ({ ...s, contactEmail: e.target.value }))} placeholder="coach@npcrwanda.org" />
                    </div>
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Description</label>
                  <textarea className="form-control form-control-sm" rows={2} required minLength={10} value={programme.description} onChange={e => setProgramme(s => ({ ...s, description: e.target.value }))} placeholder="Brief outline of training objectives..." />
                </div>
                <div className="form-check my-2">
                  <input className="form-check-input" type="checkbox" checked={programme.featured} onChange={e => setProgramme(s => ({ ...s, featured: e.target.checked }))} id="programme-featured" />
                  <label className="form-check-label small" htmlFor="programme-featured">Feature on sports portal</label>
                </div>
                <button className="btn btn-sm btn-primary w-100 fw-semibold" style={{ background: '#0b63b6', border: 'none' }} disabled={busy === 'Training programme'}>
                  {busy === 'Training programme' ? 'Saving...' : 'Save Programme'}
                </button>
              </form>
            </div>
          </div>

          {/* Form 2: Add Competition Result */}
          <div className="col-12 col-xl-4">
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', height: '100%' }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-medal text-warning" style={{ fontSize: '0.85rem' }} />
                </div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>New Competition Result</h2>
              </div>
              <form onSubmit={(e: FormEvent) => { e.preventDefault(); void saveContent('/api/competition-results', result, 'Competition result', () => setResult({ eventTitle: '', competitionDate: '', athleteName: '', sport: '', category: '', position: '', medal: '', result: '', notes: '', published: false })); }}>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Event Title</label>
                  <input className="form-control form-control-sm" required value={result.eventTitle} onChange={e => setResult(s => ({ ...s, eventTitle: e.target.value }))} placeholder="Paris 2024 Paralympic Games" />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Athlete Name</label>
                    <input className="form-control form-control-sm" required value={result.athleteName} onChange={e => setResult(s => ({ ...s, athleteName: e.target.value }))} placeholder="Hermas Cliff Muvunyi" />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Sport</label>
                    <input className="form-control form-control-sm" required value={result.sport} onChange={e => setResult(s => ({ ...s, sport: e.target.value }))} placeholder="Para Athletics" />
                  </div>
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Medal</label>
                    <input className="form-control form-control-sm" value={result.medal} onChange={e => setResult(s => ({ ...s, medal: e.target.value }))} placeholder="Gold / Silver / Bronze" />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Position / Rank</label>
                    <input className="form-control form-control-sm" value={result.position} onChange={e => setResult(s => ({ ...s, position: e.target.value }))} placeholder="1st Place / Finalist" />
                  </div>
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Competition Date</label>
                    <input className="form-control form-control-sm" type="date" required value={result.competitionDate} onChange={e => setResult(s => ({ ...s, competitionDate: e.target.value }))} />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Classification Category</label>
                    <input className="form-control form-control-sm" value={result.category} onChange={e => setResult(s => ({ ...s, category: e.target.value }))} placeholder="T46 400m" />
                  </div>
                </div>
                <div className="form-check my-2">
                  <input className="form-check-input" type="checkbox" checked={result.published} onChange={e => setResult(s => ({ ...s, published: e.target.checked }))} id="result-published" />
                  <label className="form-check-label small" htmlFor="result-published">Publish immediately</label>
                </div>
                <button className="btn btn-sm btn-warning w-100 fw-semibold text-dark" disabled={busy === 'Competition result'}>
                  {busy === 'Competition result' ? 'Saving...' : 'Save Result'}
                </button>
              </form>
            </div>
          </div>

          {/* Form 3: Add Gallery Item */}
          <div className="col-12 col-xl-4">
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', height: '100%' }}>
              <div className="d-flex align-items-center gap-2 mb-3">
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#D1FAE5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-camera text-success" style={{ fontSize: '0.85rem' }} />
                </div>
                <h2 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>New Gallery Media</h2>
              </div>
              <form onSubmit={(e: FormEvent) => { e.preventDefault(); void saveContent('/api/gallery', gallery, 'Gallery item', () => setGallery({ title: '', description: '', mediaUrl: '', mediaType: 'image', category: 'General', eventDate: '', published: false })); }}>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Media Title</label>
                  <input className="form-control form-control-sm" required value={gallery.title} onChange={e => setGallery(s => ({ ...s, title: e.target.value }))} placeholder="National Sitting Volleyball Finals 2024" />
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Media URL</label>
                  <input className="form-control form-control-sm" required value={gallery.mediaUrl} onChange={e => setGallery(s => ({ ...s, mediaUrl: e.target.value }))} placeholder="/assets/img/... or https://..." />
                </div>
                <div className="row g-2 mb-2">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Type</label>
                    <select className="form-select form-select-sm" value={gallery.mediaType} onChange={e => setGallery(s => ({ ...s, mediaType: e.target.value }))}>
                      <option value="image">Photo / Image</option>
                      <option value="video">Video Recording</option>
                    </select>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Category</label>
                    <input className="form-control form-control-sm" value={gallery.category} onChange={e => setGallery(s => ({ ...s, category: e.target.value }))} placeholder="Sitting Volleyball" />
                  </div>
                </div>
                <div className="mb-2">
                  <label className="form-label small fw-semibold">Description</label>
                  <textarea className="form-control form-control-sm" rows={2} value={gallery.description} onChange={e => setGallery(s => ({ ...s, description: e.target.value }))} placeholder="Context for this photo or video..." />
                </div>
                <div className="form-check my-2">
                  <input className="form-check-input" type="checkbox" checked={gallery.published} onChange={e => setGallery(s => ({ ...s, published: e.target.checked }))} id="gallery-published" />
                  <label className="form-check-label small" htmlFor="gallery-published">Publish immediately</label>
                </div>
                <button className="btn btn-sm btn-success w-100 fw-semibold" disabled={busy === 'Gallery item'}>
                  {busy === 'Gallery item' ? 'Saving...' : 'Save Gallery Media'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* View Selection Segment */}
        <div className="d-flex align-items-center gap-2 mb-3">
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Data Tables:
          </span>
          <div className="btn-group btn-group-sm">
            {[
              { id: 'programmes', label: 'Training Programmes', count: data.programmes.length },
              { id: 'results', label: 'Competition Results', count: data.results.length },
              { id: 'gallery', label: 'Gallery Media', count: data.gallery.length },
              { id: 'enquiries', label: 'Public Enquiries & Registrations', count: data.athleteEnquiries.length + data.eventRegistrations.length + data.sponsorEnquiries.length },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`btn fw-semibold ${activeTab === tab.id ? 'btn-primary' : 'btn-light border text-secondary'}`}
                onClick={() => setActiveTab(tab.id as any)}
                style={{ fontSize: '0.78rem' }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Tables Section based on active tab */}
        {loading ? (
          <div className="text-center py-5 text-muted" role="status">
            <i className="fas fa-circle-notch fa-spin fa-2x mb-3 text-primary d-block" />
            <span className="small fw-semibold">Loading community management data...</span>
          </div>
        ) : (
          <>
            {activeTab === 'programmes' && renderTable('Training Programmes', 'programmes', [
              { label: 'Programme Title', key: 'title' },
              { label: 'Sport', key: 'sport' },
              { label: 'Location', key: 'location' },
              { label: 'Schedule', key: 'schedule' },
              { label: 'Contact', key: 'contactEmail' },
            ])}

            {activeTab === 'results' && renderTable('Competition Results', 'results', [
              { label: 'Competition / Event', key: 'eventTitle' },
              { label: 'Athlete', key: 'athleteName' },
              { label: 'Sport Discipline', key: 'sport' },
              { label: 'Medal Won', key: 'medal' },
              { label: 'Rank / Position', key: 'position' },
            ])}

            {activeTab === 'gallery' && renderTable('Gallery Media Content', 'gallery', [
              { label: 'Media Title', key: 'title' },
              { label: 'Category', key: 'category' },
              { label: 'Type', key: 'mediaType' },
              { label: 'Asset URL', key: 'mediaUrl' },
            ])}

            {activeTab === 'enquiries' && (
              <>
                {renderTable('Athlete Intake Enquiries', 'athleteEnquiries', [
                  { label: 'Athlete Name', key: 'fullName' },
                  { label: 'Email', key: 'email' },
                  { label: 'Sport of Interest', key: 'sport' },
                  { label: 'District / Region', key: 'district' },
                ], ['New', 'Contacted', 'Accepted', 'Closed'])}

                {renderTable('Public Event Registrations', 'eventRegistrations', [
                  { label: 'Target Event', key: 'eventTitle' },
                  { label: 'Participant Name', key: 'fullName' },
                  { label: 'Email', key: 'email' },
                  { label: 'Phone', key: 'phone' },
                ], ['Pending', 'Confirmed', 'Waitlisted', 'Cancelled'])}

                {renderTable('Sponsor & Institutional Partnership Requests', 'sponsorEnquiries', [
                  { label: 'Organisation', key: 'organization' },
                  { label: 'Contact Person', key: 'contactName' },
                  { label: 'Email Address', key: 'email' },
                  { label: 'Support Nature', key: 'supportType' },
                ], ['New', 'In Discussion', 'Confirmed', 'Closed'])}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
