'use client';

import React from 'react';
import Link from 'next/link';

export interface AccessRestrictedProps {
  title?: string;
  message?: string;
  onReturn?: () => void;
  returnHref?: string;
  returnLabel?: string;
  contactEmail?: string;
  showContactButton?: boolean;
  compact?: boolean;
}

export default function AccessRestricted({
  title = 'Access Restricted',
  message = "You don't have permission to access this page. Please contact your administrator if you believe you should have access.",
  onReturn,
  returnHref = '/dashboard',
  returnLabel = 'Return to Dashboard',
  contactEmail = 'admin@npcrwanda.org',
  showContactButton = true,
  compact = false,
}: AccessRestrictedProps) {
  const mailtoSubject = encodeURIComponent('Access Permission Request - NPC Rwanda Dashboard');
  const mailtoBody = encodeURIComponent(
    'Hello Administrator,\n\nI am requesting access to a restricted section in the NPC Rwanda Management Dashboard.\n\nThank you.'
  );
  const contactHref = `mailto:${contactEmail}?subject=${mailtoSubject}&body=${mailtoBody}`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: compact ? '320px' : '460px',
        padding: '32px 16px',
        width: '100%',
      }}
    >
      <div
        className="card border-0"
        style={{
          maxWidth: '520px',
          width: '100%',
          borderRadius: '16px',
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
          overflow: 'hidden',
          textAlign: 'center',
        }}
      >
        {/* Top Decorative Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
            padding: '36px 24px 28px',
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          {/* Subtle Shield / Lock Icon */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(255, 160, 0, 0.15)',
              border: '2px solid rgba(255, 160, 0, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: '#FFA000',
            }}
          >
            <i className="fas fa-lock" style={{ fontSize: '1.6rem' }} />
          </div>

          <h2
            style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              margin: 0,
              color: '#FFFFFF',
              letterSpacing: '-0.3px',
            }}
          >
            {title}
          </h2>
        </div>

        {/* Card Body */}
        <div style={{ padding: '28px 28px 32px' }}>
          <p
            style={{
              fontSize: '0.92rem',
              lineHeight: 1.6,
              color: '#475569',
              margin: '0 0 24px',
            }}
          >
            {message}
          </p>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '12px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {onReturn ? (
              <button
                type="button"
                onClick={onReturn}
                className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2"
                style={{
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                  background: '#074783',
                  borderColor: '#074783',
                }}
              >
                <i className="fas fa-arrow-left" style={{ fontSize: '0.8rem' }} />
                {returnLabel}
              </button>
            ) : (
              <Link
                href={returnHref}
                className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2"
                style={{
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                  background: '#074783',
                  borderColor: '#074783',
                }}
              >
                <i className="fas fa-arrow-left" style={{ fontSize: '0.8rem' }} />
                {returnLabel}
              </Link>
            )}

            {showContactButton && (
              <a
                href={contactHref}
                className="btn btn-outline-secondary d-inline-flex align-items-center gap-2 px-4 py-2"
                style={{
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                  color: '#334155',
                  borderColor: '#CBD5E1',
                }}
              >
                <i className="fas fa-envelope" style={{ fontSize: '0.8rem' }} />
                Contact Administrator
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
