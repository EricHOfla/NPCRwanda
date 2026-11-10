'use client';

import AccessRestricted from '@/components/shared/AccessRestricted';
import { hasPermission } from '@/lib/rbac';
import { useDebounce } from '@/hooks/useDebounce';
import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

type Payment = {
  id: string;
  txRef: string;
  name: string;
  email: string;
  phone: string;
  amount: number;
  currency: string;
  donorAmount?: number | null;
  donorCurrency?: string | null;
  exchangeRate?: number | null;
  exchangeRateDate?: string | null;
  supportType: string;
  frequency?: string;
  paymentMethod: string;
  status: string;
  anonymous: boolean;
  createdAt: string;
  provider?: string;
  providerId?: string | null;
  providerRef?: string | null;
  checkoutUrl?: string | null;
};

type Summary = {
  successfulRwfAmount: number;
  successfulUsdAmount: number;
  successfulCount: number;
  pendingCount: number;
  failedCount: number;
};

const money = (value: number) => new Intl.NumberFormat('en-RW').format(value);

function DonationManagementContent() {
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; role: string }>({
    name: 'Admin',
    email: '',
    role: 'ADMIN',
  });

  // Payments State
  const [payments, setPayments] = useState<Payment[]>([]);
  const [summary, setSummary] = useState<Summary>({
    successfulRwfAmount: 0,
    successfulUsdAmount: 0,
    successfulCount: 0,
    pendingCount: 0,
    failedCount: 0,
  });
  const [paymentFilter, setPaymentFilter] = useState('ALL');
  const [currencyFilter, setCurrencyFilter] = useState('ALL');
  const [paymentSearch, setPaymentSearch] = useState('');
  const debouncedPaymentSearch = useDebounce(paymentSearch, 300);
  const [paymentPage, setPaymentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [activeTab, setActiveTab] = useState<'payments' | 'logs'>('payments');
  const [paymentLogs, setPaymentLogs] = useState<Array<{ id: string; txRef: string; event: string; status: string; source: string; message: string; createdAt: string }>>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState('');

  // Common UI State
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedRef, setCopiedRef] = useState('');

  const pageSize = 10;

  // Track whether we've already kicked off the initial data load
  const dataFetchedRef = useRef(false);

  // Fetch payment records
  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/donations/payments', { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || 'Unable to load donation payments.');
      setPayments(payload.payments || []);
      setSummary(
        payload.summary || {
          successfulRwfAmount: 0,
          successfulUsdAmount: 0,
          successfulCount: 0,
          pendingCount: 0,
          failedCount: 0,
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load donation payments.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Single mount effect: fetch profile and data in parallel — no waterfall
  useEffect(() => {
    const init = async () => {
      const profileRes = await fetch('/api/auth/profile')
        .then(r => (r.ok ? r.json() : null))
        .catch(() => null);

      const realRole = profileRes?.role || 'ADMIN';
      if (profileRes) {
        setUserProfile({
          name: profileRes.name || 'Admin',
          email: profileRes.email || '',
          role: realRole,
        });
      }

      if (hasPermission(realRole, 'donations.view') && !dataFetchedRef.current) {
        dataFetchedRef.current = true;
        await loadPayments();
      } else if (!hasPermission(realRole, 'donations.view')) {
        setLoading(false);
      }
    };
    void init();
  }, []); // run once on mount

  const isAuthorized = hasPermission(userProfile.role, 'donations.view');

  useEffect(() => {
    if (activeTab !== 'logs' || !isAuthorized) return;
    let cancelled = false;
    const loadLogs = async () => {
      setLogsLoading(true);
      setLogsError('');
      try {
        const response = await fetch('/api/donations/logs?page=1&pageSize=50', { cache: 'no-store' });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Unable to load payment logs.');
        if (!cancelled) setPaymentLogs(payload.logs || []);
      } catch (err) {
        if (!cancelled) setLogsError(err instanceof Error ? err.message : 'Unable to load payment logs.');
      } finally {
        if (!cancelled) setLogsLoading(false);
      }
    };
    void loadLogs();
    return () => { cancelled = true; };
  }, [activeTab, isAuthorized]);

  // Reset payment pagination when filters change.
  useEffect(() => {
    setPaymentPage(1);
  }, [paymentFilter, currencyFilter, debouncedPaymentSearch]);


  // Copy reference to clipboard
  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedRef(text);
    setTimeout(() => setCopiedRef(''), 2000);
  };

  // Verify pending payment status
  const verifyPayment = async (item: Payment) => {
    setBusyAction(`verify-${item.id}`);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/donations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tx_ref: item.txRef,
          transaction_id: item.providerId || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.status === 'SUCCESSFUL') {
        setSuccess(`Payment verified successfully! Status is now SUCCESSFUL.`);
        await loadPayments();
      } else if (data.status === 'FAILED') {
        setError(`Payment verification concluded: FAILED.`);
        await loadPayments();
      } else {
        setSuccess(`Payment is still pending with the provider.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification error');
    } finally {
      setBusyAction('');
    }
  };

  // Filtered Payments
  const visiblePayments = useMemo(() => {
    return payments.filter((item) => {
      const matchesStatus = paymentFilter === 'ALL' || item.status === paymentFilter;
      const matchesCurrency =
        currencyFilter === 'ALL' ||
        (item.donorCurrency || item.currency) === currencyFilter;
      const term = debouncedPaymentSearch.toLowerCase().trim();
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.txRef.toLowerCase().includes(term) ||
        item.phone.toLowerCase().includes(term) ||
        (item.supportType && item.supportType.toLowerCase().includes(term));
      return matchesStatus && matchesCurrency && matchesSearch;
    });
  }, [payments, paymentFilter, currencyFilter, debouncedPaymentSearch]);

  const totalPaymentPages = Math.max(1, Math.ceil(visiblePayments.length / pageSize));
  const paginatedPayments = useMemo(() => {
    return visiblePayments.slice((paymentPage - 1) * pageSize, paymentPage * pageSize);
  }, [visiblePayments, paymentPage, pageSize]);

  // Export CSV Handler
  function exportCsv() {
    const columns = [
        'Date',
        'Reference',
        'Donor',
        'Email',
        'Phone',
        'Donation Amount',
        'Donation Currency',
        'Settled Amount',
        'Settled Currency',
        'Exchange Rate',
        'Purpose',
        'Payment Method',
        'Status',
      ];
      const rows = visiblePayments.map((item) => [
        new Date(item.createdAt).toISOString(),
        item.txRef,
        item.anonymous ? 'Anonymous' : item.name,
        item.email,
        item.phone,
        String(item.donorAmount ?? item.amount),
        item.donorCurrency ?? item.currency,
        String(item.amount),
        item.currency,
        String(item.exchangeRate ?? ''),
        item.supportType,
        item.paymentMethod,
        item.status,
      ]);
      const csv = [columns, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `npc-rwanda-payments-${new Date().toISOString().split('T')[0]}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
  }

  return (
    <>
      <main className="dashboard-main-content donations-admin-shell" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        <style>{`
          .donations-admin-shell { --npc-navy: #0F172A; --npc-gold: #FFA000; --npc-border: #E2E8F0; }
          .donations-admin-shell .btn-primary, .donations-admin-shell .page-item.active .page-link { background-color: var(--npc-navy) !important; border-color: var(--npc-navy) !important; color: #fff !important; }
          .donations-admin-shell .btn-primary:hover, .donations-admin-shell .page-item.active .page-link:hover { background-color: #1E293B !important; border-color: #1E293B !important; }
          .donations-admin-shell .btn-outline-primary { color: var(--npc-navy) !important; border-color: var(--npc-navy) !important; }
          .donations-admin-shell .btn-outline-primary:hover { background: var(--npc-navy) !important; color: #fff !important; }
          .donations-admin-shell .text-primary { color: var(--npc-navy) !important; }
          .donations-admin-shell .bg-primary-subtle { background-color: #FFF7E6 !important; }
          .donations-admin-shell .border-primary-subtle { border-color: #FDE3A7 !important; }
          .donations-admin-shell .form-control:focus, .donations-admin-shell .form-select:focus { border-color: var(--npc-gold); box-shadow: 0 0 0 .2rem rgba(255,160,0,.16); }
          @media (max-width: 767.98px) { .donations-admin-shell { padding: 16px !important; } }
        `}</style>
          <div className="d-flex flex-wrap justify-content-end gap-2 mb-3">
            <button type="button" className="btn btn-sm btn-light border d-inline-flex align-items-center gap-2 fw-semibold text-secondary" onClick={() => { void loadPayments(); }} disabled={loading} style={{ borderRadius: '8px', padding: '6px 14px', fontSize: '0.82rem' }}>
              <i className={`fas fa-rotate ${loading ? 'fa-spin' : ''}`} /> Refresh
            </button>
            <button type="button" className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2 fw-semibold" onClick={exportCsv} style={{ borderRadius: '8px', padding: '6px 16px', background: '#0F172A', border: 'none', fontSize: '0.82rem' }}>
              <i className="fas fa-file-csv" /> Export Payments ({visiblePayments.length})
            </button>
          </div>
          <div style={{ maxWidth: 1600, width: '100%', margin: '0 auto' }}>
          {!isAuthorized ? (
            <AccessRestricted returnHref="/dashboard" returnLabel="Return to Dashboard" />
          ) : (
            <>
          {/* Notification Alerts */}
          {error && (
            <div className="alert alert-danger alert-dismissible border-0 shadow-sm d-flex align-items-center gap-2 mb-4" style={{ borderRadius: '10px' }}>
              <i className="fas fa-circle-exclamation text-danger" />
              <span className="small fw-semibold">{error}</span>
              <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close" />
            </div>
          )}
          {success && (
            <div className="alert alert-success alert-dismissible border-0 shadow-sm d-flex align-items-center gap-2 mb-4" style={{ borderRadius: '10px' }}>
              <i className="fas fa-circle-check text-success" />
              <span className="small fw-semibold">{success}</span>
              <button type="button" className="btn-close" onClick={() => setSuccess('')} aria-label="Close" />
            </div>
          )}

          {/* Hero Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
              borderRadius: '16px',
              padding: '24px 28px',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
              marginBottom: '24px',
            }}
          >
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <div className="d-inline-flex align-items-center gap-2 px-2 py-1 rounded-pill small mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.5px', background: '#F8FAFC', color: '#111827', fontWeight: 700 }}>
                  <i className="fas fa-hand-holding-heart text-warning" /> NPC RWANDA FINANCIAL & SUPPORT DESK
                </div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px', color: '#FFFFFF' }}>
                  Donations, Payments & Partnership Desk
                </h1>
                <p style={{ fontSize: '0.84rem', color: '#FFFFFF', margin: '4px 0 0 0', maxWidth: '720px', lineHeight: 1.6 }}>
                  Monitor verified online contributions processed via Flutterwave (MTN MoMo, Airtel Money, Visa/Mastercard).
                </p>
              </div>

              <div className="d-flex align-items-center gap-2 flex-wrap">
                <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 16px', backdropFilter: 'blur(4px)' }}>
                  <div style={{ fontSize: '0.7rem', color: '#93C5FD', fontWeight: 600, textTransform: 'uppercase' }}>Verified Total (RWF)</div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>RWF {money(summary.successfulRwfAmount)}</div>
                </div>
                {summary.successfulUsdAmount > 0 && (
                  <div style={{ background: 'rgba(255,255,255,0.12)', borderRadius: '12px', padding: '10px 16px', backdropFilter: 'blur(4px)' }}>
                    <div style={{ fontSize: '0.7rem', color: '#93C5FD', fontWeight: 600, textTransform: 'uppercase' }}>USD Direct</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF' }}>${money(summary.successfulUsdAmount)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '18px 22px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, border-color 0.15s',
                }}
                onClick={() => {
                  setPaymentFilter('SUCCESSFUL');
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Verified Payments
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-check-circle" style={{ color: '#16A34A', fontSize: '1rem' }} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {summary.successfulCount}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#16A34A', marginTop: '6px', fontWeight: 600 }}>
                  <i className="fas fa-shield-halved me-1" /> Confirmed by provider
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '18px 22px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Settled Amount (RWF)
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FFF7E6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-coins" style={{ color: '#0F172A', fontSize: '1rem' }} />
                  </div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  RWF {money(summary.successfulRwfAmount)}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B', marginTop: '6px' }}>
                  Total collected funds for programmes
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div
                style={{
                  background: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '18px 22px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setPaymentFilter('PENDING');
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Pending Settlements
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-clock" style={{ color: '#D97706', fontSize: '1rem' }} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {summary.pendingCount}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#D97706', marginTop: '6px', fontWeight: 600 }}>
                  <i className="fas fa-hourglass-half me-1" /> Awaiting provider webhook
                </div>
              </div>
            </div>
          </div>

          <div className="d-flex flex-wrap gap-2 mb-3" role="tablist" aria-label="Donation management sections">
            <button type="button" role="tab" aria-selected={activeTab === 'payments'} onClick={() => setActiveTab('payments')} className={`btn btn-sm ${activeTab === 'payments' ? 'btn-primary' : 'btn-outline-secondary'}`}>
              <i className="fas fa-money-bill-transfer me-2" /> Donation Payments
            </button>
            <button type="button" role="tab" aria-selected={activeTab === 'logs'} onClick={() => setActiveTab('logs')} className={`btn btn-sm ${activeTab === 'logs' ? 'btn-primary' : 'btn-outline-secondary'}`}>
              <i className="fas fa-clipboard-list me-2" /> Payment Logs
            </button>
          </div>

          {activeTab === 'payments' && (
          <>
          {/* Online Payment Transactions */}
          <section style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              {/* Header with Search and Filters */}
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }} className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', margin: 0 }}>
                    Online Payment Transactions
                  </h2>
                  <span className="badge rounded-pill bg-light text-secondary border px-2 py-1" style={{ fontSize: '0.74rem' }}>
                    {visiblePayments.length} of {payments.length}
                  </span>
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Search box */}
                  <div className="input-group input-group-sm" style={{ width: '240px' }}>
                    <span className="input-group-text bg-white border-end-0 text-muted">
                      <i className="fas fa-search" style={{ fontSize: '0.75rem' }} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search donor, email, ref..."
                      value={paymentSearch}
                      onChange={(e) => setPaymentSearch(e.target.value)}
                      style={{ fontSize: '0.82rem' }}
                    />
                    {paymentSearch && (
                      <button className="btn btn-outline-secondary border-start-0 bg-white" onClick={() => setPaymentSearch('')}>
                        <i className="fas fa-times" />
                      </button>
                    )}
                  </div>

                  {/* Currency Filter */}
                  <select
                    className="form-select form-select-sm"
                    value={currencyFilter}
                    onChange={(e) => setCurrencyFilter(e.target.value)}
                    style={{ width: '110px', fontSize: '0.78rem' }}
                  >
                    <option value="ALL">Currency: All</option>
                    <option value="RWF">RWF</option>
                    <option value="USD">USD</option>
                  </select>

                  {/* Status Filter Buttons */}
                  <div className="btn-group btn-group-sm" role="group">
                    {['ALL', 'SUCCESSFUL', 'PENDING', 'FAILED'].map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`btn fw-semibold ${paymentFilter === st ? 'btn-primary' : 'btn-light text-secondary border'}`}
                        onClick={() => setPaymentFilter(st)}
                        style={{ fontSize: '0.76rem', textTransform: 'capitalize' }}
                      >
                        {st === 'ALL' ? 'All' : st.toLowerCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Table Data */}
              {loading ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-circle-notch fa-spin fa-2x mb-3 text-primary d-block" />
                  <span className="small fw-semibold">Loading payment transactions...</span>
                </div>
              ) : visiblePayments.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-receipt fa-3x mb-3 text-secondary opacity-50 d-block" />
                  <p className="fw-semibold mb-1" style={{ color: '#475569' }}>No payment records found</p>
                  <p className="small mb-0 text-muted">Try adjusting your status filter or search keyword.</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.86rem' }}>
                      <thead style={{ background: '#F8FAFC', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <tr>
                          <th style={{ padding: '14px 22px' }}>Date & Reference</th>
                          <th>Donor Details</th>
                          <th>Donation / Charged</th>
                          <th>Purpose / Program</th>
                          <th>Method</th>
                          <th>Status</th>
                          <th className="text-end" style={{ paddingRight: '22px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedPayments.map((item) => {
                          const isSuccess = item.status === 'SUCCESSFUL';
                          const isPending = item.status === 'PENDING';
                          const isFailed = item.status === 'FAILED';
                          return (
                            <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '14px 22px' }}>
                                <span className="d-block fw-semibold text-dark" style={{ fontSize: '0.84rem' }}>
                                  {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </span>
                                <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                <div className="d-inline-flex align-items-center gap-1 mt-1">
                                  <span className="badge bg-light text-dark border font-monospace" style={{ fontSize: '0.68rem', fontWeight: 500 }}>
                                    {item.txRef}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(item.txRef)}
                                    className="btn btn-sm btn-link p-0 text-muted"
                                    title="Copy reference"
                                    style={{ fontSize: '0.7rem' }}
                                  >
                                    <i className={`fas ${copiedRef === item.txRef ? 'fa-check text-success' : 'fa-copy'}`} />
                                  </button>
                                </div>
                              </td>

                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '50%',
                                      background: item.anonymous ? '#E2E8F0' : '#FFF7E6',
                                      color: item.anonymous ? '#475569' : '#0F172A',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontWeight: 700,
                                      fontSize: '0.78rem',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {item.anonymous ? 'A' : (item.name ? item.name.charAt(0).toUpperCase() : 'D')}
                                  </div>
                                  <div>
                                    <span className="fw-bold text-dark d-block" style={{ fontSize: '0.86rem' }}>
                                      {item.anonymous ? (
                                        <span className="text-secondary fst-italic">Anonymous Contributor</span>
                                      ) : (
                                        item.name
                                      )}
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
                                    {item.exchangeRate && (
                                      <span className="d-block text-secondary">
                                        1 USD = {item.exchangeRate.toLocaleString()} RWF
                                      </span>
                                    )}
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
                                    {item.paymentMethod === 'card' ? 'Credit / Card' : 'Mobile Money'}
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

                              <td className="text-end" style={{ paddingRight: '22px' }}>
                                <div className="d-inline-flex align-items-center gap-1">
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-primary p-1 px-2"
                                    onClick={() => setSelectedPayment(item)}
                                    title="View receipt & details"
                                    style={{ fontSize: '0.78rem' }}
                                  >
                                    <i className="fas fa-eye me-1" /> View
                                  </button>
                                  {isPending && (
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-warning p-1 px-2"
                                      onClick={() => void verifyPayment(item)}
                                      disabled={busyAction === `verify-${item.id}`}
                                      title="Re-check status with payment gateway"
                                      style={{ fontSize: '0.78rem' }}
                                    >
                                      {busyAction === `verify-${item.id}` ? (
                                        <i className="fas fa-spinner fa-spin" />
                                      ) : (
                                        <><i className="fas fa-rotate me-1" /> Re-check</>
                                      )}
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalPaymentPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-4 py-3 border-top bg-white">
                      <span className="small text-muted" style={{ fontSize: '0.82rem' }}>
                        Showing <strong>{(paymentPage - 1) * pageSize + 1}</strong> to{' '}
                        <strong>{Math.min(paymentPage * pageSize, visiblePayments.length)}</strong> of{' '}
                        <strong>{visiblePayments.length}</strong> transactions
                      </span>
                      <nav>
                        <ul className="pagination pagination-sm mb-0 gap-1">
                          <li className={`page-item ${paymentPage <= 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setPaymentPage((prev) => Math.max(1, prev - 1))}
                              disabled={paymentPage <= 1}
                            >
                              <i className="fas fa-chevron-left" />
                            </button>
                          </li>
                          {Array.from({ length: totalPaymentPages }, (_, i) => i + 1).map((p) => (
                            <li key={p} className={`page-item ${p === paymentPage ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => setPaymentPage(p)}>
                                {p}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${paymentPage >= totalPaymentPages ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setPaymentPage((prev) => Math.min(totalPaymentPages, prev + 1))}
                              disabled={paymentPage >= totalPaymentPages}
                            >
                              <i className="fas fa-chevron-right" />
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                </>
              )}

              {/* Table Footer */}
              <div style={{ padding: '12px 24px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9' }} className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span className="small text-muted" style={{ fontSize: '0.74rem' }}>
                  <i className="fas fa-lock me-1 text-secondary" /> Only provider-verified successful contributions are credited into received revenue totals.
                </span>
                <span className="small text-muted font-monospace" style={{ fontSize: '0.74rem' }}>
                  Flutterwave v3 Integrated
                </span>
              </div>
          </section>
          </>
          )}

          {activeTab === 'logs' && (
            <section className="card border-0 shadow-sm" style={{ borderRadius: 14, overflow: 'hidden' }}>
              <div className="card-header bg-white d-flex flex-wrap justify-content-between align-items-center gap-2 py-3">
                <div><h2 className="h6 fw-bold mb-1">Donation Payment Logs</h2><p className="small text-muted mb-0">Checkout, verification, webhook and receipt activity.</p></div>
                <button type="button" className="btn btn-sm btn-outline-primary" onClick={async () => {
                  setLogsLoading(true); setLogsError('');
                  try { const response = await fetch('/api/donations/logs?page=1&pageSize=50', { cache: 'no-store' }); const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.error || 'Unable to load payment logs.'); setPaymentLogs(payload.logs || []); }
                  catch (err) { setLogsError(err instanceof Error ? err.message : 'Unable to load payment logs.'); }
                  finally { setLogsLoading(false); }
                }} disabled={logsLoading}><i className={`fas fa-rotate me-1 ${logsLoading ? 'fa-spin' : ''}`} /> Refresh Logs</button>
              </div>
              {logsError && <div className="alert alert-danger m-3 mb-0">{logsError}</div>}
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light"><tr><th>Date &amp; Time</th><th>Event</th><th>Reference</th><th>Status</th><th>Source</th><th>Details</th></tr></thead>
                  <tbody>
                    {logsLoading ? <tr><td colSpan={6} className="text-center py-5"><i className="fas fa-spinner fa-spin me-2" />Loading payment logs…</td></tr>
                    : paymentLogs.length ? paymentLogs.map((log) => <tr key={log.id}>
                      <td className="small text-nowrap">{new Date(log.createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td className="small fw-semibold">{log.event.replaceAll('_', ' ')}</td>
                      <td><code className="small">{log.txRef}</code></td>
                      <td><span className={`badge ${log.status === 'SUCCESSFUL' ? 'bg-success-subtle text-success' : log.status === 'FAILED' ? 'bg-danger-subtle text-danger' : log.status === 'PENDING' ? 'bg-warning-subtle text-warning-emphasis' : 'bg-secondary-subtle text-secondary'}`}>{log.status}</span></td>
                      <td className="small">{log.source}</td><td className="small" style={{ minWidth: 220, whiteSpace: 'normal' }}>{log.message}</td>
                    </tr>) : <tr><td colSpan={6} className="text-center text-muted py-5">No payment logs have been recorded yet.</td></tr>}
                  </tbody>
                </table>
              </div>
              <div className="card-footer bg-white small text-muted">Showing the latest {paymentLogs.length} events. Use Refresh Logs to fetch the latest activity.</div>
            </section>
          )}

            </>
          )}
          </div>
        </main>

      {/* ── Modal: Payment Receipt & Details ── */}
      {selectedPayment && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', zIndex: 1080 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px', overflow: 'hidden' }}>
              <div
                className="modal-header text-white"
                style={{
                  background: selectedPayment.status === 'SUCCESSFUL' ? 'linear-gradient(135deg, #16A34A, #15803D)' : selectedPayment.status === 'PENDING' ? 'linear-gradient(135deg, #D97706, #B45309)' : 'linear-gradient(135deg, #DC2626, #B91C1C)',
                }}
              >
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <i className={`fas ${selectedPayment.status === 'SUCCESSFUL' ? 'fa-check-circle' : selectedPayment.status === 'PENDING' ? 'fa-clock' : 'fa-circle-xmark'}`} />
                  Donation Receipt & Transaction Details
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedPayment(null)} aria-label="Close" />
              </div>

              <div className="modal-body p-4">
                {/* Financial Overview Strip */}
                <div className="p-3 rounded mb-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <span className="small text-muted text-uppercase fw-bold d-block" style={{ fontSize: '0.7rem' }}>Contributed Amount</span>
                      <span className="h4 fw-bold text-dark mb-0">
                        {selectedPayment.donorCurrency || selectedPayment.currency} {money(selectedPayment.donorAmount ?? selectedPayment.amount)}
                      </span>
                    </div>
                    <div className="col-sm-6">
                      <span className="small text-muted text-uppercase fw-bold d-block" style={{ fontSize: '0.7rem' }}>Settled in RWF</span>
                      <span className="h4 fw-bold text-success mb-0">
                        RWF {money(selectedPayment.amount)}
                      </span>
                    </div>
                  </div>
                  {selectedPayment.exchangeRate && (
                    <div className="small text-muted mt-2 pt-2 border-top" style={{ fontSize: '0.75rem' }}>
                      Exchange Rate applied: <strong>1 USD = {selectedPayment.exchangeRate.toLocaleString()} RWF</strong>
                      {selectedPayment.exchangeRateDate && ` · Dated ${selectedPayment.exchangeRateDate}`}
                    </div>
                  )}
                </div>

                <div className="row g-3">
                  <div className="col-sm-6">
                    <label className="small text-muted fw-bold d-block">Transaction Reference</label>
                    <div className="d-flex align-items-center gap-2">
                      <code className="bg-light px-2 py-1 rounded border text-dark font-monospace" style={{ fontSize: '0.8rem' }}>
                        {selectedPayment.txRef}
                      </code>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(selectedPayment.txRef)}
                        className="btn btn-sm btn-outline-secondary py-0 px-2"
                        title="Copy"
                      >
                        <i className={`fas ${copiedRef === selectedPayment.txRef ? 'fa-check text-success' : 'fa-copy'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="col-sm-6">
                    <label className="small text-muted fw-bold d-block">Status</label>
                    <span
                      className="badge px-3 py-1 rounded-pill"
                      style={{
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: selectedPayment.status === 'SUCCESSFUL' ? '#DCFCE7' : selectedPayment.status === 'PENDING' ? '#FEF3C7' : '#FEE2E2',
                        color: selectedPayment.status === 'SUCCESSFUL' ? '#16A34A' : selectedPayment.status === 'PENDING' ? '#B45309' : '#DC2626',
                      }}
                    >
                      {selectedPayment.status}
                    </span>
                  </div>

                  <div className="col-sm-6">
                    <label className="small text-muted fw-bold d-block">Donor Name</label>
                    <span className="fw-semibold text-dark">
                      {selectedPayment.anonymous ? `${selectedPayment.name} (Marked Anonymous)` : selectedPayment.name}
                    </span>
                  </div>

                  <div className="col-sm-6">
                    <label className="small text-muted fw-bold d-block">Donor Email</label>
                    <a href={`mailto:${selectedPayment.email}`} className="text-primary text-decoration-none fw-semibold">
                      {selectedPayment.email}
                    </a>
                  </div>

                  <div className="col-sm-6">
                    <label className="small text-muted fw-bold d-block">Donor Phone</label>
                    <span className="text-dark">{selectedPayment.phone || '—'}</span>
                  </div>

                  <div className="col-sm-6">
                    <label className="small text-muted fw-bold d-block">Payment Method</label>
                    <span className="text-dark fw-semibold">
                      {selectedPayment.paymentMethod === 'card' ? 'Credit / Debit Card' : 'Mobile Money (MTN / Airtel)'}
                    </span>
                  </div>

                  <div className="col-sm-6">
                    <label className="small text-muted fw-bold d-block">Purpose / Program</label>
                    <span className="badge bg-light text-dark border px-3 py-1">
                      {selectedPayment.supportType || 'General Para-Sport Support'}
                    </span>
                  </div>

                  <div className="col-sm-6">
                    <label className="small text-muted fw-bold d-block">Payment Date</label>
                    <span className="text-dark">
                      {new Date(selectedPayment.createdAt).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {selectedPayment.providerRef && (
                    <div className="col-sm-12">
                      <label className="small text-muted fw-bold d-block">Provider Reference ID</label>
                      <span className="text-muted font-monospace small">{selectedPayment.providerRef}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer bg-light d-flex justify-content-between align-items-center">
                <span className="small text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                  Gateway: {selectedPayment.provider || 'Flutterwave'}
                </span>
                <div className="d-flex gap-2">
                  <a
                    href={`mailto:${selectedPayment.email}?subject=NPC Rwanda Donation Receipt Confirmation - ${selectedPayment.txRef}`}
                    className="btn btn-sm btn-outline-primary fw-semibold"
                  >
                    <i className="fas fa-envelope me-1" /> Email Donor
                  </a>
                  <button type="button" className="btn btn-secondary btn-sm px-3" onClick={() => setSelectedPayment(null)}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



    </>
  );
}

export default function DonationPaymentsAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#F8FAFC' }}>
          <div className="text-center">
            <i className="fas fa-circle-notch fa-spin fa-2x text-primary mb-3" />
            <p className="small text-muted fw-semibold">Loading Donation Management...</p>
          </div>
        </div>
      }
    >
      <DonationManagementContent />
    </Suspense>
  );
}
