'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  categories: string[];
  createdAt: string;
}

interface SubscriberCounts {
  total: number;
  active: number;
  inactive: number;
}

export default function SubscribersTab() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingSubscriberId, setPendingSubscriberId] = useState<string | null>(null);
  const [cleaningSpam, setCleaningSpam] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Server-side pagination state
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [counts, setCounts] = useState<SubscriberCounts>({ total: 0, active: 0, inactive: 0 });

  // Debounce search changes to prevent redundant network requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset to page 1 whenever search query or status filter changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterStatus]);

  // Broadcast campaign state
  const [composeOpen, setComposeOpen] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [campaignForm, setCampaignForm] = useState({
    subject: '',
    contentHtml: '',
    category: 'all',
  });

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.subject.trim() || !campaignForm.contentHtml.trim()) return;

    if (!confirm(`Are you sure you want to broadcast this newsletter to active subscribers?`)) return;

    try {
      setBroadcasting(true);
      setBroadcastMsg(null);
      const res = await fetch('/api/subscribers/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch campaign');

      setBroadcastMsg({
        type: 'success',
        text: `Successfully broadcasted to ${data.count} subscriber${data.count === 1 ? '' : 's'}!`,
      });
      setCampaignForm({ subject: '', contentHtml: '', category: 'all' });
      setTimeout(() => setComposeOpen(false), 3000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error broadcasting newsletter.';
      setBroadcastMsg({
        type: 'danger',
        text: msg,
      });
    } finally {
      setBroadcasting(false);
    }
  };

  const handleCleanSpam = async () => {
    const wipeAll = confirm(
      'Spam Cleanup Options:\n\n' +
      'Click OK to remove detected bot/test/disposable subscriber emails from the database.\n' +
      'Click Cancel to keep all records.'
    );
    if (!wipeAll) return;

    try {
      setCleaningSpam(true);
      setActionError('');
      setActionMsg('');
      const res = await fetch('/api/admin/clean-spam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target: 'subscribers', mode: 'spam' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clean spam subscribers');
      await fetchSubscribers();
      setActionMsg(`Cleanup completed: ${data.cleaned?.subscribers ?? 0} spam subscriber(s) removed.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error cleaning subscribers');
    } finally {
      setCleaningSpam(false);
    }
  };

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        search: debouncedSearch,
        status: filterStatus,
      });

      const res = await fetch(`/api/subscribers?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Failed to load subscribers');
      const json = await res.json();

      if (json && Array.isArray(json.data)) {
        setSubscribers(json.data);
        setTotalPages(json.pagination?.totalPages || 1);
        setTotalCount(json.pagination?.total ?? 0);
        if (json.counts) {
          setCounts(json.counts);
        }
      } else if (Array.isArray(json)) {
        setSubscribers(json);
        setTotalCount(json.length);
        setTotalPages(Math.max(1, Math.ceil(json.length / limit)));
        const active = json.filter((s: Subscriber) => s.active).length;
        setCounts({ total: json.length, active, inactive: json.length - active });
      } else {
        throw new Error('The subscribers endpoint returned unexpected data.');
      }
      setError('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error loading subscribers');
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, filterStatus]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Delete subscriber "${email}" permanently from database?`)) return;
    setPendingSubscriberId(id);
    setActionError('');
    setActionMsg('');
    try {
      const res = await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Could not remove ${email} (HTTP ${res.status}).`);

      const successMsg = data.message || `Subscriber "${email}" deleted successfully from database!`;
      setActionMsg(successMsg);
      alert(successMsg);

      if (subscribers.length === 1 && page > 1) {
        setPage(prev => prev - 1);
      } else {
        await fetchSubscribers();
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Could not remove subscriber. Check your connection and try again.';
      setActionError(errMsg);
      alert(`Failed to delete subscriber from database: ${errMsg}`);
    } finally {
      setPendingSubscriberId(null);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    setPendingSubscriberId(id);
    setActionError('');
    setActionMsg('');
    try {
      const res = await fetch(`/api/subscribers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentActive }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Could not update subscriber (HTTP ${res.status}).`);
      if (typeof data.active !== 'boolean') throw new Error('The server returned an unexpected subscriber status.');

      setSubscribers(prev => prev.map(s => s.id === id ? { ...s, active: data.active } : s));
      setCounts(prev => ({
        ...prev,
        active: data.active ? prev.active + 1 : Math.max(0, prev.active - 1),
        inactive: !data.active ? prev.inactive + 1 : Math.max(0, prev.inactive - 1),
      }));

      setActionMsg(`Subscriber ${data.active ? 'activated' : 'deactivated'}`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update subscriber. Check your connection and try again.');
    } finally {
      setPendingSubscriberId(null);
    }
  };

  const CATEGORY_LABELS: Record<string, string> = {
    news: 'News',
    events: 'Events',
    careers: 'Careers',
    announcements: 'Announcements',
  };

  // Generate pagination page numbers
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }, [page, totalPages]);

  const startIndex = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, totalCount);

  return (
    <div className="subscribers-page-container">
      {/* Responsive & Big Screen Stylesheet */}
      <style>{`
        .subscribers-page-container {
          width: 100%;
          max-width: 100%;
          margin: 0;
          padding: 0;
        }

        .subscribers-card {
          width: 100%;
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          padding: 24px 28px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          margin-bottom: 24px;
        }

        .subscribers-header-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 22px;
          padding-bottom: 18px;
          border-bottom: 1px solid #F1F5F9;
        }

        .subscribers-header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          flex-wrap: wrap;
          gap: 12px;
        }

        .subscribers-header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .subscribers-stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .subscribers-stat-item {
          border-radius: 14px;
          padding: 18px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .subscribers-filter-row {
          display: flex;
          gap: 14px;
          margin-bottom: 22px;
          flex-wrap: wrap;
          align-items: center;
        }

        .subscribers-filter-search {
          flex: 1 1 320px;
          max-width: 480px;
          position: relative;
        }

        .subscribers-filter-secondary {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .subscribers-filter-select {
          width: auto;
          min-width: 160px;
          height: 42px;
          font-size: 0.88rem;
        }

        .subscribers-filter-refresh {
          height: 42px;
          border-radius: 8px;
          padding: 0 18px;
          color: #475569;
          font-weight: 600;
          font-size: 0.85rem;
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          gap: 6px;
          background: #F8FAFC;
        }

        /* ── Desktop & Big Screen Table ── */
        .subscribers-desktop-table {
          display: block;
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .subscribers-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 0.9rem;
        }

        .subscribers-table th {
          background: #F8FAFC;
          color: #475569;
          font-weight: 700;
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 14px 18px;
          border-bottom: 2px solid #E2E8F0;
          white-space: nowrap;
        }

        .subscribers-table td {
          padding: 16px 18px;
          border-bottom: 1px solid #F1F5F9;
          vertical-align: middle;
          background-color: #FFFFFF;
          transition: background-color 0.15s ease;
        }

        .subscribers-table tbody tr:hover td {
          background-color: #F8FAFC;
        }

        /* Column distribution to fit wide screens gracefully */
        .subscribers-col-email {
          width: 32%;
          min-width: 250px;
        }

        .subscribers-col-status {
          width: 14%;
          min-width: 120px;
        }

        .subscribers-col-categories {
          width: 24%;
          min-width: 180px;
        }

        .subscribers-col-date {
          width: 14%;
          min-width: 130px;
        }

        .subscribers-col-actions {
          width: 16%;
          min-width: 180px;
          text-align: right;
        }

        .subscribers-actions-wrap {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
          align-items: center;
        }

        /* Mobile Card View (< 768px) */
        .subscribers-mobile-cards {
          display: none;
        }

        /* Pagination toolbar */
        .subscribers-pagination-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
          padding-top: 22px;
          margin-top: 20px;
          border-top: 1px solid #F1F5F9;
        }

        .subscribers-pagination-range {
          font-size: 0.88rem;
          color: #64748B;
          font-weight: 500;
        }

        .subscribers-pagination-buttons {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .subscribers-pagination-size {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        /* ── Big Screen Enhancements (>= 1400px) ── */
        @media (min-width: 1400px) {
          .subscribers-card {
            padding: 28px 36px;
          }

          .subscribers-stats-grid {
            gap: 22px;
          }

          .subscribers-stat-item {
            padding: 22px 28px;
          }

          .subscribers-stat-number {
            font-size: 1.85rem !important;
          }

          .subscribers-stat-label {
            font-size: 0.84rem !important;
          }

          .subscribers-table th {
            padding: 16px 22px;
            font-size: 0.82rem;
          }

          .subscribers-table td {
            padding: 18px 22px;
            font-size: 0.92rem;
          }

          .subscribers-filter-search {
            max-width: 520px;
          }
        }

        /* ── Mobile & Tablet Media Queries (< 768px) ── */
        @media (max-width: 768px) {
          .subscribers-card {
            padding: 16px 14px;
            border-radius: 12px;
            margin-bottom: 14px;
          }

          .subscribers-header-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
            margin-bottom: 16px;
            padding-bottom: 14px;
          }

          .subscribers-header-content {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }

          .subscribers-header-actions {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .subscribers-header-actions .btn {
            width: 100%;
            justify-content: center;
            font-size: 0.82rem;
            padding: 8px 10px;
          }

          .subscribers-stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 10px;
          }

          .subscribers-stat-item {
            padding: 12px 14px;
            gap: 10px;
          }

          .subscribers-stat-item i {
            font-size: 1.25rem !important;
          }

          .subscribers-stat-number {
            font-size: 1.3rem !important;
          }

          .subscribers-stat-label {
            font-size: 0.72rem !important;
          }

          .subscribers-filter-row {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .subscribers-filter-search {
            width: 100%;
            max-width: none;
            flex: none;
          }

          .subscribers-filter-secondary {
            display: flex;
            gap: 8px;
            width: 100%;
          }

          .subscribers-filter-select {
            flex: 1;
            min-width: 0;
          }

          .subscribers-filter-refresh {
            flex: 0 0 auto;
          }

          /* Hide table on phones, switch to card view */
          .subscribers-desktop-table {
            display: none !important;
          }

          .subscribers-mobile-cards {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .subscribers-mobile-card {
            background: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 14px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.02);
            transition: all 0.2s ease;
          }

          .subscribers-mobile-card:hover {
            border-color: #CBD5E1;
            box-shadow: 0 4px 10px rgba(0,0,0,0.05);
          }

          /* Pagination on mobile */
          .subscribers-pagination-bar {
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
            padding-top: 14px;
          }

          .subscribers-pagination-mobile-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
          }

          .subscribers-pagination-buttons {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .subscribers-header-actions {
            grid-template-columns: 1fr;
          }

          .subscribers-stats-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .subscribers-pagination-buttons .btn {
            padding: 4px 8px !important;
            font-size: 0.78rem !important;
            min-width: 30px !important;
          }
        }
      `}</style>

      {/* Header card */}
      <div className="subscribers-card">
        <div className="subscribers-header-row">
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="fas fa-bell" style={{ fontSize: '1.3rem', color: '#2E7D32' }} />
          </div>
          <div className="subscribers-header-content">
            <div>
              <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.25rem', color: '#0f172a' }}>Newsletter Subscribers</h3>
              <p style={{ margin: '3px 0 0', fontSize: '0.86rem', color: '#64748B' }}>Manage subscriber list, inspect engagement, and broadcast official newsletters.</p>
            </div>
            <div className="subscribers-header-actions">
              <button
                type="button"
                onClick={handleCleanSpam}
                disabled={cleaningSpam || loading}
                className="btn btn-outline-danger btn-sm fw-bold px-3 py-2 d-inline-flex align-items-center gap-2"
                title="Detect and clean fake or bot email addresses"
              >
                <i className={`fas ${cleaningSpam ? 'fa-spinner fa-spin' : 'fa-broom'}`} />
                {cleaningSpam ? 'Cleaning…' : 'Clean Spam'}
              </button>
              <button
                type="button"
                onClick={() => setComposeOpen(true)}
                className="btn btn-primary btn-sm fw-bold px-3 py-2 d-inline-flex align-items-center gap-2"
                style={{ background: '#0072C6', borderColor: '#0072C6' }}
              >
                <i className="fas fa-paper-plane" /> Compose Broadcast
              </button>
            </div>
          </div>
        </div>

        {/* Compose Newsletter Modal / Form */}
        {composeOpen && (
          <div className="card p-3 p-md-4 mb-4 border shadow-sm" style={{ background: '#F8FAFC', borderRadius: '12px' }}>
            <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
              <h5 className="fw-bold mb-0 text-dark" style={{ fontSize: '1.05rem' }}>
                <i className="fas fa-envelope-open-text text-primary me-2" />Dispatch Newsletter Campaign
              </h5>
              <button type="button" className="btn-close" onClick={() => setComposeOpen(false)} aria-label="Close" />
            </div>

            {broadcastMsg && (
              <div className={`alert alert-${broadcastMsg.type === 'success' ? 'success' : 'danger'} small py-2 mb-3`}>
                {broadcastMsg.text}
              </div>
            )}

            <form onSubmit={handleSendBroadcast}>
              <div className="mb-3">
                <label className="form-label small fw-bold">Target Audience Category</label>
                <select
                  className="form-select form-select-sm"
                  value={campaignForm.category}
                  onChange={e => setCampaignForm({ ...campaignForm, category: e.target.value })}
                >
                  <option value="all">All Active Subscribers ({counts.active.toLocaleString()} recipients)</option>
                  <option value="news">News Updates Subscribers</option>
                  <option value="events">Events & Competitions Subscribers</option>
                  <option value="announcements">Announcements Subscribers</option>
                  <option value="careers">Careers & Vacancies Subscribers</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Campaign Subject Line <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  required
                  placeholder="e.g. NPC Rwanda Highlights: Road to Paris 2024"
                  value={campaignForm.subject}
                  onChange={e => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold">Message Content (HTML or Plain Text) <span className="text-danger">*</span></label>
                <textarea
                  className="form-control form-control-sm"
                  rows={5}
                  required
                  placeholder="<p>Dear Supporters and Athletes,</p><p>We are delighted to share our latest achievements and upcoming championships...</p>"
                  value={campaignForm.contentHtml}
                  onChange={e => setCampaignForm({ ...campaignForm, contentHtml: e.target.value })}
                />
                <small className="text-muted d-block mt-1" style={{ fontSize: '0.78rem' }}>
                  Write HTML formatting (paragraphs, links, bold text). The official header, footer, and unsubscribe link are attached automatically.
                </small>
              </div>

              <div className="d-flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="btn btn-primary btn-sm fw-bold px-4 py-2"
                >
                  <i className={`fas ${broadcasting ? 'fa-spinner fa-spin' : 'fa-paper-plane'} me-2`} />
                  {broadcasting ? 'Sending Campaign...' : 'Send to Subscribers'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setComposeOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Real-time stats row */}
        <div className="subscribers-stats-grid">
          {[
            { label: 'Total Subscribers', value: counts.total, color: '#0072C6', bg: '#E3F2FD', icon: 'fa-users' },
            { label: 'Active Subscribers', value: counts.active, color: '#2E7D32', bg: '#E8F5E9', icon: 'fa-circle-check' },
            { label: 'Inactive / Unsubscribed', value: counts.inactive, color: '#C62828', bg: '#FFEBEE', icon: 'fa-circle-xmark' },
          ].map(stat => (
            <div key={stat.label} className="subscribers-stat-item" style={{ background: stat.bg, border: `1px solid ${stat.color}15` }}>
              <i className={`fas ${stat.icon}`} style={{ color: stat.color, fontSize: '1.5rem', flexShrink: 0 }} />
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div className="subscribers-stat-number" style={{ fontSize: '1.6rem', fontWeight: 800, color: stat.color, lineHeight: 1.1 }}>
                  {stat.value.toLocaleString()}
                </div>
                <div className="subscribers-stat-label" style={{ fontSize: '0.78rem', color: stat.color, fontWeight: 600, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Data card */}
      <div className="subscribers-card">
        {actionMsg && (
          <div style={{ padding: '10px 14px', background: '#E8F5E9', border: '1px solid #C8E6C9', borderRadius: '8px', color: '#2E7D32', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span><i className="fas fa-circle-check me-2" />{actionMsg}</span>
            <button onClick={() => setActionMsg('')} style={{ background: 'transparent', border: 'none', color: '#2E7D32', cursor: 'pointer', padding: '0 4px' }}><i className="fas fa-xmark" /></button>
          </div>
        )}
        {actionError && (
          <div role="alert" style={{ padding: '10px 14px', background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '8px', color: '#C62828', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span><i className="fas fa-triangle-exclamation me-2" />{actionError}</span>
            <button onClick={() => setActionError('')} style={{ background: 'transparent', border: 'none', color: '#C62828', cursor: 'pointer', padding: '0 4px' }}><i className="fas fa-xmark" /></button>
          </div>
        )}
        {error && (
          <div style={{ padding: '10px 14px', background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '8px', color: '#C62828', fontSize: '0.85rem', marginBottom: '16px' }}>
            <i className="fas fa-triangle-exclamation me-2" />{error}
          </div>
        )}

        {/* Search & Filter bar */}
        <div className="subscribers-filter-row">
          <div className="subscribers-filter-search">
            <i className="fas fa-search" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.85rem' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by subscriber email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '38px', fontSize: '0.88rem', height: '42px', borderRadius: '8px' }}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                aria-label="Clear search"
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.88rem' }}
              >
                <i className="fas fa-times-circle" />
              </button>
            )}
          </div>

          <div className="subscribers-filter-secondary">
            <select
              className="form-select subscribers-filter-select"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <button
              type="button"
              onClick={() => { void fetchSubscribers(); }}
              disabled={loading}
              aria-label="Refresh subscriber list"
              title={loading ? 'Refreshing subscribers…' : 'Refresh subscriber list'}
              className="btn btn-light subscribers-filter-refresh"
            >
              <i className={`fas fa-rotate-right ${loading ? 'fa-spin' : ''}`} />
              <span className="d-none d-sm-inline">{loading ? 'Refreshing…' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Loading state */}
        {!loading && subscribers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94A3B8' }}>
            <i className="fas fa-bell-slash fa-2x mb-3" style={{ display: 'block', color: '#CBD5E1' }} />
            <div style={{ fontWeight: 600, fontSize: '1rem', color: '#475569' }}>
              {totalCount === 0 && !debouncedSearch && filterStatus === 'all'
                ? 'No subscribers yet.'
                : 'No subscribers match your search filter.'}
            </div>
            {(debouncedSearch || filterStatus !== 'all') && (
              <button
                onClick={() => { setSearch(''); setFilterStatus('all'); }}
                className="btn btn-outline-primary btn-sm mt-3"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── 1. Desktop & Big Screen Table View (>= 768px) ── */}
            <div className="subscribers-desktop-table" style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              <table className="subscribers-table">
                <thead>
                  <tr>
                    <th className="subscribers-col-email">Email</th>
                    <th className="subscribers-col-status">Status</th>
                    <th className="subscribers-col-categories">Categories</th>
                    <th className="subscribers-col-date">Joined Date</th>
                    <th className="subscribers-col-actions">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map(sub => (
                    <tr key={sub.id}>
                      <td className="subscribers-col-email" style={{ color: '#1E293B', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <i className="fas fa-envelope" style={{ color: '#0072C6', fontSize: '0.9rem', flexShrink: 0 }} />
                          <span style={{ wordBreak: 'break-all' }}>{sub.email}</span>
                        </div>
                      </td>
                      <td className="subscribers-col-status">
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: '5px',
                          padding: '4px 11px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                          background: sub.active ? '#E8F5E9' : '#FFEBEE',
                          color: sub.active ? '#2E7D32' : '#C62828'
                        }}>
                          <i className={`fas ${sub.active ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ fontSize: '0.7rem' }} />
                          {sub.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="subscribers-col-categories">
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          {sub.categories && sub.categories.length > 0 ? (
                            sub.categories.map(cat => (
                              <span key={cat} style={{ padding: '3px 10px', borderRadius: '12px', background: '#E3F2FD', color: '#0072C6', fontSize: '0.74rem', fontWeight: 600 }}>
                                {CATEGORY_LABELS[cat] || cat}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#94A3B8', fontSize: '0.76rem' }}>All categories</span>
                          )}
                        </div>
                      </td>
                      <td className="subscribers-col-date" style={{ color: '#64748B', whiteSpace: 'nowrap', fontSize: '0.85rem' }}>
                        {new Date(sub.createdAt).toLocaleDateString('en-RW', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="subscribers-col-actions">
                        <div className="subscribers-actions-wrap">
                          <button
                            type="button"
                            onClick={() => handleToggle(sub.id, sub.active)}
                            disabled={pendingSubscriberId !== null}
                            title={sub.active ? 'Deactivate' : 'Activate'}
                            aria-label={sub.active ? 'Deactivate' : 'Activate'}
                            style={{ background: sub.active ? '#FFF3E0' : '#E8F5E9', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', color: sub.active ? '#E65100' : '#2E7D32', fontSize: '0.85rem' }}
                          >
                            <i className={`fas ${sub.active ? 'fa-ban' : 'fa-check'}`} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(sub.id, sub.email)}
                            disabled={pendingSubscriberId !== null}
                            title="Delete"
                            aria-label="Delete"
                            style={{ background: '#FFEBEE', border: 'none', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', color: '#C62828', fontSize: '0.85rem' }}
                          >
                            <i className={`fas ${pendingSubscriberId === sub.id ? 'fa-spinner fa-spin' : 'fa-trash'}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── 2. Mobile Card View (< 768px) ── */}
            <div className="subscribers-mobile-cards" style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
              {subscribers.map(sub => (
                <div key={sub.id} className="subscribers-mobile-card">
                  {/* Top: Email and Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="fas fa-envelope" style={{ color: '#0072C6', fontSize: '0.85rem' }} />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#1E293B', wordBreak: 'break-all' }}>
                        {sub.email}
                      </div>
                    </div>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '3px 9px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
                      background: sub.active ? '#E8F5E9' : '#FFEBEE',
                      color: sub.active ? '#2E7D32' : '#C62828'
                    }}>
                      <i className={`fas ${sub.active ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ fontSize: '0.68rem' }} />
                      {sub.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Middle: Joined date + categories */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px', fontSize: '0.78rem', color: '#64748B' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <i className="far fa-calendar-alt text-muted" style={{ fontSize: '0.75rem' }} />
                      <span>Joined {new Date(sub.createdAt).toLocaleDateString('en-RW', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                      {sub.categories && sub.categories.length > 0 ? (
                        sub.categories.map(cat => (
                          <span key={cat} style={{ padding: '2px 8px', borderRadius: '12px', background: '#F1F5F9', color: '#475569', fontSize: '0.7rem', fontWeight: 600 }}>
                            {CATEGORY_LABELS[cat] || cat}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: '0.72rem' }}>All categories</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom: Action buttons */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                    <button
                      type="button"
                      onClick={() => handleToggle(sub.id, sub.active)}
                      disabled={pendingSubscriberId !== null}
                      style={{
                        background: sub.active ? '#FFF3E0' : '#E8F5E9',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px',
                        cursor: 'pointer',
                        color: sub.active ? '#E65100' : '#2E7D32',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <i className={`fas ${sub.active ? 'fa-ban' : 'fa-check'}`} />
                      {sub.active ? 'Deactivate' : 'Activate'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(sub.id, sub.email)}
                      disabled={pendingSubscriberId !== null}
                      style={{
                        background: '#FFEBEE',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px',
                        cursor: 'pointer',
                        color: '#C62828',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <i className={`fas ${pendingSubscriberId === sub.id ? 'fa-spinner fa-spin' : 'fa-trash'}`} />
                      {pendingSubscriberId === sub.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Toolbar */}
            <div className="subscribers-pagination-bar">
              {/* Range info & Limit Selector */}
              <div className="subscribers-pagination-mobile-top">
                <div className="subscribers-pagination-range">
                  Showing <span style={{ fontWeight: 700, color: '#0F172A' }}>{startIndex.toLocaleString()}</span> to{' '}
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{endIndex.toLocaleString()}</span> of{' '}
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>{totalCount.toLocaleString()}</span> subscribers
                </div>

                <div className="subscribers-pagination-size">
                  <label htmlFor="subscribersPerPage" style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500, margin: 0 }}>
                    Per page:
                  </label>
                  <select
                    id="subscribersPerPage"
                    className="form-select form-select-sm"
                    value={limit}
                    onChange={e => {
                      setLimit(Number(e.target.value));
                      setPage(1);
                    }}
                    style={{ width: '75px', fontSize: '0.82rem', fontWeight: 600, padding: '4px 8px' }}
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>

              {/* Page navigation controls */}
              <div className="subscribers-pagination-buttons">
                <button
                  type="button"
                  onClick={() => setPage(1)}
                  disabled={page <= 1 || loading}
                  className="btn btn-sm btn-light"
                  style={{ border: '1px solid #E2E8F0', padding: '5px 12px', fontSize: '0.82rem', fontWeight: 600 }}
                  title="First Page"
                >
                  <i className="fas fa-angles-left" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page <= 1 || loading}
                  className="btn btn-sm btn-light"
                  style={{ border: '1px solid #E2E8F0', padding: '5px 14px', fontSize: '0.82rem', fontWeight: 600 }}
                >
                  <i className="fas fa-chevron-left me-1" /> Prev
                </button>

                {pageNumbers.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    disabled={loading}
                    className="btn btn-sm"
                    style={{
                      background: p === page ? '#0072C6' : '#FFFFFF',
                      color: p === page ? '#FFFFFF' : '#334155',
                      border: p === page ? '1px solid #0072C6' : '1px solid #E2E8F0',
                      fontWeight: p === page ? 700 : 500,
                      minWidth: '36px',
                      fontSize: '0.82rem',
                      padding: '5px 10px'
                    }}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page >= totalPages || loading}
                  className="btn btn-sm btn-light"
                  style={{ border: '1px solid #E2E8F0', padding: '5px 14px', fontSize: '0.82rem', fontWeight: 600 }}
                >
                  Next <i className="fas fa-chevron-right ms-1" />
                </button>
                <button
                  type="button"
                  onClick={() => setPage(totalPages)}
                  disabled={page >= totalPages || loading}
                  className="btn btn-sm btn-light"
                  style={{ border: '1px solid #E2E8F0', padding: '5px 12px', fontSize: '0.82rem', fontWeight: 600 }}
                  title="Last Page"
                >
                  <i className="fas fa-angles-right" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
