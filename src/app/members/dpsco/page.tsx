'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';

const DEFAULT_PROVINCES = [
  'Kigali City',
  'Northern Province',
  'Southern Province',
  'Eastern Province',
  'Western Province',
];

export default function DpscoContactsPage() {
  const { dpscoContacts, loading } = useData();

  // Active verified contacts from the database
  const activeContacts = useMemo(() => {
    return dpscoContacts.filter(c => c.active !== false);
  }, [dpscoContacts]);

  // Extract unique provinces from DB preserving standard order
  const provinces = useMemo(() => {
    const fromDb = Array.from(new Set(activeContacts.map(c => c.province).filter(Boolean)));
    const ordered = DEFAULT_PROVINCES.filter(p => fromDb.includes(p));
    fromDb.forEach(p => {
      if (!ordered.includes(p)) ordered.push(p);
    });
    return ordered.length > 0 ? ordered : DEFAULT_PROVINCES;
  }, [activeContacts]);

  const [activeProvince, setActiveProvince] = useState('Kigali City');

  // Ensure active province is valid
  const effectiveProvince = provinces.includes(activeProvince) ? activeProvince : (provinces[0] || 'Kigali City');

  // Filter contacts by active province
  const currentDistricts = useMemo(() => {
    return activeContacts.filter(c => c.province.toLowerCase() === effectiveProvince.toLowerCase());
  }, [activeContacts, effectiveProvince]);

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
                DPSCO
              </li>
            </ol>
          </nav>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">
            DPSCO Contacts
          </h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100">
            District Paralympic Sport Committees across all 30 districts of Rwanda.
          </p>
        </div>
      </header>

      {/* Main content */}
      <section className="py-5 bg-light">
        <div className="container">
          
          {/* Province Selector tabs */}
          <div className="d-flex flex-wrap justify-content-center gap-2 mb-4" data-aos="fade-up">
            {provinces.map((prov) => (
              <button
                key={prov}
                onClick={() => setActiveProvince(prov)}
                className={`btn btn-sm px-4 py-2 rounded-pill fw-bold ${
                  effectiveProvince === prov ? 'btn-primary' : 'btn-light border text-dark'
                }`}
              >
                {prov}
              </button>
            ))}
          </div>

          {/* Districts Contacts list */}
          {loading && activeContacts.length === 0 ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading DPSCO contacts...</span>
              </div>
            </div>
          ) : currentDistricts.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>No DPSCO contacts found for {effectiveProvince}.</p>
            </div>
          ) : (
            <div className="row g-4" data-aos="fade-up" data-aos-delay="100">
              {currentDistricts.map((dist) => (
                <div key={dist.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm p-4" style={{ borderRadius: '12px', background: '#fff' }}>
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="d-flex align-items-center justify-content-center text-primary bg-primary-soft me-3"
                        style={{ width: '45px', height: '45px', borderRadius: '10px' }}
                      >
                        <i className="fas fa-map-marker-alt text-lg"></i>
                      </div>
                      <div>
                        <h2 className="h5 fw-bold mb-0 text-dark">{dist.district} District</h2>
                        <span className="text-muted small">DPSCO Coordinator</span>
                      </div>
                    </div>
                    
                    <div className="border-top pt-3 mt-2">
                      <p className="mb-2 text-dark small">
                        <i className="fas fa-user text-muted me-2"></i>
                        <strong>Name:</strong> {dist.coordinator}
                      </p>
                      <p className="mb-2 text-dark small">
                        <i className="fas fa-phone text-muted me-2"></i>
                        <strong>Phone:</strong> <a href={`tel:${dist.phone}`} className="text-decoration-none">{dist.phone}</a>
                      </p>
                      <p className="mb-0 text-dark small text-truncate">
                        <i className="fas fa-envelope text-muted me-2"></i>
                        <strong>Email:</strong> <a href={`mailto:${dist.email}`} className="text-decoration-none">{dist.email}</a>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
