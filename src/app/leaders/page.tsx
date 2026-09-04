'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import Pagination from '@/components/Pagination';

const ITEMS_PER_PAGE = 6;

const getProfileImageSrc = (image?: string) => {
  if (!image) {
    return '/assets/img/avatar-4.svg';
  }

  if (image.startsWith('/') || image.startsWith('http')) {
    return image;
  }

  if (image.includes('/')) {
    return `/${image}`;
  }

  return `/assets/img/${image}`;
};

export default function LeadersPage() {
  const { t } = useTranslation();
  const { leadership } = useData();
  const [activeCommittee, setActiveCommittee] = React.useState('All');
  const [search, setSearch] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);

  const committees = ['All', ...Array.from(new Set(leadership.map(leader => leader.committee || 'Board of Directors')))];
  const filteredLeaders = leadership.filter(leader => {
    const committee = leader.committee || 'Board of Directors';
    const matchesCommittee = activeCommittee === 'All' || committee === activeCommittee;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query ||
      leader.name.toLowerCase().includes(query) ||
      leader.role.toLowerCase().includes(query) ||
      committee.toLowerCase().includes(query);

    return matchesCommittee && matchesSearch;
  });

  const totalPages = Math.ceil(filteredLeaders.length / ITEMS_PER_PAGE);
  const visiblePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedLeaders = filteredLeaders.slice((visiblePage - 1) * ITEMS_PER_PAGE, visiblePage * ITEMS_PER_PAGE);

  const resetPage = () => setCurrentPage(1);

  return (
    <main id="main-content">
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
                {t('phrase.Our Leadership')}
              </li>
            </ol>
          </nav>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">{t('phrase.Our Leadership')}</h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100">
            Meet the leaders guiding NPC Rwanda governance, athlete development, and institutional strategy.
          </p>
        </div>
      </header>

      <section className="py-5">
        <div className="container">
          <div className="row g-3 align-items-center mb-5 p-4 rounded-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }} data-aos="fade-up">
            <div className="col-lg-4">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  <i className="fas fa-search text-muted" aria-hidden="true"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 py-2"
                  placeholder="Search leaders..."
                  value={search}
                  onChange={event => {
                    setSearch(event.target.value);
                    resetPage();
                  }}
                />
              </div>
            </div>
            <div className="col-lg-8">
              <div className="d-flex flex-wrap gap-2 align-items-center">
                <span className="small text-muted fw-bold text-uppercase me-2" style={{ letterSpacing: '0.5px' }}>Committee:</span>
                {committees.map(committee => (
                  <button
                    key={committee}
                    type="button"
                    onClick={() => {
                      setActiveCommittee(committee);
                      resetPage();
                    }}
                    className="btn btn-sm"
                    style={{
                      borderRadius: '999px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      background: activeCommittee === committee ? 'var(--primary-blue)' : '#fff',
                      color: activeCommittee === committee ? '#fff' : 'var(--text-dark)',
                      border: activeCommittee === committee ? '1px solid var(--primary-blue)' : '1px solid #D1D5DB',
                    }}
                  >
                    {committee}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {leadership.length === 0 ? (
            <div className="text-center py-5" data-aos="fade-up">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h2 className="h6 text-muted">Loading leadership profiles...</h2>
            </div>
          ) : filteredLeaders.length === 0 ? (
            <div className="text-center py-5" data-aos="fade-up">
              <i className="fas fa-user-slash text-muted mb-3" style={{ fontSize: '3rem' }} aria-hidden="true"></i>
              <h2 className="h5 text-muted">No leaders found</h2>
              <p className="small text-muted">Try changing your search or committee filter.</p>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {paginatedLeaders.map((leader, index) => (
                  <div key={leader.id} className="col-lg-6" data-aos="fade-up" data-aos-delay={`${(index % 2) * 100}`}>
                    <article className="custom-card h-100 p-4">
                      <div className="row g-4 align-items-start">
                        <div className="col-sm-4 text-center">
                          <div className="athlete-thumb mx-auto mb-3">
                            <img
                              src={getProfileImageSrc(leader.avatar)}
                              alt={`${leader.name} portrait`}
                              onError={(event) => { (event.target as HTMLImageElement).src = '/assets/img/avatar-4.svg'; }}
                            />
                          </div>
                          <span className="badge px-3 py-2 rounded-pill mb-2 d-inline-block" style={{ background: '#EFF6FF', color: '#1D4ED8' }}>
                            {leader.committee || 'Board of Directors'}
                          </span>
                          {leader.impairment && (
                            <span className="badge px-3 py-2 rounded-pill d-inline-block" style={{ background: '#E0F2FE', color: '#0369A1' }}>
                              <i className="fas fa-wheelchair me-1"></i> {leader.impairment}
                            </span>
                          )}
                        </div>
                        <div className="col-sm-8">
                          <h2 className="h4 mb-1">{leader.name}</h2>
                          <p className="text-accent-green fw-bold mb-3">{t(leader.role)}</p>
                          <p className="text-muted mb-3" style={{ lineHeight: 1.7 }}>{t(leader.desc)}</p>
                          
                          {(leader.email || leader.phone) && (
                            <div className="mb-3 d-flex flex-wrap gap-3 small">
                              {leader.email && (
                                <a href={`mailto:${leader.email}`} className="text-decoration-none text-muted fw-semibold">
                                  <i className="fas fa-envelope me-1 text-primary"></i> {leader.email}
                                </a>
                              )}
                              {leader.phone && (
                                <a href={`tel:${leader.phone}`} className="text-decoration-none text-muted fw-semibold">
                                  <i className="fas fa-phone me-1 text-primary"></i> {leader.phone}
                                </a>
                              )}
                            </div>
                          )}

                          <div className="d-flex flex-wrap gap-2 small text-muted border-top pt-3">
                            <span><i className="fas fa-id-card me-1 text-primary" aria-hidden="true"></i>{t(leader.role)}</span>
                            <span><i className="fas fa-sitemap me-1 text-primary" aria-hidden="true"></i>{leader.committee || 'Board of Directors'}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>
                ))}
              </div>

              <Pagination currentPage={visiblePage} totalPages={totalPages} onPageChange={setCurrentPage} ariaLabel="Leaders pagination" />
            </>
          )}
        </div>
      </section>
    </main>
  );
}
