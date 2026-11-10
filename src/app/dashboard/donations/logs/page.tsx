'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import AccessRestricted from '@/components/shared/AccessRestricted';
import { hasPermission } from '@/lib/rbac';

type LogEntry = {
  id: string;
  txRef: string;
  event: string;
  status: string;
  source: string;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};
type Payload = { logs: LogEntry[]; pagination: { page: number; total: number; totalPages: number } };

const dateLabel = (value: string) => new Date(value).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export default function DonationPaymentLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [role, setRole] = useState('UNKNOWN');
  const [search, setSearch] = useState('');
  const [event, setEvent] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '25', search, event, status });
      const response = await fetch('/api/donations/logs?' + params.toString(), { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load payment logs.');
      const payload = data as Payload;
      setLogs(payload.logs || []);
      setTotal(payload.pagination.total || 0);
      setTotalPages(payload.pagination.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load payment logs.');
    } finally {
      setLoading(false);
    }
  }, [page, search, event, status]);

  useEffect(() => {
    fetch('/api/auth/profile').then((r) => r.ok ? r.json() : null).then((p) => setRole(p?.role || 'UNKNOWN')).catch(() => setRole('UNKNOWN'));
  }, []);
  useEffect(() => { if (hasPermission(role, 'donations.view')) void load(); else if (role !== 'UNKNOWN') setLoading(false); }, [role, load]);

  const exportCsv = () => {
    const rows = [['Date', 'Reference', 'Event', 'Status', 'Source', 'Message'], ...logs.map((log) => [log.createdAt, log.txRef, log.event, log.status, log.source, log.message])];
    const csv = rows.map((row) => row.map((cell) => '"' + String(cell).replace(/"/g, '""') + '"').join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a'); a.href = url; a.download = 'npc-donation-payment-logs.csv'; a.click(); URL.revokeObjectURL(url);
  };

  if (role !== 'UNKNOWN' && !hasPermission(role, 'donations.view')) return <AccessRestricted returnHref="/dashboard" returnLabel="Return to Dashboard" />;

  return <main className="dashboard-main-content" style={{ flex: 1, padding: 24, overflowY: 'auto', minWidth: 0 }}>
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div><h1 className="h4 fw-bold mb-1">Donation Payment Logs</h1><p className="text-muted small mb-0">A chronological record of checkout, provider verification, webhook and receipt events.</p></div>
      <div className="d-flex gap-2 flex-wrap">
        <Link href="/dashboard/donations" className="btn btn-outline-secondary btn-sm"><i className="fas fa-arrow-left me-1" /> Payments</Link>
        <button className="btn btn-outline-primary btn-sm" onClick={exportCsv} disabled={!logs.length}><i className="fas fa-file-csv me-1" /> Export current page</button>
        <button className="btn btn-primary btn-sm" onClick={() => void load()} disabled={loading}><i className="fas fa-rotate me-1" /> Refresh</button>
      </div>
    </div>
    <section className="card border-0 shadow-sm">
      <div className="card-body border-bottom">
        <div className="row g-2">
          <div className="col-lg-6"><label className="form-label small fw-semibold">Search reference or message</label><input className="form-control" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="NPC-DON-..." /></div>
          <div className="col-sm-6 col-lg-3"><label className="form-label small fw-semibold">Event</label><select className="form-select" value={event} onChange={(e) => { setEvent(e.target.value); setPage(1); }}><option value="ALL">All events</option>{['CHECKOUT_INITIATED','CHECKOUT_REQUESTED','CHECKOUT_FAILED','CHECKOUT_READY','VERIFICATION_STARTED','PAYMENT_SUCCESSFUL','PAYMENT_FAILED','PAYMENT_PENDING','WEBHOOK_RECEIVED','WEBHOOK_REJECTED','WEBHOOK_VERIFICATION_FAILED','RECEIPT_SENT','RECEIPT_FAILED'].map((v) => <option key={v} value={v}>{v.replaceAll('_',' ')}</option>)}</select></div>
          <div className="col-sm-6 col-lg-3"><label className="form-label small fw-semibold">Status</label><select className="form-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}><option value="ALL">All statuses</option><option value="SUCCESSFUL">Successful</option><option value="PENDING">Pending</option><option value="FAILED">Failed</option><option value="INFO">Information</option></select></div>
        </div>
      </div>
      {error && <div className="alert alert-danger m-3">{error}</div>}
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light"><tr><th>Date & time</th><th>Event</th><th>Reference</th><th>Status</th><th>Source</th><th>Details</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-5"><i className="fas fa-spinner fa-spin me-2" />Loading logs…</td></tr> : logs.length ? logs.map((log) => <tr key={log.id}>
              <td className="small text-nowrap">{dateLabel(log.createdAt)}</td><td><span className="small fw-semibold">{log.event.replaceAll('_',' ')}</span></td>
              <td><code className="small">{log.txRef}</code></td><td><span className={'badge ' + (log.status === 'SUCCESSFUL' ? 'bg-success-subtle text-success' : log.status === 'FAILED' ? 'bg-danger-subtle text-danger' : log.status === 'PENDING' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-secondary-subtle text-secondary')}>{log.status}</span></td>
              <td className="small">{log.source}</td><td className="small" style={{ minWidth: 240, maxWidth: 440, whiteSpace: 'normal' }}>{log.message}{log.metadata && <details className="mt-1"><summary className="text-primary" style={{ cursor: 'pointer' }}>Event details</summary><pre className="small bg-light p-2 mt-2 rounded" style={{ whiteSpace: 'pre-wrap', maxWidth: 420 }}>{JSON.stringify(log.metadata, null, 2)}</pre></details>}</td>
            </tr>) : <tr><td colSpan={6} className="text-center text-muted py-5">No payment events found.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="card-footer bg-white d-flex flex-wrap justify-content-between align-items-center gap-2"><span className="small text-muted">Showing {logs.length} of {total} events</span><div className="d-flex gap-2"><button className="btn btn-sm btn-outline-secondary" disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>Previous</button><span className="small align-self-center">Page {page} of {totalPages}</span><button className="btn btn-sm btn-outline-secondary" disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>Next</button></div></div>
    </section>
    <p className="small text-muted mt-3"><i className="fas fa-lock me-1" /> Logs are append-only from the application and visible only to users with donation-view permission. Sensitive payment credentials and card data are not stored here.</p>
  </main>;
}
