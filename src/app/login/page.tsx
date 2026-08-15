'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const contentType = response.headers.get('content-type');
      let data: any = {};

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        console.error('Server non-JSON response:', text);
        throw new Error('Server error: Received non-JSON response. Please verify server and database status.');
      }

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials or validation failed');
      }

      // Successful login, redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#e9f2fb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 6px 32px rgba(0,0,0,0.08)',
        padding: '40px 32px 32px 32px',
        fontFamily: 'var(--font-body, sans-serif)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/assets/img/logo.png" alt="NPC Rwanda Logo" style={{ height: '70px', marginBottom: '16px', objectFit: 'contain' }} />
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0033A0', margin: 0 }}>Login</h2>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#64748B' }}>NPC Rwanda Portal Login</p>
        </div>

        {error && (
          <div style={{ padding: '12px', background: '#FFEBEE', border: '1px solid #FFCDD2', borderRadius: '8px', color: '#C62828', fontSize: '0.82rem', marginBottom: '20px', fontWeight: 500 }}>
            <i className="fas fa-triangle-exclamation me-1" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="loginEmail" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Email Address</label>
            <input
              type="email"
              className="form-control"
              id="loginEmail"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              style={{ padding: '10px 14px', borderRadius: '8px' }}
            />
          </div>
          <div>
            <label htmlFor="loginPassword" style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600, color: '#475569' }}>Password</label>
            <input
              type="password"
              className="form-control"
              id="loginPassword"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              style={{ padding: '10px 14px', borderRadius: '8px' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{
              width: 'fit-content',
              fontWeight: 700,
              background: '#0072C6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 32px',
              marginTop: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1,
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '16px' }}>
          <Link href="/" style={{ color: '#64748B', fontSize: '0.82rem', textDecoration: 'none' }}>
            <i className="fas fa-arrow-left-long me-1" /> Back to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
}
