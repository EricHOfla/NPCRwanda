'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import Pagination from '@/components/Pagination';

const ITEMS_PER_PAGE = 12;

const getProfileImageSrc = (image?: string) => {
  if (!image || image === 'avatar-4.svg' || image === '/assets/img/avatar-4.svg') {
    return null;
  }
  if (image.startsWith('/') || image.startsWith('http')) {
    return image;
  }
  if (image.includes('/')) {
    return `/${image}`;
  }
  return `/assets/img/${image}`;
};

const getInitials = (name: string) => {
  if (!name) return 'NP';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const COMMITTEE_META: Record<string, { desc: string; icon: string; badgeBg: string; badgeColor: string }> = {
  'Board of Directors': {
    desc: 'The supreme executive governing council elected by the General Assembly, providing strategic direction, institutional stewardship, and global Paralympic representation.',
    icon: 'fa-landmark',
    badgeBg: '#EFF6FF',
    badgeColor: '#1D4ED8',
  },
  'Audit Committee': {
    desc: 'Independent statutory organ ensuring rigorous financial governance, audited reporting, regulatory compliance, and fiscal accountability.',
    icon: 'fa-scale-balanced',
    badgeBg: '#ECFDF5',
    badgeColor: '#047857',
  },
  'Conflict Resolution Committee': {
    desc: 'Statutory arbitration tribunal safeguarding ethical integrity, mediation, fair resolution of sports disputes, and athlete rights.',
    icon: 'fa-shield-halved',
    badgeBg: '#FEF3C7',
    badgeColor: '#B45309',
  },
  'Staff Team': {
    desc: 'The full-time operational secretariat and technical directors executing sports programs, classification, competitions, and athlete welfare.',
    icon: 'fa-users-gear',
    badgeBg: '#F3E8FF',
    badgeColor: '#7E22CE',
  },
};

const isExecutiveRole = (role: string) => {
  const r = role.toLowerCase();
  return r.includes('chairperson') || r.includes('president') || r.includes('secretary general') || r.includes('treasurer');
};

export default function LeadersPage() {
  const { t } = useTranslation();
  const { leadership, siteContent } = useData();
  const [activeCommittee, setActiveCommittee] = useState('Board of Directors');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const mandatePeriod = siteContent['leadership.mandatePeriod'] || '2024–2028';

  // Distinct list of committees preserving standard statutory order
  const standardCommittees = ['Board of Directors', 'Staff Team', 'Audit Committee', 'Conflict Resolution Committee'];
  const actualCommittees = Array.from(new Set(leadership.map(l => l.committee || 'Board of Directors')));
  const orderedCommittees = [
    'All',
    ...standardCommittees.filter(c => actualCommittees.includes(c)),
    ...actualCommittees.filter(c => !standardCommittees.includes(c)),
  ];

  // Organ counts
  const organCounts = useMemo(() => {
    const counts: Record<string, number> = { All: leadership.length };
    leadership.forEach(l => {
      const c = l.committee || 'Board of Directors';
      counts[c] = (counts[c] || 0) + 1;
    });
    return counts;
  }, [leadership]);

  // Filtered leaders
  const filteredLeaders = useMemo(() => {
    return leadership
      .filter(leader => {
        const committee = leader.committee || 'Board of Directors';
        const matchesCommittee = activeCommittee === 'All' || committee === activeCommittee;
        const query = search.trim().toLowerCase();
        const matchesSearch = !query ||
          leader.name.toLowerCase().includes(query) ||
          leader.role.toLowerCase().includes(query) ||
          committee.toLowerCase().includes(query) ||
          (leader.desc && leader.desc.toLowerCase().includes(query)) ||
          (leader.impairment && leader.impairment.toLowerCase().includes(query));

        return matchesCommittee && matchesSearch;
      })
      .sort((a, b) => {
        // Chairperson and SG always first within their committee
        const aExec = isExecutiveRole(a.role) ? 0 : 1;
        const bExec = isExecutiveRole(b.role) ? 0 : 1;
        if (aExec !== bExec) return aExec - bExec;
        return (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name);
      });
  }, [leadership, activeCommittee, search]);

  const totalPages = Math.ceil(filteredLeaders.length / ITEMS_PER_PAGE);
  const visiblePage = Math.min(currentPage, Math.max(totalPages, 1));
  const paginatedLeaders = filteredLeaders.slice((visiblePage - 1) * ITEMS_PER_PAGE, visiblePage * ITEMS_PER_PAGE);

  const resetPage = () => setCurrentPage(1);

  return (
    <main id="main-content" style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      
      {/* ═══════════════════════════════════════════════════════════
          EXECUTIVE LEADERSHIP PAGE HEADER
      ═══════════════════════════════════════════════════════════ */}
      <header className="page-header" style={{ borderBottom: '3px solid #0072C6', background: 'linear-gradient(135deg, #071D38 0%, #0F3A6C 60%, #082142 100%)', color: '#FFFFFF', padding: '60px 0 50px' }}>
        <div className="container">
          <nav aria-label="breadcrumb" data-aos="fade-up">
            <ol className="breadcrumb mb-3">
              <li className="breadcrumb-item">
                <Link href="/" className="text-white-50 text-decoration-none">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active text-white" aria-current="page">
                {t('phrase.Our Leadership')}
              </li>
            </ol>
          </nav>

          <div className="d-flex align-items-center gap-2 mb-2" data-aos="fade-up" data-aos-delay="30">
            <span className="badge rounded-pill text-uppercase fw-bold px-3 py-2 border border-white-50" style={{ background: 'rgba(255, 255, 255, 0.12)', fontSize: '0.72rem', letterSpacing: '0.8px' }}>
              <i className="fas fa-landmark text-warning me-2" aria-hidden="true" />
              Institutional Governance &amp; Executive Leadership
            </span>
          </div>

          <h1 className="page-title mb-3 text-white fw-extrabold" data-aos="fade-up" data-aos-delay="60" style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', letterSpacing: '-0.5px' }}>
            {t('phrase.Our Leadership')} &amp; Governing Organs
          </h1>

          <p className="page-subtitle text-white-50 mb-4" data-aos="fade-up" data-aos-delay="90" style={{ maxWidth: '880px', fontSize: '1.05rem', lineHeight: 1.65 }}>
            Meet the elected executive board, statutory oversight committees, and professional secretariat guiding the National Paralympic Committee of Rwanda in delivering athlete excellence, integrity, and social inclusion.
          </p>

          {/* Institutional Governance Highlights KPIs */}
          <div className="row g-3 pt-2" data-aos="fade-up" data-aos-delay="120">
            <div className="col-6 col-md-3">
              <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <div className="h3 mb-0 fw-bold text-warning">{leadership.length || 23}</div>
                <div className="small text-white-50">Governing Leaders</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <div className="h3 mb-0 fw-bold text-white">4</div>
                <div className="small text-white-50">Statutory Organs</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <div className="h3 mb-0 fw-bold text-info">100%</div>
                <div className="small text-white-50">Inclusive Representation</div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="p-3 rounded-3" style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <div className="h3 mb-0 fw-bold text-success">{mandatePeriod}</div>
                <div className="small text-white-50">Mandate Period</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          CONTROL & FILTER BAR (ORGAN SWITCHER + SEARCH)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-5">
        <div className="container">

          <div className="bg-white p-4 rounded-4 shadow-sm border mb-4" data-aos="fade-up">
            <div className="row g-3 align-items-center">
              
              {/* Search Bar */}
              <div className="col-lg-4">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0 text-muted">
                    <i className="fas fa-search" aria-hidden="true" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 py-2 bg-light"
                    placeholder="Search by leader name, role, or committee..."
                    value={search}
                    onChange={event => {
                      setSearch(event.target.value);
                      resetPage();
                    }}
                  />
                  {search && (
                    <button
                      className="btn btn-light border-start-0 border text-muted"
                      type="button"
                      onClick={() => {
                        setSearch('');
                        resetPage();
                      }}
                      title="Clear search"
                    >
                      <i className="fas fa-times" />
                    </button>
                  )}
                </div>
              </div>

              {/* Committee Tabs */}
              <div className="col-lg-8">
                <div className="d-flex flex-wrap gap-2 align-items-center justify-content-lg-end">
                  {orderedCommittees.map(committee => {
                    const count = organCounts[committee] || 0;
                    const isActive = activeCommittee === committee;
                    return (
                      <button
                        key={committee}
                        type="button"
                        onClick={() => {
                          setActiveCommittee(committee);
                          resetPage();
                        }}
                        className={`btn btn-sm py-2 px-3 fw-bold rounded-pill d-inline-flex align-items-center gap-2 transition-all ${
                          isActive
                            ? 'btn-primary text-white shadow-sm'
                            : 'btn-outline-secondary bg-white text-dark'
                        }`}
                        style={{ fontSize: '0.82rem' }}
                      >
                        <span>{committee}</span>
                        <span
                          className={`badge rounded-pill ${
                            isActive ? 'bg-white text-primary' : 'bg-light text-muted border'
                          }`}
                          style={{ fontSize: '0.72rem' }}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Organ Description Note */}
            {activeCommittee !== 'All' && COMMITTEE_META[activeCommittee] && (
              <div className="mt-3 pt-3 border-top d-flex align-items-start gap-2 text-muted small">
                <i className={`fas ${COMMITTEE_META[activeCommittee].icon} text-primary mt-1`} aria-hidden="true" />
                <span>{COMMITTEE_META[activeCommittee].desc}</span>
              </div>
            )}
          </div>

          {/* Active Filter Status */}
          <div className="d-flex justify-content-between align-items-center mb-4 px-2">
            <span className="small text-muted fw-semibold">
              Showing <strong className="text-dark">{filteredLeaders.length}</strong> {filteredLeaders.length === 1 ? 'profile' : 'profiles'}
              {activeCommittee !== 'All' && <> in <strong className="text-primary">{activeCommittee}</strong></>}
              {search && <> matching &ldquo;{search}&rdquo;</>}
            </span>
            {(search || activeCommittee !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setActiveCommittee('All');
                  resetPage();
                }}
                className="btn btn-link btn-sm text-decoration-none p-0 fw-bold text-primary"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════
              LEADERSHIP CARDS GRID
          ═══════════════════════════════════════════════════════════ */}
          {leadership.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 border shadow-sm my-3 p-5" data-aos="fade-up">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <h2 className="h6 text-muted fw-bold">Retrieving official leadership registry...</h2>
            </div>
          ) : filteredLeaders.length === 0 ? (
            <div className="text-center py-5 bg-white rounded-4 border shadow-sm my-3 p-5" data-aos="fade-up">
              <div className="text-muted mb-3">
                <i className="fas fa-user-slash fa-3x text-secondary opacity-50" aria-hidden="true" />
              </div>
              <h3 className="h5 fw-bold text-dark">No leaders found</h3>
              <p className="small text-muted mb-3">No profiles matched your search or organ filter.</p>
              <button
                onClick={() => { setSearch(''); setActiveCommittee('All'); resetPage(); }}
                className="btn btn-outline-primary btn-sm px-4 fw-bold rounded-pill"
              >
                Show All Leaders
              </button>
            </div>
          ) : (
            <>
              <div className="row g-4">
                {paginatedLeaders.map((leader, index) => {
                  const committee = leader.committee || 'Board of Directors';
                  const meta = COMMITTEE_META[committee] || {
                    icon: 'fa-landmark',
                    badgeBg: '#EFF6FF',
                    badgeColor: '#1D4ED8',
                  };
                  const isExec = isExecutiveRole(leader.role);
                  const profileSrc = getProfileImageSrc(leader.avatar);
                  const hasImage = profileSrc && !imgErrors[leader.id];

                  return (
                    <div key={leader.id} className="col-md-6 col-lg-6" data-aos="fade-up" data-aos-delay={`${(index % 4) * 50}`}>
                      <article
                        className="card h-100 border rounded-4 bg-white shadow-sm overflow-hidden transition-all"
                        style={{
                          borderColor: isExec ? '#BFDBFE' : '#E2E8F0',
                          borderTopWidth: isExec ? '4px' : '1px',
                          borderTopColor: isExec ? '#0072C6' : '#E2E8F0',
                          transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                        }}
                      >
                        <div className="card-body p-4 d-flex flex-column justify-content-between">
                          <div>
                            {/* Header row with badges */}
                            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                              <span
                                className="badge px-3 py-1 rounded-pill fw-bold text-uppercase d-inline-flex align-items-center gap-1"
                                style={{
                                  background: meta.badgeBg,
                                  color: meta.badgeColor,
                                  fontSize: '0.72rem',
                                  letterSpacing: '0.4px',
                                }}
                              >
                                <i className={`fas ${meta.icon} me-1`} aria-hidden="true" />
                                {committee}
                              </span>

                              {leader.impairment && (
                                <span
                                  className="badge px-3 py-1 rounded-pill fw-bold d-inline-flex align-items-center gap-1 border"
                                  style={{
                                    background: '#F0FDF4',
                                    color: '#15803D',
                                    borderColor: '#BBF7D0',
                                    fontSize: '0.72rem',
                                  }}
                                  title={`Representation: ${leader.impairment}`}
                                >
                                  <i className="fas fa-universal-access me-1" aria-hidden="true" />
                                  {leader.impairment} Representation
                                </span>
                              )}
                            </div>

                            {/* Avatar and Leader Info */}
                            <div className="d-flex align-items-start gap-3 mb-3">
                              <div
                                className="position-relative flex-shrink-0"
                                style={{
                                  width: '84px',
                                  height: '84px',
                                  borderRadius: '50%',
                                  overflow: 'hidden',
                                  border: isExec ? '3px solid #0072C6' : '3px solid #E2E8F0',
                                  boxShadow: '0 4px 14px rgba(0,0,0,0.08)',
                                  background: 'linear-gradient(135deg, #071D38 0%, #0F3A6C 100%)',
                                }}
                              >
                                {hasImage ? (
                                  <img
                                    src={profileSrc}
                                    alt={`${leader.name} portrait`}
                                    style={{
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                    }}
                                    onError={() => {
                                      setImgErrors(prev => ({ ...prev, [leader.id]: true }));
                                    }}
                                  />
                                ) : (
                                  <div
                                    className="w-100 h-100 d-flex align-items-center justify-content-center text-white fw-bold"
                                    style={{
                                      fontSize: '1.4rem',
                                      letterSpacing: '0.5px',
                                    }}
                                  >
                                    {getInitials(leader.name)}
                                  </div>
                                )}
                              </div>

                              <div className="flex-grow-1">
                                <h3 className="h5 fw-bold text-dark mb-1" style={{ lineHeight: 1.3 }}>
                                  {leader.name}
                                </h3>
                                <div
                                  className="fw-bold mb-2 d-inline-flex align-items-center gap-1"
                                  style={{ color: '#0072C6', fontSize: '0.92rem' }}
                                >
                                  {isExec && <i className="fas fa-crown text-warning me-1" title="Executive Officer" aria-hidden="true" />}
                                  <span>{t(leader.role)}</span>
                                </div>
                                <div className="small text-muted">
                                  <i className="fas fa-shield-alt text-primary opacity-50 me-1" aria-hidden="true" />
                                  NPC Rwanda General Assembly Mandate
                                </div>
                              </div>
                            </div>

                            {/* Biography / Description */}
                            <p
                              className="text-secondary small mb-3"
                              style={{
                                lineHeight: 1.65,
                                fontSize: '0.88rem',
                                color: '#475569',
                              }}
                            >
                              {t(leader.desc) || 'Dedicated to promoting inclusive sports development, athlete pathways, and institutional integrity within the National Paralympic Movement.'}
                            </p>
                          </div>

                          {/* Footer / Contact bar */}
                          <div className="border-top pt-3 mt-2 d-flex flex-wrap align-items-center justify-content-between gap-2 small">
                            {(leader.email || leader.phone) ? (
                              <div className="d-flex flex-wrap gap-3">
                                {leader.email && (
                                  <a
                                    href={`mailto:${leader.email}`}
                                    className="text-decoration-none text-muted fw-semibold d-inline-flex align-items-center gap-1 hover-primary"
                                  >
                                    <i className="fas fa-envelope text-primary" aria-hidden="true" />
                                    <span>{leader.email}</span>
                                  </a>
                                )}
                                {leader.phone && (
                                  <a
                                    href={`tel:${leader.phone}`}
                                    className="text-decoration-none text-muted fw-semibold d-inline-flex align-items-center gap-1 hover-primary"
                                  >
                                    <i className="fas fa-phone text-primary" aria-hidden="true" />
                                    <span>{leader.phone}</span>
                                  </a>
                                )}
                              </div>
                            ) : (
                              <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                                <i className="fas fa-id-badge text-primary opacity-75 me-1" aria-hidden="true" />
                                Official Governance Officer
                              </span>
                            )}

                            <span
                              className="badge bg-light text-dark border px-2 py-1 rounded-pill"
                              style={{ fontSize: '0.72rem' }}
                            >
                              Mandate: {mandatePeriod}
                            </span>
                          </div>
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              <div className="mt-5">
                <Pagination
                  currentPage={visiblePage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  ariaLabel="Leadership directory pagination"
                />
              </div>
            </>
          )}

        </div>
      </section>
    </main>
  );
}
