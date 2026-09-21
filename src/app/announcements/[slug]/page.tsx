'use client';

import React from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function AnnouncementDetailPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const unwrappedParams = params && typeof (params as Promise<{ slug: string }>).then === 'function' 
    ? React.use(params as Promise<{ slug: string }>) 
    : (params as { slug: string });
  const slug = unwrappedParams?.slug;
  const { news, loading } = useData();

  const article = news.find(n => n.slug === slug);

  if (loading) {
    return (
      <main className="py-5 text-center">
        <div className="container py-5 my-5">
          <i className="fas fa-spinner fa-spin text-primary fa-3x mb-3"></i>
          <h2 className="h4 text-dark fw-bold mb-2">Loading Announcement...</h2>
          <p className="text-muted small">Fetching official statement from National Paralympic Committee of Rwanda.</p>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="py-5 text-center">
        <div className="container py-5">
          <i className="fas fa-exclamation-circle text-danger fa-3x mb-3"></i>
          <h1 className="h3 mb-3">Announcement Not Found</h1>
          <p className="text-muted">The announcement you are looking for does not exist or has been removed.</p>
          <Link href="/announcements" className="btn btn-primary mt-3">
            <i className="fas fa-arrow-left me-2"></i>Back to Announcements
          </Link>
        </div>
      </main>
    );
  }

  const displayContent = article.content || article.desc;

  return (
    <main id="main-content">
      {/* Header */}
      <header
        className="py-5 text-white bg-contain"
        style={{
          background: "linear-gradient(rgba(10,30,80,0.85), rgba(0,114,198,0.8)), url('/assets/img/curated/news-hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container py-3">
          <Link href="/announcements" className="text-white text-decoration-none small fw-bold mb-3 d-inline-block">
            <i className="fas fa-arrow-left me-2"></i>Back to Announcements
          </Link>
          <h1 className="text-white mb-2" data-aos="fade-up">{article.title}</h1>
          <div className="d-flex align-items-center gap-3 mt-3 text-white-50 small">
            <span><i className="fas fa-calendar-alt me-1"></i>{article.date}</span>
            <span>|</span>
            <span className="badge bg-warning text-dark text-uppercase px-2 py-1" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
              {article.category || 'Official Announcement'}
            </span>
          </div>
        </div>
      </header>

      {/* Article Body */}
      <article className="py-5">
        <div className="container" style={{ maxWidth: '800px' }}>
          {article.img && (
            <div className="mb-4 rounded-4 overflow-hidden shadow-sm" style={{ maxHeight: '420px' }}>
              <img
                src={article.img.startsWith('/') ? article.img : `/assets/img/${article.img}`}
                alt={article.title}
                className="w-100 h-100 object-fit-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          )}

          {article.desc && (
            <p className="lead fw-medium text-secondary mb-4 pb-3 border-bottom" style={{ lineHeight: 1.7 }}>
              {article.desc}
            </p>
          )}

          <MarkdownRenderer content={displayContent} style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#334155' }} />

          {/* Share / Back */}
          <div className="d-flex justify-content-between align-items-center pt-5 mt-5 border-top">
            <Link href="/announcements" className="btn btn-outline-primary fw-semibold px-4">
              <i className="fas fa-arrow-left me-2"></i>All Announcements
            </Link>
            <Link href="/news" className="btn btn-primary fw-semibold px-4">
              View Newsroom <i className="fas fa-arrow-right ms-2"></i>
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
