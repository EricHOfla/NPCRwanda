'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

const getSportImageSrc = (image?: string) => {
  if (!image) return '/assets/img/curated/index-sport-1.jpg';
  if (image.startsWith('/') || image.startsWith('http')) return image;
  if (image.includes('/')) return `/${image}`;
  return `/assets/img/curated/${image}`;
};

export default function SportDetailsPage() {
  const params = useParams<{ slug: string }>();
  const { t } = useTranslation();
  const { sports, athletes, loading, error } = useData();
  const slug = decodeURIComponent(params.slug || '');
  const sport = sports.find(item => item.slug === slug || item.id === slug);
  const relatedAthletes = sport
    ? athletes.filter(athlete => athlete.sport === sport.title || t(athlete.sport) === t(sport.title))
    : [];

  if (loading && !sport) {
    return (
      <main id="main-content" className="container py-5 text-center" aria-live="polite">
        <div className="spinner-border text-primary mb-3" role="status" aria-label="Loading sport details" />
        <p className="text-muted mb-0">Loading sports program...</p>
      </main>
    );
  }

  if (!sport) {
    return (
      <main id="main-content" className="container py-5 text-center">
        <i className="fas fa-medal text-muted mb-3" aria-hidden="true" style={{ fontSize: '3rem' }} />
        <h1 className="h3">Sports program not found</h1>
        <p className="text-muted">{error ? 'Sports programs are temporarily unavailable.' : 'This program may have been unpublished or moved.'}</p>
        <Link href="/sports" className="btn btn-primary mt-2">Back to sports programs</Link>
      </main>
    );
  }

  return (
    <main id="main-content" className="sport-detail-page">
      <header className="page-header">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item"><Link href="/sports">{t('phrase.Sports')}</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{t(sport.title)}</li>
            </ol>
          </nav>
          <h1 className="page-title mb-2">{t(sport.title)}</h1>
          <p className="page-subtitle">Learn about this para-sport and how it contributes to inclusive sport in Rwanda.</p>
        </div>
      </header>

      <section className="py-5">
        <div className="container">
          <div className="row g-4 g-lg-5 align-items-start">
            <div className="col-lg-7">
              <div className="sport-detail-image-wrap">
                <img
                  src={getSportImageSrc(sport.img)}
                  alt={t(sport.title)}
                  className="sport-detail-image"
                  onError={event => { (event.currentTarget as HTMLImageElement).src = '/assets/img/curated/index-sport-1.jpg'; }}
                />
              </div>
            </div>
            <div className="col-lg-5">
              <span className="sport-detail-eyebrow"><i className="fas fa-medal me-2" aria-hidden="true" />NPC Rwanda Sports Program</span>
              <h2 className="h3 fw-bold mt-3 mb-3">{t(sport.title)}</h2>
              <div className="sport-detail-description text-muted">{t(sport.desc)}</div>
              <div className="d-flex flex-wrap gap-2 mt-4">
                <Link href="/athletes" className="btn btn-primary">Meet our athletes <i className="fas fa-arrow-right ms-2" aria-hidden="true" /></Link>
                <Link href="/events" className="btn btn-outline-primary">View competitions</Link>
              </div>
            </div>
          </div>

          <div className="sport-detail-athletes mt-5 pt-4">
            <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
              <div>
                <p className="text-uppercase fw-bold small text-primary mb-2">People behind the sport</p>
                <h2 className="h3 fw-bold mb-0">Athletes in {t(sport.title)}</h2>
              </div>
              <Link href="/athletes" className="text-primary fw-semibold text-decoration-none">View all athletes <i className="fas fa-arrow-right ms-1" aria-hidden="true" /></Link>
            </div>
            {relatedAthletes.length === 0 ? (
              <div className="sport-detail-empty rounded-4 p-4 p-md-5 text-center">
                <i className="fas fa-users text-primary mb-3" aria-hidden="true" style={{ fontSize: '2rem' }} />
                <h3 className="h5 fw-bold">Athlete profiles coming soon</h3>
                <p className="text-muted mb-0">NPC Rwanda can add athletes for this discipline through the existing admin dashboard.</p>
              </div>
            ) : (
              <div className="row g-3">
                {relatedAthletes.slice(0, 6).map(athlete => (
                  <div className="col-sm-6 col-lg-4" key={athlete.id}>
                    <Link href={`/athletes/${encodeURIComponent(athlete.id)}`} className="sport-detail-athlete-card">
                      <img
                        src={athlete.avatar?.startsWith('http') || athlete.avatar?.startsWith('/') ? athlete.avatar : athlete.avatar ? `/assets/img/${athlete.avatar}` : '/assets/img/avatar-1.svg'}
                        alt=""
                        loading="lazy"
                        onError={event => { (event.currentTarget as HTMLImageElement).src = '/assets/img/avatar-1.svg'; }}
                      />
                      <span className="min-w-0">
                        <strong>{athlete.name}</strong>
                        <small>{athlete.country || 'Rwanda'}</small>
                      </span>
                      <i className="fas fa-arrow-right ms-auto" aria-hidden="true" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
