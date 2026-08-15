'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import Pagination from '@/components/Pagination';

const CATEGORIES = ['All', 'Competition', 'Training', 'Governance', 'Community', 'International'];

export default function NewsPage() {
  const { t } = useTranslation();
  const { news } = useData();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 6;

  const published = news.filter(n => n.status === 'Published' || !n.status);
  const featured  = published[0];
  const rest      = published.slice(1);

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
      <header
        className="py-5 text-white"
        style={{
          background: "linear-gradient(rgba(10,30,80,0.72), rgba(0,114,198,0.65)), url('/assets/img/curated/news-hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container py-3">
          <span className="badge text-uppercase fw-bold mb-3" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', letterSpacing: '1px', fontSize: '0.75rem' }}>
            <i className="fas fa-newspaper me-2"></i>Newsroom
          </span>
          <h1 className="text-white mb-2" data-aos="fade-up">{t('phrase.Latest News & Updates')}</h1>
          <p className="text-white opacity-75 mb-3" data-aos="fade-up" data-aos-delay="100" style={{ maxWidth: '520px' }}>
            Stay informed with the latest news, updates, and stories from NPC Rwanda.
          </p>
          <nav aria-label="breadcrumb" data-aos="fade-up" data-aos-delay="150">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link href="/" className="text-white text-decoration-none">{t('nav.home')}</Link></li>
              <li className="breadcrumb-item active text-white opacity-75" aria-current="page">{t('nav.news')}</li>
            </ol>
          </nav>
        </div>
      </header>

      <section>
        <div className="container">

          {/* Featured Article */}
          {featured && (
            <div className="mb-5" data-aos="fade-up">
              <div className="row g-0 custom-card overflow-hidden" style={{ border: '2px solid #E8EDF5' }}>
                <div className="col-lg-6">
                  <img
                    src={`/assets/img/curated/${featured.img}`}
                    alt={featured.title}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover', minHeight: '300px' }}
                  />
                </div>
                <div className="col-lg-6 d-flex flex-column justify-content-center p-4 p-lg-5">
                  <span className="badge mb-3 fw-bold text-uppercase" style={{ background: '#DBEAFE', color: '#1D4ED8', width: 'fit-content', fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                    <i className="fas fa-star me-1"></i> Featured Story
                  </span>
                  <span className="small text-muted mb-2"><i className="fas fa-tag me-1"></i>{featured.category}</span>
                  <h2 className="h4 fw-bold mb-3">{featured.title}</h2>
                  <p className="text-muted mb-4" style={{ lineHeight: 1.7 }}>{featured.desc}</p>
                  <div className="d-flex align-items-center gap-3">
                    <span className="small text-muted"><i className="fas fa-calendar me-1"></i>{featured.date}</span>
                    <Link href={`/news/${featured.slug}`} className="btn btn-primary btn-sm px-4 fw-semibold">
                      {t('phrase.Read More')} <i className="fas fa-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Search & Filters */}
          <div className="row g-3 align-items-center mb-4" data-aos="fade-up">
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-0">
                  <i className="fas fa-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-0 py-2"
                  placeholder="Search news..."
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
            <div className="col-md-7">
              <div className="d-flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setCurrentPage(1);
                    }}
                    className="btn btn-sm"
                    style={{
                      borderRadius: '999px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      background: activeCategory === cat ? 'var(--primary-blue)' : '#F1F5F9',
                      color: activeCategory === cat ? '#fff' : 'var(--text-dark)',
                      border: 'none',
                      transition: 'all 0.2s',
                    }}
                  >{cat}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          {published.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-newspaper text-muted mb-3" style={{ fontSize: '3rem' }}></i>
              <h3 className="h5 text-muted">No articles published yet</h3>
              <p className="text-muted small">Check back soon for the latest news from NPC Rwanda.</p>
            </div>
          ) : filtered.length === 0 && (search || activeCategory !== 'All') ? (
            <div className="text-center py-5">
              <i className="fas fa-search text-muted mb-3" style={{ fontSize: '3rem' }}></i>
              <h3 className="h5 text-muted">No results found</h3>
              <p className="text-muted small">Try a different search term or category.</p>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {paginatedArticles.map((article, i) => (
                  <div key={article.slug} className="col-lg-4 col-md-6" data-aos="fade-up" data-aos-delay={`${(i % 3) * 100}`}>
                    <div className="custom-card news-card h-100 d-flex flex-column">
                      <div className="news-img position-relative">
                        <img
                          src={`/assets/img/curated/${article.img}`}
                          alt={article.title}
                          className="img-fluid w-100"
                          style={{ height: '200px', objectFit: 'cover' }}
                        />
                        <span
                          className="badge position-absolute top-0 end-0 m-2 fw-semibold"
                          style={{ background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '0.7rem' }}
                        >
                          {article.category}
                        </span>
                      </div>
                      <div className="p-4 d-flex flex-column flex-grow-1">
                        <div className="news-date mb-2"><i className="fas fa-calendar-alt me-1 opacity-60"></i>{article.date}</div>
                        <h4 className="h6 fw-bold mb-2 flex-grow-1">{article.title}</h4>
                        <p className="small text-muted mb-3">{article.desc}</p>
                        <Link href={`/news/${article.slug}`} className="text-primary fw-bold text-decoration-none small mt-auto">
                          <span>{t('phrase.Read More')}</span> <i className="fas fa-arrow-right ms-1" aria-hidden="true"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Pagination currentPage={visiblePage} totalPages={totalPages} onPageChange={setCurrentPage} ariaLabel="News pagination" />
            </>
          )}

          {/* Events CTA */}
          <div className="text-center mt-5 pt-3 pb-4" data-aos="fade-up">
            <div className="custom-card p-4 p-md-5 d-inline-flex flex-column flex-md-row align-items-center gap-4" style={{ border: '1px solid #BFDBFE', background: '#EFF6FF', maxWidth: '700px', width: '100%' }}>
              <div className="text-primary" style={{ fontSize: '3rem' }}>
                <i className="fas fa-calendar-alt"></i>
              </div>
              <div className="text-start">
                <h3 className="h5 fw-bold mb-1 text-dark">Looking for our Events?</h3>
                <p className="small text-muted mb-3">View the full calendar of upcoming competitions, training camps, and conferences.</p>
                <Link href="/events" className="btn btn-primary fw-semibold px-4">
                  <i className="fas fa-calendar me-2"></i>View Events Calendar
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>
    </main>
  );
}
