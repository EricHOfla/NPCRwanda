'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useData, Event } from '@/context/DataContext';
import Pagination from '@/components/Pagination';

const STATUS_STYLES: Record<string, { background: string; color: string; icon: string }> = {
  Upcoming: { background: '#E8F1FF', color: '#1456A0', icon: 'fa-clock' },
  Ongoing: { background: '#E7F7EF', color: '#137547', icon: 'fa-circle-dot' },
  Completed: { background: '#EEF1F5', color: '#536174', icon: 'fa-circle-check' },
  Cancelled: { background: '#FCEBED', color: '#A92D3B', icon: 'fa-circle-xmark' },
};

const CATEGORY_ICONS: Record<string, string> = {
  National: 'fa-flag',
  International: 'fa-globe',
  Regional: 'fa-location-dot',
  Training: 'fa-dumbbell',
  Conference: 'fa-people-group',
};

const CATEGORY_BACKGROUNDS: Record<string, string> = {
  National: 'linear-gradient(135deg,#092B52,#1267B1)',
  International: 'linear-gradient(135deg,#102746,#315A91)',
  Regional: 'linear-gradient(135deg,#123D4B,#168A83)',
  Training: 'linear-gradient(135deg,#123E35,#26966C)',
  Conference: 'linear-gradient(135deg,#292B5D,#5C63A8)',
};

function imageUrl(value?: string) {
  const image = (value || '').trim();
  if (!image || ['default', '#', 'sports-hero.jpg'].includes(image)) return '';
  if (/^(https?:\/\/|\/)/i.test(image)) return image;
  return `/assets/img/curated/${image}`;
}

