'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [sessionNotice, setSessionNotice] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('expired') === 'true') {
        setSessionNotice('Your session has ended for your security. Please log in again to continue.');
      }
    }
  }, []);

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
    <div className="login-page-wrapper">
      <style jsx global>{`
        .login-page-wrapper {
          min-height: 100vh;
          background: radial-gradient(circle at 10% 20%, #061a3d 0%, #030d1d 90%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .login-page-wrapper::before {
          content: '';
          position: absolute;
          top: -200px;
          left: -200px;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0, 114, 198, 0.25) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-page-wrapper::after {
          content: '';
          position: absolute;
          bottom: -200px;
          right: -200px;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 160, 0, 0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-container-card {
          width: 100%;
          max-width: 980px;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1);
          display: flex;
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        .login-branding-panel {
          flex: 1.1;
          background: linear-gradient(150deg, rgba(6, 26, 61, 0.94) 0%, rgba(0, 51, 160, 0.88) 100%),
                      url('/assets/img/curated/about-hero.jpg') center/cover no-repeat;
          padding: 48px 40px;
          color: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
        }

        .login-branding-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 6px 14px;
          border-radius: 30px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          color: #FFA000;
          width: fit-content;
        }

        .login-branding-features {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin: 32px 0;
        }

        .login-feature-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .login-feature-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.88rem;
          color: #FFA000;
          flex-shrink: 0;
        }

        .login-form-panel {
          flex: 1.2;
          padding: 48px 44px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .login-input-group {
          position: relative;
          display: flex;
          align-items: center;
        }

        .login-input-icon {
          position: absolute;
          left: 14px;
          color: #94A3B8;
          font-size: 0.95rem;
          pointer-events: none;
          transition: color 0.2s ease;
        }

        .login-input-field {
          width: 100%;
          padding: 12px 14px 12px 42px;
          border: 1.5px solid #E2E8F0;
          border-radius: 10px;
          font-size: 0.92rem;
          color: #0F172A;
          background: #F8FAFC;
          outline: none;
          transition: all 0.2s ease;
        }

        .login-input-field:focus {
          background: #ffffff;
          border-color: #0072C6;
          box-shadow: 0 0 0 4px rgba(0, 114, 198, 0.12);
        }

        .login-input-field:focus + .login-input-icon,
        .login-input-group:focus-within .login-input-icon {
          color: #0072C6;
        }

        .password-toggle-btn {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: #94A3B8;
          font-size: 0.9rem;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .password-toggle-btn:hover {
          color: #0F172A;
        }

        .login-submit-btn {
          width: 100%;
          padding: 14px 20px;
          background: linear-gradient(135deg, #0072C6 0%, #0033A0 100%);
          color: #ffffff;
          border: none;
          border-radius: 10px;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: all 0.25s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          box-shadow: 0 4px 14px rgba(0, 114, 198, 0.3);
        }

        .login-submit-btn:hover:not(:disabled) {
          background: linear-gradient(135deg, #0084E6 0%, #002D8C 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 114, 198, 0.4);
        }

        .login-submit-btn:disabled {
          opacity: 0.75;
          cursor: not-allowed;
          transform: none;
        }

        .national-accent-bar {
          display: flex;
          height: 3px;
          width: 100%;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 24px;
        }

        .bar-blue { flex: 2; background: #00A1DE; }
        .bar-yellow { flex: 1; background: #FAD201; }
        .bar-green { flex: 1; background: #00A859; }

        @media (max-width: 860px) {
          .login-container-card {
            flex-direction: column;
            max-width: 480px;
          }
          .login-branding-panel {
            padding: 32px 28px 24px 28px;
          }
          .login-form-panel {
            padding: 36px 28px;
          }
          .login-branding-features {
            display: none;
          }
        }
      `}</style>

      <div className="login-container-card">
        {/* Left Side: Professional Branding Panel */}
        <div className="login-branding-panel">
          <div>
            <div className="login-branding-badge">
              <i className="fas fa-shield-halved" /> Official Portal
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '20px', lineHeight: 1.25, color: '#ffffff' }}>
              National Paralympic Committee
            </h1>
            <p style={{ fontSize: '0.88rem', color: 'rgba(255, 255, 255, 0.8)', marginTop: '8px', lineHeight: 1.5 }}>
              Republic of Rwanda • Administrative Console
            </p>

            <div className="login-branding-features">
              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <i className="fas fa-lock" />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Secure Session Control</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '2px' }}>
                    Encrypted authentication with automated timeout protection
                  </div>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <i className="fas fa-medal" />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>National Sports Registry</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '2px' }}>
                    Athletes, disciplines, tournaments, and federation records
                  </div>
                </div>
              </div>

              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <i className="fas fa-newspaper" />
                </div>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff' }}>Direct Content Hub</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.7)', marginTop: '2px' }}>
                    Real-time governance documentation, news, and career vacancies
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="national-accent-bar">
              <div className="bar-blue" />
              <div className="bar-yellow" />
              <div className="bar-green" />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255, 255, 255, 0.6)', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>© {new Date().getFullYear()} NPC Rwanda</span>
              <span>Authorized Access Only</span>
            </div>
          </div>
        </div>

        {/* Right Side: Professional Login Form */}
        <div className="login-form-panel">
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <img
                src="/assets/img/logo.png"
                alt="NPC Rwanda Logo"
                style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
              />
              <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '12px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0072C6', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  ADMIN ACCESS
                </span>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>NPC Rwanda Portal</div>
              </div>
            </div>

            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0' }}>
              Sign In to Your Account
            </h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
              Enter your credentials to access the administrative dashboard.
            </p>
          </div>

          {sessionNotice && (
            <div style={{
              padding: '12px 14px',
              background: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '10px',
              color: '#B45309',
              fontSize: '0.84rem',
              marginBottom: '20px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <i className="fas fa-clock-rotate-left fa-lg" style={{ color: '#D97706' }} />
              <span>{sessionNotice}</span>
            </div>
          )}

          {error && (
            <div style={{
              padding: '12px 14px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: '10px',
              color: '#B91C1C',
              fontSize: '0.84rem',
              marginBottom: '20px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}>
              <i className="fas fa-circle-exclamation fa-lg" style={{ color: '#DC2626' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label
                htmlFor="loginEmail"
                style={{ display: 'block', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#334155' }}
              >
                Official Email Address
              </label>
              <div className="login-input-group">
                <i className="fas fa-envelope login-input-icon" />
                <input
                  type="email"
                  id="loginEmail"
                  placeholder="admin@npcrwanda.org"
                  className="login-input-field"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label
                  htmlFor="loginPassword"
                  style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', margin: 0 }}
                >
                  Password
                </label>
              </div>
              <div className="login-input-group">
                <i className="fas fa-lock login-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="loginPassword"
                  placeholder="Enter your account password"
                  className="login-input-field"
                  style={{ paddingRight: '42px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? (
                <>
                  <i className="fas fa-circle-notch fa-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <i className="fas fa-arrow-right" style={{ fontSize: '0.85rem' }} />
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <Link
              href="/"
              style={{ color: '#0072C6', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <i className="fas fa-arrow-left-long" /> Back to Public Website
            </Link>

            <span style={{ color: '#94A3B8', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <i className="fas fa-shield-alt text-success" /> 256-Bit SSL Secured
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
