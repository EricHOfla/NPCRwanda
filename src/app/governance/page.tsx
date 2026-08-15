'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';

interface GovDoc {
  id: string;
  title: string;
  desc: string;
  fileUrl: string;
  order: number;
}

interface GovPolicy {
  id: string;
  title: string;
  desc: string;
  fileUrl: string;
  order: number;
}

export default function GovernancePage() {
  const { t } = useTranslation();
  const [keyDocuments, setKeyDocuments] = useState<GovDoc[]>([]);
  const [officialPolicies, setOfficialPolicies] = useState<GovPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/governance-docs').then(r => r.json()),
      fetch('/api/governance-policies').then(r => r.json()),
    ])
      .then(([docs, policies]) => {
        setKeyDocuments(Array.isArray(docs) ? docs : []);
        setOfficialPolicies(Array.isArray(policies) ? policies : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <main id="main-content">
      {/* Page Header */}
      <header
        className="py-5 text-white bg-contain"
        style={{
          background:
            "linear-gradient(rgba(229,57,53,0.72), rgba(0,114,198,0.75), rgba(76,175,80,0.7)), url('/assets/img/curated/governance-hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container py-4">
          <h1 className="text-white mb-2" data-aos="fade-up">
            {t('phrase.Governance & Transparency')}
          </h1>
          <nav aria-label="breadcrumb" data-aos="fade-up" data-aos-delay="100">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/" className="text-white text-decoration-none">
                  {t('nav.home')}
                </Link>
              </li>
              <li className="breadcrumb-item active text-white opacity-75" aria-current="page">
                {t('phrase.Governance')}
              </li>
            </ol>
          </nav>
        </div>
      </header>

      {/* Main Governance Section */}
      <section id="governance-info">
        <div className="container">
          <div className="row g-5">
            <div className="col-lg-8">
              <h2 className="mb-4" data-aos="fade-up">
                {t('phrase.How We Are Managed')}
              </h2>
              <p className="mb-4 text-justify" data-aos="fade-up">
                {t(
                  'phrase.NPC Rwanda operates under governance standards aligned with the International Paralympic Committee. We are committed to transparency so athletes, partners, and the public can access our strategic direction, policies, and performance reporting.'
                )}
              </p>

              {/* Key Documents */}
              <div className="mb-5" id="reports">
                <h3 className="h4 mb-4" data-aos="fade-up">
                  {t('phrase.Key Documents')}
                </h3>

                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : keyDocuments.length === 0 ? (
                  <p className="text-muted">No documents available at this time.</p>
                ) : (
                  keyDocuments.map((doc, index) => {
                    const docId = doc.title.toLowerCase().includes('constitution') ? 'constitution' :
                                  doc.title.toLowerCase().includes('strategic') ? 'strategic-plan' :
                                  doc.title.toLowerCase().includes('annual') ? 'annual-report-2023' :
                                  doc.title.toLowerCase().includes('financial') ? 'financial-audit-2023' :
                                  doc.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    return (
                      <div
                        key={doc.id}
                        id={docId}
                        className="doc-item d-flex align-items-center p-3 mb-3 border rounded-3 bg-white shadow-soft"
                        data-aos="fade-up"
                        data-aos-delay={index * 100}
                        style={{ transition: 'all 0.3s ease' }}
                      >
                        <div
                          className="doc-icon d-flex align-items-center justify-content-center bg-light rounded-3 me-3"
                          style={{ width: '50px', height: '50px', minWidth: '50px', color: 'var(--primary-blue)' }}
                        >
                          <i className="fas fa-file-pdf fa-lg"></i>
                        </div>
                        <div className="flex-grow-1">
                          <h4 className="h6 mb-1">{doc.title}</h4>
                          <p className="small text-muted mb-0">{doc.desc}</p>
                        </div>
                        <a
                          href={doc.fileUrl || '#'}
                          className="btn btn-sm btn-outline-primary ms-3"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          <i className="fas fa-download me-1"></i>
                          <span>{t('phrase.PDF')}</span>
                        </a>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Official Policies */}
              <div id="policies">
                <h3 className="h4 mb-4" data-aos="fade-up">
                  {t('phrase.Official Policies')}
                </h3>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : officialPolicies.length === 0 ? (
                  <p className="text-muted">No policies available at this time.</p>
                ) : (
                  <div className="row g-3">
                    {officialPolicies.map((policy, index) => {
                      const policyId = policy.title.toLowerCase().includes('safeguarding') ? 'safeguarding-policy' :
                                       policy.title.toLowerCase().includes('anti-doping') ? 'anti-doping-regulations' :
                                       policy.title.toLowerCase().includes('selection') ? 'selection-criteria' :
                                       policy.title.toLowerCase().includes('classification') ? 'classification-rules' :
                                       policy.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      return (
                        <div
                          key={policy.id}
                          className="col-md-6"
                          data-aos="zoom-in"
                          data-aos-delay={index * 100}
                        >
                          <div className="p-3 bg-light rounded-3 border h-100" id={policyId}>
                            <h5 className="h6 mb-2">{policy.title}</h5>
                            <p className="small text-muted mb-2">{policy.desc}</p>
                            <a
                              href={policy.fileUrl || '#'}
                              className="small fw-bold text-primary"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {t('phrase.Read Policy')}
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="col-lg-4" data-aos="fade-left">
              <div className="bg-white p-4 rounded-4 shadow-soft border mb-4" id="board">
                <h4 className="h6 text-uppercase fw-bold mb-3">{t('phrase.Our Structure')}</h4>
                <div className="text-center py-3">
                  <div className="bg-primary text-white p-2 rounded small mb-2">
                    {t('phrase.General Assembly')}
                  </div>
                  <i className="fas fa-arrow-down text-muted mb-2"></i>
                  <div className="bg-primary text-white p-2 rounded small mb-2">
                    {t('phrase.Board of Directors')}
                  </div>
                  <i className="fas fa-arrow-down text-muted mb-2"></i>
                  <div className="bg-primary text-white p-2 rounded small mb-2">
                    {t('phrase.Executive Secretariat')}
                  </div>
                  <i className="fas fa-arrow-down text-muted mb-2"></i>
                  <div className="bg-light p-2 rounded small border mb-1 text-dark">
                    {t('phrase.Technical Commissions')}
                  </div>
                  <div className="bg-light p-2 rounded small border mb-1 text-dark">
                    {t('phrase.District Committees')}
                  </div>
                </div>
              </div>

              <div className="bg-accent-green text-white p-4 rounded-4 shadow-soft">
                <h4 className="h6 text-uppercase fw-bold mb-3 text-white">
                  {t('phrase.Need Information?')}
                </h4>
                <p className="small mb-3">
                  {t(
                    'phrase.For specific governance questions or official record requests, contact our secretariat.'
                  )}
                </p>
                <Link href="/contact" className="btn btn-light btn-sm px-4 py-2 fw-bold w-auto d-inline-block">
                  {t('phrase.Contact Secretariat')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
