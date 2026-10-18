'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

export default function CareersPage() {
  const { t } = useTranslation();
  const { careers, loading, error } = useData();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const openCareers = careers.filter(c => {
    if (c.status !== 'Open') return false;
    if (c.deadline && c.deadline < todayStr) return false;
    return true;
  });

  const filtered = openCareers.filter(job => {
    const titleText = t(job.title || '');
    const descText = t(job.desc || '');
    const locText = t(job.location || '');
    
    const searchMatch = !search || 
      titleText.toLowerCase().includes(search.toLowerCase()) || 
      descText.toLowerCase().includes(search.toLowerCase()) ||
      locText.toLowerCase().includes(search.toLowerCase());

    const filterMatch = activeFilter === 'All' || 
      (activeFilter === 'Kigali' && locText.toLowerCase().includes('kigali')) ||
      (activeFilter === 'Remote' && locText.toLowerCase().includes('remote')) ||
      (activeFilter === 'Outside Kigali' && !locText.toLowerCase().includes('kigali') && !locText.toLowerCase().includes('remote'));

    return searchMatch && filterMatch;
  });

  return (
    <main id="main-content">
      {/* Header */}
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
                {t('nav.careers')}
              </li>
            </ol>
          </nav>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">{t('nav.careers')}</h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100">
            Join our team and help us build a sustainable system for para-athletes to achieve excellence in Rwanda.
          </p>
        </div>
      </header>

      {/* Main Section */}
      <section className="py-5">
        <div className="container">

          {/* Search & Filters */}
          <div className="row g-3 align-items-center mb-5 p-4 rounded-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }} data-aos="fade-up">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input
                  type="search"
                  aria-label="Search career opportunities"
                  className="form-control border-start-0 py-2"
                  placeholder="Search title, description, or location..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setSearch('')} aria-label="Clear career search">Clear</button>
                )}
              </div>
            </div>
            <div className="col-md-7">
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="small text-muted fw-bold text-uppercase me-2" style={{ letterSpacing: '0.5px' }}>Location:</span>
                {['All', 'Kigali', 'Remote', 'Outside Kigali'].map(loc => (
                  <button
                    key={loc}
                    onClick={() => setActiveFilter(loc)}
                    className="btn btn-sm"
                    style={{
                      borderRadius: '999px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      background: activeFilter === loc ? 'var(--primary-blue)' : '#fff',
                      color: activeFilter === loc ? '#fff' : 'var(--text-dark)',
                      border: activeFilter === loc ? '1px solid var(--primary-blue)' : '1px solid #D1D5DB',
                      transition: 'all 0.2s',
                    }}
                  >{loc}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Careers List */}
          {loading && careers.length === 0 ? (
            <div className="text-center py-5" role="status" aria-live="polite">
              <div className="spinner-border text-primary mb-3" aria-hidden="true" />
              <h3 className="h6 text-muted">Loading careers...</h3>
            </div>
          ) : careers.length === 0 ? (
            <div className="text-center py-5" data-aos="fade-up">
              <i className="fas fa-folder-open text-muted mb-3" aria-hidden="true" style={{ fontSize: '3rem' }}></i>
              <h3 className="h5 text-muted">{error ? 'Career opportunities are temporarily unavailable' : 'No career opportunities published yet'}</h3>
              <p className="small text-muted">{error ? 'Please try again in a moment.' : 'Please check back later for new vacancies.'}</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5" data-aos="fade-up">
              <i className="fas fa-folder-open text-muted mb-3" style={{ fontSize: '3rem' }}></i>
              <h3 className="h5 text-muted">No career opportunities found</h3>
              <p className="small text-muted">There are currently no open listings matching your criteria.</p>
            </div>
          ) : (
            <div className="row g-4">
              {filtered.map((job, i) => (
                <div key={job.slug} className="col-md-6" data-aos="fade-up" data-aos-delay={`${i * 100}`}>
                  <div className="custom-card p-4 h-100 d-flex flex-column" style={{ border: '1px solid #E8EDF5' }}>
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <h4 className="h5 fw-bold mb-0 text-dark">{t(job.title)}</h4>
                      <span className="badge bg-success-light text-success px-2.5 py-1 rounded-pill small fw-bold">
                        Open
                      </span>
                    </div>
                    <div className="mb-3 text-muted small d-flex gap-3 flex-wrap align-items-center">
                      <span><i className="fas fa-map-marker-alt me-1 text-primary"></i>{t(job.location)}</span>
                      <span><i className="fas fa-users me-1 text-primary"></i>{job.applicants} applicant{job.applicants !== 1 ? 's' : ''}</span>
                      {job.deadline && (
                        <span className="badge bg-light text-dark border px-2.5 py-1.5 fw-semibold d-inline-flex align-items-center gap-1">
                          <i className="fas fa-clock text-danger" />
                          <span>Deadline: {new Date(job.deadline + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </span>
                      )}
                    </div>
                    <p className="small text-muted mb-4 flex-grow-1" style={{ lineHeight: 1.6 }}>{t(job.desc)}</p>
                    
                    <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                      <Link href={`/careers/${job.slug}#apply`} className="btn btn-primary btn-sm fw-semibold px-4">
                        {t('phrase.Apply')} <i className="fas fa-arrow-right ms-1"></i>
                      </Link>
                      <span className="small text-muted">View role details <i className="fas fa-arrow-right ms-1" aria-hidden="true" /></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="text-center py-5 mt-4" data-aos="fade-up">
            <div className="d-inline-flex flex-column align-items-center gap-3 p-4 rounded-4" style={{ background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <i className="fas fa-handshake text-primary" style={{ fontSize: '2rem' }}></i>
              <p className="mb-0 fw-semibold text-dark">Don't see a role that fits? Volunteer with us instead!</p>
              <Link href="/volunteer" className="btn btn-primary px-4 fw-semibold">
                <i className="fas fa-users me-2"></i>Join as Volunteer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
