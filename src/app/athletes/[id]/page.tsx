'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

export default function AthleteProfilePage() {
  const params = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { athletes, loading } = useData();
  const id = decodeURIComponent(params.id);
  const athlete = athletes.find((item) => item.id === id);

  const imageSrc = athlete?.avatar?.trim()
    ? (athlete.avatar.startsWith('http') || athlete.avatar.startsWith('/') || athlete.avatar.startsWith('data:')
        ? athlete.avatar
        : `/assets/img/${athlete.avatar}`)
    : '/assets/img/avatar-1.svg';

  if (loading && !athlete) {
    return (
      <main id="main-content" className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading athlete profile...</span>
        </div>
        <p className="text-muted mb-0">Loading athlete profile...</p>
      </main>
    );
  }

  if (!athlete) {
    return (
      <main id="main-content" className="container py-5">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/athletes">Athletes</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Profile not found</li>
          </ol>
        </nav>
        <div className="text-center py-5">
          <i className="fas fa-user-slash text-muted mb-3" aria-hidden="true" style={{ fontSize: '3rem' }} />
          <h1 className="h3">Athlete profile not found</h1>
          <p className="text-muted">This profile may have been removed or is no longer available.</p>
          <Link href="/athletes" className="btn btn-primary rounded-pill px-4">Browse athletes</Link>
        </div>
      </main>
    );
  }

  const isInactive = athlete.status === 'Inactive';

  return (
    <main id="main-content">
      <header className="page-header">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-3">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item"><Link href="/athletes">Athletes</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{athlete.name}</li>
            </ol>
          </nav>
          <p className="text-uppercase fw-bold small mb-2" style={{ letterSpacing: '0.08em' }}>NPC Rwanda athlete profile</p>
          <h1 className="page-title mb-2">{athlete.name}</h1>
          <p className="page-subtitle mb-0">Learn more about the athlete and their sporting discipline.</p>
        </div>
      </header>

      <section className="py-5">
        <div className="container">
          <div className="row g-4 g-lg-5 align-items-start">
            <div className="col-lg-5">
              <div className="position-relative overflow-hidden rounded-4 shadow-sm bg-light" style={{ minHeight: '320px', aspectRatio: '4 / 5' }}>
                <Image
                  src={imageSrc}
                  alt={`${athlete.name} portrait`}
                  fill
                  sizes="(max-width: 991px) 100vw, 42vw"
                  style={{ objectFit: 'cover', ...(isInactive ? { filter: 'grayscale(20%)' } : {}) }}
                  unoptimized={imageSrc.startsWith('data:')}
                  onError={(event) => {
                    const image = event.currentTarget;
                    if (!image.src.endsWith('/assets/img/avatar-1.svg')) image.src = '/assets/img/avatar-1.svg';
                  }}
                />
              </div>
            </div>
            <div className="col-lg-7">
              <div className="d-flex flex-wrap gap-2 mb-4">
                <span className="badge rounded-pill px-3 py-2 text-bg-primary">{t(athlete.sport)}</span>
                <span className={`badge rounded-pill px-3 py-2 ${isInactive ? 'text-bg-secondary' : 'text-bg-success'}`}>
                  {isInactive ? 'Inactive' : 'Active athlete'}
                </span>
              </div>

              <h2 className="h4 fw-bold mb-3">About {athlete.name}</h2>
              <p className="text-muted" style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
                {t(athlete.desc) || 'More information about this athlete will be added soon.'}
              </p>

              <div className="row g-3 my-4">
                <div className="col-sm-6">
                  <div className="border rounded-3 p-3 h-100">
                    <span className="small text-muted d-block mb-1">Sport</span>
                    <strong>{t(athlete.sport)}</strong>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="border rounded-3 p-3 h-100">
                    <span className="small text-muted d-block mb-1">Country</span>
                    <strong>{athlete.country || 'Rwanda'}</strong>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-2 mt-4">
                <Link href="/athletes" className="btn btn-primary rounded-pill px-4">
                  <i className="fas fa-arrow-left me-2" aria-hidden="true" />All athletes
                </Link>
                <Link href="/sports" className="btn btn-outline-primary rounded-pill px-4">
                  Explore sports
                </Link>
                <Link href="/contact" className="btn btn-outline-secondary rounded-pill px-4">
                  Contact NPC Rwanda
                </Link>
              </div>
              <p className="small text-muted mt-4 mb-0">
                Athlete details are maintained by NPC Rwanda administrators. Information will update here when the profile is updated in the admin dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
