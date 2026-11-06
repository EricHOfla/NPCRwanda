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

function Metric({ label, value, detail }: { label: string; value: number; detail?: string }) {
  return <div className="live-analytics-metric">
    <span>{label}</span><strong>{number(value)}</strong>{detail && <small>{detail}</small>}
  </div>;
}

export default function DashboardAnalytics() {
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

  return <div className="live-analytics-wrap">
    <div className="live-analytics-toolbar">
      <div><span className="live-analytics-live-dot" /> <strong>Overview analytics</strong><small>Database data · refreshes every 30 seconds</small></div>
      <div className="live-analytics-controls">
        <select aria-label="Analytics date range" value={days} onChange={(event) => setDays(Number(event.target.value))}>
          <option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option><option value={365}>Last 12 months</option>
        </select>
        <button type="button" onClick={() => refresh()} disabled={loading}><i className={`fas fa-rotate ${loading ? 'fa-spin' : ''}`} /> Refresh</button>
        <span className="live-analytics-updated">{lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Waiting for data'}</span>
      </div>
    </div>

    {error && <div className="live-analytics-error" role="alert">{error} <button type="button" onClick={() => refresh()}>Try again</button></div>}
    {loading && !data ? <div className="live-analytics-loading"><i className="fas fa-spinner fa-spin" /> Loading dashboard data…</div> : data && <>
      <section className="live-analytics-section">
        <div className="live-analytics-section-heading"><div><h3>Needs attention</h3><p>Open requests that still require an administrator response</p></div><strong className="live-analytics-total">{number(data.engagement.pendingWork)} open</strong></div>
        <div className="live-analytics-attention-grid">
          <Metric label="Unread contact messages" value={data.engagement.unreadMessages} detail={`of ${number(data.engagement.totalMessages)} total messages`} />
          <Metric label="Pending job applications" value={data.engagement.pendingJobs} />
          <Metric label="Athlete enquiries" value={data.engagement.athleteEnquiries} />
          <Metric label="Event registrations" value={data.engagement.eventRegistrations} />
          <Metric label="Sponsor enquiries" value={data.engagement.sponsorInquiries} />
        </div>
        <p className="live-analytics-note">The open total is the sum of these five categories. Volunteer applications are shown separately because the current data does not provide a verified pending-review status count.</p>
      </section>

      <section className="live-analytics-section">
        <div className="live-analytics-section-heading"><div><h3>Organization at a glance</h3><p>Current records and published website content</p></div></div>
        <div className="live-analytics-overview-grid">
          <Panel title="Athletes & partners" icon="fa-people-group">
            <div className="live-analytics-metric-grid">
              <Metric label="Total athletes" value={data.members.athletes} detail={`${number(data.members.activeAthletes)} active`} />
              <Metric label="Active partners" value={data.members.partners} />
            </div>
          </Panel>
          <Panel title="Website content" icon="fa-newspaper">
            <div className="live-analytics-metric-grid">
              <Metric label="Published news" value={data.content.publishedNews} />
              <Metric label="News drafts" value={data.content.draftNews} />
              <Metric label="Upcoming / ongoing events" value={data.content.upcomingEvents} />
              <Metric label="All events" value={data.content.totalEvents} />
            </div>
          </Panel>
          <Panel title="Community" icon="fa-users">
            <div className="live-analytics-metric-grid">
              <Metric label="Volunteer applications" value={data.engagement.volunteers} detail="All statuses" />
              <Metric label="Active subscribers" value={data.engagement.activeSubscribers} />
              <Metric label="All contact messages" value={data.engagement.totalMessages} />
            </div>
          </Panel>
        </div>
      </section>

      <section className="live-analytics-section">
        <div className="live-analytics-section-heading"><div><h3>Donations & payments</h3><p>Successful donations are separated by currency; pending and failed payments are not included in successful totals</p></div></div>
        <div className="live-analytics-overview-grid">
          <Panel title={`Successful donations · last ${days} days`} icon="fa-hand-holding-heart">
            <div className="live-analytics-metric-grid">
              <Metric label="RWF received" value={data.donations.rangeRwf} detail="Successful payments only" />
              <Metric label="USD received" value={data.donations.rangeUsd} detail="Successful payments only" />
              <Metric label="Successful transactions" value={data.donations.rangeCount} />
            </div>
            <div className="live-analytics-bars" role="img" aria-label="Daily successful RWF donation totals">
              {data.donations.daily.filter((_, i) => days <= 30 || i % Math.ceil(days / 30) === 0).map((item) => <div className="live-analytics-bar-col" key={item.date} title={`${item.date}: ${money(item.rwf, 'RWF')}`}>
                <div className="live-analytics-bar-track"><span style={{ height: `${Math.max(item.rwf ? 3 : 0, item.rwf / maxDonation * 100)}%` }} /></div>
                <small>{new Date(item.date + 'T00:00:00').toLocaleDateString('en', { day: 'numeric', month: 'short' })}</small>
              </div>)}
            </div>
            <p className="live-analytics-note">Chart shows RWF only. USD totals are displayed separately and are never converted or combined.</p>
          </Panel>
          <Panel title="Payment follow-up" icon="fa-receipt">
            <div className="live-analytics-metric-grid">
              <Metric label="Pending payments" value={data.donations.pendingPayments} />
              <Metric label="Failed payments" value={data.donations.failedPayments} />
              <Metric label="Lifetime successful RWF" value={data.donations.lifetime.RWF} />
              <Metric label="Lifetime successful USD" value={data.donations.lifetime.USD} />
              <Metric label="Lifetime successful transactions" value={data.donations.lifetime.count} />
            </div>
          </Panel>
        </div>
      </section>

      <section className="live-analytics-section">
        <div className="live-analytics-section-heading"><div><h3>Athletes by sport</h3><p>All sports represented in the athlete records</p></div></div>
        <Panel title="Athlete distribution" icon="fa-medal">
          {sportTotal ? <div className="live-analytics-sports">{data.sports.map((item) => <div key={item.sport}>
            <div><span>{item.sport}</span><strong>{number(item.athletes)}</strong></div>
            <div className="live-analytics-progress"><span style={{ width: `${Math.round(item.athletes / sportTotal * 100)}%` }} /></div>
          </div>)}</div> : <p className="live-analytics-empty">No athlete records have been added yet.</p>}
        </Panel>
      </section>

      <div className="live-analytics-footnote"><i className="fas fa-circle-info" /> Visitor and page-view analytics are not shown because no verified traffic-tracking source is connected. Figures above come from the application database.</div>
    </>}
  </div>;
}
