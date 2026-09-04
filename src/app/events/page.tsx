'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import Pagination from '@/components/Pagination';

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  Upcoming:  { bg: '#EFF6FF', text: '#1D4ED8', icon: 'fa-clock' },
  Ongoing:   { bg: '#F0FDF4', text: '#15803D', icon: 'fa-circle-dot' },
  Completed: { bg: '#F9FAFB', text: '#6B7280', icon: 'fa-circle-check' },
  Cancelled: { bg: '#FFF1F2', text: '#BE123C', icon: 'fa-circle-xmark' },
};

const CATEGORY_ICONS: Record<string, string> = {
  National:      'fa-flag',
  International: 'fa-globe',
  Regional:      'fa-map-marker-alt',
  Training:      'fa-dumbbell',
  Conference:    'fa-chalkboard-teacher',
};

export default function EventsPage() {
  const { t } = useTranslation();
  const { events } = useData();
  const [activeStatus, setActiveStatus] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  const statuses = ['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'];
  const categories = ['All', ...Array.from(new Set(events.map(e => e.category)))];

  const filtered = events.filter(ev => {
    const statusMatch = activeStatus === 'All' || ev.status === activeStatus;
    const catMatch = activeCategory === 'All' || ev.category === activeCategory;
    return statusMatch && catMatch;
  });
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const visiblePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedEvents = filtered.slice((visiblePage - 1) * ITEMS_PER_PAGE, visiblePage * ITEMS_PER_PAGE);

  const featured = events.filter(e => e.featured);
  const upcoming = events.filter(e => e.status === 'Upcoming').length;
  const ongoing  = events.filter(e => e.status === 'Ongoing').length;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <main id="main-content">
      {/* Hero */}
      <header className="page-header">
        <div className="container">
          <nav aria-label="breadcrumb" data-aos="fade-up">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item">
                <Link href="/">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item">
                <Link href="/news">
                  {t('nav.news')}
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Events</li>
            </ol>
          </nav>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">Events &amp; Competitions</h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100">
            Stay up to date with NPC Rwanda national, regional, and international sports events, training camps, and conferences.
          </p>
        </div>
      </header>

      {/* Stats Bar */}
      <div style={{ background: 'var(--primary-blue)', color: '#fff' }}>
        <div className="container py-3">
          <div className="row g-3 text-center">
            {[
              { label: 'Total Events', value: events.length, icon: 'fa-calendar' },
              { label: 'Upcoming', value: upcoming, icon: 'fa-clock' },
              { label: 'Ongoing', value: ongoing, icon: 'fa-circle-dot' },
              { label: 'Featured', value: featured.length, icon: 'fa-star' },
            ].map(stat => (
              <div key={stat.label} className="col-6 col-md-3">
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <i className={`fas ${stat.icon}`} style={{ fontSize: '1.2rem', opacity: 0.8 }}></i>
                  <div className="text-start">
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section>
        <div className="container">

          {/* Featured Events */}
          {featured.length > 0 && (
            <div className="mb-5" data-aos="fade-up">
              <div className="section-title text-start mb-4">
                <span className="text-uppercase fw-bold text-accent-green mb-2 d-block" style={{ fontSize: '0.78rem', letterSpacing: '1px' }}>
                  <i className="fas fa-star me-1"></i> Featured
                </span>
                <h2 className="h3">Highlight Events</h2>
              </div>
              <div className="row g-4">
                {featured.slice(0, 2).map((ev, i) => {
                  const sc = STATUS_COLORS[ev.status] || STATUS_COLORS.Upcoming;
                  return (
                    <div key={ev.id} className="col-lg-6" data-aos="fade-up" data-aos-delay={i * 100}>
                      <div className="custom-card h-100 overflow-hidden" style={{ border: '2px solid #E8EDF5' }}>
                        <div className="position-relative">
                          <img
                            src={`/assets/img/curated/${ev.img}`}
                            alt={ev.title}
                            className="w-100"
                            style={{ height: '220px', objectFit: 'cover' }}
                            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/curated/sports-hero.jpg'; }}
                          />
                          <div className="position-absolute top-0 start-0 m-3">
                            <span className="badge fw-bold px-3 py-2" style={{ background: sc.bg, color: sc.text, fontSize: '0.78rem' }}>
                              <i className={`fas ${sc.icon} me-1`}></i>{ev.status}
                            </span>
                          </div>
                          <div className="position-absolute top-0 end-0 m-3">
                            <span className="badge fw-bold px-2 py-2" style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.72rem' }}>
                              <i className={`fas ${CATEGORY_ICONS[ev.category] || 'fa-tag'} me-1`}></i>{ev.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="h5 mb-2">{ev.title}</h3>
                          <p className="small text-muted mb-3">{ev.description}</p>
                          <div className="d-flex flex-wrap gap-3 text-muted small">
                            <span><i className="fas fa-calendar me-1 text-primary"></i>{formatDate(ev.date)}{ev.endDate && ev.endDate !== ev.date ? ` – ${formatDate(ev.endDate)}` : ''}</span>
                            <span><i className="fas fa-map-marker-alt me-1 text-primary"></i>{ev.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 mb-4 p-4 rounded-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }} data-aos="fade-up">
            <div>
              <p className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Status</p>
              <div className="d-flex flex-wrap gap-2">
                {statuses.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setActiveStatus(s);
                      setCurrentPage(1);
                    }}
                    className="btn btn-sm"
                    style={{
                      borderRadius: '999px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      background: activeStatus === s ? 'var(--primary-blue)' : '#fff',
                      color: activeStatus === s ? '#fff' : 'var(--text-dark)',
                      border: activeStatus === s ? '1px solid var(--primary-blue)' : '1px solid #D1D5DB',
                      transition: 'all 0.2s',
                    }}
                  >{s}</button>
                ))}
              </div>
            </div>
            <div className="vr d-none d-md-block" style={{ opacity: 0.2 }}></div>
            <div>
              <p className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Category</p>
              <div className="d-flex flex-wrap gap-2">
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setActiveCategory(c);
                      setCurrentPage(1);
                    }}
                    className="btn btn-sm"
                    style={{
                      borderRadius: '999px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      background: activeCategory === c ? '#16A34A' : '#fff',
                      color: activeCategory === c ? '#fff' : 'var(--text-dark)',
                      border: activeCategory === c ? '1px solid #16A34A' : '1px solid #D1D5DB',
                      transition: 'all 0.2s',
                    }}
                  >{c}</button>
                ))}
              </div>
            </div>
            <div className="ms-md-auto">
              <span className="small text-muted fw-semibold">{filtered.length} event{filtered.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Events Grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-5" data-aos="fade-up">
              <i className="fas fa-calendar-times text-muted mb-3" style={{ fontSize: '3rem' }}></i>
              <h3 className="h5 text-muted">No events found</h3>
              <p className="small text-muted">Try changing the filters above.</p>
            </div>
          ) : (
            <>
              <div className="row g-4">
              {paginatedEvents.map((ev, i) => {
                const sc = STATUS_COLORS[ev.status] || STATUS_COLORS.Upcoming;
                return (
                  <div key={ev.id} className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay={`${(i % 3) * 100}`}>
                    <div className="custom-card h-100 d-flex flex-column overflow-hidden" style={{ border: '1px solid #E8EDF5' }}>
                      <div className="position-relative">
                        <img
                          src={`/assets/img/curated/${ev.img}`}
                          alt={ev.title}
                          className="w-100"
                          style={{ height: '170px', objectFit: 'cover' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/curated/sports-hero.jpg'; }}
                        />
                        <span
                          className="badge fw-bold px-2 py-1 position-absolute top-0 start-0 m-2"
                          style={{ background: sc.bg, color: sc.text, fontSize: '0.72rem' }}
                        >
                          <i className={`fas ${sc.icon} me-1`}></i>{ev.status}
                        </span>
                        {ev.featured && (
                          <span className="position-absolute top-0 end-0 m-2 badge" style={{ background: '#F59E0B', color: '#fff', fontSize: '0.68rem' }}>
                            <i className="fas fa-star me-1"></i>Featured
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-grow-1 d-flex flex-column">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="badge" style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.68rem', fontWeight: 600 }}>
                            <i className={`fas ${CATEGORY_ICONS[ev.category] || 'fa-tag'} me-1`}></i>{ev.category}
                          </span>
                        </div>
                        <h4 className="h6 fw-bold mb-2">{ev.title}</h4>
                        <p className="small text-muted mb-3 flex-grow-1" style={{ lineHeight: 1.6 }}>{ev.description}</p>
                        <div className="border-top pt-3 mt-auto">
                          <div className="small text-muted mb-1">
                            <i className="fas fa-calendar me-2 text-primary"></i>
                            <strong>{formatDate(ev.date)}</strong>
                            {ev.endDate && ev.endDate !== ev.date && <span className="text-muted"> – {formatDate(ev.endDate)}</span>}
                          </div>
                          <div className="small text-muted">
                            <i className="fas fa-map-marker-alt me-2 text-primary"></i>{ev.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
              <Pagination currentPage={visiblePage} totalPages={totalPages} onPageChange={setCurrentPage} ariaLabel="Events pagination" />
            </>
          )}

          {/* CTA */}
          <div className="text-center py-5 mt-4" data-aos="fade-up">
            <div className="d-inline-flex flex-column align-items-center gap-3 p-4 rounded-4" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <i className="fas fa-envelope-open-text text-success" style={{ fontSize: '2rem' }}></i>
              <p className="mb-0 fw-semibold text-dark">Want to participate or partner with us for an event?</p>
              <Link href="/contact" className="btn btn-success px-4 fw-semibold">
                <i className="fas fa-paper-plane me-2"></i>Contact Us
              </Link>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
