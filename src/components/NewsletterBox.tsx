'use client';

import React, { useState } from 'react';

interface NewsletterBoxProps {
  category?: 'news' | 'announcements' | 'events' | 'careers';
  title?: string;
  description?: string;
}

export default function NewsletterBox({
  category,
  title = 'Get Notified On New Updates',
  description = 'Subscribe to receive instant email notifications whenever we publish new official announcements, stories, events, and job openings.',
}: NewsletterBoxProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ text: string; success: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          categories: category ? [category] : ['news', 'announcements', 'events', 'careers'],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus({ text: data.message || 'Thank you for subscribing!', success: true });
        setEmail('');
      } else {
        setStatus({ text: data.error || 'Failed to subscribe.', success: false });
      }
    } catch {
      setStatus({ text: 'Error connecting to server. Please try again.', success: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm bg-primary text-white p-4 rounded-4 my-4" data-aos="fade-up">
      <div className="row align-items-center g-3">
        <div className="col-lg-7">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="bg-white bg-opacity-25 rounded-circle d-flex align-items-center justify-content-center text-white" 
              style={{ width: '48px', height: '48px', minWidth: '48px' }}
            >
              <i className="fas fa-bell fa-lg"></i>
            </div>
            <div>
              <h4 className="h5 fw-bold mb-1 text-white">{title}</h4>
              <p className="small text-white-50 mb-0">{description}</p>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <form onSubmit={handleSubmit} className="d-flex flex-column flex-sm-row gap-2">
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              style={{ borderRadius: '8px' }}
            />
            <button
              type="submit"
              className="btn btn-warning text-dark fw-bold px-4 text-nowrap"
              disabled={loading}
              style={{ borderRadius: '8px' }}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
              ) : (
                'Subscribe'
              )}
            </button>
          </form>
          {status && (
            <div className={`small mt-2 ${status.success ? 'text-warning fw-bold' : 'text-danger fw-bold'}`}>
              {status.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
