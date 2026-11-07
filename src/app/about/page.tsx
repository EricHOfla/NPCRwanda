'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

export default function AboutPage() {
  const { t } = useTranslation();
  const { siteContent } = useData();

  const getSiteText = (key: string, fallback: string) => {
    return siteContent[key] || fallback;
  };

  const coreValues = [
    {
      icon: 'fa-heart',
      title: 'phrase.Courage',
      desc: 'phrase.The courage to compete at the highest level and redefine what is possible.',
      accent: '#E11D48',
      bg: '#FFE4E6',
    },
    {
      icon: 'fa-fire',
      title: 'phrase.Determination',
      desc: 'phrase.Relentless commitment to preparation, discipline, and sporting excellence.',
      accent: '#D97706',
      bg: '#FEF3C7',
    },
    {
      icon: 'fa-equals',
      title: 'phrase.Equality',
      desc: 'phrase.Ensuring fair access, respect, and opportunity for all athletes.',
      accent: '#059669',
      bg: '#D1FAE5',
    },
    {
      icon: 'fa-lightbulb',
      title: 'phrase.Inspiration',
      desc: 'phrase.Inspiring communities through achievement and leadership on and off the field.',
      accent: '#0284C7',
      bg: '#E0F2FE',
    },
    {
      icon: 'fa-fist-raised',
      title: 'phrase.Empowerment',
      desc: 'phrase.Equipping athletes with the tools, training, and support they need to thrive.',
      accent: '#7C3AED',
      bg: '#EDE9FE',
    },
    {
      icon: 'fa-project-diagram',
      title: 'phrase.Intersectionality',
      desc: 'phrase.Recognizing the diverse experiences that shape our athletes and communities.',
      accent: '#0D9488',
      bg: '#CCFBF1',
    },
  ];

  const strategicObjectives = [
    {
      num: '01',
      icon: 'fa-chart-line',
      title: 'phrase.Athlete Excellence',
      desc: 'phrase.Strengthen coaching, science, and athlete support to compete for podium finishes internationally.',
      outcome: 'Podium focus & high-performance science',
    },
    {
      num: '02',
      icon: 'fa-users-viewfinder',
      title: 'phrase.Grassroots Development',
      desc: 'phrase.Expand access in all 30 districts and identify talent early for long-term development.',
      outcome: '30 districts active talent pathways',
    },
    {
      num: '03',
      icon: 'fa-shield-halved',
      title: 'phrase.Safeguarding & Governance',
      desc: 'phrase.Maintain strong safeguarding practices and transparent governance at all levels.',
      outcome: 'Zero-tolerance safeguarding & compliance',
    },
    {
      num: '04',
      icon: 'fa-handshake-angle',
      title: 'phrase.Partnership Growth',
      desc: 'phrase.Build sustainable partnerships with government, federations, and private sector sponsors.',
      outcome: 'Long-term funding & commercial partnerships',
    },
  ];

  const milestones = [
    {
      year: '2001',
      title: 'Foundation of NPC Rwanda',
      desc: 'Officially constituted in November 2001 to organize, develop, and advocate for Paralympic sports across Rwanda.',
    },
    {
      year: '2004',
      title: 'First Paralympic Appearance',
      desc: 'Athens 2004 marked Rwanda’s Paralympic debut, initiating a legacy of high-performance international competition.',
    },
    {
      year: '2016',
      title: 'Historic Rio Qualification',
      desc: "Rwanda's Women's Sitting Volleyball team became the first women's team from Sub-Saharan Africa to qualify for the Paralympic Games.",
    },
    {
      year: '2021',
      title: 'Tokyo 2020 Expansion',
      desc: 'Fielded athletes across Sitting Volleyball and Para-Athletics while launching district grassroots classification clinics.',
    },
    {
      year: '2024–2028',
      title: 'Quadrennial Strategic Plan',
      desc: 'Executing a comprehensive multi-year strategy to modernize training centers, empower youth, and achieve podium excellence.',
    },
  ];

  const affiliations = [
    { name: 'International Paralympic Committee', tag: 'IPC Member', role: 'Global governing body of the Paralympic Movement' },
    { name: 'African Paralympic Committee', tag: 'APC Member', role: 'Continental confederation coordinating African Para-Sport' },
    { name: 'Ministry of Sports (MINISPORTS)', tag: 'National Authority', role: 'Institutional partner and national policy stakeholder' },
    { name: 'World ParaVolley (WPV)', tag: 'Global Federation', role: 'International governing body for Sitting Volleyball' },
  ];

  const histImg = siteContent['about.historyImage'];
  const hasHistImg = Boolean(histImg && histImg.trim() !== '' && !histImg.includes('/assets/img/curated/'));

  return (
    <main id="main-content" className="about-page-root">
      {/* ═══════════════════════════════════════════════════════════
          PAGE HEADER (Consistent Light Design System & Black Text)
      ═══════════════════════════════════════════════════════════ */}
      <header className="page-header" style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', color: '#000000', padding: '44px 0 52px' }}>
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-3">
              <li className="breadcrumb-item">
                <Link href="/" style={{ color: '#000000', fontWeight: 600, textDecoration: 'none' }}>
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page" style={{ color: '#000000', fontWeight: 800 }}>
                {t('phrase.About Us')}
              </li>
            </ol>
          </nav>

          <div className="d-flex align-items-center gap-2 mb-3">
            <span
              className="badge rounded-pill text-uppercase fw-bold px-3 py-2"
              style={{
                background: '#FEF3C7',
                color: '#000000',
                border: '1.5px solid #F59E0B',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
              }}
            >
              <i className="fas fa-flag me-2" style={{ color: '#D97706' }} aria-hidden="true" />
              National Paralympic Committee of Rwanda
            </span>
          </div>

          <h1
            className="page-title mb-3 fw-bold"
            style={{
              color: '#000000',
              fontSize: 'clamp(2.1rem, 3.8vw, 3.1rem)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            Championing Inclusion Through Para-Sport Excellence
          </h1>

          <p
            className="page-subtitle mb-4"
            style={{
              color: '#000000',
              maxWidth: '860px',
              fontSize: '1.1rem',
              lineHeight: 1.7,
              fontWeight: 500,
            }}
          >
            Founded in November 2001, NPC Rwanda is the recognized governing authority for Paralympic sports in Rwanda,
            dedicated to empowering persons with disabilities, developing elite champions, and transforming perceptions through sport.
          </p>

          {/* Quick Metrics Bar */}
          <div className="row g-3 pt-2">
            <div className="col-6 col-md-3">
              <div
                className="p-3"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '14px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div className="h3 mb-1 fw-bold" style={{ color: '#0B5F9F' }}>
                  30
                </div>
                <div className="small fw-bold" style={{ color: '#000000' }}>
                  Districts Covered
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div
                className="p-3"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '14px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div className="h3 mb-1 fw-bold" style={{ color: '#0B5F9F' }}>
                  1,200+
                </div>
                <div className="small fw-bold" style={{ color: '#000000' }}>
                  Para-Athletes Supported
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div
                className="p-3"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '14px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div className="h3 mb-1 fw-bold" style={{ color: '#0B5F9F' }}>
                  8+
                </div>
                <div className="small fw-bold" style={{ color: '#000000' }}>
                  Para-Sport Disciplines
                </div>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div
                className="p-3"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #CBD5E1',
                  borderRadius: '14px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div className="h3 mb-1 fw-bold" style={{ color: '#0B5F9F' }}>
                  6
                </div>
                <div className="small fw-bold" style={{ color: '#000000' }}>
                  Paralympic Games Editions
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          VISION & MISSION (Dual Elevated Feature Cards)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-5" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <div className="row g-4 align-items-stretch">
            {/* Vision Card */}
            <div className="col-lg-6">
              <div
                className="h-100 p-4 p-md-5 d-flex flex-column justify-content-between"
                style={{
                  background: 'linear-gradient(145deg, #F0FDF4 0%, #DCFCE7 100%)',
                  border: '2px solid #86EFAC',
                  borderRadius: '20px',
                  boxShadow: '0 8px 24px rgba(22, 101, 52, 0.06)',
                }}
              >
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <span
                      className="badge rounded-pill text-uppercase fw-bold px-3 py-2"
                      style={{ background: '#166534', color: '#FFFFFF', fontSize: '0.76rem', letterSpacing: '0.08em' }}
                    >
                      Long-Term Horizon
                    </span>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: '#166534',
                        color: '#FFFFFF',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '1.35rem',
                      }}
                    >
                      <i className="fas fa-eye" aria-hidden="true" />
                    </div>
                  </div>
                  <h2 className="h3 fw-bold mb-3" style={{ color: '#14532D' }}>
                    {t('phrase.Our Vision')}
                  </h2>
                  <p className="lead fw-bold mb-4" style={{ color: '#166534', lineHeight: 1.5 }}>
                    &ldquo;{getSiteText('about.vision', t('phrase.To be the leading Paralympic nation in Africa.'))}&rdquo;
                  </p>
                  <p className="mb-0" style={{ color: '#15803D', fontSize: '0.95rem', lineHeight: 1.65 }}>
                    Striving for continental leadership through world-class performance, state-of-the-art coaching,
                    and building pathways that turn aspiring talent into celebrated podium medalists.
                  </p>
                </div>
                <div className="d-flex flex-wrap gap-2 mt-4 pt-3 border-top" style={{ borderColor: 'rgba(22, 101, 52, 0.2)' }}>
                  <span className="badge bg-white text-success border px-2 py-1">Top Continental Seed</span>
                  <span className="badge bg-white text-success border px-2 py-1">Podium Ambition</span>
                  <span className="badge bg-white text-success border px-2 py-1">Societal Equity</span>
                </div>
              </div>
            </div>

            {/* Mission Card */}
            <div className="col-lg-6">
              <div
                className="h-100 p-4 p-md-5 d-flex flex-column justify-content-between"
                style={{
                  background: 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)',
                  border: '2px solid #93C5FD',
                  borderRadius: '20px',
                  boxShadow: '0 8px 24px rgba(30, 64, 175, 0.06)',
                }}
              >
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <span
                      className="badge rounded-pill text-uppercase fw-bold px-3 py-2"
                      style={{ background: '#1E40AF', color: '#FFFFFF', fontSize: '0.76rem', letterSpacing: '0.08em' }}
                    >
                      Our Daily Purpose
                    </span>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        background: '#1E40AF',
                        color: '#FFFFFF',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '1.35rem',
                      }}
                    >
                      <i className="fas fa-bullseye" aria-hidden="true" />
                    </div>
                  </div>
                  <h2 className="h3 fw-bold mb-3" style={{ color: '#1E3A8A' }}>
                    {t('phrase.Our Mission')}
                  </h2>
                  <p className="lead fw-bold mb-4" style={{ color: '#1E40AF', lineHeight: 1.5 }}>
                    &ldquo;
                    {getSiteText(
                      'about.mission',
                      t(
                        'phrase.To develop a sustainable Paralympic sport system in Rwanda for enabling Para-athletes to achieve their sporting aspirations in local and International sport arena.'
                      )
                    )}
                    &rdquo;
                  </p>
                  <p className="mb-0" style={{ color: '#1D4ED8', fontSize: '0.95rem', lineHeight: 1.65 }}>
                    Deploying structured coaching networks, standardized classification clinics, adaptive equipment,
                    and international competitive opportunities across Rwanda.
                  </p>
                </div>
                <div className="d-flex flex-wrap gap-2 mt-4 pt-3 border-top" style={{ borderColor: 'rgba(30, 64, 175, 0.2)' }}>
                  <span className="badge bg-white text-primary border px-2 py-1">Grassroots Discovery</span>
                  <span className="badge bg-white text-primary border px-2 py-1">Athlete Welfare</span>
                  <span className="badge bg-white text-primary border px-2 py-1">Global Competition</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          OUR HISTORY & JOURNEY
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-5" style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <div className="row align-items-center g-5 mb-5">
            <div className={hasHistImg ? 'col-lg-6' : 'col-lg-10 mx-auto'}>
              <div className="d-inline-flex align-items-center gap-2 mb-2">
                <span className="badge bg-primary text-white text-uppercase px-2 py-1" style={{ fontSize: '0.72rem' }}>
                  Our Heritage
                </span>
                <span className="small fw-bold text-muted">2001 to Present</span>
              </div>
              <h2 className="h2 fw-bold text-dark mb-4">{t('phrase.Our History')}</h2>
              <p className="text-secondary mb-3" style={{ fontSize: '1.05rem', lineHeight: 1.75 }}>
                {getSiteText(
                  'about.historyParagraph1',
                  t(
                    'phrase.Founded in November 2001, the National Paralympic Committee of Rwanda has grown from a small group of advocates into a nationally coordinated movement. We have worked consistently to expand opportunities for athletes with disabilities while building a high-performance pathway that meets international standards.'
                  )
                )}
              </p>
              <p className="text-secondary mb-4" style={{ fontSize: '1.05rem', lineHeight: 1.75 }}>
                {getSiteText(
                  'about.historyParagraph2',
                  t(
                    "phrase.Rwanda's first Paralympic participation was in Athens 2004. Since then, our athletes have continued to prove that disability is not inability, delivering strong performances and inspiring the nation through resilience and excellence."
                  )
                )}
              </p>
              <div
                className="p-3 border-start border-4 border-primary rounded-end"
                style={{ background: '#FFFFFF', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}
              >
                <p className="mb-0 fst-italic text-dark fw-semibold">
                  &ldquo;Disability is never an inability. Para-sport is a powerful catalyst for human dignity, unity,
                  and national pride in Rwanda.&rdquo;
                </p>
              </div>
            </div>
            {hasHistImg && (
              <div className="col-lg-6">
                <div className="position-relative">
                  <img
                    src={histImg}
                    alt="Historical NPC Rwanda moment"
                    className="img-fluid rounded-4 shadow-sm border"
                    style={{ width: '100%', maxHeight: '420px', objectFit: 'cover' }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <div
                    className="position-absolute bottom-0 start-0 m-3 p-2 bg-dark bg-opacity-75 text-white rounded-3 small"
                    style={{ backdropFilter: 'blur(4px)' }}
                  >
                    <i className="fas fa-camera me-2 text-warning" />
                    Historic Paralympic Legacy · Team Rwanda
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Heritage Timeline */}
          <div className="mt-4 pt-4 border-top">
            <h3 className="h5 fw-bold text-dark mb-4 text-center">Key Milestones of the Movement</h3>
            <div className="row g-3">
              {milestones.map((item, index) => (
                <div key={item.year} className="col-md-6 col-lg">
                  <div
                    className="p-3 h-100 rounded-3 bg-white border"
                    style={{
                      borderTop: `4px solid ${index % 2 === 0 ? '#0B5F9F' : '#059669'}`,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div className="h4 fw-bold mb-1" style={{ color: index % 2 === 0 ? '#0B5F9F' : '#059669' }}>
                      {item.year}
                    </div>
                    <div className="fw-bold text-dark mb-2 small">{item.title}</div>
                    <p className="small text-muted mb-0" style={{ lineHeight: 1.5 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CORE VALUES (Principles of the Paralympic Movement)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-5" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <div className="text-center mb-5" style={{ maxWidth: '720px', margin: '0 auto' }}>
            <span
              className="badge text-uppercase fw-bold px-3 py-1 mb-2"
              style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.78rem' }}
            >
              {t('phrase.Our Foundation')}
            </span>
            <h2 className="h2 fw-bold text-dark mb-3">{t('phrase.Core Values')}</h2>
            <p className="text-muted" style={{ fontSize: '1.05rem' }}>
              {t('phrase.The principles that guide our movement and athletes.')} These ethical pillars anchor every decision, training session, and tournament representation.
            </p>
          </div>

          <div className="row g-4">
            {coreValues.map(({ icon, title, desc, accent, bg }) => (
              <div key={title} className="col-lg-4 col-md-6">
                <div
                  className="p-4 h-100 rounded-4 border transition-all"
                  style={{
                    background: '#FFFFFF',
                    borderColor: '#E2E8F0',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
                  }}
                >
                  <div
                    className="mb-3 rounded-3"
                    style={{
                      width: '52px',
                      height: '52px',
                      background: bg,
                      color: accent,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '1.4rem',
                    }}
                  >
                    <i className={`fas ${icon}`} aria-hidden="true" />
                  </div>
                  <h3 className="h5 fw-bold text-dark mb-2">{t(title)}</h3>
                  <p className="small text-secondary mb-0" style={{ lineHeight: 1.6 }}>
                    {getSiteText(`about.value.${title}`, t(desc))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STRATEGIC OBJECTIVES (2024–2028 Plan)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-5" style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <div className="text-center mb-5" style={{ maxWidth: '750px', margin: '0 auto' }}>
            <span
              className="badge text-uppercase fw-bold px-3 py-1 mb-2"
              style={{ background: '#ECFDF5', color: '#047857', fontSize: '0.78rem' }}
            >
              Strategic Quadrennial 2024–2028
            </span>
            <h2 className="h2 fw-bold text-dark mb-3">{t('phrase.Strategic Objectives')}</h2>
            <p className="text-muted" style={{ fontSize: '1.05rem' }}>
              {t('phrase.Our key focus areas for the 2024-2028 strategic period.')} Targeted initiatives ensuring sustainable growth from district grassroots to global championship stages.
            </p>
          </div>

          <div className="row g-4">
            {strategicObjectives.map(({ num, icon, title, desc, outcome }) => (
              <div key={title} className="col-lg-6">
                <div
                  className="p-4 bg-white rounded-4 border h-100 d-flex flex-column justify-content-between"
                  style={{
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.04)',
                    borderLeft: '4px solid #0B5F9F',
                  }}
                >
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <div
                      className="rounded-3 flex-shrink-0"
                      style={{
                        width: '54px',
                        height: '54px',
                        background: '#EFF6FF',
                        color: '#0B5F9F',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '1.35rem',
                      }}
                    >
                      <i className={`fas ${icon}`} aria-hidden="true" />
                    </div>
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-light text-primary border fw-bold">{num}</span>
                        <h3 className="h5 fw-bold text-dark mb-0">{t(title)}</h3>
                      </div>
                      <p className="text-secondary small mb-0" style={{ lineHeight: 1.6 }}>
                        {getSiteText(`about.objective.${title}`, t(desc))}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-top d-flex align-items-center justify-content-between">
                    <span className="small text-muted fw-semibold">Target Outcome:</span>
                    <span className="badge bg-primary-subtle text-primary fw-bold">{outcome}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          INSTITUTIONAL AFFILIATIONS & GOVERNANCE PARTNERS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-5" style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container">
          <div className="text-center mb-4">
            <span
              className="badge text-uppercase fw-bold px-3 py-1 mb-2"
              style={{ background: '#F1F5F9', color: '#334155', fontSize: '0.78rem' }}
            >
              Institutional Accreditations
            </span>
            <h2 className="h3 fw-bold text-dark">Affiliations &amp; Governing Bodies</h2>
          </div>

          <div className="row g-3">
            {affiliations.map((aff) => (
              <div key={aff.name} className="col-md-6 col-lg-3">
                <div className="p-3 bg-light rounded-3 border h-100 text-center">
                  <div className="badge bg-white text-dark border mb-2 fw-bold">{aff.tag}</div>
                  <h4 className="h6 fw-bold text-dark mb-1">{aff.name}</h4>
                  <p className="small text-muted mb-0">{aff.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ACTION FOOTER CALL TO ACTION
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-5 text-white text-center" style={{ background: '#0B2545' }}>
        <div className="container">
          <div style={{ maxWidth: '720px', margin: '0 auto' }}>
            <span
              className="badge text-uppercase fw-bold px-3 py-1 mb-3"
              style={{ background: '#F59E0B', color: '#071A30' }}
            >
              Get Involved
            </span>
            <h2 className="h2 fw-bold text-white mb-3">Support the Paralympic Journey</h2>
            <p className="lead text-white-50 mb-4" style={{ fontSize: '1.05rem' }}>
              Whether through athlete sponsorship, volunteering, or corporate partnerships, you can help Rwandan
              para-athletes reach their highest potential.
            </p>
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              <Link href="/donate" className="btn btn-warning btn-lg fw-bold px-4 py-2 text-dark">
                <i className="fas fa-heart me-2" /> Make a Donation
              </Link>
              <Link href="/leaders" className="btn btn-outline-light btn-lg fw-bold px-4 py-2">
                <i className="fas fa-users me-2" /> Meet Our Leadership
              </Link>
              <Link href="/contact" className="btn btn-outline-info btn-lg fw-bold px-4 py-2">
                <i className="fas fa-envelope me-2" /> Contact Office
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
