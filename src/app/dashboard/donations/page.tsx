'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Payment = {
  id: string; txRef: string; name: string; email: string; phone: string; amount: number;
  currency: string; supportType: string; paymentMethod: string; status: string;
  anonymous: boolean; createdAt: string; providerRef?: string | null;
};
type Summary = { successfulAmount: number; successfulCount: number; pendingCount: number; failedCount: number };

const money = (value: number) => new Intl.NumberFormat('en-RW').format(value);

export default function DonationPaymentsAdminPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<Summary>({ successfulAmount: 0, successfulCount: 0, pendingCount: 0, failedCount: 0 });
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/donations/payments', { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Unable to load donation payments.');
      setPayments(payload.payments || []);
      setSummary(payload.summary || { successfulAmount: 0, successfulCount: 0, pendingCount: 0, failedCount: 0 });
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load donation payments.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => filter === 'ALL' ? payments : payments.filter((item) => item.status === filter), [payments, filter]);

  function exportCsv() {
    const columns = ['Date', 'Reference', 'Donor', 'Email', 'Phone', 'Amount', 'Currency', 'Purpose', 'Payment method', 'Status'];
    const rows = visible.map((item) => [
      new Date(item.createdAt).toISOString(), item.txRef, item.anonymous ? 'Anonymous' : item.name,
      item.email, item.phone, String(item.amount), item.currency, item.supportType, item.paymentMethod, item.status,
    ]);
    const csv = [columns, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'npc-rwanda-donations.csv'; anchor.click(); URL.revokeObjectURL(url);
  }

  return <main className="container-fluid py-4 px-3 px-lg-4" style={{ maxWidth: 1500 }}>
    <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
      <div><Link href="/dashboard/community" className="small text-decoration-none"><i className="fas fa-arrow-left me-2" />Community management</Link><h1 className="h3 fw-bold mt-2 mb-1">Donation payments</h1><p className="text-muted mb-0">View verified contributions and track payment activity.</p></div>
      <div className="d-flex gap-2"><button className="btn btn-outline-secondary" onClick={() => void load()} disabled={loading}><i className="fas fa-rotate me-2" />Refresh</button><button className="btn btn-primary" onClick={exportCsv} disabled={!visible.length}><i className="fas fa-download me-2" />Export CSV</button></div>
    </div>
    {error && <div className="alert alert-danger" role="alert">{error}</div>}
    <div className="row g-3 mb-4">
      <div className="col-6 col-xl-3"><div className="card border-0 shadow-sm h-100"><div className="card-body"><div className="small text-muted">Verified donations</div><div className="h3 fw-bold mb-0">{summary.successfulCount}</div></div></div></div>
      <div className="col-6 col-xl-3"><div className="card border-0 shadow-sm h-100"><div className="card-body"><div className="small text-muted">Total received (RWF)</div><div className="h3 fw-bold mb-0">{money(summary.successfulAmount)}</div></div></div></div>
      <div className="col-6 col-xl-3"><div className="card border-0 shadow-sm h-100"><div className="card-body"><div className="small text-muted">Pending</div><div className="h3 fw-bold mb-0">{summary.pendingCount}</div></div></div></div>
      <div className="col-6 col-xl-3"><div className="card border-0 shadow-sm h-100"><div className="card-body"><div className="small text-muted">Failed</div><div className="h3 fw-bold mb-0">{summary.failedCount}</div></div></div></div>
    </div>
    <section className="card border-0 shadow-sm">
      <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2 py-3"><h2 className="h5 fw-bold mb-0">Payment records</h2><select className="form-select" style={{ maxWidth: 190 }} value={filter} onChange={(event) => setFilter(event.target.value)}><option value="ALL">All payments</option><option value="SUCCESSFUL">Successful</option><option value="PENDING">Pending</option><option value="FAILED">Failed</option></select></div>
      {loading ? <div className="text-center py-5" role="status">Loading payment records…</div> : visible.length === 0 ? <div className="text-center text-muted py-5">No donation payments found.</div> : <div className="table-responsive"><table className="table table-hover align-middle mb-0"><thead className="table-light"><tr><th>Date</th><th>Donor</th><th>Amount</th><th>Purpose</th><th>Payment</th><th>Reference</th><th>Status</th></tr></thead><tbody>{visible.map((item) => <tr key={item.id}><td className="small text-nowrap">{new Date(item.createdAt).toLocaleString()}</td><td><strong>{item.anonymous ? 'Anonymous donor' : item.name}</strong><div className="small text-muted">{item.email}<br />{item.phone}</div></td><td className="fw-bold text-nowrap">{item.currency} {money(item.amount)}</td><td>{item.supportType}</td><td className="text-nowrap">{item.paymentMethod === 'card' ? 'Card' : 'Mobile Money'}</td><td className="small font-monospace">{item.txRef}</td><td><span className={`badge ${item.status === 'SUCCESSFUL' ? 'bg-success' : item.status === 'FAILED' ? 'bg-danger' : 'bg-warning text-dark'}`}>{item.status}</span></td></tr>)}</tbody></table></div>}
      <div className="card-footer bg-white small text-muted">Only provider-verified successful payments are included in the received total. Showing the latest 250 records.</div>
    </section>
  </main>;
}
