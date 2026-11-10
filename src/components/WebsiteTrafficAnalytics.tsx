'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { Analytics } from './DashboardAnalytics';

export default function WebsiteTrafficAnalytics() {
  const [data, setData] = useState<Analytics | null>(null);
  const [days, setDays] = useState<7 | 30 | 90 | 365>(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/dashboard/analytics?days=${days}`, {
          cache: 'no-store',
          credentials: 'same-origin',
        });
        if (!response.ok) throw new Error(response.status === 401
          ? 'Your session has expired. Please sign in again.'
          : 'Website analytics could not be loaded.');
        const payload: Analytics = await response.json();
        if (active) {
          setData(payload);
          setError('');
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : 'Website analytics could not be loaded.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, [days]);

  const maxTrafficViews = useMemo(() => Math.max(1, ...(data?.websiteTraffic.daily.map((item) => item.views) || [1])), [data]);
  const maxTrafficHour = useMemo(() => Math.max(1, ...(data?.websiteTraffic.hourly.map((item) => item.views) || [1])), [data]);
  const number = (value: number) => new Intl.NumberFormat('en-US').format(value || 0);

  return (
    <div className="live-analytics-wrap" style={{ marginTop: '24px' }}>
      <div style={{ margin: '0 0 14px' }}>
        <h2 style={{ margin: 0, color: '#0F172A', fontSize: '1.15rem', fontWeight: 800 }}>Website Analytics</h2>
        <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: '0.84rem' }}>
          Public website traffic, visitor behaviour, popular pages, and engagement.
        </p>
      </div>
      {loading && !data ? (
        <div className="live-analytics-loading"><i className="fas fa-spinner fa-spin" /> Loading website analytics…</div>
      ) : error ? (
        <div className="live-analytics-error" role="alert">{error}</div>
      ) : data ? (
        <>
        <section className="live-analytics-panel" style={{ marginTop: '18px', opacity: loading ? 0.65 : 1, transition: 'opacity 0.2s' }}>
          <div className="live-analytics-panel-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
            <h3><i className="fas fa-chart-line" />Website analytics</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <label htmlFor="website-analytics-days" style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>Date range</label>
              <select
                id="website-analytics-days"
                value={days}
                onChange={(event) => setDays(Number(event.target.value) as 7 | 30 | 90 | 365)}
                aria-label="Website analytics date range"
                style={{ border: '1px solid #CBD5E1', borderRadius: '8px', padding: '7px 10px', background: '#fff', color: '#334155', fontSize: '0.78rem', fontWeight: 600 }}
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last 365 days</option>
              </select>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Public website</span>
            </div>
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
                  {data.websiteTraffic.daily.map((item) => (
                    <div key={item.date} title={item.date + ': ' + number(item.views) + ' views · ' + number(item.visitors) + ' visitors'} style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                      <span style={{ display: 'block', width: '100%', height: (item.views ? Math.max(3, (item.views / maxTrafficViews) * 100) : 0) + '%', background: '#2563EB', borderRadius: '3px 3px 0 0', opacity: item.views ? 0.85 : 0.15 }} />
                    </div>
                  ))}
                </div>
                <p style={{ margin: '6px 0 0', color: '#94A3B8', fontSize: '0.68rem' }}>Daily totals for the last {days} days</p>
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



              <p style={{ margin: '14px 0 0', color: '#64748B', fontSize: '0.72rem', lineHeight: 1.5 }}>
                <i className="fas fa-circle-info me-1" />{data.websiteTraffic.note} Returning visitors are repeat IP addresses observed on multiple days, not confirmed individual people. Device and browser details are inferred from user-agent strings. Country and reading-time reports require additional tracking or GeoIP setup.
              </p>
            </>
          )}
        </section>
        </>
      ) : null}
    </div>
  );
}
