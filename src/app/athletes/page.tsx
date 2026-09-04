'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import Pagination from '@/components/Pagination';

export default function AthletesPage() {
  const { t } = useTranslation();
  const { athletes, sports } = useData();
  const [activeSport, setActiveSport] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 9;

  const sportCategories = ['All', ...Array.from(new Set(sports.map(s => s.title)))];

  const filtered = athletes.filter(a => {
    const sportName = t(a.sport);
    const sportMatch = activeSport === 'All' || a.sport === activeSport || sportName === activeSport;
    const searchMatch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || sportName.toLowerCase().includes(search.toLowerCase());
    return sportMatch && searchMatch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const visiblePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedAthletes = filtered.slice((visiblePage - 1) * ITEMS_PER_PAGE, visiblePage * ITEMS_PER_PAGE);

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
                {t('nav.athletes')}
              </li>
            </ol>
          </nav>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">{t('nav.athletes')}</h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100">
            Meet our elite para-athletes who represent Rwanda on the global stage, proving that ability always comes first.
          </p>
        </div>
      </header>

      {/* Main Section */}
      <section className="py-5">
        <div className="container">
          
          {/* Search & Filters */}
          <div className="row g-3 align-items-center mb-5 p-4 rounded-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }} data-aos="fade-up">
            <div className="col-md-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 py-2"
                  placeholder="Search athletes..."
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-md-8">
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="small text-muted fw-bold text-uppercase me-2" style={{ letterSpacing: '0.5px' }}>Filter by Sport:</span>
                {sportCategories.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setActiveSport(s);
                      setCurrentPage(1);
                    }}
                    className="btn btn-sm"
                    style={{
                      borderRadius: '999px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      background: activeSport === s ? 'var(--primary-blue)' : '#fff',
                      color: activeSport === s ? '#fff' : 'var(--text-dark)',
                      border: activeSport === s ? '1px solid var(--primary-blue)' : '1px solid #D1D5DB',
                      transition: 'all 0.2s',
                    }}
                  >{t(s)}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Athletes List */}
          {athletes.length === 0 ? (
            <div className="text-center py-5" data-aos="fade-up">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h3 className="h6 text-muted">Loading athlete profiles...</h3>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5" data-aos="fade-up">
              <i className="fas fa-users-slash text-muted mb-3" style={{ fontSize: '3rem' }}></i>
              <h3 className="h5 text-muted">No athlete profiles found</h3>
              <p className="small text-muted">Try changing your search query or sport filter.</p>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {paginatedAthletes.map((a, i) => {
                  const anchor = a.name.toLowerCase().split(' ').pop();
                  return (
                    <div key={a.id} id={anchor} className="col-md-6 col-lg-4" data-aos="zoom-in" data-aos-delay={`${(i % 3) * 100}`}>
                      <div className="custom-card athlete-card p-4 h-100 text-center d-flex flex-column align-items-center">
                        <div className="athlete-thumb mb-3">
                          <img 
                            src={a.avatar.startsWith('http') || a.avatar.startsWith('/') ? a.avatar : `/assets/img/${a.avatar}`} 
                            alt={`${a.name} portrait`} 
                            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/avatar-1.svg'; }}
                          />
                        </div>
                        <h3 className="h5 fw-bold mb-1">{a.name}</h3>
                        <span className="badge bg-success-light text-success mb-3 px-3 py-2 rounded-pill small fw-bold">
                          <i className="fas fa-running me-1"></i>{t(a.sport)}
                        </span>
                        <p className="small text-muted mb-4 flex-grow-1" style={{ lineHeight: 1.6 }}>{t(a.desc)}</p>
                        
                        <div className="border-top pt-3 w-100 mt-auto d-flex justify-content-between align-items-center text-muted small">
                          <span><i className="fas fa-globe me-1"></i>{a.country}</span>
                          <span><i className="fas fa-circle text-success me-1" style={{ fontSize: '0.6rem' }}></i>Active</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Pagination currentPage={visiblePage} totalPages={totalPages} onPageChange={setCurrentPage} ariaLabel="Athletes pagination" />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
