'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import Pagination from '@/components/Pagination';

const STATUS_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
  Upcoming:  { bg: '#EFF6FF', text: '#1D4ED8', icon: 'fa-clock' },
  Ongoing:   { bg: '#F0FDF4', text: '#15803D', icon: 'fa-circle-dot' },
  Completed: { bg: '#F9FAFB', text: '#6B7280', icon: 'fa-circle-check' },
  Cancelled: { bg: '#FFF1F2', text: '#BE123C', icon: 'fa-circle-xmark' },
};

const CATEGORY_ICONS: Record<string, string> = {
  National:      'fa-flag',
  International: 'fa-globe',
  Regional:      'fa-map-marker-alt',
  Training:      'fa-dumbbell',
  Conference:    'fa-chalkboard-teacher',
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  National:      'linear-gradient(135deg, #002B49 0%, #0072C6 100%)',
  International: 'linear-gradient(135deg, #0F172A 0%, #1E40AF 100%)',
  Regional:      'linear-gradient(135deg, #1E293B 0%, #0D9488 100%)',
  Training:      'linear-gradient(135deg, #064E3B 0%, #10B981 100%)',
  Conference:    'linear-gradient(135deg, #312E81 0%, #6366F1 100%)',
};

const getEventImageUrl = (img?: string) => {
  if (!img) return null;
  const clean = img.trim();
  if (!clean || clean === 'sports-hero.jpg' || clean === 'default' || clean === '#') return null;
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('/')) {
    return clean;
  }
  return `/assets/img/curated/${clean}`;
};

