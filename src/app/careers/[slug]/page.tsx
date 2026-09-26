'use client';

import React from 'react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import CareerApplicationForm from '@/components/CareerApplicationForm';

export default function CareerDetailPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  const unwrappedParams = params && typeof (params as Promise<{ slug: string }>).then === 'function' 
    ? React.use(params as Promise<{ slug: string }>) 
    : (params as { slug: string });
  const slug = unwrappedParams?.slug;
  const { careers, loading } = useData();

  const job = careers.find(c => c.slug === slug);

  const todayStr = new Date().toISOString().split('T')[0];
  const isExpired = Boolean(job && job.deadline && job.deadline < todayStr);
  const isAvailable = Boolean(job && job.status === 'Open' && !isExpired);

  if (loading) {
    return (
      <main className="py-5 text-center">
        <div className="container py-5 my-5">
          <i className="fas fa-spinner fa-spin text-primary fa-3x mb-3"></i>
          <h2 className="h4 text-dark fw-bold mb-2">Loading Career Opportunity...</h2>
          <p className="text-muted small">Fetching position details from National Paralympic Committee of Rwanda.</p>
        </div>
      </main>
    );
  }

  if (!job || !isAvailable) {
    return (
      <main className="py-5 text-center">
        <div className="container py-5 my-5">
          <i className="fas fa-calendar-times text-danger fa-3x mb-3"></i>
          <h1 className="h3 mb-3">Position Closed or Unavailable</h1>
          <p className="text-muted">The career position you are looking for does not exist, has reached its application deadline, or is no longer open.</p>
          <Link href="/careers" className="btn btn-primary mt-3">
            <i className="fas fa-arrow-left me-2"></i>Back to Careers
          </Link>
        </div>
      </main>
    );
  }

  const formattedDeadline = job.deadline
    ? new Date(job.deadline).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;

  return (
    <main id="main-content">
      {/* Header */}
      <header
        className="py-5 text-white bg-contain"
        style={{
          background: "linear-gradient(rgba(10,30,80,0.85), rgba(0,114,198,0.8)), url('/assets/img/curated/sports-hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container py-3">
          <Link href="/careers" className="text-white text-decoration-none small fw-bold mb-3 d-inline-block">
            <i className="fas fa-arrow-left me-2"></i>Back to Careers
          </Link>
          <h1 className="text-white mb-2" data-aos="fade-up">{job.title}</h1>
          <div className="d-flex align-items-center gap-3 mt-3 text-white-50 small flex-wrap">
            <span><i className="fas fa-location-dot me-1"></i>{job.location}</span>
            <span>|</span>
            <span className="badge bg-success text-white text-uppercase px-2 py-1" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
              {job.status} Position
            </span>
            {formattedDeadline && (
              <>
                <span>|</span>
                <span className="badge bg-warning text-dark px-2 py-1" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                  <i className="fas fa-clock me-1"></i>Deadline: {formattedDeadline}
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <article className="py-5">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="custom-card p-4 p-md-5 mb-4 border">
            {formattedDeadline && (
              <div className="alert alert-warning py-2 px-3 mb-4 rounded-3 small d-flex align-items-center">
                <i className="fas fa-hourglass-half text-warning-emphasis me-2 fa-lg"></i>
                <div>
                  <strong>Application Deadline:</strong> {formattedDeadline} (Applications close at 23:59 CAT)
                </div>
              </div>
            )}

            <h3 className="h5 fw-bold text-dark mb-3">Position Summary & Description</h3>
            <MarkdownRenderer content={job.desc} style={{ fontSize: '1.05rem', lineHeight: 1.8 }} />

            <div className="mt-4 pt-4 border-top d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
              <div>
                <span className="small text-muted d-block">Recruitment Inquiry:</span>
                <span className="fw-semibold text-dark">info@npcrwanda.org</span>
              </div>
              <a href="#apply" className="btn btn-primary fw-bold px-4">
                <i className="fas fa-file-signature me-2"></i>Apply Online Below
              </a>
            </div>
          </div>

          {/* Application Form */}
          <div id="apply" className="mb-4">
            <CareerApplicationForm careerId={job.id} careerTitle={job.title} />
          </div>

          <div className="d-flex justify-content-between align-items-center pt-3">
            <Link href="/careers" className="btn btn-outline-primary fw-semibold px-4">
              <i className="fas fa-arrow-left me-2"></i>All Open Roles
            </Link>
          </div>
        </div>
      </article>
    </main>
  );
}