function formatDate(value?: string) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function EventArtwork({ event, compact = false }: { event: Event; compact?: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = imageUrl(event.img);
  const date = event.date ? new Date(event.date) : null;
  const validDate = date && !Number.isNaN(date.getTime());
  const categoryIcon = CATEGORY_ICONS[event.category] || 'fa-calendar-days';
  const background = CATEGORY_BACKGROUNDS[event.category] || 'linear-gradient(135deg,#092B52,#1267B1)';

  return (
    <div className="position-relative overflow-hidden" style={{ height: compact ? 190 : 250, background }}>
      {src && !failed ? (
        <img src={src} alt={event.title} className="w-100 h-100" style={{ objectFit: 'cover' }} onError={() => setFailed(true)} />
      ) : (
        <div className="w-100 h-100 d-flex align-items-center justify-content-between px-4">
          {validDate && (
            <div className="rounded-3 text-center px-3 py-2" style={{ background: '#fff', color: '#102746', minWidth: 68, zIndex: 1 }}>
              <div className="small fw-bold text-primary text-uppercase">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
              <div className="fs-3 fw-bold lh-1">{date.getDate()}</div>
            </div>
          )}
          <i className={`fas ${categoryIcon}`} aria-hidden="true" style={{ fontSize: '6rem', color: 'rgba(255,255,255,.16)', marginLeft: 'auto' }} />
        </div>
      )}
      <div className="position-absolute top-0 start-0 m-3 d-flex flex-wrap gap-2">
        <span className="badge rounded-pill px-3 py-2" style={{ ...(STATUS_STYLES[event.status] || STATUS_STYLES.Upcoming), fontSize: '.72rem' }}>
          <i className={`fas ${(STATUS_STYLES[event.status] || STATUS_STYLES.Upcoming).icon} me-1`} />{event.status}
        </span>
        {event.featured && <span className="badge rounded-pill px-3 py-2" style={{ background: '#F4B942', color: '#24364B', fontSize: '.72rem' }}><i className="fas fa-star me-1" />Featured</span>}
      </div>
      <span className="position-absolute bottom-0 end-0 m-3 badge rounded-pill px-3 py-2" style={{ background: 'rgba(7,25,48,.78)', color: '#fff' }}>
        <i className={`fas ${categoryIcon} me-1`} />{event.category || 'Event'}
      </span>
    </div>
  );
}

export default function EventsPage() {
  const { events, loading, error } = useData();
  const [status, setStatus] = useState('All');
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const categories = useMemo(() => ['All', ...Array.from(new Set(events.map(item => item.category).filter(Boolean)))], [events]);
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return events.filter(item => {
      const matchesStatus = status === 'All' || item.status === status;
      const matchesCategory = category === 'All' || item.category === category;
      const matchesSearch = !term || [item.title, item.description, item.location, item.category, item.status]
        .some(value => String(value || '').toLowerCase().includes(term));
      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [events, status, category, search]);

  const pageSize = 6;
  const pages = Math.ceil(filtered.length / pageSize);
  const currentPage = Math.min(page, Math.max(pages, 1));
  const pageItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const featured = events.filter(item => item.featured);
  const upcoming = events.filter(item => item.status === 'Upcoming').length;
  const ongoing = events.filter(item => item.status === 'Ongoing').length;
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const offset = new Date(year, monthIndex, 1).getDay();
  const calendarCells = Array.from({ length: offset + daysInMonth }, (_, index) => index < offset ? null : index - offset + 1);
  const monthLabel = month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  const eventsForDay = (day: number) => filtered.filter(item => {
    if (!item.date) return false;
    const date = new Date(item.date);
    return !Number.isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === monthIndex && date.getDate() === day;
  });
  const resetFilters = () => { setStatus('All'); setCategory('All'); setSearch(''); setPage(1); };

  return (
    <main id="main-content" className="npc-events-page">
      <header className="page-header">
        <div className="container">
          <nav aria-label="breadcrumb" data-aos="fade-up">
            <ol className="breadcrumb mb-3">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Events &amp; Competitions</li>
            </ol>
          </nav>
          <div className="row align-items-end g-4">
            <div className="col-lg-8">
              <span className="d-inline-flex align-items-center gap-2 text-uppercase fw-bold mb-3" style={{ color: '#7BD6A7', letterSpacing: '1.8px', fontSize: '.76rem' }}>
                <span style={{ width: 28, height: 2, background: '#7BD6A7' }} />On the calendar
              </span>
              <h1 className="page-title mb-3">Events &amp; Competitions</h1>
              <p className="page-subtitle mb-0" style={{ maxWidth: 690 }}>
                Follow the moments that bring Rwanda’s Paralympic community together — from grassroots activities and training camps to national and international competition.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link href="/contact" className="btn btn-light rounded-pill px-4 py-3 fw-bold">
                Partner with us <i className="fas fa-arrow-right ms-2" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      <section className="py-4" style={{ background: '#0B2C50', color: '#fff' }}>
        <div className="container">
          <div className="row g-3">
            {[
              { label: 'All events', value: events.length, icon: 'fa-calendar-days' },
              { label: 'Upcoming', value: upcoming, icon: 'fa-clock' },
              { label: 'In progress', value: ongoing, icon: 'fa-circle-play' },
              { label: 'Featured', value: featured.length, icon: 'fa-star' },
            ].map(item => (
              <div className="col-6 col-md-3" key={item.label}>
                <div className="d-flex align-items-center gap-3 justify-content-center justify-content-md-start">
                  <span className="d-flex align-items-center justify-content-center rounded-circle" style={{ width: 44, height: 44, background: 'rgba(255,255,255,.11)', color: '#9BE0B8' }}>
                    <i className={`fas ${item.icon}`} />
                  </span>
                  <div><div className="fs-4 fw-bold lh-1">{item.value}</div><div className="small opacity-75 mt-1">{item.label}</div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          {featured.length > 0 && (
            <div className="mb-5">
              <div className="d-flex align-items-end justify-content-between gap-3 mb-4">
                <div><span className="text-uppercase fw-bold small" style={{ color: '#16845B', letterSpacing: '1.5px' }}>Don’t miss</span><h2 className="h3 fw-bold mt-1 mb-0">Featured events</h2></div>
                <span className="small text-muted">{featured.length} highlighted</span>
              </div>
              <div className="row g-4">
                {featured.slice(0, 2).map(event => (
                  <div className="col-lg-6" key={event.id}>
                    <article className="custom-card h-100 overflow-hidden border-0 shadow-sm">
                      <EventArtwork event={event} />
                      <div className="p-4 p-lg-4">
                        <h3 className="h5 fw-bold mb-2">{event.title}</h3>
                        <p className="text-muted mb-3" style={{ lineHeight: 1.7 }}>{event.description}</p>
                        <div className="d-flex flex-wrap gap-3 small text-muted mb-3">
                          <span><i className="fas fa-calendar me-2 text-primary" />{formatDate(event.date)}{event.endDate && event.endDate !== event.date ? ` – ${formatDate(event.endDate)}` : ''}</span>
                          {event.location && <span><i className="fas fa-location-dot me-2 text-primary" />{event.location}</span>}
                        </div>
                        <Link href={`/events/${encodeURIComponent(event.id)}`} className="fw-bold text-primary text-decoration-none">Explore event <i className="fas fa-arrow-right ms-1" /></Link>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-4 p-3 p-lg-4 mb-4" style={{ background: '#F3F6FA', border: '1px solid #E4EAF1' }}>
            <div className="row g-3 align-items-end">
              <div className="col-lg-4">
                <label htmlFor="event-search" className="form-label small fw-bold text-uppercase text-muted">Find an event</label>
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0"><i className="fas fa-search text-muted" /></span>
                  <input id="event-search" type="search" className="form-control bg-white border-start-0" placeholder="Search title, venue or category" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} />
                  {search && <button className="btn btn-outline-secondary bg-white" type="button" onClick={() => { setSearch(''); setPage(1); }}>Clear</button>}
                </div>
              </div>
              <div className="col-lg-4">
                <label className="form-label small fw-bold text-uppercase text-muted">Event status</label>
                <div className="d-flex flex-wrap gap-2">
                  {['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map(value => (
                    <button type="button" key={value} onClick={() => { setStatus(value); setPage(1); }} className="btn btn-sm rounded-pill px-3" style={{ background: status === value ? '#0B4F91' : '#fff', color: status === value ? '#fff' : '#334155', border: '1px solid #D8E0E9', fontWeight: 600 }}>{value}</button>
                  ))}
                </div>
              </div>
              <div className="col-lg-4">
                <label htmlFor="event-category" className="form-label small fw-bold text-uppercase text-muted">Category</label>
                <select id="event-category" className="form-select bg-white" value={category} onChange={event => { setCategory(event.target.value); setPage(1); }}>
                  {categories.map(value => <option key={value} value={value}>{value === 'All' ? 'All categories' : value}</option>)}
                </select>
              </div>
              <div className="col-12 d-flex flex-wrap justify-content-between align-items-center gap-2 pt-1">
                <span className="small text-muted" aria-live="polite">{loading && events.length === 0 ? 'Loading events…' : `Showing ${filtered.length} event${filtered.length === 1 ? '' : 's'}`}</span>
                <div className="d-flex align-items-center gap-2">
                  {(search || status !== 'All' || category !== 'All') && <button type="button" className="btn btn-link btn-sm text-decoration-none" onClick={resetFilters}>Reset filters</button>}
                  <div className="btn-group btn-group-sm" role="group" aria-label="Event view">
                    <button type="button" className={`btn ${view === 'list' ? 'btn-primary' : 'btn-outline-primary'}`} aria-pressed={view === 'list'} onClick={() => setView('list')}><i className="fas fa-grip me-1" />Cards</button>
                    <button type="button" className={`btn ${view === 'calendar' ? 'btn-primary' : 'btn-outline-primary'}`} aria-pressed={view === 'calendar'} onClick={() => setView('calendar')}><i className="fas fa-calendar-days me-1" />Calendar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading && events.length === 0 ? (
            <div className="text-center py-5" role="status"><div className="spinner-border text-primary mb-3" /><p className="text-muted mb-0">Loading events…</p></div>
          ) : error && events.length === 0 ? (
            <div className="text-center rounded-4 py-5 px-3" style={{ background: '#F7F9FC' }}><i className="fas fa-calendar-xmark fs-1 text-muted mb-3" /><h2 className="h5">Events are temporarily unavailable</h2><p className="text-muted mb-0">Please try again shortly.</p></div>
          ) : filtered.length === 0 ? (
            <div className="text-center rounded-4 py-5 px-3" style={{ background: '#F7F9FC' }}><i className="fas fa-calendar-xmark fs-1 text-muted mb-3" /><h2 className="h5">{events.length === 0 ? 'No events published yet' : 'No matching events'}</h2><p className="text-muted mb-0">{events.length === 0 ? 'Please check back for upcoming activities and competitions.' : 'Try another search or adjust your filters.'}</p></div>
          ) : view === 'calendar' ? (
            <div className="rounded-4 p-3 p-lg-4" style={{ border: '1px solid #E3EAF2', background: '#fff' }}>
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
                <div><span className="small text-uppercase fw-bold" style={{ color: '#16845B', letterSpacing: '1px' }}>Monthly schedule</span><h2 className="h4 fw-bold mb-0">{monthLabel}</h2></div>
                <div className="d-flex gap-2">
                  <button className="btn btn-outline-primary btn-sm" type="button" aria-label="Previous month" onClick={() => setMonth(new Date(year, monthIndex - 1, 1))}><i className="fas fa-chevron-left" /></button>
                  <button className="btn btn-outline-secondary btn-sm" type="button" onClick={() => { const now = new Date(); setMonth(new Date(now.getFullYear(), now.getMonth(), 1)); }}>Today</button>
                  <button className="btn btn-outline-primary btn-sm" type="button" aria-label="Next month" onClick={() => setMonth(new Date(year, monthIndex + 1, 1))}><i className="fas fa-chevron-right" /></button>
                </div>
              </div>
              <div className="row g-2 text-center mb-2">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div className="col" key={day}><span className="small fw-bold text-muted">{day}</span></div>)}</div>
              <div className="row g-2">
                {calendarCells.map((day, index) => {
                  if (day === null) return <div className="col-12 col-md" key={`blank-${index}`} style={{ minWidth: '12%' }}><div className="rounded-3" style={{ minHeight: 104, background: '#F7F9FC' }} /></div>;
                  const dayEvents = eventsForDay(day);
                  return <div className="col-12 col-md" key={day} style={{ minWidth: '12%' }}>
                    <div className="rounded-3 p-2 h-100" style={{ minHeight: 104, border: dayEvents.length ? '1px solid #B9D3ED' : '1px solid #E8EDF3', background: dayEvents.length ? '#F2F7FC' : '#fff' }}>
                      <span className="small fw-bold text-muted">{day}</span>
                      <div className="d-flex flex-column gap-1 mt-2">
                        {dayEvents.slice(0, 2).map(item => <Link key={item.id} href={`/events/${encodeURIComponent(item.id)}`} className="small text-decoration-none fw-semibold rounded-2 px-2 py-1" style={{ background: '#DCEBFA', color: '#164B7D', overflowWrap: 'anywhere' }}>{item.title}</Link>)}
                        {dayEvents.length > 2 && <span className="small text-muted">+{dayEvents.length - 2} more</span>}
                      </div>
                    </div>
                  </div>;
                })}
              </div>
              {!filtered.some(item => { const date = item.date ? new Date(item.date) : null; return date && !Number.isNaN(date.getTime()) && date.getFullYear() === year && date.getMonth() === monthIndex; }) && <p className="small text-muted mt-3 mb-0">No matching events in this month.</p>}
            </div>
          ) : (
            <>
              <div className="d-flex justify-content-between align-items-center gap-3 mb-3"><h2 className="h4 fw-bold mb-0">{status === 'Completed' ? 'Past events & results' : 'All events'}</h2><span className="small text-muted">Page {currentPage} of {Math.max(pages, 1)}</span></div>
              <div className="row g-4">
                {pageItems.map(event => (
                  <div className="col-md-6 col-xl-4" key={event.id}>
                    <article className="custom-card h-100 overflow-hidden border-0 shadow-sm d-flex flex-column">
                      <EventArtwork event={event} compact />
                      <div className="p-4 d-flex flex-column flex-grow-1">
                        <div className="small text-muted mb-2"><i className="fas fa-calendar me-2 text-primary" />{formatDate(event.date)}{event.endDate && event.endDate !== event.date ? ` – ${formatDate(event.endDate)}` : ''}</div>
                        <h3 className="h5 fw-bold mb-2">{event.title}</h3>
                        <p className="small text-muted flex-grow-1" style={{ lineHeight: 1.7 }}>{event.description}</p>
                        {event.location && <p className="small text-muted mb-3"><i className="fas fa-location-dot me-2 text-primary" />{event.location}</p>}
                        {event.status === 'Completed' && (event.resultsSummary?.trim() || event.results?.trim()) && <div className="rounded-3 p-3 mb-3" style={{ background: '#EFF8F2', border: '1px solid #D4EBDD' }}><div className="small fw-bold text-success mb-1"><i className="fas fa-trophy me-2" />Competition results</div>{event.resultsSummary?.trim() && <p className="small fw-semibold mb-1">{event.resultsSummary}</p>}{event.results?.trim() && <p className="small text-muted mb-0" style={{ whiteSpace: 'pre-line' }}>{event.results}</p>}</div>}
                        <Link href={`/events/${encodeURIComponent(event.id)}`} className="btn btn-outline-primary rounded-pill fw-semibold mt-auto">Event details <i className="fas fa-arrow-right ms-2" /></Link>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
              <Pagination currentPage={currentPage} totalPages={pages} onPageChange={setPage} ariaLabel="Events pagination" />
            </>
          )}
        </div>
      </section>

      <section className="pb-5">
        <div className="container">
          <div className="rounded-4 p-4 p-lg-5 d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-4" style={{ background: 'linear-gradient(120deg,#0B2C50,#145A91)', color: '#fff' }}>
            <div><span className="small text-uppercase fw-bold" style={{ color: '#9BE0B8', letterSpacing: '1.5px' }}>Be part of the movement</span><h2 className="h3 fw-bold mt-2 mb-2">Interested in an NPC Rwanda event?</h2><p className="mb-0 opacity-75">Connect with our team about participation, collaboration, or event partnerships.</p></div>
            <Link href="/contact" className="btn btn-light rounded-pill px-4 py-3 fw-bold flex-shrink-0">Contact NPC Rwanda <i className="fas fa-arrow-right ms-2" /></Link>
          </div>
        </div>
      </section>
    </main>
  );
}
