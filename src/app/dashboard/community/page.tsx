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

  const table = (title: string, type: keyof Data, columns: { label: string; key: string }[], statusOptions?: string[]) => (
    <section className="card border-0 shadow-sm mb-4" key={type}>
      <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center"><h2 className="h5 fw-bold mb-0">{title}</h2><span className="badge bg-primary">{data[type].length}</span></div>
      {data[type].length === 0 ? <div className="card-body text-muted small">No records yet.</div> : <div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead className="table-light"><tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}<th>Status</th><th className="text-end">Action</th></tr></thead><tbody>{data[type].map(item => <tr key={item.id}>{columns.map(c => <td key={c.key} style={{ minWidth: 130 }}>{String(item[c.key] ?? '—').slice(0, 120)}</td>)}<td style={{ minWidth: 150 }}>{type === 'programmes' ? <select className="form-select form-select-sm" value={item.status} disabled={busy === item.id} onChange={e => void update(type, item, { status: e.target.value })}><option>Draft</option><option>Published</option><option>Archived</option></select> : ['results', 'gallery'].includes(type) ? <button className={`btn btn-sm ${item.published ? 'btn-success' : 'btn-outline-secondary'}`} disabled={busy === item.id} onClick={() => void update(type, item, { published: !item.published })}>{item.published ? 'Published' : 'Draft / Hidden'}</button> : <select className="form-select form-select-sm" value={item.status} disabled={busy === item.id} onChange={e => void update(type, item, { status: e.target.value })}>{(statusOptions || ['New', 'Contacted', 'Closed']).map(s => <option key={s}>{s}</option>)}</select>}</td><td className="text-end"><button className="btn btn-sm btn-outline-danger" disabled={busy === item.id} onClick={() => void remove(type, item)} aria-label="Delete record"><i className="fas fa-trash" /> Delete</button></td></tr>)}</tbody></table></div>}
    </section>
  );

  return <main className="container-fluid py-4 px-3 px-lg-4" style={{ maxWidth: 1500 }}>
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div><Link href="/dashboard" className="small text-decoration-none"><i className="fas fa-arrow-left me-2" />Back to main dashboard</Link><h1 className="h3 fw-bold mt-2 mb-1">Sports & Community Management</h1><p className="text-muted mb-0">Manage programmes, results, gallery content and public enquiries.</p></div>
      <div className="d-flex gap-2 flex-wrap"><Link href="/dashboard/donations" className="btn btn-primary"><i className="fas fa-hand-holding-heart me-2" />Donation payments</Link><button className="btn btn-outline-primary" onClick={() => void load()} disabled={loading}><i className="fas fa-rotate me-2" />Refresh data</button></div>
    </div>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}{success && <div className="alert alert-success" role="status">{success}</div>}
    <div className="row g-3 mb-4">{(['programmes','results','gallery','athleteEnquiries','eventRegistrations','sponsorEnquiries'] as (keyof Data)[]).map(k => <div className="col-6 col-md-4 col-xl-2" key={k}><div className="card border-0 shadow-sm h-100"><div className="card-body"><div className="small text-muted text-capitalize">{k.replace(/([A-Z])/g,' $1')}</div><div className="h3 fw-bold mb-0">{data[k].length}</div></div></div></div>)}</div>

    <div className="row g-4 mb-4">
      <div className="col-lg-6"><section className="card border-0 shadow-sm h-100"><div className="card-body p-4"><h2 className="h5 fw-bold">Add training programme</h2><form onSubmit={(e: FormEvent) => { e.preventDefault(); void saveContent('/api/training-programs', programme, 'Training programme', () => setProgramme({ title: '', sport: '', description: '', location: '', schedule: '', startDate: '', endDate: '', eligibility: '', contactEmail: '', status: 'Draft', featured: false })); }}>
        <div className="row g-2">{(['title','sport','location','schedule','startDate','endDate','contactEmail'] as (keyof typeof programme)[]).map(k => <div className="col-md-6" key={k}><label className="form-label small fw-semibold text-capitalize">{k.replace(/([A-Z])/g,' $1')}</label><input className="form-control" type={k === 'contactEmail' ? 'email' : 'text'} required={['title','sport','location'].includes(k)} value={programme[k] as string} onChange={e => setProgramme(s => ({ ...s, [k]: e.target.value } as typeof programme))} /></div>)}</div>
        <label className="form-label small fw-semibold mt-2">Description</label><textarea className="form-control" rows={3} required minLength={10} value={programme.description} onChange={e => setProgramme(s => ({ ...s, description: e.target.value }))} />
        <label className="form-label small fw-semibold mt-2">Eligibility</label><textarea className="form-control" rows={2} value={programme.eligibility} onChange={e => setProgramme(s => ({ ...s, eligibility: e.target.value }))} />
        <div className="form-check my-3"><input className="form-check-input" type="checkbox" checked={programme.featured} onChange={e => setProgramme(s => ({ ...s, featured: e.target.checked }))} id="programme-featured" /><label className="form-check-label" htmlFor="programme-featured">Feature this programme</label></div>
        <button className="btn btn-primary" disabled={busy === 'Training programme'}>{busy === 'Training programme' ? 'Saving…' : 'Save programme as draft'}</button>
      </form></div></section></div>
      <div className="col-lg-6"><section className="card border-0 shadow-sm h-100"><div className="card-body p-4"><h2 className="h5 fw-bold">Add competition result</h2><form onSubmit={(e: FormEvent) => { e.preventDefault(); void saveContent('/api/competition-results', result, 'Competition result', () => setResult({ eventTitle: '', competitionDate: '', athleteName: '', sport: '', category: '', position: '', medal: '', result: '', notes: '', published: false })); }}>
        <div className="row g-2">{(['eventTitle','competitionDate','athleteName','sport','category','position','medal','result'] as (keyof typeof result)[]).map(k => <div className="col-md-6" key={k}><label className="form-label small fw-semibold text-capitalize">{k.replace(/([A-Z])/g,' $1')}</label><input className="form-control" type={k === 'competitionDate' ? 'date' : 'text'} required={['eventTitle','competitionDate','athleteName','sport'].includes(k)} value={result[k] as string} onChange={e => setResult(s => ({ ...s, [k]: e.target.value } as typeof result))} /></div>)}</div>
        <label className="form-label small fw-semibold mt-2">Notes</label><textarea className="form-control" rows={2} value={result.notes} onChange={e => setResult(s => ({ ...s, notes: e.target.value }))} /><div className="form-check my-3"><input className="form-check-input" type="checkbox" checked={result.published} onChange={e => setResult(s => ({ ...s, published: e.target.checked }))} id="result-published" /><label className="form-check-label" htmlFor="result-published">Publish immediately</label></div><button className="btn btn-primary" disabled={busy === 'Competition result'}>{busy === 'Competition result' ? 'Saving…' : 'Save result'}</button>
      </form></div></section></div>
      <div className="col-lg-6"><section className="card border-0 shadow-sm"><div className="card-body p-4"><h2 className="h5 fw-bold">Add gallery item</h2><form onSubmit={(e: FormEvent) => { e.preventDefault(); void saveContent('/api/gallery', gallery, 'Gallery item', () => setGallery({ title: '', description: '', mediaUrl: '', mediaType: 'image', category: 'General', eventDate: '', published: false })); }}>
        <label className="form-label small fw-semibold">Title</label><input className="form-control mb-2" required value={gallery.title} onChange={e => setGallery(s => ({ ...s, title: e.target.value }))} /><label className="form-label small fw-semibold">Media URL</label><input className="form-control mb-2" required value={gallery.mediaUrl} onChange={e => setGallery(s => ({ ...s, mediaUrl: e.target.value }))} placeholder="/uploads/photo.jpg or https://…" /><div className="row g-2"><div className="col-md-6"><label className="form-label small fw-semibold">Type</label><select className="form-select" value={gallery.mediaType} onChange={e => setGallery(s => ({ ...s, mediaType: e.target.value }))}><option value="image">Image</option><option value="video">Video</option></select></div><div className="col-md-6"><label className="form-label small fw-semibold">Category</label><input className="form-control" value={gallery.category} onChange={e => setGallery(s => ({ ...s, category: e.target.value }))} /></div></div><label className="form-label small fw-semibold mt-2">Description</label><textarea className="form-control" rows={2} value={gallery.description} onChange={e => setGallery(s => ({ ...s, description: e.target.value }))} /><div className="form-check my-3"><input className="form-check-input" type="checkbox" checked={gallery.published} onChange={e => setGallery(s => ({ ...s, published: e.target.checked }))} id="gallery-published" /><label className="form-check-label" htmlFor="gallery-published">Publish immediately</label></div><button className="btn btn-primary" disabled={busy === 'Gallery item'}>{busy === 'Gallery item' ? 'Saving…' : 'Save gallery item'}</button>
      </form></div></section></div>
    </div>
    {loading ? <div className="text-center py-5" role="status">Loading management records…</div> : <>
      {table('Training programmes', 'programmes', [{label:'Programme',key:'title'},{label:'Sport',key:'sport'},{label:'Location',key:'location'}])}
      {table('Competition results', 'results', [{label:'Event',key:'eventTitle'},{label:'Athlete',key:'athleteName'},{label:'Sport',key:'sport'},{label:'Medal / position',key:'medal'}])}
      {table('Gallery items', 'gallery', [{label:'Title',key:'title'},{label:'Category',key:'category'},{label:'Media type',key:'mediaType'}])}
      {table('Athlete enquiries', 'athleteEnquiries', [{label:'Name',key:'fullName'},{label:'Email',key:'email'},{label:'Sport',key:'sport'},{label:'District',key:'district'}], ['New','Contacted','Accepted','Closed'])}
      {table('Event registrations', 'eventRegistrations', [{label:'Event',key:'eventTitle'},{label:'Name',key:'fullName'},{label:'Email',key:'email'}], ['Pending','Confirmed','Waitlisted','Cancelled'])}
      {table('Sponsor & partner enquiries', 'sponsorEnquiries', [{label:'Organisation',key:'organization'},{label:'Contact',key:'contactName'},{label:'Email',key:'email'},{label:'Support',key:'supportType'}], ['New','In Discussion','Confirmed','Closed'])}
    </>}
  </main>;
}
