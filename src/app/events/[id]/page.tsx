'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useData } from '@/context/DataContext';

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

const imageUrl = (value?: string) => {
  if (!value || value === '#' || value === 'default' || value === 'sports-hero.jpg') return '';
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) return value;
  return `/assets/img/curated/${value}`;
};

export default function EventDetailsPage() {
  const params = useParams<{ id: string }>();
  const { events, loading } = useData();
  const id = decodeURIComponent(params.id);
  const event = events.find((item) => item.id === id);
  const cover = imageUrl(event?.img);

  if (loading && !event) {
    return (
      <main id="main-content" className="container py-5 text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Loading event...</span>
        </div>
        <p className="text-muted mb-0">Loading event details...</p>
      </main>
    );
  }

  if (!event) {
    return (
      <main id="main-content" className="container py-5">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link href="/">Home</Link></li>
            <li className="breadcrumb-item"><Link href="/events">Events</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Not found</li>
          </ol>
        </nav>
        <div className="text-center py-5">
          <i className="fas fa-calendar-times text-muted mb-3" aria-hidden="true" style={{ fontSize: '3rem' }} />
          <h1 className="h3">Event not found</h1>
          <p className="text-muted">This event may have been removed or is no longer available.</p>
          <Link href="/events" className="btn btn-primary rounded-pill px-4">Browse all events</Link>
        </div>
      </main>
    );
  }

  const isCompleted = event.status === 'Completed';

  return (
    <main id="main-content">
      <header className="page-header">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-3">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item"><Link href="/events">Events &amp; Competitions</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{event.title}</li>
            </ol>
          </nav>
          <div className="d-flex flex-wrap gap-2 mb-3">
            <span className="badge rounded-pill text-bg-primary">{event.category}</span>
            <span className={`badge rounded-pill ${isCompleted ? 'text-bg-secondary' : event.status === 'Cancelled' ? 'text-bg-danger' : 'text-bg-success'}`}>{event.status}</span>
          </div>
          <h1 className="page-title mb-2">{event.title}</h1>
          <p className="page-subtitle mb-0">Event information and updates from NPC Rwanda.</p>
        </div>
      </header>

      <section className="py-5">
        <div className="container">
          <div className="row g-4 g-lg-5 align-items-start">
            <div className="col-lg-7">
              {cover ? (
                <img src={cover} alt={event.title} className="w-100 rounded-4 shadow-sm" style={{ maxHeight: '460px', objectFit: 'cover' }} />
              ) : (
                <div className="rounded-4 d-flex align-items-center justify-content-center" style={{ minHeight: '260px', background: 'linear-gradient(135deg, #002B49, #0072C6)' }}>
                  <i className="fas fa-calendar-check text-white" aria-hidden="true" style={{ fontSize: '5rem', opacity: 0.8 }} />
                </div>
              )}
              <section className="mt-4">
                <h2 className="h4 fw-bold mb-3">About this event</h2>
                <p className="text-muted" style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>{event.description}</p>
              </section>
              {isCompleted && (
                <section className="mt-4 rounded-4 p-4" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }} aria-labelledby="event-results">
                  <h2 id="event-results" className="h4 fw-bold mb-3"><i className="fas fa-trophy text-success me-2" aria-hidden="true" />Competition Results</h2>
                  {event.resultsSummary?.trim() || event.results?.trim() ? (
                    <>
                      {event.resultsSummary?.trim() && <p className="fw-semibold text-dark mb-3">{event.resultsSummary}</p>}
                      {event.results?.trim() && <p className="mb-0 text-muted" style={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>{event.results}</p>}
                    </>
                  ) : (
                    <p className="text-muted mb-0">Results and highlights have not been published for this event yet.</p>
                  )}
                </section>
              )}
            </div>

            <aside className="col-lg-5">
              <div className="custom-card p-4">
                <h2 className="h5 fw-bold mb-4">Event information</h2>
                <div className="d-flex gap-3 mb-4">
                  <i className="fas fa-calendar text-primary mt-1" aria-hidden="true" />
                  <div>
                    <span className="small text-muted d-block mb-1">Date</span>
                    <strong>{formatDate(event.date)}</strong>
                    {event.endDate && event.endDate !== event.date && <div className="small text-muted mt-1">Until {formatDate(event.endDate)}</div>}
                  </div>
                </div>
                <div className="d-flex gap-3 mb-4">
                  <i className="fas fa-map-marker-alt text-primary mt-1" aria-hidden="true" />
                  <div><span className="small text-muted d-block mb-1">Location</span><strong>{event.location}</strong></div>
                </div>
                <div className="d-flex gap-3 mb-4">
                  <i className="fas fa-tag text-primary mt-1" aria-hidden="true" />
                  <div><span className="small text-muted d-block mb-1">Category</span><strong>{event.category}</strong></div>
                </div>
                <div className="d-flex gap-3">
                  <i className="fas fa-info-circle text-primary mt-1" aria-hidden="true" />
                  <div><span className="small text-muted d-block mb-1">Status</span><strong>{event.status}</strong></div>
                </div>
                <hr className="my-4" />
                <Link href="/contact" className="btn btn-primary rounded-pill w-100">Ask about this event</Link>
              </div>
            </aside>
          </div>
          <div className="mt-4">
            <Link href="/events" className="btn btn-outline-primary rounded-pill px-4"><i className="fas fa-arrow-left me-2" aria-hidden="true" />Back to all events</Link>
          </div>
          <p className="small text-muted mt-4 mb-0">Event information and published results are maintained by NPC Rwanda administrators.</p>
        </div>
      </section>
    </main>
  );
}
