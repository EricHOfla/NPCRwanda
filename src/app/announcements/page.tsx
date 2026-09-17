'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import Pagination from '@/components/Pagination';

const CATEGORIES = ['All', 'Announcement', 'Notice', 'Update', 'Important'];

export default function AnnouncementsPage() {
  const { t } = useTranslation();
  const { news } = useData();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  // Filter for announcements (show all published news articles as announcements)
  const announcements = news.filter(n => n.status === 'Published' || !n.status);
  const featured = announcements[0];
  const rest = announcements.slice(1);

  const filtered = rest.filter(article => {
    const catMatch = activeCategory === 'All' || article.category === activeCategory;
    const searchMatch = !search || article.title.toLowerCase().includes(search.toLowerCase()) || article.desc.toLowerCase().includes(search.toLowerCase());
    return catMatch && searchMatch;
  });
  
  const visibleArticles = search || activeCategory !== 'All' ? filtered : rest;
  const totalPages = Math.ceil(visibleArticles.length / ITEMS_PER_PAGE);
  const visiblePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedArticles = visibleArticles.slice((visiblePage - 1) * ITEMS_PER_PAGE, visiblePage * ITEMS_PER_PAGE);

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
              <li className="breadcrumb-item active" aria-current="page">Announcements</li>
            </ol>
          </nav>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">Latest Announcements &amp; Updates</h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100">
            Stay informed with official announcements, notices, and important updates from NPC Rwanda.
          </p>
        </div>
      </header>

      {/* Featured Announcement */}
      {featured && (
        <section className="py-5 bg-light">
          <div className="container">
            <h2 className="h5 fw-bold text-muted mb-4 text-uppercase">Featured Announcement</h2>
            <Link href={`/announcements/${featured.slug || featured.id}`} className="text-decoration-none">
              <div className="card shadow-sm h-100 border-0" style={{ overflow: 'hidden', cursor: 'pointer' }}>
                <div className="row g-0">
                  <div className="col-md-5">
                    <img
                      src={featured.img?.startsWith('http') || featured.img?.startsWith('/') ? featured.img : `/assets/img/${featured.img}`}
                      alt={featured.title}
                      className="img-fluid"
                      style={{ height: '280px', objectFit: 'cover' }}
                    />
                  </div>
                  <div className="col-md-7">
                    <div className="card-body d-flex flex-column justify-content-between h-100 p-4">
                      <div>
                        <span className="badge bg-primary mb-2">{featured.category}</span>
                        <h3 className="card-title h5 fw-bold text-dark mb-2">{featured.title}</h3>
                        <p className="card-text text-muted small mb-3">{featured.desc}</p>
                      </div>
                      <div>
                        <small className="text-muted d-block mb-2">
                          <i className="fas fa-calendar me-1"></i> {featured.date}
                        </small>
                        <button className="btn btn-primary btn-sm">
                          <i className="fas fa-arrow-right me-1"></i> Read Full Announcement
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Filters & Search */}
      <section className="py-4 border-bottom">
        <div className="container">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <input
                type="text"
                className="form-control form-control-lg"
                placeholder="Search announcements..."
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="col-md-6">
              <div className="d-flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setCurrentPage(1);
                    }}
                    className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ fontSize: '0.85rem' }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Grid */}
      <section className="py-5">
        <div className="container">
          <div className="row g-4">
            {paginatedArticles.length > 0 ? (
              paginatedArticles.map(article => (
                <div key={article.id} className="col-md-6 col-lg-4">
                  <Link href={`/announcements/${article.slug || article.id}`} className="text-decoration-none">
                    <div className="card h-100 shadow-sm border-0" style={{ cursor: 'pointer', transition: 'transform 0.3s, box-shadow 0.3s' }}>
                      <img
                        src={article.img?.startsWith('http') || article.img?.startsWith('/') ? article.img : `/assets/img/${article.img}`}
                        alt={article.title}
                        className="card-img-top"
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                      <div className="card-body d-flex flex-column">
                        <span className="badge bg-info mb-2" style={{ width: 'fit-content' }}>{article.category}</span>
                        <h5 className="card-title fw-bold text-dark mb-2" style={{ minHeight: '3rem' }}>{article.title}</h5>
                        <p className="card-text text-muted small mb-3" style={{ minHeight: '3rem' }}>{article.desc}</p>
                        <div className="mt-auto">
                          <small className="text-muted d-block">
                            <i className="fas fa-calendar me-1"></i> {article.date}
                          </small>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="col-12 text-center py-5">
                <i className="fas fa-inbox fa-3x mb-3 text-muted" style={{ opacity: 0.5 }}></i>
                <p className="text-muted">No announcements found. Please try different search criteria.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {paginatedArticles.length > 0 && totalPages > 1 && (
            <Pagination
              currentPage={visiblePage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </section>
    </main>
  );
}
