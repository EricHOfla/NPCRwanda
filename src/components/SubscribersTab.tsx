'use client';

import { useState, useEffect, useCallback } from 'react';

interface Subscriber {
  id: string;
  email: string;
  active: boolean;
  categories: string[];
  createdAt: string;
}

export default function SubscribersTab() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchSubscribers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/subscribers');
      if (!res.ok) throw new Error('Failed to load subscribers');
      const data = await res.json();
      setSubscribers(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error loading subscribers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubscribers(); }, [fetchSubscribers]);

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Remove subscriber "${email}"?`)) return;
    const res = await fetch(`/api/subscribers/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setActionMsg(`Removed ${email}`);
      setSubscribers(prev => prev.filter(s => s.id !== id));
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    const res = await fetch(`/api/subscribers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !currentActive }),
    });
    if (res.ok) {
      const updated = await res.json();
      setSubscribers(prev => prev.map(s => s.id === id ? { ...s, active: updated.active } : s));
      setActionMsg(`Subscriber ${updated.active ? 'activated' : 'deactivated'}`);
      setTimeout(() => setActionMsg(''), 3000);
    }
  };

  const filtered = subscribers.filter(s => {
    const matchSearch = s.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || (filterStatus === 'active' ? s.active : !s.active);
    return matchSearch && matchStatus;
  });

  const activeCount = subscribers.filter(s => s.active).length;
  const inactiveCount = subscribers.length - activeCount;

  const CATEGORY_LABELS: Record<string, string> = {
    news: 'News',
    events: 'Events',
    careers: 'Careers',
    announcements: 'Announcements',
  };

  return (
    <div style={{ maxWidth: '960px' }}>
      {/* Header card */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px 32px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className="fas fa-bell" style={{ fontSize: '1.3rem', color: '#2E7D32' }} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>Newsletter Subscribers</h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: '#64748B' }}>Manage email subscribers and notification categories.</p>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Subscribers', value: subscribers.length, color: '#0072C6', bg: '#E3F2FD', icon: 'fa-users' },
            { label: 'Active', value: activeCount, color: '#2E7D32', bg: '#E8F5E9', icon: 'fa-circle-check' },
            { label: 'Inactive / Unsubscribed', value: inactiveCount, color: '#C62828', bg: '#FFEBEE', icon: 'fa-circle-xmark' },
          ].map(stat => (
            <div key={stat.label} style={{ flex: '1 1 160px', background: stat.bg, borderRadius: '12px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <i className={`fas ${stat.icon}`} style={{ color: stat.color, fontSize: '1.4rem' }} />
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: stat.color, fontWeight: 600 }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters & Table */}
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '28px 32px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        {actionMsg && (
          <div style={{ padding: '10px 16px', background: '#E8F5E9', border: '1px solid #C8E6C9', borderRadius: '8px', color: '#2E7D32', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 500 }}>
            <i className="fas fa-circle-check me-2" />{actionMsg}
          </div>
        )}
        {error && (
          <div style={{ padding: '10px 16px', background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '8px', color: '#C62828', fontSize: '0.85rem', marginBottom: '16px' }}>
            <i className="fas fa-triangle-exclamation me-2" />{error}
          </div>
        )}

        {/* Search & Filter row */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '1 1 220px', position: 'relative' }}>
            <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', fontSize: '0.85rem' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: '36px', fontSize: '0.85rem' }}
            />
          </div>
          <select
            className="form-control"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            style={{ flex: '0 0 160px', fontSize: '0.85rem' }}
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
          <button
            onClick={fetchSubscribers}
            style={{ background: '#F1F5F9', border: 'none', borderRadius: '8px', padding: '8px 16px', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}
          >
            <i className="fas fa-rotate-right me-1" />Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
            <i className="fas fa-spinner fa-spin fa-2x mb-3" /><br />Loading subscribers…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
            <i className="fas fa-bell-slash fa-2x mb-3" style={{ display: 'block', marginBottom: '8px' }} />
            {subscribers.length === 0 ? 'No subscribers yet.' : 'No results match your filters.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                  {['Email', 'Status', 'Categories', 'Joined', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub, idx) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #F8FAFC', background: idx % 2 === 0 ? '#fff' : '#FAFAFA' }}>
                    <td style={{ padding: '12px 12px', color: '#1E293B', fontWeight: 500 }}>
                      <i className="fas fa-envelope me-2" style={{ color: '#0072C6', fontSize: '0.8rem' }} />{sub.email}
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '4px',
                        padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                        background: sub.active ? '#E8F5E9' : '#FFEBEE',
                        color: sub.active ? '#2E7D32' : '#C62828'
                      }}>
                        <i className={`fas ${sub.active ? 'fa-circle-check' : 'fa-circle-xmark'}`} style={{ fontSize: '0.7rem' }} />
                        {sub.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {sub.categories.map(cat => (
                          <span key={cat} style={{ padding: '2px 8px', borderRadius: '12px', background: '#E3F2FD', color: '#0072C6', fontSize: '0.72rem', fontWeight: 600 }}>
                            {CATEGORY_LABELS[cat] || cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '12px 12px', color: '#64748B', whiteSpace: 'nowrap' }}>
                      {new Date(sub.createdAt).toLocaleDateString('en-RW', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleToggle(sub.id, sub.active)}
                          title={sub.active ? 'Deactivate' : 'Activate'}
                          style={{ background: sub.active ? '#FFF3E0' : '#E8F5E9', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', color: sub.active ? '#E65100' : '#2E7D32', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          <i className={`fas ${sub.active ? 'fa-ban' : 'fa-check'} me-1`} />
                          {sub.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id, sub.email)}
                          title="Remove subscriber"
                          style={{ background: '#FFEBEE', border: 'none', borderRadius: '6px', padding: '5px 10px', cursor: 'pointer', color: '#C62828', fontSize: '0.8rem', fontWeight: 600 }}
                        >
                          <i className="fas fa-trash-can me-1" />Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p style={{ textAlign: 'right', fontSize: '0.78rem', color: '#94A3B8', marginTop: '12px' }}>
              Showing {filtered.length} of {subscribers.length} subscribers
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
