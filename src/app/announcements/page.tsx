'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import Pagination from '@/components/Pagination';
import { isAnnouncementCategory } from '@/lib/newsUtils';

export default function AnnouncementsPage() {
  const { t } = useTranslation();
  const { news } = useData();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'gazette' | 'cards'>('gazette');

  const ITEMS_PER_PAGE = 8;

  // Announcements only: filter to items with an announcement-related category
  const announcementsOnly = useMemo(() => {
    return news.filter(n => isAnnouncementCategory(n.category));
  }, [news]);

  // Categories derived purely from real announcement data
  const categories = useMemo(() => {
    const seen = new Set<string>();
    const list = ['All'];
    announcementsOnly.forEach(n => {
      if (n.category && !seen.has(n.category)) {
        seen.add(n.category);
        list.push(n.category);
      }
    });
    return list;
  }, [announcementsOnly]);

  const published = useMemo(() => {
    return announcementsOnly.filter(n => n.status === 'Published' || !n.status);
  }, [announcementsOnly]);

  const filtered = useMemo(() => {
    return published.filter(article => {
      const catMatch = activeCategory === 'All' || article.category?.toLowerCase() === activeCategory.toLowerCase();
      const searchMatch = !search ||
        article.title.toLowerCase().includes(search.toLowerCase()) ||
        article.desc.toLowerCase().includes(search.toLowerCase());
      return catMatch && searchMatch;
    });
  }, [published, activeCategory, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const visiblePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedArticles = filtered.slice((visiblePage - 1) * ITEMS_PER_PAGE, visiblePage * ITEMS_PER_PAGE);

  return (
    <main id="main-content" style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* Official Government / Gazette Header */}
      <header className="page-header" style={{ borderBottom: '3px solid #0072C6' }}>
        <div className="container">
          <nav aria-label="breadcrumb" data-aos="fade-up">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item">
                <Link href="/">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Official Announcements</li>
            </ol>
          </nav>
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="badge px-3 py-1 bg-white text-dark fw-bold rounded-pill text-uppercase border" style={{ fontSize: '0.72rem', letterSpacing: '0.8px' }}>
              <i className="fas fa-bullhorn text-primary me-1" /> Official Gazette &amp; Notices
            </span>
          </div>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">
            Official Announcements &amp; Public Notices
          </h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100" style={{ maxWidth: '850px' }}>
            Official public notices, committee circulars, statutory communiqués, and administrative announcements issued by the National Paralympic Committee of Rwanda.
          </p>
        </div>
      </header>

      {/* Main Body */}
      <div className="container py-5">

        {/* Filter and Control Bar */}
        <div className="bg-white p-4 rounded-4 shadow-sm border mb-4" data-aos="fade-up">
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-lg-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 text-muted">
                  <i className="fas fa-search" />
                </span>
                <input
                  type="text"
                  className="form-control border-start-0 py-2 bg-light"
                  placeholder="Search announcements, circulars or keywords..."
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                {search && (
                  <button
                    className="btn btn-light border-start-0 border text-muted"
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setCurrentPage(1);
                    }}
                  >
                    <i className="fas fa-times" />
                  </button>
                )}
              </div>
            </div>

            {/* Classification Filters */}
            <div className="col-lg-4">
              <div className="d-flex flex-wrap gap-2">
                {categories.map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setActiveCategory(cat);
                      setCurrentPage(1);
                    }}
                    className={`btn btn-sm py-2 px-3 fw-bold rounded-pill ${activeCategory === cat ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.8rem' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Layout Toggle */}
            <div className="col-lg-3 d-flex justify-content-lg-end gap-2 align-items-center">
              <span className="small text-muted fw-semibold me-1 d-none d-md-inline">Format:</span>
              <div className="btn-group" role="group" aria-label="Format toggle">
                <button
                  type="button"
                  onClick={() => setViewMode('gazette')}
                  className={`btn btn-sm ${viewMode === 'gazette' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  title="Official Gazette List View"
                >
                  <i className="fas fa-list-check me-1" /> Gazette List
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  className={`btn btn-sm ${viewMode === 'cards' ? 'btn-dark' : 'btn-outline-secondary'}`}
                  title="Cards Grid View"
                >
                  <i className="fas fa-border-all me-1" /> Grid
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content View */}
        {filtered.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border shadow-sm my-3 p-5">
            <div className="text-muted mb-3">
              <i className="fas fa-bullhorn fa-3x text-secondary opacity-50" />
            </div>
            <h5 className="fw-bold text-dark">No announcements found</h5>
            <p className="text-muted small mb-3">There are no official public notices matching your search criteria.</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All'); }}
              className="btn btn-outline-primary btn-sm px-4 fw-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'gazette' ? (
          /* Official Gazette Register Style (Government / Ministry Style) */
          <div className="card border rounded-4 shadow-sm overflow-hidden bg-white mb-4" data-aos="fade-up">
            <div className="card-header bg-white py-3 px-4 border-bottom d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-danger px-2 py-1 text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                  Official Communiqués
                </span>
                <h6 className="mb-0 fw-bold text-dark">
                  Public Notices &amp; Administrative Circulars
                </h6>
              </div>
              <span className="small text-muted fw-semibold">
                Showing {filtered.length} notices
              </span>
            </div>

            <div className="list-group list-group-flush">
              {paginatedArticles.map((article, index) => {
                const targetUrl = `/announcements/${encodeURIComponent(article.slug || article.id)}`;

                return (
                  <div
                    key={article.id}
                    className="list-group-item p-4 p-md-4 transition-all"
                    style={{ borderBottom: '1px solid #EDF2F7', backgroundColor: '#FFFFFF' }}
                  >
                    <div className="row g-3 align-items-center">
                      {/* Left: Date Badge */}
                      <div className="col-auto">
                        <div
                          className="d-flex flex-column align-items-center justify-content-center rounded-3 border bg-light px-3 py-2 text-center"
                          style={{ minWidth: '78px', borderColor: '#E2E8F0' }}
                        >
                          <i className="fas fa-calendar-day text-primary mb-1" style={{ fontSize: '0.85rem' }} />
                          <span className="fw-bold text-dark small" style={{ fontSize: '0.75rem', lineHeight: 1.2 }}>
                            {article.date || 'Notice'}
                          </span>
                        </div>
                      </div>

                      {/* Middle: Content & Metadata */}
                      <div className="col">
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                          <span
                            className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle text-uppercase fw-bold"
                            style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}
                          >
                            {article.category || 'Official Notice'}
                          </span>
                          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            <i className="fas fa-shield-alt text-primary opacity-75 me-1" />
                            National Paralympic Committee
                          </span>
                        </div>

                        <h5 className="fw-bold mb-1" style={{ fontSize: '1.05rem', lineHeight: 1.4 }}>
                          <Link
                            href={targetUrl}
                            className="text-dark text-decoration-none hover-primary"
                          >
                            {article.title}
                          </Link>
                        </h5>

                        <p className="text-muted small mb-0" style={{ lineHeight: 1.5 }}>
                          {article.desc}
                        </p>
                      </div>

                      {/* Right: Action Button */}
                      <div className="col-12 col-md-auto text-md-end mt-2 mt-md-0">
                        <Link
                          href={targetUrl}
                          className="btn btn-sm btn-outline-primary fw-bold px-3 py-2 d-inline-flex align-items-center gap-2 rounded-3 text-nowrap"
                          style={{ fontSize: '0.82rem' }}
                        >
                          <span>Read Full Notice</span>
                          <i className="fas fa-arrow-right" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card-footer bg-light px-4 py-3 border-top d-flex flex-wrap justify-content-between align-items-center text-muted small">
              <div>
                <i className="fas fa-certificate text-primary me-1" />
                All notices published here represent official administrative communication of NPC Rwanda.
              </div>
              <div className="fw-semibold">
                Official NPC Rwanda Gazette Registry
              </div>
            </div>
          </div>
        ) : (
          /* Cards Grid View */
          <div className="row g-4 mb-4" data-aos="fade-up">
            {paginatedArticles.map(article => {
              const targetUrl = `/announcements/${encodeURIComponent(article.slug || article.id)}`;

              return (
                <div key={article.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 shadow-sm border rounded-4 bg-white p-4 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="badge bg-danger bg-opacity-10 text-danger border border-danger-subtle px-2 py-1 text-uppercase fw-bold" style={{ fontSize: '0.7rem' }}>
                          {article.category || 'Announcement'}
                        </span>
                        <small className="text-muted fw-semibold" style={{ fontSize: '0.75rem' }}>
                          <i className="fas fa-calendar me-1" /> {article.date}
                        </small>
                      </div>

                      <h5 className="fw-bold text-dark mb-2 leading-snug" style={{ fontSize: '1rem', minHeight: '44px' }}>
                        <Link href={targetUrl} className="text-dark text-decoration-none hover-primary">
                          {article.title}
                        </Link>
                      </h5>

                      <p className="text-muted small mb-4" style={{ minHeight: '44px', lineHeight: 1.5 }}>
                        {article.desc}
                      </p>
                    </div>

                    <div className="border-top pt-3 mt-auto">
                      <Link
                        href={targetUrl}
                        className="btn btn-sm btn-outline-primary w-100 fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                      >
                        <span>Read Full Announcement</span>
                        <i className="fas fa-arrow-right" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {paginatedArticles.length > 0 && totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              currentPage={visiblePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* Official Notice Note */}
        <div className="p-4 rounded-4 border bg-white shadow-xs d-flex flex-column flex-md-row gap-3 align-items-center justify-content-between mt-4">
          <div className="d-flex align-items-center gap-3">
            <div className="rounded-circle p-3 bg-danger bg-opacity-10 text-danger">
              <i className="fas fa-stamp fa-2x" />
            </div>
            <div>
              <h6 className="fw-bold mb-1 text-dark">Official Communication Protocol</h6>
              <p className="text-muted small mb-0">
                To verify an announcement, request certified circulars, or submit press inquiries, reach out to the Executive Bureau.
              </p>
            </div>
          </div>
          <Link href="/contact" className="btn btn-outline-primary btn-sm px-4 py-2 fw-bold text-nowrap rounded-3">
            Contact Bureau <i className="fas fa-arrow-right ms-1" />
          </Link>
        </div>

      </div>
    </main>
  );
}
