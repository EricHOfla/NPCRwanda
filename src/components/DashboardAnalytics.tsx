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
  members: { athletes: number; activeAthletes: number; partners: number; totalUsers: number | null };
  content: { totalAnnouncements: number; publishedNews: number; draftNews: number; upcomingEvents: number; totalEvents: number; trainingPrograms: number };
  engagement: { 
    unreadMessages: number; 
    totalMessages: number; 
    volunteers: number; 
    unreadVolunteers: number;
    pendingJobs: number; 
    eventRegistrations: number; 
    sponsorInquiries: number; 
    activeSubscribers: number; 
    pendingWork: number 
  };
  donations: { rangeRwf: number; rangeUsd: number; rangeCount: number; pendingPayments: number; failedPayments: number; lifetime: { RWF: number; USD: number; count: number }; daily: { date: string; rwf: number; usd: number; count: number }[] };
  sports: { sport: string; athletes: number }[];
  websiteTraffic: {
    available: boolean;
    pageViews: number;
    uniqueVisitors: number;
    returningVisitors: number;
    notFoundPages: number;
    downloads: number;
    hourly: { hour: string; views: number }[];
    devices: { name: string; visits: number }[];
    browsers: { name: string; visits: number }[];
    operatingSystems: { name: string; visits: number }[];
    sources: { name: string; visits: number }[];
    conversions: {
      contactMessages: number;
      volunteerApplications: number;
      jobApplications: number;
      eventRegistrations: number;
      sponsorInquiries: number;
      newsletterSubscriptions: number;
      successfulDonations: number;
    };
    daily: { date: string; views: number; visitors: number }[];
    topPages: { page: string; views: number }[];
    referrers: { source: string; visits: number }[];
    note: string;
  };
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

  // Load once on entry and when the selected date range changes.
  // There is deliberately no polling; subsequent updates are manual.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const maxDonation = useMemo(() => Math.max(1, ...(data?.donations.daily.map((d) => d.rwf) || [1])), [data]);
  const sportTotal = useMemo(() => data?.sports.reduce((sum, item) => sum + item.athletes, 0) || 0, [data]);
  const maxTrafficViews = useMemo(() => Math.max(1, ...(data?.websiteTraffic.daily.map((item) => item.views) || [1])), [data]);
  const maxTrafficHour = useMemo(() => Math.max(1, ...(data?.websiteTraffic.hourly.map((item) => item.views) || [1])), [data]);

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
                  data.engagement.unreadVolunteers > 0 ? `${data.engagement.unreadVolunteers} volunteers` : null,
                  data.engagement.eventRegistrations > 0 ? `${data.engagement.eventRegistrations} events` : null,
                  data.engagement.sponsorInquiries > 0 ? `${data.engagement.sponsorInquiries} sponsors` : null,
                ].filter(Boolean).join(' · ') || 'No pending items'}
              </div>

              <i className="fas fa-inbox" />
            </div>
          </div>

          <div className="live-analytics-kpis" style={{ marginTop: '12px' }}>
            <div
              className="live-analytics-kpi blue"
              role="button"
              tabIndex={0}
              onClick={() => handleNav({ tab: 'pages', page: 'news' })}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNav({ tab: 'pages', page: 'news' }); } }}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
              title="Open announcement management"
            >
              <span>Announcements</span>
              <strong>{number(data.content.totalAnnouncements)}</strong>
              <small>All announcement records</small>
              <i className="fas fa-bullhorn" />
            </div>
            {data.members.totalUsers !== null && (
              <div
                className="live-analytics-kpi violet"
                role="button"
                tabIndex={0}
                onClick={() => handleNav({ tab: 'users' })}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNav({ tab: 'users' }); } }}
                style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                title="Open user management"
              >
                <span>System Users</span>
                <strong>{number(data.members.totalUsers)}</strong>
                <small>Registered admin accounts</small>
                <i className="fas fa-user-shield" />
              </div>
            )}
            <div className="live-analytics-kpi blue" role="button" tabIndex={0}
              onClick={() => handleNav({ url: '/dashboard/community' })}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNav({ url: '/dashboard/community' }); } }}
              style={{ cursor: 'pointer', transition: 'all 0.2s ease' }} title="Open sports development management">
              <span>Training Programmes</span><strong>{number(data.content.trainingPrograms)}</strong>
              <small>All programme records</small><i className="fas fa-dumbbell" />
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

              {/* Pending request categories: messages, job applications, and volunteer applications */}
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

                {/* 3. Volunteer Applications -> Navigates to Volunteer Inbox */}
                <div className="col-sm-6 col-md-4 col-lg">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNav({ tab: 'contacts', subtab: 'volunteers' })}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNav({ tab: 'contacts', subtab: 'volunteers' }); } }}
                    style={{ background: '#FFFFFF', border: '1px solid #EDE9FE', borderRadius: '10px', padding: '12px 14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#059669'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#EDE9FE'; e.currentTarget.style.transform = 'none'; }}
                    title="Review Volunteer Applications"
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>Volunteer Applications</span>
                        <i className="fas fa-hand-holding-heart" style={{ color: '#059669', fontSize: '0.85rem' }} />
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                        {number(data.engagement.unreadVolunteers)}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#047857', marginTop: '6px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Review Volunteers</span>
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

          <section className="live-analytics-panel" style={{ marginTop: '18px' }}>
            <div className="live-analytics-panel-head">
              <h3><i className="fas fa-chart-line" />Website analytics</h3>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Public website · Last {days} days</span>
            </div>
            {!data.websiteTraffic.available ? (
              <p className="live-analytics-empty" role="status">{data.websiteTraffic.note}</p>
            ) : (
              <>
                <div className="live-analytics-kpis" style={{ marginBottom: '16px' }}>
                  {[
                    { label: 'Page views', value: data.websiteTraffic.pageViews, hint: 'Successful public page requests', icon: 'fa-eye', tone: 'blue' },
                    { label: 'Approx. unique visitors', value: data.websiteTraffic.uniqueVisitors, hint: 'Distinct hashed IPs in this period', icon: 'fa-users', tone: 'green' },
                    { label: 'Returning IPs', value: data.websiteTraffic.returningVisitors, hint: 'Seen on more than one day', icon: 'fa-repeat', tone: 'amber' },
                    { label: 'Document downloads', value: data.websiteTraffic.downloads, hint: 'PDF, Office and ZIP files', icon: 'fa-download', tone: 'blue' },
                    { label: 'Page not found', value: data.websiteTraffic.notFoundPages, hint: 'Public page requests returning 404', icon: 'fa-circle-exclamation', tone: 'amber' }
                  ].map((item) => (
                    <div className={'live-analytics-kpi ' + item.tone} key={item.label}>
                      <span>{item.label}</span>
                      <strong>{number(item.value)}</strong>
                      <small>{item.hint}</small>
                      <i className={'fas ' + item.icon} />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 12px', color: '#334155', fontSize: '0.85rem', fontWeight: 700 }}>Daily page views</h4>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '132px', padding: '8px 2px 0', borderBottom: '1px solid #E2E8F0' }}>
                      {data.websiteTraffic.daily.filter((_, index) => days <= 30 || index % Math.ceil(days / 30) === 0).map((item) => (
                        <div key={item.date} title={item.date + ': ' + number(item.views) + ' views · ' + number(item.visitors) + ' visitors'} style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                          <span style={{ display: 'block', width: '100%', height: (item.views ? Math.max(3, (item.views / maxTrafficViews) * 100) : 0) + '%', background: '#2563EB', borderRadius: '3px 3px 0 0', opacity: item.views ? 0.85 : 0.15 }} />
                        </div>
                      ))}
                    </div>
                    <p style={{ margin: '6px 0 0', color: '#94A3B8', fontSize: '0.68rem' }}>Daily totals for the selected period</p>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 12px', color: '#334155', fontSize: '0.85rem', fontWeight: 700 }}>Peak visiting hours</h4>
                    {data.websiteTraffic.hourly.slice().sort((a, b) => b.views - a.views).slice(0, 6).map((item) => (
                      <div key={item.hour} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 42px', alignItems: 'center', gap: '8px', marginBottom: '9px', fontSize: '0.75rem' }}>
                        <span style={{ color: '#64748B' }}>{item.hour}</span>
                        <span style={{ height: '8px', background: '#E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                          <span style={{ display: 'block', width: ((item.views / maxTrafficHour) * 100) + '%', height: '100%', background: '#2563EB', borderRadius: '8px' }} />
                        </span>
                        <strong style={{ textAlign: 'right', color: '#0F172A' }}>{number(item.views)}</strong>
                      </div>
                    ))}
                    {!data.websiteTraffic.hourly.length && <p className="live-analytics-empty">No hourly data recorded.</p>}
                    <p style={{ margin: '6px 0 0', color: '#94A3B8', fontSize: '0.68rem' }}>Based on server request timestamps</p>
                  </div>

                  {[
                    { title: 'Traffic sources', items: data.websiteTraffic.sources },
                    { title: 'Visitor devices', items: data.websiteTraffic.devices },
                    { title: 'Browsers', items: data.websiteTraffic.browsers },
                    { title: 'Operating systems', items: data.websiteTraffic.operatingSystems },
                    { title: 'External referrers', items: data.websiteTraffic.referrers.map((item) => ({ name: item.source, visits: item.visits })) }
                  ].map((group) => (
                    <div key={group.title}>
                      <h4 style={{ margin: '0 0 8px', color: '#334155', fontSize: '0.85rem', fontWeight: 700 }}>{group.title}</h4>
                      {group.items.length ? group.items.slice(0, 8).map((item) => (
                        <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '7px 0', borderBottom: '1px solid #F1F5F9', fontSize: '0.78rem' }}>
                          <span style={{ color: '#475569', overflowWrap: 'anywhere' }}>{item.name}</span>
                          <strong style={{ color: '#0F172A', whiteSpace: 'nowrap' }}>{number(item.visits)}</strong>
                        </div>
                      )) : <p className="live-analytics-empty">No data recorded.</p>}
                    </div>
                  ))}

                  <div>
                    <h4 style={{ margin: '0 0 8px', color: '#334155', fontSize: '0.85rem', fontWeight: 700 }}>Most visited pages</h4>
                    {data.websiteTraffic.topPages.length ? data.websiteTraffic.topPages.map((item) => (
                      <div key={item.page} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '7px 0', borderBottom: '1px solid #F1F5F9', fontSize: '0.78rem' }}>
                        <span style={{ color: '#475569', overflowWrap: 'anywhere' }}>{item.page}</span><strong>{number(item.views)}</strong>
                      </div>
                    )) : <p className="live-analytics-empty">No page data recorded.</p>}
                  </div>
                </div>

                <div style={{ marginTop: '18px' }}>
                  <h4 style={{ margin: '0 0 8px', color: '#334155', fontSize: '0.85rem', fontWeight: 700 }}>Engagement and conversions · Records created in this period</h4>
                  <div className="live-analytics-kpis">
                    {[
                      ['Contact messages', data.websiteTraffic.conversions.contactMessages],
                      ['Volunteer applications', data.websiteTraffic.conversions.volunteerApplications],
                      ['Job applications', data.websiteTraffic.conversions.jobApplications],
                      ['Event registrations', data.websiteTraffic.conversions.eventRegistrations],
                      ['Sponsor inquiries', data.websiteTraffic.conversions.sponsorInquiries],
                      ['Newsletter subscriptions', data.websiteTraffic.conversions.newsletterSubscriptions],
                      ['Successful donations', data.websiteTraffic.conversions.successfulDonations]
                    ].map(([label, value]) => (
                      <div className="live-analytics-kpi blue" key={String(label)}>
                        <span>{label}</span><strong>{number(Number(value))}</strong><small>Created in selected period</small>
                      </div>
                    ))}
                  </div>
                </div>

                <p style={{ margin: '14px 0 0', color: '#64748B', fontSize: '0.72rem', lineHeight: 1.5 }}>
                  <i className="fas fa-circle-info me-1" />{data.websiteTraffic.note} Returning visitors are repeat IP addresses observed on multiple days, not confirmed individual people. Device and browser details are inferred from user-agent strings. Country and reading-time reports require additional tracking or GeoIP setup.
                </p>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
