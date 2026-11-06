'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

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
    athleteEnquiries: number; 
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

export default function DashboardAnalytics() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [showPendingBreakdown, setShowPendingBreakdown] = useState(true);

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

  useEffect(() => {
    refresh();
    const timer = window.setInterval(() => refresh(true), 30000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  const maxDonation = useMemo(() => Math.max(1, ...(data?.donations.daily.map((d) => d.rwf) || [1])), [data]);
  const sportTotal = useMemo(() => data?.sports.reduce((sum, item) => sum + item.athletes, 0) || 0, [data]);

  return (
    <div className="live-analytics-wrap">
      <div style={{ margin: '0 0 14px' }}>
        <h2 style={{ margin: 0, color: '#0F172A', fontSize: '1.15rem', fontWeight: 800 }}>Organization Overview</h2>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.84rem' }}>
          Operational figures for athletes, donations, active partners, and live requests needing attention.
        </p>
      </div>

      <div className="live-analytics-toolbar">
        <div>
          <span className="live-analytics-live-dot" /> <strong>Live database analytics</strong>
          <small>Auto-refreshes every 30 seconds</small>
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
          {/* Top 4 Key Performance Indicators */}
          <div className="live-analytics-kpis">
            <div className="live-analytics-kpi blue">
              <span>Total Athletes</span>
              <strong>{number(data.members.athletes)}</strong>
              <small>{number(data.members.activeAthletes)} active</small>
              <i className="fas fa-wheelchair" />
            </div>

            <div className="live-analytics-kpi green">
              <span>Verified Donations</span>
              <strong>{money(data.donations.lifetime.RWF, 'RWF')}</strong>
              <small>{money(data.donations.lifetime.USD, 'USD')} · {number(data.donations.lifetime.count)} payments</small>
              <i className="fas fa-hand-holding-heart" />
            </div>

            <div className="live-analytics-kpi amber">
              <span>Active Partners</span>
              <strong>{number(data.members.partners)}</strong>
              <small>Currently active</small>
              <i className="fas fa-handshake" />
            </div>

            {/* Pending Work KPI with explicit breakdown trigger */}
            <div 
              className="live-analytics-kpi violet"
              style={{ cursor: 'pointer', transition: 'all 0.2s ease', borderColor: showPendingBreakdown ? '#7C3AED' : '#E2E8F0' }}
              onClick={() => setShowPendingBreakdown(!showPendingBreakdown)}
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
                  data.engagement.athleteEnquiries > 0 ? `${data.engagement.athleteEnquiries} athletes` : null,
                  data.engagement.eventRegistrations > 0 ? `${data.engagement.eventRegistrations} events` : null,
                  data.engagement.sponsorInquiries > 0 ? `${data.engagement.sponsorInquiries} sponsors` : null,
                ].filter(Boolean).join(' · ') || 'No pending items'}
              </div>

              <i className="fas fa-inbox" />
            </div>
          </div>

          {/* Explicit Specification Panel for the 21 Pending Work Requests */}
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
                      Exact category breakdown of public submissions awaiting administrative review, response, or follow-up
                    </p>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <a 
                    href="/dashboard#inbox" 
                    className="btn btn-xs"
                    style={{ background: '#FFFFFF', border: '1px solid #DDD6FE', color: '#6D28D9', fontWeight: 600, borderRadius: '6px', fontSize: '0.72rem', padding: '5px 12px', textDecoration: 'none' }}
                  >
                    <i className="fas fa-inbox me-1" /> Open Messages & Jobs
                  </a>
                  <a 
                    href="/dashboard/community" 
                    className="btn btn-xs"
                    style={{ background: '#7C3AED', color: '#FFFFFF', fontWeight: 600, borderRadius: '6px', fontSize: '0.72rem', padding: '5px 12px', textDecoration: 'none' }}
                  >
                    <i className="fas fa-users-gear me-1" /> Community Enquiries
                  </a>
                </div>
              </div>

              {/* 5 Distinct Categories making up the Pending Work */}
              <div className="row g-2">
                {/* 1. Unread Messages */}
                <div className="col-sm-6 col-md-4 col-lg">
                  <div style={{ background: '#FFFFFF', border: '1px solid #EDE9FE', borderRadius: '10px', padding: '12px 14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0369A1', textTransform: 'uppercase' }}>Contact Messages</span>
                        <i className="fas fa-envelope text-primary" style={{ fontSize: '0.85rem' }} />
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                        {number(data.engagement.unreadMessages)}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '6px' }}>
                      Unread contact inquiries
                    </div>
                  </div>
                </div>

                {/* 2. Job Candidates */}
                <div className="col-sm-6 col-md-4 col-lg">
                  <div style={{ background: '#FFFFFF', border: '1px solid #EDE9FE', borderRadius: '10px', padding: '12px 14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase' }}>Job Applications</span>
                        <i className="fas fa-briefcase" style={{ color: '#7C3AED', fontSize: '0.85rem' }} />
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                        {number(data.engagement.pendingJobs)}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '6px' }}>
                      Candidates awaiting review
                    </div>
                  </div>
                </div>

                {/* 3. Athlete Enquiries */}
                <div className="col-sm-6 col-md-4 col-lg">
                  <div style={{ background: '#FFFFFF', border: '1px solid #EDE9FE', borderRadius: '10px', padding: '12px 14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#0D9488', textTransform: 'uppercase' }}>Athlete Intake</span>
                        <i className="fas fa-person-running" style={{ color: '#0D9488', fontSize: '0.85rem' }} />
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                        {number(data.engagement.athleteEnquiries)}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '6px' }}>
                      Prospective athlete intake
                    </div>
                  </div>
                </div>

                {/* 4. Event Registrations */}
                <div className="col-sm-6 col-md-4 col-lg">
                  <div style={{ background: '#FFFFFF', border: '1px solid #EDE9FE', borderRadius: '10px', padding: '12px 14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#16A34A', textTransform: 'uppercase' }}>Event Signups</span>
                        <i className="fas fa-calendar-check text-success" style={{ fontSize: '0.85rem' }} />
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                        {number(data.engagement.eventRegistrations)}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '6px' }}>
                      Pending event registrations
                    </div>
                  </div>
                </div>

                {/* 5. Sponsor Enquiries */}
                <div className="col-sm-6 col-md-4 col-lg">
                  <div style={{ background: '#FFFFFF', border: '1px solid #EDE9FE', borderRadius: '10px', padding: '12px 14px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#D97706', textTransform: 'uppercase' }}>Sponsor Leads</span>
                        <i className="fas fa-handshake text-warning" style={{ fontSize: '0.85rem' }} />
                      </div>
                      <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>
                        {number(data.engagement.sponsorInquiries)}
                      </div>
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '6px' }}>
                      Partnership & sponsor leads
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analytics Details Grid */}
          <div className="live-analytics-grid">
            <Panel title={`Donation activity · ${days} days`} icon="fa-chart-column">
              <div className="live-analytics-donation-summary">
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

            <Panel title="Athletes by sport" icon="fa-medal">
              {sportTotal ? (
                <div className="live-analytics-sports">
                  {data.sports.slice(0, 7).map((item) => (
                    <div key={item.sport}>
                      <div>
                        <span>{item.sport}</span>
                        <strong>{number(item.athletes)}</strong>
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

            <Panel title="Website content" icon="fa-newspaper">
              <div className="live-analytics-stat-list">
                <div><span>Published news</span><strong>{number(data.content.publishedNews)}</strong></div>
                <div><span>Draft news</span><strong>{number(data.content.draftNews)}</strong></div>
                <div><span>Upcoming / ongoing events</span><strong>{number(data.content.upcomingEvents)}</strong></div>
                <div><span>All events</span><strong>{number(data.content.totalEvents)}</strong></div>
              </div>
            </Panel>

            <Panel title="Community engagement" icon="fa-users">
              <div className="live-analytics-stat-list">
                <div><span>Unread messages</span><strong>{number(data.engagement.unreadMessages)}</strong></div>
                <div><span>Volunteer applications</span><strong>{number(data.engagement.volunteers)}</strong></div>
                <div><span>Pending job applications</span><strong>{number(data.engagement.pendingJobs)}</strong></div>
                <div><span>Athlete enquiries</span><strong>{number(data.engagement.athleteEnquiries)}</strong></div>
                <div><span>Event registrations</span><strong>{number(data.engagement.eventRegistrations)}</strong></div>
                <div><span>Sponsor enquiries</span><strong>{number(data.engagement.sponsorInquiries)}</strong></div>
                <div><span>Active subscribers</span><strong>{number(data.engagement.activeSubscribers)}</strong></div>
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
