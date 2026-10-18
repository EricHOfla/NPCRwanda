'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

export default function NpcAssociationsPage() {
  const { t } = useTranslation();

  const { npcAssociations, npcClubs, loading } = useData();
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const associations = npcAssociations.filter(a => a.active);
  const clubs = npcClubs.filter(c => c.active);
  const filteredAssociations = associations.filter(a =>
    !query || [a.name, a.acronym, a.desc, ...(a.activities || [])].some(value => value.toLowerCase().includes(query))
  );
  const filteredClubs = clubs.filter(c =>
    !query || c.name.toLowerCase().includes(query) || c.location.toLowerCase().includes(query)
  );

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
                Associations
              </li>
            </ol>
          </nav>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">
            NPC Associations
          </h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100">
            Dedicated sports associations driving athletic excellence and inclusion in Rwanda.
          </p>
        </div>
      </header>

      {/* Main content */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="bg-white border rounded-4 p-3 p-md-4 mb-4 shadow-sm">
            <label htmlFor="member-directory-search" className="form-label fw-semibold mb-2">
              Find an association or member club
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0" aria-hidden="true">
                <i className="fas fa-search text-muted"></i>
              </span>
              <input
                id="member-directory-search"
                type="search"
                className="form-control border-start-0 py-2"
                placeholder="Search by name, sport, activity, or location..."
                value={search}
                onChange={event => setSearch(event.target.value)}
                aria-describedby="member-directory-count"
              />
              {search && (
                <button type="button" className="btn btn-outline-secondary" onClick={() => setSearch('')}>
                  Clear
                </button>
              )}
            </div>
            <p id="member-directory-count" className="small text-muted mt-2 mb-0" aria-live="polite">
              Showing {filteredAssociations.length} of {associations.length} associations and {filteredClubs.length} of {clubs.length} member clubs.
            </p>
          </div>
          {loading && associations.length === 0 ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading associations...</span>
              </div>
            </div>
          ) : filteredAssociations.length === 0 ? (
            <div className="text-center py-5 text-muted mb-4">
              <p>No matching active associations found. Try another search.</p>
            </div>
          ) : (
            <div className="row g-4 mb-5">
              {filteredAssociations.map((assoc, idx) => (
                <div key={assoc.id || idx} className="col-md-6" data-aos="fade-up" data-aos-delay={idx * 100}>
                  <div className="card association-directory-card h-100 border-0 shadow-sm p-4" style={{ borderRadius: '16px' }}>
                    <div className="d-flex align-items-center mb-3">
                      <div
                        className="d-flex align-items-center justify-content-center text-white me-3"
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '10px',
                          background: 'linear-gradient(135deg, var(--dark-blue) 0%, var(--primary-blue) 100%)',
                        }}
                      >
                        <i className={`fas ${assoc.icon || 'fa-users'} fa-lg`}></i>
                      </div>
                      <div>
                        <h2 className="h5 fw-bold mb-0 text-dark">{assoc.name}</h2>
                        <span className="badge bg-primary-soft text-primary mt-1">{assoc.acronym}</span>
                      </div>
                    </div>
                    <p className="text-muted small mb-3">{assoc.desc}</p>
                    {assoc.activities && assoc.activities.length > 0 && (
                      <div>
                        <h4 className="h6 fw-bold text-dark mb-2">Key Activities & Disciplines:</h4>
                        <ul className="list-unstyled mb-0 row g-1">
                          {assoc.activities.map((act, i) => (
                            <li key={i} className="col-12 text-muted small">
                              <i className="fas fa-check-circle text-success me-2"></i> {act}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Member Clubs Section */}
          <div className="mt-5" data-aos="fade-up">
            <h3 className="h4 fw-bold mb-4 text-dark border-bottom pb-2">Member Clubs & Founder Teams</h3>
            {filteredClubs.length === 0 ? (
              <p className="text-muted">No matching member clubs found. Try another search.</p>
            ) : (
            <div className="row g-3">
              {filteredClubs.map((club, idx) => (
                <div key={idx} className="col-sm-6 col-md-4">
                  <div className="card club-directory-card border-0 shadow-xs p-3 h-100 d-flex flex-row align-items-center" style={{ borderRadius: '12px', background: '#fff' }}>
                    <div
                      className="d-flex align-items-center justify-content-center text-primary bg-primary-soft me-3"
                      style={{ width: '40px', height: '40px', borderRadius: '8px' }}
                    >
                      <i className="fas fa-users-cog"></i>
                    </div>
                    <div>
                      <h4 className="h6 fw-bold mb-1 text-dark">{club.name}</h4>
                      <span className="text-muted small">
                        <i className="fas fa-map-marker-alt me-1 text-xs text-danger"></i> {club.location}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
