'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

export default function CareersPage() {
  const { t } = useTranslation();
  const { careers } = useData();
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const openCareers = careers.filter(c => c.status === 'Open');

  const filtered = openCareers.filter(job => {
    const titleText = t(job.title);
    const descText = t(job.desc);
    const locText = t(job.location);
    
    const searchMatch = !search || 
      titleText.toLowerCase().includes(search.toLowerCase()) || 
      descText.toLowerCase().includes(search.toLowerCase());

    const filterMatch = activeFilter === 'All' || 
      (activeFilter === 'Kigali' && locText.toLowerCase().includes('kigali')) ||
      (activeFilter === 'Remote' && locText.toLowerCase().includes('remote')) ||
      (activeFilter === 'Outside Kigali' && !locText.toLowerCase().includes('kigali') && !locText.toLowerCase().includes('remote'));

    return searchMatch && filterMatch;
  });

  return (
    <main id="main-content">
      {/* Header */}
      <header
        className="py-5 text-white"
        style={{
          background: "linear-gradient(rgba(0,114,198,0.78), rgba(76,175,80,0.7)), url('/assets/img/curated/about-hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container py-4">
          <span className="badge text-uppercase fw-bold mb-3" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', letterSpacing: '1px', fontSize: '0.75rem' }}>
            <i className="fas fa-briefcase me-2"></i>Opportunities
          </span>
          <h1 className="text-white mb-2" data-aos="fade-up">{t('nav.careers')}</h1>
          <p className="text-white opacity-75 mb-3" data-aos="fade-up" data-aos-delay="100" style={{ maxWidth: '520px' }}>
            Join our team and help us build a sustainable system for para-athletes to achieve excellence in Rwanda.
          </p>
          <nav aria-label="breadcrumb" data-aos="fade-up" data-aos-delay="150">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link href="/" className="text-white text-decoration-none">{t('nav.home')}</Link></li>
              <li className="breadcrumb-item active text-white opacity-75" aria-current="page">{t('nav.careers')}</li>
            </ol>
          </nav>
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
                  type="text"
                  className="form-control border-start-0 py-2"
                  placeholder="Search listings..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
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
          {careers.length === 0 ? (
            <div className="text-center py-5" data-aos="fade-up">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h3 className="h6 text-muted">Loading careers...</h3>
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
                    <div className="mb-3 text-muted small d-flex gap-3">
                      <span><i className="fas fa-map-marker-alt me-1 text-primary"></i>{t(job.location)}</span>
                      <span><i className="fas fa-users me-1 text-primary"></i>{job.applicants} applicant{job.applicants !== 1 ? 's' : ''}</span>
                    </div>
                    <p className="small text-muted mb-4 flex-grow-1" style={{ lineHeight: 1.6 }}>{t(job.desc)}</p>
                    
                    <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                      <Link href={`/careers/${job.slug}`} className="btn btn-primary btn-sm fw-semibold px-4">
                        {t('phrase.Apply')} <i className="fas fa-arrow-right ms-1"></i>
                      </Link>
                      <span className="small text-muted">Full-Time</span>
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
