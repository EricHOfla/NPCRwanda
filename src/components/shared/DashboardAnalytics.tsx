'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

export type AnalyticsNavigateAction = {
  tab?: string;
  page?: string;
  subtab?: string;
  url?: string;
};

interface DashboardAnalyticsProps {
  onNavigate?: (action: AnalyticsNavigateAction) => void;
}

type Analytics = {
  generatedAt: string;
  range: { days: number };
  members: { athletes: number; activeAthletes: number; partners: number };
  content: { publishedNews: number; draftNews: number; upcomingEvents: number; totalEvents: number };
  engagement: { 
    unreadMessages: number; 
    totalMessages: number; 
    volunteers: number; 
    pendingJobs: number; 
    eventRegistrations: number; 
    sponsorInquiries: number; 
    activeSubscribers: number; 
    pendingWork: number 
  };
  donations: { rangeRwf: number; rangeUsd: number; rangeCount: number; pendingPayments: number; failedPayments: number; lifetime: { RWF: number; USD: number; count: number }; daily: { date: string; rwf: number; usd: number; count: number }[] };
  sports: { sport: string; athletes: number }[];
};

const number = (value: number) => new Intl.NumberFormat('en-US').format(value || 0);
const money = (value: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value || 0);

function Panel({ title, icon, children, action }: { title: string; icon: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="live-analytics-panel">
      <div className="live-analytics-panel-head">
        <h3><i className={`fas ${icon}`} />{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function DashboardAnalytics({ onNavigate }: DashboardAnalyticsProps) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showPendingBreakdown, setShowPendingBreakdown] = useState(true);

  const handleNav = (action: AnalyticsNavigateAction) => {
    if (onNavigate) {
      onNavigate(action);
    } else if (action.url) {
      window.location.href = action.url;
    } else {
      const params = new URLSearchParams();
      if (action.tab) params.set('tab', action.tab);
      if (action.page) params.set('page', action.page);
      if (action.subtab) params.set('subtab', action.subtab);
      window.location.href = `/dashboard?${params.toString()}`;
    }
  };

  const refresh = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch(`/api/dashboard/analytics?days=${days}`, { cache: 'no-store', credentials: 'same-origin' });
      if (!response.ok) throw new Error(response.status === 401 ? 'Your session has expired. Please sign in again.' : 'Analytics could not be loaded.');
      const payload = await response.json();
      setData(payload);
      setError('');
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analytics could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  // Load analytics on entry and when the selected date range changes.
  // Further updates are user-triggered through the Refresh button.

  const maxDonation = useMemo(() => Math.max(1, ...(data?.donations.daily.map((d) => d.rwf) || [1])), [data]);
  const sportTotal = useMemo(() => data?.sports.reduce((sum, item) => sum + item.athletes, 0) || 0, [data]);

  return (
    <div className="live-analytics-wrap">
      <div style={{ margin: '0 0 14px' }}>
        <h2 style={{ margin: 0, color: '#0F172A', fontSize: '1.15rem', fontWeight: 800 }}>Organization Overview</h2>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.84rem' }}>
          Operational figures for athletes, donations, active partners, and requests needing attention. Select any card or row to navigate to its management page.
        </p>
      </div>

      <div className="live-analytics-toolbar">
        <div>
          <span className="live-analytics-live-dot" /> <strong>Database analytics</strong>
          <small>Updates when you refresh</small>
        </div>
        <div className="live-analytics-controls">
          <select aria-label="Analytics date range" value={days} onChange={(event) => setDays(Number(event.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last 12 months</option>
          </select>
          <button type="button" onClick={() => refresh()} disabled={loading}>
            <i className={`fas fa-rotate ${loading ? 'fa-spin' : ''}`} /> Refresh
          </button>
          <span className="live-analytics-updated">
            {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Waiting for data'}
          </span>
        </div>
      </div>

      {error && (
        <div className="live-analytics-error" role="alert">
          {error} <button type="button" onClick={() => refresh()}>Try again</button>
        </div>
      )}

      {loading && !data ? (
        <div className="live-analytics-loading">
          <i className="fas fa-spinner fa-spin" /> Loading real database analytics…
        </div>
      ) : data && (
        <>
          {/* Top 4 Key Performance Indicators (all clickable to respective pages) */}
          <div className="live-analytics-kpis">
            {/* 1. Total Athletes -> Navigates to Athletes Page */}
            <div 
              className="live-analytics-kpi blue"
              role="button"
              tabIndex={0}
              onClick={() => handleNav({ tab: 'pages', page: 'athletes' })}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNav({ tab: 'pages', page: 'athletes' }); } }}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              title="Open Athletes Directory"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Total Athletes</span>
                <span style={{ fontSize: '0.65rem', color: '#2563EB', fontWeight: 700 }}>Manage →</span>
              </div>
              <strong>{number(data.members.athletes)}</strong>
              <small>{number(data.members.activeAthletes)} active</small>
              <i className="fas fa-wheelchair" />
            </div>

            {/* 2. Verified Donations -> Navigates to Donations Inbox */}
            <div 
              className="live-analytics-kpi green"
              role="button"
              tabIndex={0}
              onClick={() => handleNav({ tab: 'contacts', subtab: 'donations' })}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNav({ tab: 'contacts', subtab: 'donations' }); } }}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              title="Open Verified Donations Inbox"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Verified Donations</span>
                <span style={{ fontSize: '0.65rem', color: '#059669', fontWeight: 700 }}>View Records →</span>
              </div>
              <strong>{money(data.donations.lifetime.RWF, 'RWF')}</strong>
              <small>{money(data.donations.lifetime.USD, 'USD')} · {number(data.donations.lifetime.count)} payments</small>
              <i className="fas fa-hand-holding-heart" />
            </div>

            {/* 3. Active Partners -> Navigates to Partners Editor */}
            <div 
              className="live-analytics-kpi amber"
              role="button"
              tabIndex={0}
              onClick={() => handleNav({ tab: 'pages', page: 'partners' })}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNav({ tab: 'pages', page: 'partners' }); } }}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              title="Open Partners & Sponsors Management"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Active Partners</span>
                <span style={{ fontSize: '0.65rem', color: '#D97706', fontWeight: 700 }}>Manage →</span>
              </div>
              <strong>{number(data.members.partners)}</strong>
              <small>Currently active</small>
              <i className="fas fa-handshake" />
            </div>

            {/* 4. Pending Work -> Toggles breakdown and highlights requests */}
            <div 
              className="live-analytics-kpi violet"
              role="button"
              tabIndex={0}
              onClick={() => setShowPendingBreakdown(!showPendingBreakdown)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setShowPendingBreakdown(!showPendingBreakdown); } }}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderColor: showPendingBreakdown ? '#7C3AED' : '#E2E8F0' }}
              title="Click to toggle detailed pending work specification"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Pending Work</span>
                <span 
                  className="badge" 
                  style={{ 
                    background: showPendingBreakdown ? '#7C3AED' : '#EDE9FE', 
                    color: showPendingBreakdown ? '#FFFFFF' : '#6D28D9', 
                    fontSize: '0.62rem', 
                    fontWeight: 700, 
                    borderRadius: '8px', 
                    padding: '2px 6px' 
                  }}
                >
                  {showPendingBreakdown ? 'Specified ▲' : 'Breakdown ▼'}
                </span>
              </div>
              <strong>{number(data.engagement.pendingWork)}</strong>
              <small style={{ color: '#7C3AED', fontWeight: 700 }}>
                Requests needing attention
              </small>
              
              {/* Quick specification preview line */}
              <div style={{ marginTop: '6px', fontSize: '0.68rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {[
                  data.engagement.unreadMessages > 0 ? `${data.engagement.unreadMessages} msg` : null,
                  data.engagement.pendingJobs > 0 ? `${data.engagement.pendingJobs} jobs` : null,
                  data.engagement.eventRegistrations > 0 ? `${data.engagement.eventRegistrations} events` : null,
                  data.engagement.sponsorInquiries > 0 ? `${data.engagement.sponsorInquiries} sponsors` : null,
                ].filter(Boolean).join(' · ') || 'No pending items'}
              </div>

              <i className="fas fa-inbox" />
            </div>
          </div>

          {/* Explicit Specification Panel for the 21 Pending Work Requests (each tile navigates directly) */}
          {showPendingBreakdown && (
            <div 
              style={{
                background: 'linear-gradient(135deg, #FAF5FF 0%, #FFFFFF 100%)',
                border: '1px solid #DDD6FE',
                borderRadius: '14px',
                padding: '16px 20px',
                marginBottom: '16px',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.06)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span 
                    style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '8px', 
                      background: '#7C3AED', 
                      color: '#FFFFFF', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '0.9rem',
                      boxShadow: '0 2px 6px rgba(124, 58, 237, 0.25)'
                    }}
                  >
                    <i className="fas fa-clipboard-check" />
                  </span>
                  <div>
                    <div className="d-flex align-items-center gap-2">
                      <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#4C1D95' }}>
                        Pending Work Specification
                      </h4>
                      <span className="badge" style={{ background: '#7C3AED', color: '#FFFFFF', fontSize: '0.72rem', borderRadius: '12px', padding: '3px 8px' }}>
                        {number(data.engagement.pendingWork)} Total Requests
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#6B21A8' }}>
                      Click any card below to navigate directly to its review queue
                    </p>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button 
                    type="button"
                    onClick={() => handleNav({ tab: 'contacts', subtab: 'messages' })}
                    className="btn btn-xs"
                    style={{ background: '#FFFFFF', border: '1px solid #DDD6FE', color: '#6D28D9', fontWeight: 600, borderRadius: '6px', fontSize: '0.72rem', padding: '5px 12px' }}
                  >
                    <i className="fas fa-inbox me-1" /> Open Messages & Jobs
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleNav({ url: '/dashboard/community' })}
                    className="btn btn-xs"
                    style={{ background: '#7C3AED', color: '#FFFFFF', fontWeight: 600, borderRadius: '6px', fontSize: '0.72rem', padding: '5px 12px' }}
                  >
                    <i className="fas fa-users-gear me-1" /> Community Enquiries
                  </button>
                </div>
              </div>

              {/* 5 Distinct Categories making up the Pending Work */}
              <div className="row g-2">
                {/* 1. Unread Messages -> Navigates to Messages Inbox */}
                <div className="col-sm-6 col-md-4 col-lg">
                  <div 
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNav({ tab: 'contacts', subtab: 'messages' })}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNav({ tab: 'contacts', subtab: 'messages' }); } }}
                    style={{ background: '#FFFFFF', border: '1px solid #EDE9FE', borderRadius: '10px', padding: '12px 14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#0369A1'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EDE9FE'; e.currentTarget.style.transform = 'none'; }}
                    title="Review Unread Contact Messages"
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase' }}>Contact Messages</span>
                        <i className="fas fa-envelope text-primary" style={{ fontSize: '0.85rem' }} />
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                        {number(data.engagement.unreadMessages)}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#0369A1', marginTop: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Review Messages</span>
                      <i className="fas fa-arrow-right" style={{ fontSize: '0.65rem' }} />
                    </div>
                  </div>
                </div>

                {/* 2. Job Candidates -> Navigates to Job Applications */}
                <div className="col-sm-6 col-md-4 col-lg">
                  <div 
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNav({ tab: 'contacts', subtab: 'applications' })}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNav({ tab: 'contacts', subtab: 'applications' }); } }}
                    style={{ background: '#FFFFFF', border: '1px solid #EDE9FE', borderRadius: '10px', padding: '12px 14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EDE9FE'; e.currentTarget.style.transform = 'none'; }}
                    title="Review Job Candidates"
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase' }}>Job Applications</span>
                        <i className="fas fa-briefcase" style={{ color: '#7C3AED', fontSize: '0.85rem' }} />
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                        {number(data.engagement.pendingJobs)}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#7C3AED', marginTop: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Review Candidates</span>
                      <i className="fas fa-arrow-right" style={{ fontSize: '0.65rem' }} />
                    </div>
                  </div>
                </div>


              </div>
            </div>
          )}

          {/* Analytics Details Grid with Links to All Pages */}
          <div className="live-analytics-grid">
            {/* Panel 1: Donation Activity */}
            <Panel 
              title={`Donation activity · ${days} days`} 
              icon="fa-chart-column"
              action={
                <button
                  type="button"
                  onClick={() => handleNav({ tab: 'contacts', subtab: 'donations' })}
                  className="btn btn-xs btn-outline-primary"
                  style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}
                >
                  Manage Donations <i className="fas fa-arrow-right ms-1" />
                </button>
              }
            >
              <div 
                className="live-analytics-donation-summary"
                role="button"
                tabIndex={0}
                onClick={() => handleNav({ tab: 'contacts', subtab: 'donations' })}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                title="Open Donation Management"
              >
                <div>
                  <small>Successful in selected period</small>
                  <strong>{money(data.donations.rangeRwf, 'RWF')}</strong>
                  <span>{money(data.donations.rangeUsd, 'USD')} USD · {number(data.donations.rangeCount)} transactions</span>
                </div>
                <div>
                  <small>Payment status</small>
                  <strong>{number(data.donations.pendingPayments)} pending</strong>
                  <span>{number(data.donations.failedPayments)} failed · excluded from totals</span>
                </div>
              </div>
              <div className="live-analytics-bars" role="img" aria-label="Daily verified RWF donation totals">
                {data.donations.daily.filter((_, i) => days <= 30 || i % Math.ceil(days / 30) === 0).map((item) => (
                  <div className="live-analytics-bar-col" key={item.date} title={`${item.date}: ${money(item.rwf, 'RWF')}`}>
                    <div className="live-analytics-bar-track">
                      <span style={{ height: `${Math.max(item.rwf ? 3 : 0, (item.rwf / maxDonation) * 100)}%` }} />
                    </div>
                    <small>{new Date(item.date + 'T00:00:00').toLocaleDateString('en', { day: 'numeric', month: 'short' })}</small>
                  </div>
                ))}
              </div>
              <p className="live-analytics-note">Only payments marked SUCCESSFUL are included. RWF and USD are kept separate.</p>
            </Panel>

            {/* Panel 2: Athletes by Sport */}
            <Panel 
              title="Athletes by sport" 
              icon="fa-medal"
              action={
                <button
                  type="button"
                  onClick={() => handleNav({ tab: 'pages', page: 'sports' })}
                  className="btn btn-xs btn-outline-primary"
                  style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}
                >
                  Manage Sports <i className="fas fa-arrow-right ms-1" />
                </button>
              }
            >
              {sportTotal ? (
                <div className="live-analytics-sports">
                  {data.sports.slice(0, 7).map((item) => (
                    <div 
                      key={item.sport}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleNav({ tab: 'pages', page: 'athletes' })}
                      style={{ cursor: 'pointer', padding: '4px 6px', borderRadius: '6px', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      title={`Filter ${item.sport} athletes in directory`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{item.sport}</span>
                        <strong style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          {number(item.athletes)}
                          <i className="fas fa-angle-right text-muted" style={{ fontSize: '0.7rem' }} />
                        </strong>
                      </div>
                      <div className="live-analytics-progress">
                        <span style={{ width: `${Math.round((item.athletes / sportTotal) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="live-analytics-empty">No athlete records have been added yet.</p>
              )}
            </Panel>

            {/* Panel 3: Website Content */}
            <Panel 
              title="Website content" 
              icon="fa-newspaper"
              action={
                <button
                  type="button"
                  onClick={() => handleNav({ tab: 'pages', page: 'news' })}
                  className="btn btn-xs btn-outline-primary"
                  style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}
                >
                  Manage Content <i className="fas fa-arrow-right ms-1" />
                </button>
              }
            >
              <div className="live-analytics-stat-list">
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNav({ tab: 'pages', page: 'news' })}
                  style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                  title="Open Published News Articles"
                >
                  <span><i className="fas fa-newspaper text-success me-2" />Published news</span>
                  <strong>{number(data.content.publishedNews)} <i className="fas fa-arrow-right text-muted ms-1" style={{ fontSize: '0.65rem' }} /></strong>
                </div>

                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNav({ tab: 'pages', page: 'news' })}
                  style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                  title="Open Draft Articles"
                >
                  <span><i className="fas fa-file-pen text-warning me-2" />Draft news</span>
                  <strong>{number(data.content.draftNews)} <i className="fas fa-arrow-right text-muted ms-1" style={{ fontSize: '0.65rem' }} /></strong>
                </div>

                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNav({ tab: 'pages', page: 'events' })}
                  style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                  title="Open Upcoming Events Calendar"
                >
                  <span><i className="fas fa-calendar-alt text-primary me-2" />Upcoming / ongoing events</span>
                  <strong>{number(data.content.upcomingEvents)} <i className="fas fa-arrow-right text-muted ms-1" style={{ fontSize: '0.65rem' }} /></strong>
                </div>

                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNav({ tab: 'pages', page: 'events' })}
                  style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                  title="Open All Events"
                >
                  <span><i className="fas fa-calendar-check text-secondary me-2" />All recorded events</span>
                  <strong>{number(data.content.totalEvents)} <i className="fas fa-arrow-right text-muted ms-1" style={{ fontSize: '0.65rem' }} /></strong>
                </div>
              </div>
            </Panel>

            {/* Panel 4: Community Engagement */}
            <Panel 
              title="Community engagement" 
              icon="fa-users"
              action={
                <button
                  type="button"
                  onClick={() => handleNav({ url: '/dashboard/community' })}
                  className="btn btn-xs btn-outline-primary"
                  style={{ fontSize: '0.72rem', fontWeight: 600, padding: '3px 8px', borderRadius: '6px' }}
                >
                  Community Center <i className="fas fa-arrow-right ms-1" />
                </button>
              }
            >
              <div className="live-analytics-stat-list">
                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNav({ tab: 'contacts', subtab: 'messages' })}
                  style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                  title="Open Unread Messages"
                >
                  <span><i className="fas fa-envelope text-primary me-2" />Unread messages</span>
                  <strong>{number(data.engagement.unreadMessages)} <i className="fas fa-arrow-right text-muted ms-1" style={{ fontSize: '0.65rem' }} /></strong>
                </div>

                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNav({ tab: 'contacts', subtab: 'volunteers' })}
                  style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                  title="Open Volunteer Applications"
                >
                  <span><i className="fas fa-hands-helping text-success me-2" />Volunteer applications</span>
                  <strong>{number(data.engagement.volunteers)} <i className="fas fa-arrow-right text-muted ms-1" style={{ fontSize: '0.65rem' }} /></strong>
                </div>

                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNav({ tab: 'contacts', subtab: 'applications' })}
                  style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                  title="Open Job Candidates"
                >
                  <span><i className="fas fa-briefcase text-purple me-2" style={{ color: '#7C3AED' }} />Pending job applications</span>
                  <strong>{number(data.engagement.pendingJobs)} <i className="fas fa-arrow-right text-muted ms-1" style={{ fontSize: '0.65rem' }} /></strong>
                </div>

                <div 
                  role="button"
                  tabIndex={0}
                  onClick={() => handleNav({ tab: 'subscribers' })}
                  style={{ cursor: 'pointer', transition: 'all 0.15s' }}
                  title="Open Newsletter Subscribers"
                >
                  <span><i className="fas fa-bell text-secondary me-2" />Active subscribers</span>
                  <strong>{number(data.engagement.activeSubscribers)} <i className="fas fa-arrow-right text-muted ms-1" style={{ fontSize: '0.65rem' }} /></strong>
                </div>
              </div>
            </Panel>
          </div>

          <div className="live-analytics-footnote">
            <i className="fas fa-circle-info" /> Website visitor/page-view analytics are not included yet because the current project has no verified traffic-tracking source connected. No visitor figures are estimated or fabricated.
          </div>
        </>
      )}
    </div>
  );
}
