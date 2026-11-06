'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

type Analytics = {
  generatedAt: string;
  range: { days: number };
  members: { athletes: number; activeAthletes: number; partners: number };
  content: { publishedNews: number; draftNews: number; upcomingEvents: number; totalEvents: number };
  engagement: { unreadMessages: number; totalMessages: number; volunteers: number; pendingJobs: number; athleteEnquiries: number; eventRegistrations: number; sponsorInquiries: number; activeSubscribers: number; pendingWork: number };
  donations: { rangeRwf: number; rangeUsd: number; rangeCount: number; pendingPayments: number; failedPayments: number; lifetime: { RWF: number; USD: number; count: number }; daily: { date: string; rwf: number; usd: number; count: number }[] };
  sports: { sport: string; athletes: number }[];
};

const number = (value: number) => new Intl.NumberFormat('en-US').format(value || 0);
const money = (value: number, currency: string) => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value || 0);

function Panel({ title, icon, children, action }: { title: string; icon: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <section className="live-analytics-panel">
    <div className="live-analytics-panel-head"><h3><i className={`fas ${icon}`} />{title}</h3>{action}</div>
    {children}
  </section>;
}

export default function DashboardAnalytics({ onNavigate }: { onNavigate: (tab: string) => void }) {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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

  return <div className="live-analytics-wrap" id="organization-overview">
    <div style={{ margin: '0 0 14px' }}>
      <a href="#organization-overview" style={{ color: '#0F172A', fontSize: '1.15rem', fontWeight: 800, textDecoration: 'none' }} aria-label="Jump to Organization Overview">Organization Overview <i className="fas fa-link" style={{ fontSize: '0.75rem', marginLeft: 6, color: '#64748B' }} /></a>
      <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.84rem' }}>Operational figures for athletes, donations, active partners and requests needing attention.</p>
    </div>
    <div className="live-analytics-toolbar">
      <div><span className="live-analytics-live-dot" /> <strong>Live database analytics</strong><small>Auto-refreshes every 30 seconds</small></div>
      <div className="live-analytics-controls">
        <select aria-label="Analytics date range" value={days} onChange={(event) => setDays(Number(event.target.value))}>
          <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value={365}>Last 12 months</option>
        </select>
        <button type="button" onClick={() => refresh()} disabled={loading}><i className={`fas fa-rotate ${loading ? 'fa-spin' : ''}`} /> Refresh</button>
        <span className="live-analytics-updated">{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Waiting for data'}</span>
      </div>
    </div>

    {error && <div className="live-analytics-error" role="alert">{error} <button type="button" onClick={() => refresh()}>Try again</button></div>}
    {loading && !data ? <div className="live-analytics-loading"><i className="fas fa-spinner fa-spin" /> Loading real database analytics…</div> : data && <>
      <div className="live-analytics-kpis">
        <button type="button" onClick={() => onNavigate("athletes")} className="live-analytics-kpi blue" aria-label="Open athlete management" style={{ textAlign: "left", width: "100%", border: 0, cursor: "pointer" }}><span>Total Athletes</span><strong>{number(data.members.athletes)}</strong><small>{number(data.members.activeAthletes)} active</small><i className="fas fa-wheelchair" /></button>
        <button type="button" onClick={() => onNavigate("pages")} className="live-analytics-kpi green" aria-label="Open donation management" style={{ textAlign: "left", width: "100%", border: 0, cursor: "pointer" }}><span>Verified Donations</span><strong>{money(data.donations.lifetime.RWF, 'RWF')}</strong><small>{money(data.donations.lifetime.USD, 'USD')} · {number(data.donations.lifetime.count)} payments</small><i className="fas fa-hand-holding-heart" /></button>
        <button type="button" onClick={() => onNavigate("partners")} className="live-analytics-kpi amber" aria-label="Open partner management" style={{ textAlign: "left", width: "100%", border: 0, cursor: "pointer" }}><span>Active Partners</span><strong>{number(data.members.partners)}</strong><small>Currently active</small><i className="fas fa-handshake" /></button>
        <button type="button" onClick={() => onNavigate("contacts")} className="live-analytics-kpi violet" aria-label="Open pending requests" style={{ textAlign: "left", width: "100%", border: 0, cursor: "pointer" }}><span>Pending Work</span><strong>{number(data.engagement.pendingWork)}</strong><small>Requests needing attention</small><i className="fas fa-inbox" /></button>
      </div>

      <div className="live-analytics-grid">
        <Panel title={`Donation activity · ${days} days`} icon="fa-chart-column" action={<button type="button" className="btn btn-sm btn-link" onClick={() => onNavigate("pages")}>Open donations <i className="fas fa-arrow-right" /></button>}>
          <div className="live-analytics-donation-summary">
            <div><small>Successful in selected period</small><strong>{money(data.donations.rangeRwf, 'RWF')}</strong><span>{money(data.donations.rangeUsd, 'USD')} USD · {number(data.donations.rangeCount)} transactions</span></div>
            <div><small>Payment status</small><strong>{number(data.donations.pendingPayments)} pending</strong><span>{number(data.donations.failedPayments)} failed · excluded from totals</span></div>
          </div>
          <div className="live-analytics-bars" role="img" aria-label="Daily verified RWF donation totals">
            {data.donations.daily.filter((_, i) => days <= 30 || i % Math.ceil(days / 30) === 0).map((item) => <div className="live-analytics-bar-col" key={item.date} title={`${item.date}: ${money(item.rwf, 'RWF')}`}>
              <div className="live-analytics-bar-track"><span style={{ height: `${Math.max(item.rwf ? 3 : 0, item.rwf / maxDonation * 100)}%` }} /></div>
              <small>{new Date(item.date + 'T00:00:00').toLocaleDateString('en', { day: 'numeric', month: 'short' })}</small>
            </div>)}
          </div>
          <p className="live-analytics-note">Only payments marked SUCCESSFUL are included. RWF and USD are kept separate.</p>
        </Panel>

        <Panel title="Athletes by sport" icon="fa-medal" action={<button type="button" className="btn btn-sm btn-link" onClick={() => onNavigate("athletes")}>View athletes <i className="fas fa-arrow-right" /></button>}>
          {sportTotal ? <div className="live-analytics-sports">{data.sports.slice(0, 7).map((item) => <div key={item.sport}>
            <div><span>{item.sport}</span><strong>{number(item.athletes)}</strong></div>
            <div className="live-analytics-progress"><span style={{ width: `${Math.round(item.athletes / sportTotal * 100)}%` }} /></div>
          </div>)}</div> : <p className="live-analytics-empty">No athlete records have been added yet.</p>}
        </Panel>

        <Panel title="Website content" icon="fa-newspaper" action={<button type="button" className="btn btn-sm btn-link" onClick={() => onNavigate("news")}>Manage content <i className="fas fa-arrow-right" /></button>}>
          <div className="live-analytics-stat-list"><button type="button" onClick={() => onNavigate("news")}><span>Published news</span><strong>{number(data.content.publishedNews)}</strong></button><button type="button" onClick={() => onNavigate("news")}><span>Draft news</span><strong>{number(data.content.draftNews)}</strong></button><button type="button" onClick={() => onNavigate("events")}><span>Upcoming / ongoing events</span><strong>{number(data.content.upcomingEvents)}</strong></button><button type="button" onClick={() => onNavigate("events")}><span>All events</span><strong>{number(data.content.totalEvents)}</strong></button></div>
        </Panel>

        <Panel title="Community engagement" icon="fa-users" action={<button type="button" className="btn btn-sm btn-link" onClick={() => onNavigate("contacts")}>Open inbox <i className="fas fa-arrow-right" /></button>}>
          <div className="live-analytics-stat-list"><button type="button" onClick={() => onNavigate("contacts")}><span>Unread messages</span><strong>{number(data.engagement.unreadMessages)}</strong></button><button type="button" onClick={() => onNavigate("volunteers")}><span>Volunteer applications</span><strong>{number(data.engagement.volunteers)}</strong></button><button type="button" onClick={() => onNavigate("careers")}><span>Pending job applications</span><strong>{number(data.engagement.pendingJobs)}</strong></button><button type="button" onClick={() => onNavigate("athletes")}><span>Athlete enquiries</span><strong>{number(data.engagement.athleteEnquiries)}</strong></button><button type="button" onClick={() => onNavigate("events")}><span>Event registrations</span><strong>{number(data.engagement.eventRegistrations)}</strong></button><button type="button" onClick={() => onNavigate("partners")}><span>Sponsor enquiries</span><strong>{number(data.engagement.sponsorInquiries)}</strong></button><button type="button" onClick={() => onNavigate("subscribers")}><span>Active subscribers</span><strong>{number(data.engagement.activeSubscribers)}</strong></button></div>
        </Panel>
      </div>
      <div className="live-analytics-footnote"><i className="fas fa-circle-info" /> Website visitor/page-view analytics are not included yet because the current project has no verified traffic-tracking source connected. No visitor figures are estimated or fabricated.</div>
    </>}
  </div>;
}
