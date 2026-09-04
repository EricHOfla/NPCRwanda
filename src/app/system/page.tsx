'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

interface GovDoc {
  id: string;
  title: string;
  desc: string;
  fileUrl: string;
}

interface GovPolicy {
  id: string;
  title: string;
  desc: string;
  fileUrl: string;
}

export default function SystemPage() {
  const { t } = useTranslation();
  const { systemComponents } = useData();

  const [docs, setDocs] = useState<GovDoc[]>([]);
  const [policies, setPolicies] = useState<GovPolicy[]>([]);
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Unified Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalItems, setModalItems] = useState<{ name: string; role: string; desc: string; type: 'member' | 'doc'; url?: string }[]>([]);

  useEffect(() => {
    Promise.all([
      fetch('/api/governance-docs').then(r => r.ok ? r.json() : []),
      fetch('/api/governance-policies').then(r => r.ok ? r.json() : []),
      fetch('/api/leaders').then(r => r.ok ? r.json() : [])
    ])
      .then(([rDocs, rPolicies, rLeaders]) => {
        setDocs(rDocs);
        setPolicies(rPolicies);
        setLeaders(rLeaders);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getDocSlug = (title: string) => {
    const tLower = title.toLowerCase();
    if (tLower.includes('constitution')) return 'constitution';
    if (tLower.includes('strategic')) return 'strategic-plan';
    if (tLower.includes('annual')) return 'annual-report-2023';
    if (tLower.includes('financial')) return 'financial-audit-2023';
    return tLower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const getPolicySlug = (title: string) => {
    const tLower = title.toLowerCase();
    if (tLower.includes('safeguarding')) return 'safeguarding-policy';
    if (tLower.includes('anti-doping')) return 'anti-doping-regulations';
    if (tLower.includes('selection')) return 'selection-criteria';
    if (tLower.includes('classification')) return 'classification-rules';
    return tLower.replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handleOpenClick = (e: React.MouseEvent, componentTitle: string) => {
    const title = t(componentTitle).toLowerCase();
    if (title.includes('board') || title.includes('leader')) {
      e.preventDefault();
      const filtered = leaders.filter(l => l.committee === 'Board of Directors');
      setModalTitle(t(componentTitle));
      setModalItems(filtered.map(l => ({ name: l.name, role: l.role, desc: l.desc, type: 'member' })));
      setModalOpen(true);
    } else if (title.includes('audit')) {
      e.preventDefault();
      const filtered = leaders.filter(l => l.committee === 'Audit Committee');
      setModalTitle(t(componentTitle));
      setModalItems(filtered.map(l => ({ name: l.name, role: l.role, desc: l.desc, type: 'member' })));
      setModalOpen(true);
    } else if (title.includes('conflict') || title.includes('resolut')) {
      e.preventDefault();
      const filtered = leaders.filter(l => l.committee === 'Conflict Resolution Committee');
      setModalTitle(t(componentTitle));
      setModalItems(filtered.map(l => ({ name: l.name, role: l.role, desc: l.desc, type: 'member' })));
      setModalOpen(true);
    } else if (title.includes('schedule') || title.includes('plan')) {
      e.preventDefault();
      const filtered = docs.filter(d => {
        const dTitle = d.title.toLowerCase();
        return dTitle.includes('plan') || dTitle.includes('schedule') || dTitle.includes('roadmap') || dTitle.includes('constitution');
      });
      setModalTitle(t(componentTitle));
      setModalItems(filtered.map(d => ({ name: d.title, role: 'Timeline & Mandate', desc: d.desc, type: 'doc', url: d.fileUrl })));
      setModalOpen(true);
    } else if (title.includes('publication')) {
      e.preventDefault();
      const filtered = docs.filter(d => {
        const dTitle = d.title.toLowerCase();
        return dTitle.includes('report') || dTitle.includes('audit') || dTitle.includes('publication');
      });
      setModalTitle(t(componentTitle));
      setModalItems(filtered.map(d => ({ name: d.title, role: 'Official Report', desc: d.desc, type: 'doc', url: d.fileUrl })));
      setModalOpen(true);
    }
  };

  return (
    <main id="main-content">
      {/* Page Header */}
      <header className="page-header">
        <div className="container">
          <nav aria-label="breadcrumb" data-aos="fade-up">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item">
                <Link href="/">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {t('nav.system')}
              </li>
            </ol>
          </nav>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">
            {t('system.page_title')}
          </h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100">
            {t('system.subtitle')}
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <section>
        <div className="container">
          <div className="section-title" data-aos="fade-up">
            <span className="text-uppercase fw-bold text-accent-green mb-2 d-block">
              {t('system.directory')}
            </span>
            <h2>{t('phrase.Governance & Transparency')}</h2>
            <p className="text-muted">
              {t('phrase.Data found in Governance is listed here for quick access.')}
            </p>
          </div>

          {/* Governance & Transparency Index box */}
          <div className="custom-card p-4 mb-5" id="governance-data-index" data-aos="fade-up">
            {loading ? (
              <div className="text-center py-3">
                <div className="spinner-border text-primary spinner-border-sm" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="h6 text-uppercase fw-bold text-muted mb-3 border-bottom pb-2">Key Documents & Structure</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {docs.map(doc => (
                      <Link key={doc.id} href={`/governance#${getDocSlug(doc.title)}`} className="text-decoration-none d-flex align-items-center p-3 rounded-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', transition: 'all 0.2s ease', color: '#0F172A' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                          <i className="fas fa-file-pdf"></i>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{doc.title}</span>
                      </Link>
                    ))}
                    <Link href="/governance#board" className="text-decoration-none d-flex align-items-center p-3 rounded-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', transition: 'all 0.2s ease', color: '#0F172A' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#E0F2FE', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                          <i className="fas fa-sitemap"></i>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{t('phrase.Our Structure')}</span>
                    </Link>
                </div>

                <h4 className="h6 text-uppercase fw-bold text-muted mb-3 border-bottom pb-2 mt-4">Official Policies</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                    {policies.map(policy => (
                      <Link key={policy.id} href={`/governance#${getPolicySlug(policy.title)}`} className="text-decoration-none d-flex align-items-center p-3 rounded-3" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', transition: 'all 0.2s ease', color: '#0F172A' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                          <i className="fas fa-shield-alt"></i>
                        </div>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{policy.title}</span>
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="section-title pt-4" data-aos="fade-up">
            <h2>{t('system.core_items')}</h2>
            <p className="text-muted">{t('system.intro')}</p>
          </div>

          {/* Dynamic Grid of Database Components */}
          <div className="row g-4 mb-5">
            {systemComponents.map((c, i) => {
              // Custom open link maps based on component title keywords for dynamic utility
              let openLink = '/system';
              const titleLower = c.title.toLowerCase();
              if (titleLower.includes('background') || titleLower.includes('hist')) {
                openLink = '/about#history';
              } else if (titleLower.includes('board') || titleLower.includes('leader')) {
                openLink = '/governance#board';
              } else if (titleLower.includes('audit') || titleLower.includes('report') || titleLower.includes('publ')) {
                openLink = '/governance#reports';
              } else if (titleLower.includes('resolut') || titleLower.includes('conflict') || titleLower.includes('policy') || titleLower.includes('regulat')) {
                openLink = '/governance#policies';
              } else if (titleLower.includes('schedule') || titleLower.includes('plan')) {
                openLink = '/governance#strategic-plan';
              } else if (titleLower.includes('sport') || titleLower.includes('federat')) {
                openLink = '/sports';
              } else if (titleLower.includes('event')) {
                openLink = '/news#events-schedule';
              } else if (titleLower.includes('dpsco') || titleLower.includes('contact') || titleLower.includes('social')) {
                openLink = '/contact';
              } else if (titleLower.includes('staff')) {
                openLink = '/about#leadership';
              }

              return (
                <div key={c.id} className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay={(i % 3) * 100}>
                  <div className="custom-card p-4 h-100">
                    <h3 className="h5">{t(c.title)}</h3>
                    <p className="small text-muted">{t(c.desc)}</p>
                    <Link href={openLink} onClick={(e) => handleOpenClick(e, c.title)} className="btn btn-sm btn-outline-primary">
                      {t('common.open')}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* Unified Directory Details Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '700px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{modalTitle}</h4>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#64748B' }}>&times;</button>
            </div>
            <div style={{ padding: '24px', maxHeight: '70vh', overflowY: 'auto' }}>
              {modalItems.length === 0 ? (
                <p className="text-muted text-center py-4">No entries registered under this section yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {modalItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', padding: '16px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                      <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #0072C6 0%, #00c6ff 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.2rem', textTransform: 'uppercase', flexShrink: 0 }}>
                        {item.type === 'member' ? item.name.charAt(0) : <i className="fas fa-file-pdf" style={{ fontSize: '1.4rem' }} />}
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <h5 style={{ margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>{item.name}</h5>
                        <span style={{ display: 'inline-block', background: item.type === 'member' ? '#E3F2FD' : '#E8F5E9', color: item.type === 'member' ? '#0072C6' : '#2E7D32', borderRadius: '20px', padding: '2px 10px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px' }}>
                          {item.role}
                        </span>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>{item.desc}</p>
                      </div>
                      {item.type === 'doc' && item.url && item.url !== '#' && (
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline-primary align-self-center ms-2" style={{ whiteSpace: 'nowrap' }}>
                          <i className="fas fa-download me-1" /> PDF
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', background: '#F8FAFC' }}>
              <button onClick={() => setModalOpen(false)} className="btn btn-primary px-4" style={{ borderRadius: '8px', fontWeight: 600 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