function EventCardMedia({
  ev,
  height = '180px',
  statusConfig,
}: {
  ev: any;
  height?: string;
  statusConfig: { bg: string; text: string; icon: string };
}) {
  const [imgFailed, setImgFailed] = useState(false);
  const rawUrl = getEventImageUrl(ev.img);
  const hasRealImage = Boolean(rawUrl && !imgFailed);

  const categoryIcon = CATEGORY_ICONS[ev.category] || 'fa-calendar-check';
  const gradient = CATEGORY_GRADIENTS[ev.category] || 'linear-gradient(135deg, #002B49 0%, #0072C6 100%)';

  const dateObj = ev.date ? new Date(ev.date) : null;
  const validDate = dateObj && !isNaN(dateObj.getTime());
  const monthName = validDate ? dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase() : '';
  const dayNum = validDate ? dateObj.getDate() : '';

  return (
    <div className="position-relative overflow-hidden" style={{ height, background: gradient }}>
      {hasRealImage ? (
        <img
          src={rawUrl!}
          alt={ev.title}
          className="w-100 h-100"
          style={{ objectFit: 'cover' }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className="w-100 h-100 d-flex align-items-center justify-content-between px-4 position-relative">
          <i
            className={`fas ${categoryIcon} position-absolute`}
            style={{
              fontSize: '5.5rem',
              right: '15px',
              bottom: '-8px',
              color: 'rgba(255, 255, 255, 0.15)',
              pointerEvents: 'none',
            }}
          />
          {validDate && (
            <div
              className="text-center rounded-3 px-3 py-2 shadow-sm"
              style={{
                background: 'rgba(255, 255, 255, 0.95)',
                color: '#0F172A',
                minWidth: '60px',
                zIndex: 2,
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--primary-blue)', letterSpacing: '1px' }}>
                {monthName}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, lineHeight: 1 }}>
                {dayNum}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status Badge */}
      <span
        className="badge fw-bold px-2 py-1 position-absolute top-0 start-0 m-2"
        style={{ background: statusConfig.bg, color: statusConfig.text, fontSize: '0.72rem', zIndex: 3 }}
      >
        <i className={`fas ${statusConfig.icon} me-1`}></i>{ev.status}
      </span>

      {/* Featured / Category Badge */}
      <div className="position-absolute top-0 end-0 m-2 d-flex gap-1" style={{ zIndex: 3 }}>
        {ev.featured && (
          <span className="badge" style={{ background: '#F59E0B', color: '#fff', fontSize: '0.68rem' }}>
            <i className="fas fa-star me-1"></i>Featured
          </span>
        )}
        <span className="badge fw-bold" style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.68rem' }}>
          <i className={`fas ${categoryIcon} me-1`}></i>{ev.category}
        </span>
      </div>
    </div>
  );
}

export default function EventsPage() {
  const { t } = useTranslation();
  const { events, loading, error } = useData();
  const [activeStatus, setActiveStatus] = useState('All');
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const ITEMS_PER_PAGE = 6;

  const statuses = ['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'];
  const categories = ['All', ...Array.from(new Set(events.map(e => e.category)))];

  const query = search.trim().toLowerCase();
  const filtered = events.filter(ev => {
    const statusMatch = activeStatus === 'All' || ev.status === activeStatus;
    const catMatch = activeCategory === 'All' || ev.category === activeCategory;
    const searchMatch = !query || [ev.title, ev.description, ev.location, ev.category, ev.status]
      .some(value => (value || '').toLowerCase().includes(query));
    return statusMatch && catMatch && searchMatch;
  });
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const visiblePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedEvents = filtered.slice((visiblePage - 1) * ITEMS_PER_PAGE, visiblePage * ITEMS_PER_PAGE);
  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIndex = calendarMonth.getMonth();
  const calendarDaysInMonth = new Date(calendarYear, calendarMonthIndex + 1, 0).getDate();
  const calendarStartOffset = new Date(calendarYear, calendarMonthIndex, 1).getDay();
  const calendarCells = Array.from(
    { length: calendarStartOffset + calendarDaysInMonth },
    (_, index) => index < calendarStartOffset ? null : index - calendarStartOffset + 1
  );
  const calendarMonthLabel = calendarMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const getCalendarEvents = (day: number) => filtered.filter(item => {
    if (!item.date) return false;
    const date = new Date(item.date);
    return !Number.isNaN(date.getTime()) &&
      date.getFullYear() === calendarYear &&
      date.getMonth() === calendarMonthIndex &&
      date.getDate() === day;
  });

  const featured = events.filter(e => e.featured);
  const upcoming = events.filter(e => e.status === 'Upcoming').length;
  const ongoing  = events.filter(e => e.status === 'Ongoing').length;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  };

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
              <li className="breadcrumb-item">
                <Link href="/news">
                  {t('nav.news')}
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">Events</li>
            </ol>
          </nav>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">Events &amp; Competitions</h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100">
            Stay up to date with NPC Rwanda national, regional, and international sports events, training camps, and conferences.
          </p>
        </div>
      </header>

      {/* Stats Bar */}
      <div style={{ background: 'var(--primary-blue)', color: '#fff' }}>
        <div className="container py-3">
          <div className="row g-3 text-center">
            {[
              { label: 'Total Events', value: events.length, icon: 'fa-calendar' },
              { label: 'Upcoming', value: upcoming, icon: 'fa-clock' },
              { label: 'Ongoing', value: ongoing, icon: 'fa-circle-dot' },
              { label: 'Featured', value: featured.length, icon: 'fa-star' },
            ].map(stat => (
              <div key={stat.label} className="col-6 col-md-3">
                <div className="d-flex align-items-center justify-content-center gap-2">
                  <i className={`fas ${stat.icon}`} style={{ fontSize: '1.2rem', opacity: 0.8 }}></i>
                  <div className="text-start">
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1 }}>{stat.value}</div>
                    <div style={{ fontSize: '0.72rem', opacity: 0.75, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{stat.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section>
        <div className="container">

          {/* Featured Events */}
          {featured.length > 0 && (
            <div className="mb-5" data-aos="fade-up">
              <div className="section-title text-start mb-4">
                <span className="text-uppercase fw-bold text-accent-green mb-2 d-block" style={{ fontSize: '0.78rem', letterSpacing: '1px' }}>
                  <i className="fas fa-star me-1"></i> Featured
                </span>
                <h2 className="h3">Highlight Events</h2>
              </div>
              <div className="row g-4">
                {featured.slice(0, 2).map((ev, i) => {
                  const sc = STATUS_COLORS[ev.status] || STATUS_COLORS.Upcoming;
                  return (
                    <div key={ev.id} className="col-lg-6" data-aos="fade-up" data-aos-delay={i * 100}>
                      <div className="custom-card event-feature-card h-100 overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
                        <EventCardMedia ev={ev} height="220px" statusConfig={sc} />
                        <div className="p-4">
                          <h3 className="h5 mb-2">{ev.title}</h3>
                          <p className="small text-muted mb-3">{ev.description}</p>
                          <div className="d-flex flex-wrap gap-3 text-muted small">
                            <span><i className="fas fa-calendar me-1 text-primary"></i>{formatDate(ev.date)}{ev.endDate && ev.endDate !== ev.date ? ` – ${formatDate(ev.endDate)}` : ''}</span>
                            <span><i className="fas fa-map-marker-alt me-1 text-primary"></i>{ev.location}</span>
                          </div>
                          <Link href={`/events/${encodeURIComponent(ev.id)}`} className="btn btn-outline-primary btn-sm rounded-pill px-3 mt-3">
                            Event details <i className="fas fa-arrow-right ms-1" aria-hidden="true" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeStatus === 'Completed' && (
            <div className="rounded-4 p-4 mb-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }} aria-live="polite">
              <h2 className="h5 fw-bold mb-1"><i className="fas fa-trophy text-warning me-2" aria-hidden="true" />Past Events &amp; Competition Results</h2>
              <p className="small text-muted mb-0">Browse completed events and review results or highlights entered by NPC Rwanda administrators.</p>
            </div>
          )}

          {/* Filters */}
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3 mb-4 p-3 p-md-4 rounded-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }} data-aos="fade-up">
            <div className="event-search-field">
              <label htmlFor="event-directory-search" className="small fw-bold text-muted mb-2 text-uppercase d-block" style={{ letterSpacing: '0.5px' }}>Search events</label>
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0" aria-hidden="true"><i className="fas fa-search text-muted" /></span>
                <input
                  id="event-directory-search"
                  type="search"
                  className="form-control border-start-0"
                  placeholder="Search title, venue, or category"
                  value={search}
                  onChange={event => { setSearch(event.target.value); setCurrentPage(1); }}
                  aria-describedby="event-filter-count"
                />
                {search && <button type="button" className="btn btn-outline-secondary" onClick={() => { setSearch(''); setCurrentPage(1); }} aria-label="Clear event search">Clear</button>}
              </div>
            </div>
            <div>
              <p className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Status</p>
              <div className="d-flex flex-wrap gap-2">
                {statuses.map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      setActiveStatus(s);
                      setCurrentPage(1);
                    }}
                    className="btn btn-sm"
                    style={{
                      borderRadius: '999px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      background: activeStatus === s ? 'var(--primary-blue)' : '#fff',
                      color: activeStatus === s ? '#fff' : 'var(--text-dark)',
                      border: activeStatus === s ? '1px solid var(--primary-blue)' : '1px solid #D1D5DB',
                      transition: 'all 0.2s',
                    }}
                  >{s}</button>
                ))}
              </div>
            </div>
            <div className="vr d-none d-md-block" style={{ opacity: 0.2 }}></div>
            <div>
              <p className="small fw-bold text-muted mb-2 text-uppercase" style={{ letterSpacing: '0.5px' }}>Category</p>
              <div className="d-flex flex-wrap gap-2">
                {categories.map(c => (
                  <button
                    key={c}
                    onClick={() => {
                      setActiveCategory(c);
                      setCurrentPage(1);
                    }}
                    className="btn btn-sm"
                    style={{
                      borderRadius: '999px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      background: activeCategory === c ? '#16A34A' : '#fff',
                      color: activeCategory === c ? '#fff' : 'var(--text-dark)',
                      border: activeCategory === c ? '1px solid #16A34A' : '1px solid #D1D5DB',
                      transition: 'all 0.2s',
                    }}
                  >{c}</button>
                ))}
              </div>
            </div>
            <div className="d-flex flex-wrap align-items-center gap-2 ms-md-auto">
              <span id="event-filter-count" className="small text-muted fw-semibold" aria-live="polite">{loading && events.length === 0 ? 'Loading events…' : filtered.length + ' event' + (filtered.length !== 1 ? 's' : '') + ' found'}</span>
              {(search || activeStatus !== 'All' || activeCategory !== 'All') && (
                <button type="button" className="btn btn-link btn-sm p-0" onClick={() => { setSearch(''); setActiveStatus('All'); setActiveCategory('All'); setCurrentPage(1); }}>Reset filters</button>
              )}
              <div className="btn-group btn-group-sm" role="group" aria-label="Event display mode">
                <button type="button" className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`} aria-pressed={viewMode === 'grid'} onClick={() => setViewMode('grid')}>
                  <i className="fas fa-grip me-1" aria-hidden="true" />List
                </button>
                <button type="button" className={`btn ${viewMode === 'calendar' ? 'btn-primary' : 'btn-outline-primary'}`} aria-pressed={viewMode === 'calendar'} onClick={() => setViewMode('calendar')}>
                  <i className="fas fa-calendar-days me-1" aria-hidden="true" />Calendar
                </button>
              </div>
            </div>
          </div>

          {/* Events Grid */}
          {loading && events.length === 0 ? (
            <div className="text-center py-5" role="status" aria-live="polite">
              <div className="spinner-border text-primary mb-3" aria-hidden="true" />
              <h3 className="h6 text-muted">Loading events...</h3>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-5" data-aos="fade-up">
              <i className="fas fa-calendar-times text-muted mb-3" aria-hidden="true" style={{ fontSize: '3rem' }}></i>
              <h3 className="h5 text-muted">{error ? 'Events are temporarily unavailable' : events.length === 0 ? 'No events have been published yet' : 'No events found'}</h3>
              <p className="small text-muted">{error ? 'Please try again in a moment.' : events.length === 0 ? 'Please check back later for upcoming competitions and results.' : 'Try changing the filters above.'}</p>
            </div>
          ) : viewMode === 'calendar' ? (
            <section className="event-calendar" aria-label="Events calendar">
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-3">
                <h2 className="h4 fw-bold mb-0">{calendarMonthLabel}</h2>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setCalendarMonth(new Date(calendarYear, calendarMonthIndex - 1, 1))} aria-label="Previous month">
                    <i className="fas fa-chevron-left" aria-hidden="true" /> <span className="d-none d-sm-inline">Previous</span>
                  </button>
                  <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { const now = new Date(); setCalendarMonth(new Date(now.getFullYear(), now.getMonth(), 1)); }}>Today</button>
                  <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setCalendarMonth(new Date(calendarYear, calendarMonthIndex + 1, 1))} aria-label="Next month">
                    <span className="d-none d-sm-inline">Next</span> <i className="fas fa-chevron-right" aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="event-calendar-grid" aria-label={calendarMonthLabel}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div className="event-calendar-weekday" key={day}>{day}</div>
                ))}
                {calendarCells.map((day, index) => {
                  if (day === null) return <div className="event-calendar-day is-empty" aria-hidden="true" key={`empty-${index}`} />;
                  const dayEvents = getCalendarEvents(day);
                  return (
                    <div className="event-calendar-day" key={day}>
                      <span className="event-calendar-date">{day}</span>
                      <div className="event-calendar-day-items">
                        {dayEvents.slice(0, 2).map(item => (
                          <Link key={item.id} href={`/events/${encodeURIComponent(item.id)}`} className="event-calendar-item" title={item.title}>
                            {item.title}
                          </Link>
                        ))}
                        {dayEvents.length > 2 && <span className="event-calendar-more">+{dayEvents.length - 2} more</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {!filtered.some(item => {
                if (!item.date) return false;
                const date = new Date(item.date);
                return !Number.isNaN(date.getTime()) && date.getFullYear() === calendarYear && date.getMonth() === calendarMonthIndex;
              }) && <p className="text-muted small mt-3 mb-0">No events in this month match the current filters. Try another month or reset your filters.</p>}
            </section>
          ) : (
            <>
              <div className="row g-4">
              {paginatedEvents.map((ev, i) => {
                const sc = STATUS_COLORS[ev.status] || STATUS_COLORS.Upcoming;
                return (
                  <div key={ev.id} className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay={`${(i % 3) * 100}`}>
                    <div className="custom-card event-list-card h-100 d-flex flex-column overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
                      <EventCardMedia ev={ev} height="170px" statusConfig={sc} />
                      <div className="p-4 flex-grow-1 d-flex flex-column">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <span className="badge" style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.68rem', fontWeight: 600 }}>
                            <i className={`fas ${CATEGORY_ICONS[ev.category] || 'fa-tag'} me-1`}></i>{ev.category}
                          </span>
                        </div>
                        <h4 className="h6 fw-bold mb-2">{ev.title}</h4>
                        <p className="small text-muted mb-3 flex-grow-1" style={{ lineHeight: 1.6 }}>{ev.description}</p>
                        <div className="border-top pt-3 mt-auto">
                          <div className="small text-muted mb-1">
                            <i className="fas fa-calendar me-2 text-primary"></i>
                            <strong>{formatDate(ev.date)}</strong>
                            {ev.endDate && ev.endDate !== ev.date && <span className="text-muted"> – {formatDate(ev.endDate)}</span>}
                          </div>
                          <div className="small text-muted">
                            <i className="fas fa-map-marker-alt me-2 text-primary"></i>{ev.location}
                          </div>
                          <Link href={`/events/${encodeURIComponent(ev.id)}`} className="btn btn-outline-primary btn-sm rounded-pill px-3 mt-3">
                            Event details <i className="fas fa-arrow-right ms-1" aria-hidden="true" />
                          </Link>
                          {ev.status === 'Completed' && (ev.resultsSummary?.trim() || ev.results?.trim()) && (
                            <div className="mt-3 p-3 rounded-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                              <h5 className="small fw-bold text-success mb-1"><i className="fas fa-trophy me-2" aria-hidden="true" />Competition Results</h5>
                              {ev.resultsSummary?.trim() && <p className="fw-semibold text-dark mb-2">{ev.resultsSummary}</p>}
                              {ev.results?.trim() && <p className="small text-muted mb-0" style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>{ev.results}</p>}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
              <Pagination currentPage={visiblePage} totalPages={totalPages} onPageChange={setCurrentPage} ariaLabel="Events pagination" />
            </>
          )}

          {/* CTA */}
          <div className="text-center py-5 mt-4" data-aos="fade-up">
            <div className="d-inline-flex flex-column align-items-center gap-3 p-4 rounded-4" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
              <i className="fas fa-envelope-open-text text-success" style={{ fontSize: '2rem' }}></i>
              <p className="mb-0 fw-semibold text-dark">Want to participate or partner with us for an event?</p>
              <Link href="/contact" className="btn btn-success px-4 fw-semibold">
                <i className="fas fa-paper-plane me-2"></i>Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
