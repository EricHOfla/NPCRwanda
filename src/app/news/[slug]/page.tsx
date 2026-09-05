'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

export default function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const unwrappedParams = params && typeof (params as Promise<{ slug: string }>).then === 'function' 
    ? React.use(params as Promise<{ slug: string }>) 
    : (params as { slug: string });
  const slug = unwrappedParams?.slug;
  const { t } = useTranslation();
  const { news } = useData();

  const article = news.find(n => n.slug === slug);

  if (!article) {
    return (
      <main className="py-5 text-center">
        <div className="container py-5">
          <i className="fas fa-exclamation-circle text-danger fa-3x mb-3"></i>
          <h1 className="h3 mb-3">Article Not Found</h1>
          <p className="text-muted">The news article you are looking for does not exist or has been removed.</p>
          <Link href="/news" className="btn btn-primary mt-3">
            <i className="fas fa-arrow-left me-2"></i>Back to Newsroom
          </Link>
        </div>
      </main>
    );
  }

  // Fallback to description if rich content is empty
  const displayContent = article.content || article.desc;

  return (
    <main id="main-content">
      {/* Header */}
      <header
        className="py-5 text-white bg-contain"
        style={{
          background: "linear-gradient(rgba(10,30,80,0.78), rgba(0,114,198,0.7)), url('/assets/img/curated/news-hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container py-3">
          <Link href="/news" className="text-white text-decoration-none small fw-bold mb-3 d-inline-block">
            <i className="fas fa-arrow-left me-2"></i>Back to Newsroom
          </Link>
          <h1 className="text-white mb-2" data-aos="fade-up">{article.title}</h1>
          <div className="d-flex align-items-center gap-3 mt-3 text-white-50 small">
            <span><i className="fas fa-calendar-alt me-1"></i>{article.date}</span>
            <span>|</span>
            <span className="badge bg-primary text-white text-uppercase px-2 py-1" style={{ fontSize: '0.72rem' }}>
              {article.category}
            </span>
          </div>
        </div>
      </header>

      {/* Article Content */}
      <section className="py-5">
        <div className="container">
          <div className="row g-5 justify-content-center">
            <div className="col-lg-8" data-aos="fade-up">
              <div className="mb-4 overflow-hidden rounded-4 shadow-medium">
                <img
                  src={article.img.startsWith('http') || article.img.startsWith('/') ? article.img : `/assets/img/curated/${article.img}`}
                  alt={article.title}
                  className="w-100 img-fluid"
                  style={{ maxHeight: '480px', objectFit: 'cover' }}
                />
              </div>

              {/* Rich Body text */}
              <article 
                className="article-body text-dark py-3" 
                style={{ fontSize: '1.1rem', lineHeight: '1.8', textAlign: 'justify' }}
              >
                {displayContent.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </article>

              <hr className="my-5" />

              {/* Share block */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-2">
                  <span className="small text-muted fw-semibold">Share this story:</span>
                  <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary rounded-circle">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-secondary rounded-circle">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                </div>
                <Link href="/news" className="btn btn-outline-primary btn-sm fw-semibold">
                  <i className="fas fa-th-list me-1"></i>All Stories
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
