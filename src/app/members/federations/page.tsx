'use client';

import React from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';

export default function NpcFederationsPage() {
  const { npcFederations } = useData();
  const federations = npcFederations.filter(f => f.active);

  return (
    <main id="main-content">
      {/* Page Header */}
      <header className="page-header">
        <div className="container">
          <nav aria-label="breadcrumb" data-aos="fade-up">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item">
                <Link href="/">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Federations
              </li>
            </ol>
          </nav>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">
            NPC Federations
          </h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100">
            Affiliated international and continental sports federations supporting the Paralympic movement.
          </p>
        </div>
      </header>

      {/* Main content */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row g-4">
            {federations.map((fed, idx) => (
              <div key={idx} className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="card h-100 border-0 shadow-sm p-4 d-flex flex-column justify-content-between" style={{ borderRadius: '12px' }}>
                  <div>
                    <div className="d-flex align-items-center justify-content-center bg-white p-3 rounded mb-3 border" style={{ height: '100px', width: '100%' }}>
                      <img
                        src={fed.logo}
                        alt={fed.name}
                        style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
                      />
                    </div>
                    <h2 className="h5 fw-bold text-dark mb-1">{fed.name}</h2>
                    <span className="badge bg-success-soft text-success mb-3">{fed.role}</span>
                    <p className="text-muted small mb-4">{fed.desc}</p>
                  </div>
                  <div>
                    {fed.website && (
                      <a
                        href={fed.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary w-100 rounded-pill"
                      >
                        Visit Website <i className="fas fa-external-link-alt ms-1 text-xs"></i>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
