'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

type Programme = {
  id: string;
  title: string;
  sport: string;
  description: string;
  location: string;
  schedule: string;
  startDate: string;
  endDate: string;
  eligibility: string;
  featured: boolean;
};

export default function SportsDevelopmentPage() {
  const { t } = useTranslation();
  const { dpscoContacts } = useData();
  const districtCount = new Set(dpscoContacts.filter(contact => contact.active).map(contact => contact.district.trim().toLowerCase()).filter(Boolean)).size;
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    let active = true;
    fetch('/api/training-programs')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!active) return;
        setProgrammes(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        // Silently handle if offline or empty
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const pathwayStages = [
    {
      step: '01',
      title: 'Grassroots Scouting & School Outreach',
      icon: 'fa-magnifying-glass-chart',
      badge: 'Discovery Phase',
      desc: 'Active talent scouting across districts of Rwanda in partnership with inclusive schools, district sports committees, and local disability support networks.',
      points: [
        'Annual district talent identification clinics',
        'Inclusive physical education in primary & secondary schools',
        'Basic physical assessment & medical screening',
      ],
    },
    {
      step: '02',
      title: 'District Academies & Club Training',
      icon: 'fa-dumbbell',
      badge: 'Foundation Phase',
      desc: 'Identified athletes join local clubs and district sports academies for structured technical coaching, physical conditioning, and adaptive equipment orientation.',
      points: [
        'Weekly structured training sessions with certified coaches',
        'Provision of specialized adaptive sports equipment',
        'Participation in regional youth and development tournaments',
      ],
    },
    {
      step: '03',
      title: 'National Classification & League Play',
      icon: 'fa-id-card-clip',
      badge: 'Classification Phase',
      desc: 'Athletes undergo official national and IPC-standard sports classification to establish eligible sport classes for competitive league play and national championships.',
      points: [
        'Physical, visual, and intellectual impairment classification',
        'Regular season competition in national leagues',
        'National Championship qualification and rankings',
      ],
    },
    {
      step: '04',
      title: 'High-Performance & Paralympic Podium',
      icon: 'fa-trophy',
      badge: 'Podium Excellence',
      desc: 'Top-tier athletes represent Rwanda in national squads, entering intensive training camps, continental championships, World Championships, and the Paralympic Games.',
      points: [
        'National team intensive residential training camps',
        'Sports science, nutrition, and psychological support',
        'African Para Games, World Championships & Paralympic representation',
      ],
    },
  ];

  return (
    <main id="main-content" style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* ═══════════════════════════════════════════════════════════
          PAGE HEADER (Consistent High-Contrast Light Design System)
      ═══════════════════════════════════════════════════════════ */}
      <header
        className="page-header"
        style={{
          borderBottom: '1px solid #E2E8F0',
          background: '#F8FAFC',
          color: '#000000',
          padding: '44px 0 52px',
        }}
      >
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-3" style={{ fontSize: '0.88rem' }}>
              <li className="breadcrumb-item">
                <Link href="/" style={{ color: '#000000', fontWeight: 600, textDecoration: 'none' }}>
                  <i className="fas fa-home me-1" />
                  {t('nav.home') || 'Home'}
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page" style={{ color: '#000000', fontWeight: 800 }}>
                Sports Development
              </li>
            </ol>
          </nav>

          <div className="text-center mx-auto" style={{ maxWidth: '960px' }}>
            <span
              className="badge rounded-pill text-uppercase fw-bold px-3 py-2 mb-3"
              style={{
                background: '#FEF3C7',
                color: '#000000',
                border: '1.5px solid #F59E0B',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <i className="fas fa-chart-line text-warning" />
              GRASSROOTS TO PODIUM EXCELLENCE
            </span>

            <h1
              className="fw-black mb-3"
              style={{
                color: '#000000',
                fontSize: 'clamp(2.1rem, 3.8vw, 3.1rem)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              Sports Development &amp; Athlete Pathways
            </h1>

            <p
              style={{
                color: '#000000',
                maxWidth: '860px',
                fontSize: '1.1rem',
                lineHeight: 1.7,
                fontWeight: 500,
                margin: '0 auto',
              }}
            >
              Building Rwanda&apos;s next generation of Paralympic champions through grassroots scouting, structured coaching,
              district academies, and official sports classification across Rwanda.
            </p>

            {/* High-Contrast Highlights KPI Bar */}
            <div className="row g-3 mt-4 pt-2 text-start">
              <div className="col-6 col-md-3">
                <div
                  className="p-3 rounded-3 h-100 text-center"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="fw-black" style={{ color: '#0B5F9F', fontSize: '1.45rem', lineHeight: 1.2 }}>
                    {districtCount}
                  </div>
                  <div className="small fw-bold mt-1" style={{ color: '#000000', fontSize: '0.8rem' }}>
                    Districts with Active Contacts
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div
                  className="p-3 rounded-3 h-100 text-center"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="fw-black" style={{ color: '#0B5F9F', fontSize: '1.45rem', lineHeight: 1.2 }}>
                    4-Tier
                  </div>
                  <div className="small fw-bold mt-1" style={{ color: '#000000', fontSize: '0.8rem' }}>
                    Athlete Pathway
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div
                  className="p-3 rounded-3 h-100 text-center"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="fw-black" style={{ color: '#0B5F9F', fontSize: '1.45rem', lineHeight: 1.2 }}>
                    IPC Standards
                  </div>
                  <div className="small fw-bold mt-1" style={{ color: '#000000', fontSize: '0.8rem' }}>
                    Certified Classification
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div
                  className="p-3 rounded-3 h-100 text-center"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="fw-black" style={{ color: '#0B5F9F', fontSize: '1.45rem', lineHeight: 1.2 }}>
                    Grassroots
                  </div>
                  <div className="small fw-bold mt-1" style={{ color: '#000000', fontSize: '0.8rem' }}>
                    Youth Talent Scouting
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 1: THE 4-STAGE ATHLETE DEVELOPMENT PATHWAY
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-5" style={{ background: '#FFFFFF' }}>
        <div className="container">
          <div className="text-center mx-auto mb-5" style={{ maxWidth: '780px' }}>
            <span
              className="badge px-3 py-1 mb-2 text-uppercase fw-bold"
              style={{
                background: '#E0F2FE',
                color: '#075985',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
              }}
            >
              Development Framework
            </span>
            <h2 className="fw-bold mb-2" style={{ color: '#000000', fontSize: '2rem' }}>
              The Rwandan Para-Athlete Pathway
            </h2>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6 }}>
              Every Rwandan champion follows a clear, structured progression from school-level discovery to the international podium.
            </p>
          </div>

          <div className="row g-4">
            {pathwayStages.map((stage) => (
              <div className="col-md-6 col-lg-3" key={stage.step}>
                <div
                  className="p-4 rounded-4 h-100 d-flex flex-column position-relative"
                  style={{
                    background: '#F8FAFC',
                    border: '1.5px solid #E2E8F0',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <span
                      className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                      style={{
                        width: '42px',
                        height: '42px',
                        background: '#0B5F9F',
                        color: '#FFFFFF',
                        fontSize: '0.95rem',
                      }}
                    >
                      {stage.step}
                    </span>
                    <span
                      className="badge rounded-pill px-2.5 py-1 text-uppercase fw-bold"
                      style={{
                        background: '#EFF6FF',
                        color: '#0B5F9F',
                        fontSize: '0.7rem',
                        border: '1px solid #BFDBFE',
                      }}
                    >
                      {stage.badge}
                    </span>
                  </div>

                  <h3 className="fw-bold mb-2" style={{ color: '#000000', fontSize: '1.15rem', lineHeight: 1.35 }}>
                    {stage.title}
                  </h3>

                  <p className="mb-4" style={{ color: '#475569', fontSize: '0.88rem', lineHeight: 1.6 }}>
                    {stage.desc}
                  </p>

                  <div className="mt-auto pt-3 border-top" style={{ borderColor: '#E2E8F0' }}>
                    <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                      {stage.points.map((pt, idx) => (
                        <li key={idx} className="d-flex align-items-start gap-2 small" style={{ color: '#334155', fontSize: '0.82rem' }}>
                          <i className="fas fa-check text-success mt-1 flex-shrink-0" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 2: ACTIVE TRAINING PROGRAMMES & CLINICS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-5" style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
            <div>
              <span
                className="badge px-3 py-1 mb-2 text-uppercase fw-bold"
                style={{
                  background: '#FEF3C7',
                  color: '#000000',
                  border: '1.5px solid #F59E0B',
                  fontSize: '0.72rem',
                }}
              >
                Official Academies
              </span>
              <h2 className="fw-bold mb-1" style={{ color: '#000000', fontSize: '1.75rem' }}>
                Published Training Programmes
              </h2>
              <p className="mb-0 text-muted small">
                Official development camps, grassroots clinics, and high-performance sessions run by NPC Rwanda.
              </p>
            </div>
            <Link
              href="/athletes"
              className="btn btn-outline-dark fw-bold btn-sm d-inline-flex align-items-center gap-1 rounded-3 px-3 py-2"
              style={{ borderColor: '#CBD5E1', background: '#FFFFFF' }}
            >
              <span>View National Athletes</span>
              <i className="fas fa-arrow-right ms-1" style={{ fontSize: '0.75rem' }} />
            </Link>
          </div>

          {loading ? (
            <div className="p-5 text-center bg-white rounded-4 border" style={{ borderColor: '#E2E8F0' }}>
              <div className="spinner-border text-primary mb-3" role="status" />
              <p className="text-muted mb-0">Loading sports development programmes...</p>
            </div>
          ) : programmes.length > 0 ? (
            <div className="row g-4">
              {programmes.map((p) => (
                <div className="col-md-6 col-lg-4" key={p.id}>
                  <div
                    className="p-4 rounded-4 h-100 d-flex flex-column bg-white"
                    style={{
                      border: '1.5px solid #E2E8F0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <span
                        className="badge px-2.5 py-1 text-uppercase fw-bold rounded-pill"
                        style={{ background: '#0B5F9F', color: '#FFFFFF', fontSize: '0.72rem' }}
                      >
                        {p.sport}
                      </span>
                      {p.featured && (
                        <span
                          className="badge px-2.5 py-1 text-uppercase fw-bold rounded-pill"
                          style={{ background: '#FEF3C7', color: '#000000', border: '1px solid #F59E0B', fontSize: '0.7rem' }}
                        >
                          Featured
                        </span>
                      )}
                    </div>

                    <h3 className="fw-bold mb-2" style={{ color: '#000000', fontSize: '1.2rem' }}>
                      {p.title}
                    </h3>

                    <p className="mb-3 text-muted" style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
                      {p.description}
                    </p>

                    <div className="mt-auto pt-3 border-top" style={{ borderColor: '#F1F5F9', fontSize: '0.85rem' }}>
                      {p.location && (
                        <div className="mb-1.5 d-flex align-items-center gap-2" style={{ color: '#334155' }}>
                          <i className="fas fa-location-dot text-primary flex-shrink-0" />
                          <span>{p.location}</span>
                        </div>
                      )}
                      {p.schedule && (
                        <div className="mb-1.5 d-flex align-items-center gap-2" style={{ color: '#334155' }}>
                          <i className="fas fa-clock text-primary flex-shrink-0" />
                          <span>{p.schedule}</span>
                        </div>
                      )}
                      {(p.startDate || p.endDate) && (
                        <div className="mb-1.5 d-flex align-items-center gap-2" style={{ color: '#334155' }}>
                          <i className="fas fa-calendar text-primary flex-shrink-0" />
                          <span>
                            {p.startDate}
                            {p.endDate ? ` – ${p.endDate}` : ''}
                          </span>
                        </div>
                      )}
                      {p.eligibility && (
                        <div className="mt-2 p-2 rounded-2" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                          <span className="fw-bold" style={{ color: '#000000' }}>Eligibility: </span>
                          <span style={{ color: '#475569' }}>{p.eligibility}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="p-4 p-md-5 rounded-4 bg-white text-center"
              style={{
                border: '1.5px solid #E2E8F0',
                maxWidth: '820px',
                margin: '0 auto',
              }}
            >
              <div
                className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{
                  width: '60px',
                  height: '60px',
                  background: '#EFF6FF',
                  color: '#0B5F9F',
                  fontSize: '1.5rem',
                }}
              >
                <i className="fas fa-calendar-check" />
              </div>
              <h3 className="fw-bold mb-2" style={{ color: '#000000', fontSize: '1.25rem' }}>
                Seasonal Academy Schedule Under Preparation
              </h3>
              <p className="mb-4 text-muted" style={{ fontSize: '0.92rem', maxWidth: '560px', margin: '0 auto 1.5rem' }}>
                District sports development camps and youth training sessions are scheduled in alignment with national championship calendars.
                Aspiring athletes are encouraged to register their details below to receive early notifications.
              </p>
              <a
                href="#talent-registration"
                className="btn btn-primary fw-bold px-4 py-2.5 rounded-3 d-inline-flex align-items-center gap-2"
                style={{ background: '#0B5F9F', borderColor: '#0B5F9F' }}
              >
                <span>Register as an Aspiring Athlete</span>
                <i className="fas fa-arrow-down" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 3: CLASSIFICATION & COACHING PILLARS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-5" style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
        <div className="container">
          <div className="row g-4">
            {/* Pillar 1: Understanding Sports Classification */}
            <div className="col-lg-6">
              <div
                className="p-4 p-md-5 rounded-4 h-100 d-flex flex-column"
                style={{
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: '50px',
                    height: '50px',
                    background: '#0B5F9F',
                    color: '#FFFFFF',
                    fontSize: '1.25rem',
                  }}
                >
                  <i className="fas fa-scale-balanced" />
                </div>
                <h3 className="fw-bold mb-2" style={{ color: '#000000', fontSize: '1.4rem' }}>
                  Understanding Para-Sport Classification
                </h3>
                <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  Classification is the foundation of Paralympic competition. It groups athletes into sport classes according to the extent
                  to which their impairment impacts their athletic performance, ensuring that winning is determined by skill, fitness, and tactical excellence.
                </p>

                <div className="d-flex flex-column gap-2 mb-4">
                  <div className="d-flex align-items-center gap-2 small" style={{ color: '#1E293B', fontWeight: 600 }}>
                    <i className="fas fa-circle-check text-primary" />
                    <span>Physical Impairments (limb deficiency, spinal injury, muscle weakness)</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 small" style={{ color: '#1E293B', fontWeight: 600 }}>
                    <i className="fas fa-circle-check text-primary" />
                    <span>Visual Impairments (low vision, partial sight, total blindness)</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 small" style={{ color: '#1E293B', fontWeight: 600 }}>
                    <i className="fas fa-circle-check text-primary" />
                    <span>Intellectual Impairments (diagnosed prior to age 18)</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <Link
                    href="/resources"
                    className="fw-bold text-decoration-none d-inline-flex align-items-center gap-2"
                    style={{ color: '#0B5F9F', fontSize: '0.9rem' }}
                  >
                    <span>Read Official Classification Documents &amp; Rules</span>
                    <i className="fas fa-arrow-right" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Pillar 2: Coaching & Technical Officials Certification */}
            <div className="col-lg-6">
              <div
                className="p-4 p-md-5 rounded-4 h-100 d-flex flex-column"
                style={{
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: '50px',
                    height: '50px',
                    background: '#10B981',
                    color: '#FFFFFF',
                    fontSize: '1.25rem',
                  }}
                >
                  <i className="fas fa-chalkboard-user" />
                </div>
                <h3 className="fw-bold mb-2" style={{ color: '#000000', fontSize: '1.4rem' }}>
                  Coaching &amp; Technical Officials Education
                </h3>
                <p style={{ color: '#475569', fontSize: '0.92rem', lineHeight: 1.6 }}>
                  High-performing athletes require qualified leaders. NPC Rwanda collaborates with the Ministry of Sports, the IPC, and continental
                  sport federations to train certified coaches, referees, and national classifiers across Rwanda.
                </p>

                <div className="d-flex flex-column gap-2 mb-4">
                  <div className="d-flex align-items-center gap-2 small" style={{ color: '#1E293B', fontWeight: 600 }}>
                    <i className="fas fa-circle-check text-success" />
                    <span>Level 1 &amp; Level 2 Para-Coaching certification clinics</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 small" style={{ color: '#1E293B', fontWeight: 600 }}>
                    <i className="fas fa-circle-check text-success" />
                    <span>Referee and line official accreditation for national leagues</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 small" style={{ color: '#1E293B', fontWeight: 600 }}>
                    <i className="fas fa-circle-check text-success" />
                    <span>Safeguarding in sport and inclusive sports administration workshops</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <Link
                    href="/contact"
                    className="fw-bold text-decoration-none d-inline-flex align-items-center gap-2"
                    style={{ color: '#059669', fontSize: '0.9rem' }}
                  >
                    <span>Inquire About Coaching Certification Courses</span>
                    <i className="fas fa-arrow-right" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SECTION 5: COMMUNITY CONNECTIONS & MEMBER DIRECTORIES
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-5" style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}>
        <div className="container">
          <div className="text-center mx-auto mb-4" style={{ maxWidth: '700px' }}>
            <h3 className="fw-bold mb-1" style={{ color: '#000000', fontSize: '1.4rem' }}>
              Connect With Your Local Para-Sports Community
            </h3>
            <p className="text-muted small">
              Explore our nationwide network of recognized federations, district sports coordinators, and registered clubs.
            </p>
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <Link
                href="/members/dpsco"
                className="p-3.5 rounded-3 d-block text-decoration-none h-100"
                style={{
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  color: '#000000',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="fas fa-map-location-dot text-primary" />
                  <span className="fw-bold" style={{ fontSize: '0.95rem' }}>
                    District Sports Coordinators
                  </span>
                </div>
                <p className="text-muted small mb-0">
                  Find direct contact details for DPSCO representatives across Rwanda.
                </p>
              </Link>
            </div>

            <div className="col-md-4">
              <Link
                href="/members/associations"
                className="p-3.5 rounded-3 d-block text-decoration-none h-100"
                style={{
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  color: '#000000',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="fas fa-users text-primary" />
                  <span className="fw-bold" style={{ fontSize: '0.95rem' }}>
                    Clubs &amp; Member Associations
                  </span>
                </div>
                <p className="text-muted small mb-0">
                  Browse officially affiliated sitting volleyball clubs, para-athletics associations, and basketball teams.
                </p>
              </Link>
            </div>

            <div className="col-md-4">
              <Link
                href="/volunteer"
                className="p-3.5 rounded-3 d-block text-decoration-none h-100"
                style={{
                  background: '#F8FAFC',
                  border: '1.5px solid #E2E8F0',
                  color: '#000000',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-1">
                  <i className="fas fa-hands-helping text-primary" />
                  <span className="fw-bold" style={{ fontSize: '0.95rem' }}>
                    Volunteer Program
                  </span>
                </div>
                <p className="text-muted small mb-0">
                  Support event operations, logistics, athlete assistance, and media coverage nationwide.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
