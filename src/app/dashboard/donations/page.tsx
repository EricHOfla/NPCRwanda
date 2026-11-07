'use client';

import AccessRestricted from '@/components/dashboard/AccessRestricted';
import { hasPermission } from '@/lib/rbac';
import { useDebounce } from '@/hooks/useDebounce';
import React, { FormEvent, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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

type Inquiry = {
  id: string;
  name: string;
  email: string;
  category: string;
  supportType: string;
  details: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
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
  const searchParams = useSearchParams();

  // Navigation & view states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string; role: string }>({
    name: 'Admin',
    email: '',
    role: 'ADMIN',
  });

  const urlTab = (searchParams.get('tab') as 'payments' | 'inquiries') || 'payments';
  const [activeTab, setActiveTab] = useState<'payments' | 'inquiries'>(urlTab);

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
  const [paymentPage, setPaymentPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  // Inquiries State
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [inquiryFilter, setInquiryFilter] = useState<'ALL' | 'UNREAD' | 'READ'>('ALL');
  const [inquirySearch, setInquirySearch] = useState('');
  const [inquiryPage, setInquiryPage] = useState(1);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  // Common UI State
  const [loading, setLoading] = useState(true);
  const [inquiryLoading, setInquiryLoading] = useState(false);
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

  // Fetch inquiries records
  const loadInquiries = useCallback(async () => {
    setInquiryLoading(true);
    try {
      const response = await fetch('/api/donations', { cache: 'no-store' });
      const payload = await response.json().catch(() => []);
      if (!response.ok) throw new Error(payload.error || 'Unable to load donation inquiries.');
      setInquiries(Array.isArray(payload) ? payload : []);
    } catch (err) {
      console.error('Failed to load inquiries:', err);
    } finally {
      setInquiryLoading(false);
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
        await Promise.all([loadPayments(), loadInquiries()]);
      } else if (!hasPermission(realRole, 'donations.view')) {
        setLoading(false);
      }
    };
    void init();
  }, []); // run once on mount

  const isAuthorized = hasPermission(userProfile.role, 'donations.view');

  // Debounced search terms — prevents expensive filter re-runs on every keystroke
  const debouncedPaymentSearch = useDebounce(paymentSearch, 300);
  const debouncedInquirySearch = useDebounce(inquirySearch, 300);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab') as 'payments' | 'inquiries';
    if (tab && ['payments', 'inquiries'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Reset pagination on tab/filter change
  useEffect(() => {
    setPaymentPage(1);
  }, [paymentFilter, currencyFilter, debouncedPaymentSearch]);

  useEffect(() => {
    setInquiryPage(1);
  }, [inquiryFilter, debouncedInquirySearch]);

  // Copy reference to clipboard
  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedRef(text);
    setTimeout(() => setCopiedRef(''), 2000);
  };

  // Mark inquiry read / unread
  const toggleInquiryRead = async (inquiry: Inquiry, newStatus?: boolean) => {
    const targetStatus = typeof newStatus === 'boolean' ? newStatus : !inquiry.read;
    setBusyAction(`inquiry-${inquiry.id}`);
    try {
      const res = await fetch(`/api/donations/${inquiry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: targetStatus }),
      });
      if (!res.ok) throw new Error('Failed to update inquiry status');
      setInquiries((prev) =>
        prev.map((item) => (item.id === inquiry.id ? { ...item, read: targetStatus } : item))
      );
      if (selectedInquiry?.id === inquiry.id) {
        setSelectedInquiry({ ...selectedInquiry, read: targetStatus });
      }
      setSuccess(`Inquiry marked as ${targetStatus ? 'read' : 'unread'}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusyAction('');
    }
  };

  // Delete inquiry
  const deleteInquiry = async (inquiry: Inquiry) => {
    if (!window.confirm(`Delete donation inquiry from ${inquiry.name}?`)) return;
    setBusyAction(`delete-${inquiry.id}`);
    try {
      const res = await fetch(`/api/donations/${inquiry.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete inquiry');
      setInquiries((prev) => prev.filter((item) => item.id !== inquiry.id));
      if (selectedInquiry?.id === inquiry.id) {
        setSelectedInquiry(null);
      }
      setSuccess('Inquiry deleted successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setBusyAction('');
    }
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

  // Filtered Inquiries
  const visibleInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      const matchesFilter =
        inquiryFilter === 'ALL' ||
        (inquiryFilter === 'UNREAD' && !item.read) ||
        (inquiryFilter === 'READ' && item.read);
      const term = debouncedInquirySearch.toLowerCase().trim();
      const matchesSearch =
        !term ||
        item.name.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.category.toLowerCase().includes(term) ||
        item.supportType.toLowerCase().includes(term) ||
        item.details.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [inquiries, inquiryFilter, debouncedInquirySearch]);

  const totalInquiryPages = Math.max(1, Math.ceil(visibleInquiries.length / pageSize));
  const paginatedInquiries = useMemo(() => {
    return visibleInquiries.slice((inquiryPage - 1) * pageSize, inquiryPage * pageSize);
  }, [visibleInquiries, inquiryPage, pageSize]);

  // Unread Inquiries Count
  const unreadInquiriesCount = useMemo(() => {
    return inquiries.filter((i) => !i.read).length;
  }, [inquiries]);

  // Export CSV Handler
  function exportCsv() {
    if (activeTab === 'payments') {
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
    } else {
      const columns = ['Date', 'Name', 'Email', 'Category', 'Support Type', 'Details', 'Read Status'];
      const rows = visibleInquiries.map((item) => [
        new Date(item.createdAt).toISOString(),
        item.name,
        item.email,
        item.category,
        item.supportType,
        item.details,
        item.read ? 'Read' : 'Unread',
      ]);
      const csv = [columns, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `npc-rwanda-donation-inquiries-${new Date().toISOString().split('T')[0]}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    }
  }

  return (
    <>
      <main className="dashboard-main-content" style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          <div className="d-flex flex-wrap justify-content-end gap-2 mb-3">
            <button type="button" className="btn btn-sm btn-light border d-inline-flex align-items-center gap-2 fw-semibold text-secondary" onClick={() => { void loadPayments(); void loadInquiries(); }} disabled={loading || inquiryLoading} style={{ borderRadius: '8px', padding: '6px 14px', fontSize: '0.82rem' }}>
              <i className={`fas fa-rotate ${loading || inquiryLoading ? 'fa-spin' : ''}`} /> Refresh
            </button>
            <button type="button" className="btn btn-sm btn-primary d-inline-flex align-items-center gap-2 fw-semibold" onClick={exportCsv} style={{ borderRadius: '8px', padding: '6px 16px', background: '#0284C7', border: 'none', fontSize: '0.82rem' }}>
              <i className="fas fa-file-csv" /> Export {activeTab === 'payments' ? `Payments (${visiblePayments.length})` : `Inquiries (${visibleInquiries.length})`}
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
              background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 60%, #0369A1 100%)',
              borderRadius: '16px',
              padding: '24px 28px',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.08)',
              marginBottom: '24px',
            }}
          >
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <div className="d-inline-flex align-items-center gap-2 px-2 py-1 rounded-pill bg-white bg-opacity-10 text-white small mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                  <i className="fas fa-hand-holding-heart text-warning" /> NPC RWANDA FINANCIAL & SUPPORT DESK
                </div>
                <h1 style={{ fontSize: '1.45rem', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                  Donations, Payments & Partnership Desk
                </h1>
                <p style={{ fontSize: '0.84rem', color: '#CBD5E1', margin: '4px 0 0 0', maxWidth: '720px' }}>
                  Monitor verified online contributions processed via Flutterwave (MTN MoMo, Airtel Money, Visa/Mastercard) and review incoming donor sponsorship & equipment pledges.
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
                  setActiveTab('payments');
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
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className="fas fa-coins" style={{ color: '#0284C7', fontSize: '1rem' }} />
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
                  setActiveTab('payments');
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
                  setActiveTab('inquiries');
                  setInquiryFilter('UNREAD');
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Support Inquiries
                  </span>
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: unreadInquiriesCount > 0 ? '#FEF2F2' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <i className={`fas ${unreadInquiriesCount > 0 ? 'fa-envelope-open-text text-danger' : 'fa-inbox text-secondary'}`} style={{ fontSize: '1rem' }} />
                  </div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                  {inquiries.length}
                </div>
                <div style={{ fontSize: '0.74rem', color: unreadInquiriesCount > 0 ? '#DC2626' : '#64748B', marginTop: '6px', fontWeight: 600 }}>
                  {unreadInquiriesCount > 0 ? (
                    <><i className="fas fa-circle-exclamation me-1" /> {unreadInquiriesCount} unread / awaiting follow-up</>
                  ) : (
                    <><i className="fas fa-check me-1 text-success" /> All inquiries addressed</>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Master Tabs Switcher */}
          <div className="d-flex align-items-center gap-2 mb-3 border-bottom pb-2">
            <button
              type="button"
              className={`btn btn-sm d-inline-flex align-items-center gap-2 fw-bold px-3 py-2 ${activeTab === 'payments' ? 'btn-primary' : 'btn-light border text-secondary'}`}
              onClick={() => setActiveTab('payments')}
              style={{ borderRadius: '10px', fontSize: '0.86rem' }}
            >
              <i className="fas fa-credit-card" /> Online Payments ({payments.length})
            </button>
            <button
              type="button"
              className={`btn btn-sm d-inline-flex align-items-center gap-2 fw-bold px-3 py-2 position-relative ${activeTab === 'inquiries' ? 'btn-primary' : 'btn-light border text-secondary'}`}
              onClick={() => setActiveTab('inquiries')}
              style={{ borderRadius: '10px', fontSize: '0.86rem' }}
            >
              <i className="fas fa-envelope" /> Support & Pledges ({inquiries.length})
              {unreadInquiriesCount > 0 && (
                <span className="badge rounded-pill bg-danger ms-1" style={{ fontSize: '0.68rem' }}>
                  {unreadInquiriesCount} new
                </span>
              )}
            </button>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              TAB 1: ONLINE PAYMENTS & GATEWAY TRANSACTIONS
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'payments' && (
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
                                      background: item.anonymous ? '#E2E8F0' : '#E0F2FE',
                                      color: item.anonymous ? '#475569' : '#0284C7',
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
          )}

          {/* ══════════════════════════════════════════════════════════════════
              TAB 2: DONATION INQUIRIES & PLEDGES
             ══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'inquiries' && (
            <section style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              {/* Header with Search and Filter */}
              <div style={{ padding: '18px 24px', borderBottom: '1px solid #F1F5F9', background: '#FAFAFA' }} className="d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#0F172A', margin: 0 }}>
                    Support Inquiries & Pledges
                  </h2>
                  <span className="badge rounded-pill bg-light text-secondary border px-2 py-1" style={{ fontSize: '0.74rem' }}>
                    {visibleInquiries.length} records
                  </span>
                  {unreadInquiriesCount > 0 && (
                    <span className="badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle px-2 py-1" style={{ fontSize: '0.74rem' }}>
                      {unreadInquiriesCount} unread
                    </span>
                  )}
                </div>

                <div className="d-flex align-items-center gap-2 flex-wrap">
                  {/* Search box */}
                  <div className="input-group input-group-sm" style={{ width: '250px' }}>
                    <span className="input-group-text bg-white border-end-0 text-muted">
                      <i className="fas fa-search" style={{ fontSize: '0.75rem' }} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-start-0"
                      placeholder="Search donor, category, details..."
                      value={inquirySearch}
                      onChange={(e) => setInquirySearch(e.target.value)}
                      style={{ fontSize: '0.82rem' }}
                    />
                    {inquirySearch && (
                      <button className="btn btn-outline-secondary border-start-0 bg-white" onClick={() => setInquirySearch('')}>
                        <i className="fas fa-times" />
                      </button>
                    )}
                  </div>

                  {/* Filter Tabs */}
                  <div className="btn-group btn-group-sm" role="group">
                    {(['ALL', 'UNREAD', 'READ'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        className={`btn fw-semibold ${inquiryFilter === filter ? 'btn-primary' : 'btn-light text-secondary border'}`}
                        onClick={() => setInquiryFilter(filter)}
                        style={{ fontSize: '0.76rem' }}
                      >
                        {filter === 'ALL' ? 'All' : filter === 'UNREAD' ? 'Unread' : 'Read'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Inquiries Content */}
              {inquiryLoading ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-circle-notch fa-spin fa-2x mb-3 text-primary d-block" />
                  <span className="small fw-semibold">Loading donation inquiries...</span>
                </div>
              ) : visibleInquiries.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-envelope-open fa-3x mb-3 text-secondary opacity-50 d-block" />
                  <p className="fw-semibold mb-1" style={{ color: '#475569' }}>No support inquiries found</p>
                  <p className="small mb-0 text-muted">
                    {inquiries.length === 0 ? 'No partnership or donation inquiries have been received yet.' : 'Try adjusting your search criteria.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ fontSize: '0.86rem' }}>
                      <thead style={{ background: '#F8FAFC', color: '#475569', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <tr>
                          <th style={{ padding: '14px 22px' }}>Date</th>
                          <th>Contributor</th>
                          <th>Category</th>
                          <th>Support Type</th>
                          <th style={{ minWidth: '220px' }}>Inquiry Details</th>
                          <th>Status</th>
                          <th className="text-end" style={{ paddingRight: '22px' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedInquiries.map((item) => (
                          <tr
                            key={item.id}
                            style={{
                              borderBottom: '1px solid #F1F5F9',
                              background: !item.read ? 'rgba(254, 243, 199, 0.25)' : 'transparent',
                            }}
                          >
                            <td style={{ padding: '14px 22px' }}>
                              <span className="d-block fw-semibold text-dark" style={{ fontSize: '0.82rem' }}>
                                {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                              <span className="text-muted d-block" style={{ fontSize: '0.72rem' }}>
                                {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </td>

                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <div
                                  style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: '#FEF3C7',
                                    color: '#B45309',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: '0.78rem',
                                    flexShrink: 0,
                                  }}
                                >
                                  {item.name ? item.name.charAt(0).toUpperCase() : 'C'}
                                </div>
                                <div>
                                  <span className="fw-bold text-dark d-block" style={{ fontSize: '0.86rem' }}>
                                    {item.name}
                                  </span>
                                  <a
                                    href={`mailto:${item.email}`}
                                    className="text-decoration-none text-muted small d-block"
                                    style={{ fontSize: '0.75rem' }}
                                  >
                                    <i className="fas fa-envelope me-1 text-primary opacity-75" />
                                    {item.email}
                                  </a>
                                </div>
                              </div>
                            </td>

                            <td>
                              <span className="badge bg-light text-dark border px-2 py-1" style={{ fontSize: '0.72rem' }}>
                                {item.category}
                              </span>
                            </td>

                            <td>
                              <span className="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-3 py-1" style={{ fontSize: '0.74rem', fontWeight: 600 }}>
                                {item.supportType}
                              </span>
                            </td>

                            <td>
                              <p
                                className="mb-0 text-muted"
                                style={{
                                  fontSize: '0.8rem',
                                  maxWidth: '340px',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                }}
                                title={item.details}
                              >
                                {item.details}
                              </p>
                            </td>

                            <td>
                              <span
                                className={`badge px-2 py-1 rounded-pill ${item.read ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning-emphasis'}`}
                                style={{ fontSize: '0.72rem', fontWeight: 600 }}
                              >
                                <i className={`fas ${item.read ? 'fa-check' : 'fa-bell'} me-1`} />
                                {item.read ? 'Read' : 'New Inquiry'}
                              </span>
                            </td>

                            <td className="text-end" style={{ paddingRight: '22px' }}>
                              <div className="d-inline-flex align-items-center gap-1">
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-primary p-1 px-2"
                                  onClick={() => setSelectedInquiry(item)}
                                  title="View message & reply"
                                  style={{ fontSize: '0.78rem' }}
                                >
                                  <i className="fas fa-eye me-1" /> View
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-light border p-1 px-2 text-secondary"
                                  onClick={() => void toggleInquiryRead(item)}
                                  disabled={busyAction === `inquiry-${item.id}`}
                                  title={item.read ? 'Mark as Unread' : 'Mark as Read'}
                                  style={{ fontSize: '0.78rem' }}
                                >
                                  <i className={`fas ${item.read ? 'fa-envelope' : 'fa-envelope-open'}`} />
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger p-1 px-2"
                                  onClick={() => void deleteInquiry(item)}
                                  disabled={busyAction === `delete-${item.id}`}
                                  title="Delete inquiry"
                                  style={{ fontSize: '0.78rem' }}
                                >
                                  <i className="fas fa-trash" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Controls */}
                  {totalInquiryPages > 1 && (
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 px-4 py-3 border-top bg-white">
                      <span className="small text-muted" style={{ fontSize: '0.82rem' }}>
                        Showing <strong>{(inquiryPage - 1) * pageSize + 1}</strong> to{' '}
                        <strong>{Math.min(inquiryPage * pageSize, visibleInquiries.length)}</strong> of{' '}
                        <strong>{visibleInquiries.length}</strong> inquiries
                      </span>
                      <nav>
                        <ul className="pagination pagination-sm mb-0 gap-1">
                          <li className={`page-item ${inquiryPage <= 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setInquiryPage((prev) => Math.max(1, prev - 1))}
                              disabled={inquiryPage <= 1}
                            >
                              <i className="fas fa-chevron-left" />
                            </button>
                          </li>
                          {Array.from({ length: totalInquiryPages }, (_, i) => i + 1).map((p) => (
                            <li key={p} className={`page-item ${p === inquiryPage ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => setInquiryPage(p)}>
                                {p}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${inquiryPage >= totalInquiryPages ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => setInquiryPage((prev) => Math.min(totalInquiryPages, prev + 1))}
                              disabled={inquiryPage >= totalInquiryPages}
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
                  <i className="fas fa-info-circle me-1 text-secondary" /> Contributor inquiries submitted via the public donation inquiry form.
                </span>
                <span className="small text-muted font-monospace" style={{ fontSize: '0.74rem' }}>
                  NPC Rwanda Partner Network
                </span>
              </div>
            </section>
          )}
            </>
          )}
          </div>
        </main>
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
