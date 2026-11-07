'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

export default function GovernancePage() {
  const { t } = useTranslation();
  const { siteContent } = useData();
  const content = (key: string, fallback: string) => siteContent[`governance.${key}`] || fallback;

  const governancePrinciples = [
    {
      icon: 'fa-scale-balanced',
      title: content('accountabilityTitle', 'Accountability'),
      description: content('accountabilityDesc', 'Leadership and management are responsible for decisions, resources, and the results delivered to athletes and members.'),
    },
    {
      icon: 'fa-eye',
      title: content('transparencyTitle', 'Transparency'),
      description: content('transparencyDesc', 'We aim to make our governance approach, responsibilities, and institutional direction clear to our stakeholders.'),
    },
    {
      icon: 'fa-handshake-angle',
      title: content('integrityTitle', 'Integrity'),
      description: content('integrityDesc', 'We promote ethical conduct, fairness, and respect throughout the Paralympic movement in Rwanda.'),
    },
    {
      icon: 'fa-people-group',
      title: content('representationTitle', 'Representation'),
      description: content('representationDesc', 'Athletes, members, and disability groups should have a meaningful voice in the decisions that affect them.'),
    },
  ];
  
  const governanceLevels = [
    {
      number: '01',
      title: 'General Assembly',
      description: content('generalAssemblyDesc', 'The supreme member body that provides the institutional mandate and considers major decisions.'),
      icon: 'fa-users',
      level: 'primary',
    },
    {
      number: '02',
      title: 'Board of Directors',
      description: content('boardDesc', 'Provides strategic oversight, governance direction, and accountability for the committee.'),
      icon: 'fa-landmark',
      level: 'primary',
    },
    {
      number: '03',
      title: 'Executive Secretariat',
      description: content('secretariatDesc', 'Coordinates daily operations and implements approved plans, programmes, and decisions.'),
      icon: 'fa-building',
      level: 'primary',
    },
  ];
  
  const supportingStructures = [
    {
      title: 'Technical Commissions',
      description: content('technicalDesc', 'Support technical standards, sport development, athlete preparation, and specialist functions.'),
      icon: 'fa-medal',
    },
    {
      title: 'District Committees',
      description: content('districtDesc', 'Help extend participation, talent identification, and adapted sport activities across Rwanda.'),
      icon: 'fa-map-location-dot',
    },
  ];

  return (
    <main id="main-content" style={{ background: '#F7F9FC', minHeight: '100vh' }}>
      <header
        className="page-header"
        style={{
          background: 'linear-gradient(135deg, #082B55 0%, #0B477B 58%, #087B78 100%)',
          color: '#fff',
          padding: '64px 0 76px',
          borderBottom: '4px solid #F2B632',
        }}
      >
        <div className="container">
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/" className="text-white text-decoration-none">{t('nav.home') || 'Home'}</Link>
              </li>
              <li className="breadcrumb-item active text-white" aria-current="page">
                {t('phrase.Governance') || 'Governance'}
              </li>
            </ol>
          </nav>
          <div className="row align-items-center g-4">
            <div className="col-lg-8">
              <span className="d-inline-flex align-items-center gap-2 rounded-pill px-3 py-2 mb-3" style={{ background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', fontSize: '.78rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' }}>
                <i className="fas fa-landmark" /> {content('pageEyebrow', 'Governance & institutional leadership')}
              </span>
              <h1 className="display-5 fw-bold mb-3 text-white">{t('phrase.Governance & Transparency') || 'Governance & Transparency'}</h1>
              <p className="lead mb-0" style={{ maxWidth: '760px', color: 'rgba(255,255,255,.86)', lineHeight: 1.7 }}>
                {content('pageIntro', 'NPC Rwanda is committed to responsible leadership, clear accountability, and inclusive decision-making in the development of Paralympic sport.')}
              </p>
            </div>
            <div className="col-lg-4">
              <div className="rounded-4 p-4" style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.2)' }}>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <i className="fas fa-shield-halved fa-2x text-warning" />
                  <div className="fw-bold text-white">Good governance</div>
                </div>
                <p className="small mb-0" style={{ color: 'rgba(255,255,255,.82)' }}>
                  Strong institutions help protect the interests of athletes, members, partners, and the wider community.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="container py-5" aria-labelledby="governance-approach">
        <div className="row g-4 align-items-end mb-4">
          <div className="col-lg-8">
            <span className="text-uppercase fw-bold small text-primary" style={{ letterSpacing: '.1em' }}>{content('commitmentEyebrow', 'Our commitment')}</span>
            <h2 id="governance-approach" className="fw-bold text-dark mt-2 mb-3">{t('phrase.How We Are Managed') || 'How We Are Managed'}</h2>
            <p className="text-muted mb-0" style={{ maxWidth: '850px', lineHeight: 1.8 }}>
              {content('approachIntro', 'NPC Rwanda operates under governance standards aligned with the International Paralympic Committee. We work to ensure that our strategic direction, leadership responsibilities, and institutional decisions support fair and inclusive sport.')}
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            <Link href="/resources" className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold">
              <i className="fas fa-folder-open me-2" />View official publications
            </Link>
          </div>
        </div>

        <div className="row g-3 mb-5">
          {governancePrinciples.map((principle) => (
            <div className="col-sm-6 col-xl-3" key={principle.title}>
              <article className="h-100 bg-white border rounded-4 p-4 shadow-sm">
                <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{ width: 48, height: 48, background: '#EAF2FB', color: '#0B5793' }}>
                  <i className={`fas ${principle.icon} fa-lg`} aria-hidden="true" />
                </div>
                <h3 className="h5 fw-bold text-dark mb-2">{principle.title}</h3>
                <p className="small text-muted mb-0" style={{ lineHeight: 1.7 }}>{principle.description}</p>
              </article>
            </div>
          ))}
        </div>

        <div className="row g-4">
          <div className="col-lg-8">
            <section className="bg-white border rounded-4 p-4 p-md-5 shadow-sm h-100" aria-labelledby="governance-structure">
              <div className="mb-4">
                <span className="text-uppercase fw-bold small text-primary" style={{ letterSpacing: '.1em' }}>{content('frameworkEyebrow', 'Institutional framework')}</span>
                <h2 id="governance-structure" className="h3 fw-bold text-dark mt-2 mb-2">{t('phrase.Our Structure') || 'Our Structure'}</h2>
                <p className="text-muted mb-0">{content('frameworkIntro', 'The committee works through member representation, strategic oversight, and operational coordination.')}</p>
              </div>

              <div className="d-flex flex-column align-items-center">
                {governanceLevels.map((level, index) => (
                  <React.Fragment key={level.number}>
                    <article className="w-100 rounded-4 p-3 p-md-4 d-flex align-items-start gap-3" style={{ maxWidth: '620px', background: index === 0 ? '#0B477B' : index === 1 ? '#125F8B' : '#EAF2F8', color: index === 2 ? '#17324D' : '#fff', border: index === 2 ? '1px solid #D5E2ED' : '1px solid transparent' }}>
                      <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: 46, height: 46, background: index === 2 ? '#D7E8F5' : 'rgba(255,255,255,.16)' }}>
                        <i className={`fas ${level.icon} `} aria-hidden="true" />
                      </div>
                      <div className="flex-grow-1">
                        <div className="small fw-bold mb-1" style={{ opacity: .72 }}>LEVEL {level.number}</div>
                        <h3 className="h5 fw-bold mb-1" style={{ color: 'inherit' }}>{t(`phrase.${level.title}`) || level.title}</h3>
                        <p className="small mb-0" style={{ opacity: .82, lineHeight: 1.65 }}>{level.description}</p>
                      </div>
                    </article>
                    {index < governanceLevels.length - 1 && (
                      <div className="py-2 text-primary" aria-hidden="true"><i className="fas fa-arrow-down fa-lg" /></div>
                    )}
                  </React.Fragment>
                ))}
                <div className="py-2 text-primary" aria-hidden="true"><i className="fas fa-arrow-down fa-lg" /></div>
                <div className="row g-3 w-100" style={{ maxWidth: '700px' }}>
                  {supportingStructures.map((item) => (
                    <div className="col-md-6" key={item.title}>
                      <article className="h-100 rounded-4 p-3 border" style={{ background: '#F8FAFC', borderColor: '#D8E3ED' }}>
                        <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                          <i className={`fas ${item.icon}`} aria-hidden="true" />
                          <h3 className="h6 fw-bold mb-0 text-dark">{t(`phrase.${item.title}`) || item.title}</h3>
                        </div>
                        <p className="small text-muted mb-0" style={{ lineHeight: 1.65 }}>{item.description}</p>
                      </article>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="col-lg-4">
            <aside className="h-100 d-flex flex-column gap-3">
              <div className="bg-white border rounded-4 p-4 shadow-sm">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="fas fa-people-arrows-left-right text-primary fa-lg" />
                  <h2 className="h5 fw-bold mb-0">{content('inclusiveTitle', 'Inclusive leadership')}</h2>
                </div>
                <p className="small text-muted mb-0" style={{ lineHeight: 1.75 }}>
                  {content('inclusiveDesc', 'Governance should reflect the diversity of the Paralympic movement and support meaningful participation by athletes and people with disabilities.')}
                </p>
              </div>
              <div className="rounded-4 p-4 text-white flex-grow-1" style={{ background: 'linear-gradient(145deg, #087B78, #075B68)' }}>
                <div className="d-flex align-items-center gap-2 mb-3">
                  <i className="fas fa-comments fa-lg" />
                  <h2 className="h5 fw-bold text-white mb-0">{t('phrase.Need Information?') || 'Need Information?'}</h2>
                </div>
                <p className="small mb-4" style={{ color: 'rgba(255,255,255,.86)', lineHeight: 1.75 }}>
                  {content('contactDesc', 'For governance questions, institutional enquiries, or requests for official records, please contact the NPC Rwanda secretariat.')}
                </p>
                <Link href="/contact" className="btn btn-light rounded-pill px-4 fw-bold">
                  <i className="fas fa-envelope me-2" />{t('phrase.Contact Secretariat') || 'Contact Secretariat'}
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
