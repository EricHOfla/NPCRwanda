'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import Pagination from '@/components/Pagination';
import { isAnnouncementCategory } from '@/lib/newsUtils';

function imageUrl(value?: string) {
  const image = (value || '').trim();
  if (!image) return '/assets/img/curated/sports-hero.jpg';
  if (/^(https?:\/\/|\/)/i.test(image)) return image;
  return `/assets/img/curated/${image}`;
}

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function NewsImage({ src, alt, height = 220 }: { src?: string; alt: string; height?: number }) {
  const [failed, setFailed] = useState(false);
  return <div className="position-relative overflow-hidden" style={{ height, background: 'linear-gradient(135deg,#092B52,#1267B1)' }}>
    {!failed ? <img src={imageUrl(src)} alt={alt} className="w-100 h-100" style={{ objectFit: 'cover' }} onError={() => setFailed(true)} /> : <div className="w-100 h-100 d-flex align-items-center justify-content-center"><i className="fas fa-newspaper" style={{ fontSize: '4rem', color: 'rgba(255,255,255,.45)' }} /></div>}
  </div>;
}

export default function NewsPage() {
  const { news, loading, error } = useData();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const published = useMemo(() => news.filter(item => item.status === 'Published' && !isAnnouncementCategory(item.category || '')), [news]);
  const categories = useMemo(() => ['All', ...Array.from(new Set(published.map(item => item.category).filter(Boolean)))], [published]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return published.filter(item => {
      const matchesCategory = category === 'All' || item.category.toLowerCase() === category.toLowerCase();
      const matchesSearch = !term || [item.title, item.desc, item.category, item.content].some(value => String(value || '').toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [published, category, search]);

  const isFiltering = Boolean(search.trim() || category !== 'All');
  const featured = !isFiltering ? published[0] : null;
  const articles = !isFiltering ? filtered.filter(item => item.id !== featured?.id) : filtered;
  const pageSize = 6;
  const pages = Math.ceil(articles.length / pageSize);
  const currentPage = Math.min(page, Math.max(pages, 1));
  const pageItems = articles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetFilters = () => { setCategory('All'); setSearch(''); setPage(1); };

  return (
    <main id="main-content" className="npc-news-page">
      <header className="page-header">
        <div className="container">
          <nav aria-label="breadcrumb" data-aos="fade-up">
            <ol className="breadcrumb mb-3"><li className="breadcrumb-item"><Link href="/">Home</Link></li><li className="breadcrumb-item active" aria-current="page">News &amp; Updates</li></ol>
          </nav>
          <div className="row align-items-end g-4">
            <div className="col-lg-8">
              <span className="d-inline-flex align-items-center gap-2 text-uppercase fw-bold mb-3" style={{ color: '#7BD6A7', letterSpacing: '1.8px', fontSize: '.76rem' }}><span style={{ width: 28, height: 2, background: '#7BD6A7' }} />Stories from our movement</span>
              <h1 className="page-title mb-3">News &amp; Updates</h1>
              <p className="page-subtitle mb-0" style={{ maxWidth: 690 }}>The latest stories, achievements, announcements and developments from NPC Rwanda and our Paralympic community.</p>
            </div>
            <div className="col-lg-4 text-lg-end"><Link href="/events" className="btn btn-light rounded-pill px-4 py-3 fw-bold">Explore events <i className="fas fa-arrow-right ms-2" /></Link></div>
          </div>
        </div>
      </header>

      <section className="py-4" style={{ background: '#0B2C50', color: '#fff' }}>
        <div className="container">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-3"><span className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 46, height: 46, background: 'rgba(255,255,255,.11)', color: '#9BE0B8' }}><i className="fas fa-newspaper fs-5" /></span><div><div className="fs-4 fw-bold lh-1">{published.length}</div><div className="small opacity-75 mt-1">Published stories</div></div></div>
            <div className="small opacity-75"><i className="fas fa-bullhorn me-2" />Updates from across the NPC Rwanda community</div>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          {featured && (
            <div className="mb-5">
              <div className="d-flex align-items-end justify-content-between gap-3 mb-4"><div><span className="text-uppercase fw-bold small" style={{ color: '#16845B', letterSpacing: '1.5px' }}>In focus</span><h2 className="h3 fw-bold mt-1 mb-0">Latest featured story</h2></div><span className="small text-muted">Editor’s highlight</span></div>
              <article className="custom-card overflow-hidden border-0 shadow-sm">
                <div className="row g-0">
                  <div className="col-lg-7"><NewsImage src={featured.img} alt={featured.title} height={390} /></div>
                  <div className="col-lg-5 d-flex flex-column justify-content-center p-4 p-lg-5">
                    <span className="badge rounded-pill px-3 py-2 mb-3 align-self-start" style={{ background: '#E6F4EC', color: '#147449' }}><i className="fas fa-star me-1" />Featured story</span>
                    <div className="small text-uppercase fw-bold text-muted mb-2" style={{ letterSpacing: '.8px' }}>{featured.category || 'NPC Rwanda'} <span className="mx-2">•</span> {formatDate(featured.date)}</div>
                    <h2 className="h3 fw-bold mb-3">{featured.title}</h2>
                    <p className="text-muted mb-4" style={{ lineHeight: 1.8 }}>{featured.desc}</p>
                    <Link href={`/news/${encodeURIComponent(featured.slug || featured.id)}`} className="btn btn-primary rounded-pill px-4 py-3 fw-bold align-self-start">Read the story <i className="fas fa-arrow-right ms-2" /></Link>
                  </div>
                </div>
              </article>
            </div>
          )}

          <div className="rounded-4 p-3 p-lg-4 mb-4" style={{ background: '#F3F6FA', border: '1px solid #E4EAF1' }}>
            <div className="row g-3 align-items-end">
              <div className="col-lg-5">
                <label htmlFor="news-search" className="form-label small fw-bold text-uppercase text-muted">Search stories</label>
                <div className="input-group"><span className="input-group-text bg-white border-end-0"><i className="fas fa-search text-muted" /></span><input id="news-search" type="search" className="form-control bg-white border-start-0" placeholder="Search news, topics or keywords" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />{search && <button type="button" className="btn btn-outline-secondary bg-white" onClick={() => { setSearch(''); setPage(1); }}>Clear</button>}</div>
              </div>
              <div className="col-lg-7">
                <label className="form-label small fw-bold text-uppercase text-muted">Browse by topic</label>
                <div className="d-flex flex-wrap gap-2">
                  {categories.map(value => <button type="button" key={value} onClick={() => { setCategory(value); setPage(1); }} className="btn btn-sm rounded-pill px-3" style={{ background: category === value ? '#0B4F91' : '#fff', color: category === value ? '#fff' : '#334155', border: '1px solid #D8E0E9', fontWeight: 600 }}>{value === 'All' ? 'All stories' : value}</button>)}
                </div>
              </div>
              <div className="col-12 d-flex justify-content-between align-items-center gap-2"><span className="small text-muted" aria-live="polite">{loading && news.length === 0 ? 'Loading stories…' : `${filtered.length} stor${filtered.length === 1 ? 'y' : 'ies'} found`}</span>{isFiltering && <button type="button" className="btn btn-link btn-sm text-decoration-none" onClick={resetFilters}>Clear filters</button>}</div>
            </div>
          </div>

          {loading && news.length === 0 ? (
            <div className="text-center py-5" role="status"><div className="spinner-border text-primary mb-3" /><p className="text-muted mb-0">Loading news…</p></div>
          ) : error && news.length === 0 ? (
            <div className="text-center rounded-4 py-5 px-3" style={{ background: '#F7F9FC' }}><i className="fas fa-newspaper fs-1 text-muted mb-3" /><h2 className="h5">News is temporarily unavailable</h2><p className="text-muted mb-0">Please try again shortly.</p></div>
          ) : published.length === 0 ? (
            <div className="text-center rounded-4 py-5 px-3" style={{ background: '#F7F9FC' }}><i className="fas fa-newspaper fs-1 text-muted mb-3" /><h2 className="h5">No stories published yet</h2><p className="text-muted mb-0">Please check back soon for updates from NPC Rwanda.</p></div>
          ) : articles.length === 0 ? (
            <div className="text-center rounded-4 py-5 px-3" style={{ background: '#F7F9FC' }}><i className="fas fa-magnifying-glass fs-1 text-muted mb-3" /><h2 className="h5">No matching stories</h2><p className="text-muted mb-0">Try another keyword or topic.</p></div>
          ) : (
            <>
              <div className="d-flex align-items-end justify-content-between gap-3 mb-4"><div><span className="text-uppercase fw-bold small" style={{ color: '#16845B', letterSpacing: '1.5px' }}>From NPC Rwanda</span><h2 className="h3 fw-bold mt-1 mb-0">More stories</h2></div><span className="small text-muted">{articles.length} articles</span></div>
              <div className="row g-4">
                {pageItems.map(article => (
                  <div className="col-md-6 col-xl-4" key={article.id || article.slug}>
                    <article className="custom-card h-100 overflow-hidden border-0 shadow-sm d-flex flex-column">
                      <div className="position-relative"><NewsImage src={article.img} alt={article.title} height={220} /><span className="position-absolute bottom-0 start-0 m-3 badge rounded-pill px-3 py-2" style={{ background: 'rgba(7,25,48,.82)', color: '#fff' }}>{article.category || 'News'}</span></div>
                      <div className="p-4 d-flex flex-column flex-grow-1">
                        <div className="small text-muted mb-2"><i className="fas fa-calendar-alt me-2 text-primary" />{formatDate(article.date)}</div>
                        <h3 className="h5 fw-bold mb-2">{article.title}</h3>
                        <p className="small text-muted flex-grow-1" style={{ lineHeight: 1.75 }}>{article.desc}</p>
                        <Link href={`/news/${encodeURIComponent(article.slug || article.id)}`} className="fw-bold text-primary text-decoration-none mt-2">Read story <i className="fas fa-arrow-right ms-1" /></Link>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={pages} onPageChange={setPage} ariaLabel="News pagination" />
            </>
          )}
        </div>
      </section>

      <section className="pb-5"><div className="container"><div className="rounded-4 p-4 p-lg-5 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4" style={{ background: 'linear-gradient(120deg,#0B2C50,#145A91)', color: '#fff' }}><div><span className="small text-uppercase fw-bold" style={{ color: '#9BE0B8', letterSpacing: '1.5px' }}>Stay connected</span><h2 className="h3 fw-bold mt-2 mb-2">Follow the journey of Team Rwanda</h2><p className="mb-0 opacity-75">Discover upcoming competitions, athlete stories and opportunities to support inclusive sport.</p></div><Link href="/events" className="btn btn-light rounded-pill px-4 py-3 fw-bold flex-shrink-0">View events <i className="fas fa-arrow-right ms-2" /></Link></div></div></section>
    </main>
  );
}
