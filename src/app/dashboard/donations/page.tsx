'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

type Payment = {
  id: string; txRef: string; name: string; email: string; phone: string; amount: number;
  currency: string; donorAmount?: number | null; donorCurrency?: string | null; exchangeRate?: number | null; exchangeRateDate?: string | null; supportType: string; paymentMethod: string; status: string;
  anonymous: boolean; createdAt: string; providerRef?: string | null;
};
type Summary = { successfulRwfAmount: number; successfulUsdAmount: number; successfulCount: number; pendingCount: number; failedCount: number };

const money = (value: number) => new Intl.NumberFormat('en-RW').format(value);

export default function DonationPaymentsAdminPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<Summary>({ successfulRwfAmount: 0, successfulUsdAmount: 0, successfulCount: 0, pendingCount: 0, failedCount: 0 });
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch('/api/donations/payments', { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Unable to load donation payments.');
      setPayments(payload.payments || []);
      setSummary(payload.summary || { successfulRwfAmount: 0, successfulUsdAmount: 0, successfulCount: 0, pendingCount: 0, failedCount: 0 });
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to load donation payments.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visible = useMemo(() => {
    return payments.filter((item) => {
      const matchesFilter = filter === 'ALL' || item.status === filter;
      const matchesSearch = !searchTerm.trim() || 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.txRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.phone.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [payments, filter, searchTerm]);

  function exportCsv() {
    const columns = ['Date', 'Reference', 'Donor', 'Email', 'Phone', 'Donation amount', 'Donation currency', 'Charged amount', 'Charged currency', 'Exchange rate', 'Purpose', 'Payment method', 'Status'];
    const rows = visible.map((item) => [
      new Date(item.createdAt).toISOString(), item.txRef, item.anonymous ? 'Anonymous' : item.name,
      item.email, item.phone, String(item.donorAmount ?? item.amount), item.donorCurrency ?? item.currency, String(item.amount), item.currency, String(item.exchangeRate ?? ''), item.supportType, item.paymentMethod, item.status,
    ]);
    const csv = [columns, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'npc-rwanda-donations.csv'; anchor.click(); URL.revokeObjectURL(url);
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Breadcrumb & Actions Bar */}
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
                Donation Payments & Financial Tracking
              </h1>
              <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
                Real-time tracking of contributions verified via Flutterwave integration
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Link 
              href="/dashboard/community" 
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-2 fw-semibold"
              style={{ borderRadius: '8px', padding: '7px 14px' }}
            >
              <i className="fas fa-people-group text-primary" /> Community Desk
            </Link>
            <button 
              className="btn btn-sm btn-light border d-inline-flex align-items-center gap-2 fw-semibold text-secondary"
              onClick={() => void load()} 
              disabled={loading}
              style={{ borderRadius: '8px', padding: '7px 14px' }}
            >
              <i className={`fas fa-rotate ${loading ? 'fa-spin' : ''}`} /> Refresh
            </button>
            <button 
              className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2 fw-semibold"
              onClick={exportCsv} 
              disabled={!visible.length}
              style={{ borderRadius: '8px', padding: '7px 16px', background: '#0b63b6', border: 'none' }}
            >
              <i className="fas fa-file-csv" /> Export CSV ({visible.length})
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

        {/* Financial KPI Cards */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-xl-3">
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Verified Donations</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-check-circle" style={{ color: '#16A34A', fontSize: '1rem' }} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{summary.successfulCount}</div>
              <div style={{ fontSize: '0.76rem', color: '#16A34A', marginTop: '6px', fontWeight: 600 }}>
                <i className="fas fa-shield-halved me-1" /> Provider confirmed transactions
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Received (RWF)</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-coins" style={{ color: '#0284C7', fontSize: '1rem' }} />
                </div>
              </div>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                RWF {money(summary.successfulRwfAmount)}
              </div>
              <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '6px' }}>
                USD equivalent: <strong>${money(summary.successfulUsdAmount)}</strong>
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Settlements</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-clock" style={{ color: '#D97706', fontSize: '1rem' }} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{summary.pendingCount}</div>
              <div style={{ fontSize: '0.76rem', color: '#D97706', marginTop: '6px', fontWeight: 600 }}>
                <i className="fas fa-hourglass-half me-1" /> Awaiting provider webhook
              </div>
            </div>
          </div>

          <div className="col-12 col-sm-6 col-xl-3">
            <div style={{ background: '#FFFFFF', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Failed / Cancelled</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fas fa-circle-xmark" style={{ color: '#DC2626', fontSize: '1rem' }} />
                </div>
              </div>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{summary.failedCount}</div>
              <div style={{ fontSize: '0.76rem', color: '#DC2626', marginTop: '6px', fontWeight: 600 }}>
                <i className="fas fa-triangle-exclamation me-1" /> Incomplete checkout attempts
              </div>
            </div>
          </div>
        </div>

        {/* Payments Table Card */}
        <section style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)' }}>
          {/* Filter & Search Header */}
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', background: '#FFFFFF' }} className="d-flex flex-wrap justify-content-between align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A' }}>Transaction Logs</span>
              <span className="badge rounded-pill bg-light text-secondary border px-2 py-1" style={{ fontSize: '0.75rem' }}>
                {visible.length} records
              </span>
            </div>

            <div className="d-flex align-items-center gap-3 flex-wrap">
              {/* Search bar */}
              <div className="input-group input-group-sm" style={{ width: '260px' }}>
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="fas fa-search" style={{ fontSize: '0.75rem' }} />
                </span>
                <input 
                  type="text" 
                  className="form-control bg-light border-start-0" 
                  placeholder="Search donor, email, ref..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ fontSize: '0.82rem' }}
                />
                {searchTerm && (
                  <button className="btn btn-outline-secondary border-start-0" onClick={() => setSearchTerm('')}>
                    <i className="fas fa-times" />
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="btn-group btn-group-sm" role="group">
                {['ALL', 'SUCCESSFUL', 'PENDING', 'FAILED'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`btn fw-semibold ${filter === st ? 'btn-primary' : 'btn-light text-secondary border'}`}
                    onClick={() => setFilter(st)}
                    style={{ fontSize: '0.78rem', textTransform: 'capitalize' }}
                  >
                    {st === 'ALL' ? 'All' : st.toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Content */}
          {loading ? (
            <div className="text-center py-5 text-muted" role="status">
              <i className="fas fa-circle-notch fa-spin fa-2x mb-3 text-primary d-block" />
              <span className="small fw-semibold">Loading payment transactions...</span>
            </div>
          ) : visible.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="fas fa-receipt fa-3x mb-3 text-muted-subtle d-block" style={{ color: '#CBD5E1' }} />
              <p className="fw-semibold mb-1" style={{ color: '#475569' }}>No payment records found</p>
              <p className="small mb-0 text-muted">Try adjusting your status filter or search keyword.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.86rem' }}>
                <thead style={{ background: '#F8FAFC', color: '#475569', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <tr>
                    <th style={{ padding: '14px 24px' }}>Date & Reference</th>
                    <th>Donor Details</th>
                    <th>Donation / Charged</th>
                    <th>Purpose / Program</th>
                    <th>Method</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((item) => {
                    const isSuccess = item.status === 'SUCCESSFUL';
                    const isPending = item.status === 'PENDING';
                    return (
                      <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '16px 24px' }}>
                          <span className="d-block fw-semibold text-dark" style={{ fontSize: '0.84rem' }}>
                            {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <span className="badge bg-light text-muted border font-monospace mt-1" style={{ fontSize: '0.68rem', fontWeight: 500 }}>
                            {item.txRef}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontWeight: 700, color: '#475569', fontSize: '0.78rem' }}>
                              {(item.anonymous ? 'A' : (item.name ? item.name.charAt(0).toUpperCase() : 'D'))}
                            </div>
                            <div>
                              <span className="fw-bold text-dark d-block" style={{ fontSize: '0.86rem' }}>
                                {item.anonymous ? 'Anonymous Contributor' : item.name}
                              </span>
                              <span className="text-muted small d-block" style={{ fontSize: '0.75rem' }}>{item.email}</span>
                              {item.phone && <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>{item.phone}</span>}
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="fw-bold text-dark" style={{ fontSize: '0.92rem' }}>
                            {item.donorCurrency || item.currency} {money(item.donorAmount ?? item.amount)}
                          </div>
                          {(item.donorCurrency || item.currency) !== item.currency && (
                            <div className="text-muted mt-1" style={{ fontSize: '0.72rem' }}>
                              <span>Settled: {item.currency} {money(item.amount)}</span>
                              {item.exchangeRate && <span className="d-block text-secondary">1 USD = {item.exchangeRate.toLocaleString()} RWF</span>}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge rounded-pill bg-light text-dark border px-3 py-1" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            {item.supportType || 'General Para-Sport'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <i className={item.paymentMethod === 'card' ? 'fas fa-credit-card text-primary' : 'fas fa-mobile-screen-button text-success'} />
                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>
                              {item.paymentMethod === 'card' ? 'Credit / Debit Card' : 'Mobile Money (MoMo)'}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span 
                            className="badge px-3 py-2 rounded-pill"
                            style={{
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              background: isSuccess ? '#DCFCE7' : isPending ? '#FEF3C7' : '#FEE2E2',
                              color: isSuccess ? '#16A34A' : isPending ? '#B45309' : '#DC2626',
                              letterSpacing: '0.3px',
                            }}
                          >
                            <i className={`fas ${isSuccess ? 'fa-circle-check' : isPending ? 'fa-clock' : 'fa-circle-xmark'} me-1`} />
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer */}
          <div style={{ padding: '14px 24px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }} className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <span className="small text-muted" style={{ fontSize: '0.76rem' }}>
              <i className="fas fa-lock me-1 text-secondary" /> Only provider-verified successful contributions are credited into the received revenue total. Showing up to latest 250 records.
            </span>
            <span className="small text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
              NPC Rwanda Financial Gateway
            </span>
          </div>
        </section>
      </main>
    </div>
  );
}
