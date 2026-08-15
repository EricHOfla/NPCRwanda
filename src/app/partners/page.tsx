'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

export default function PartnersPage() {
  const { t } = useTranslation();
  const { partners } = useData();

  // Group partners by category
  const activePartners = partners.filter(p => p.active);

  const govPartners = activePartners.filter(
    p => p.category === 'Government Sector'
  );
  const intPartners = activePartners.filter(
    p => p.category === 'International Sports Bodies'
  );
  const ngoPartners = activePartners.filter(
    p => p.category === 'Other Non-Governmental Organizations'
  );

  return (
    <main id="main-content">
      {/* Page Header */}
      <header
        className="py-5 text-white"
        style={{
          background:
            "linear-gradient(135deg, rgba(15, 37, 63, 0.95), rgba(0, 114, 198, 0.9)), url('/assets/img/curated/about-hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container py-4 text-center text-md-start">
          <h1 className="text-white mb-2" data-aos="fade-up">
            {t('nav.partners') || 'Partners & Members'}
          </h1>
          <p className="lead mb-0 text-white opacity-75" data-aos="fade-up" data-aos-delay="100">
            Collaborating with national and global partners to support sports for persons with disabilities.
          </p>
        </div>
      </header>

      {/* Partners Categories Section */}
      <section className="py-5 bg-light">
        <div className="container">
          
          {/* 1. Government Sector */}
          {govPartners.length > 0 && (
            <div className="mb-5" data-aos="fade-up">
              <h2 className="h4 fw-bold border-bottom pb-2 mb-4 text-dark" style={{ borderBottomWidth: '2px !important', borderColor: 'var(--primary-blue) !important' }}>
                <i className="fas fa-landmark text-primary me-2"></i> Government Sector
              </h2>
              <div className="row g-4">
                {govPartners.map(p => (
                  <div key={p.id} className="col-6 col-sm-4 col-md-3">
                    <div className="card h-100 border-0 shadow-xs text-center p-4 d-flex flex-column justify-content-between align-items-center" style={{ borderRadius: '12px', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                      <div className="d-flex align-items-center justify-content-center" style={{ height: '100px', width: '100%' }}>
                        <img 
                          src={p.logo} 
                          alt={p.name} 
                          style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
                        />
                      </div>
                      <div className="mt-3 w-100">
                        <h3 className="h6 fw-bold text-dark mb-2 text-truncate" title={p.name}>{p.name}</h3>
                        {p.website && (
                          <a href={p.website} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline-primary py-1 px-3 rounded-pill small">
                            Visit Site <i className="fas fa-external-link-alt ms-1 text-xs"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. International Sports Bodies */}
          {intPartners.length > 0 && (
            <div className="mb-5" data-aos="fade-up">
              <h2 className="h4 fw-bold border-bottom pb-2 mb-4 text-dark" style={{ borderBottomWidth: '2px !important', borderColor: 'var(--primary-blue) !important' }}>
                <i className="fas fa-globe text-primary me-2"></i> International Sports Bodies
              </h2>
              <div className="row g-4">
                {intPartners.map(p => (
                  <div key={p.id} className="col-6 col-sm-4 col-md-3">
                    <div className="card h-100 border-0 shadow-xs text-center p-4 d-flex flex-column justify-content-between align-items-center" style={{ borderRadius: '12px', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                      <div className="d-flex align-items-center justify-content-center" style={{ height: '100px', width: '100%' }}>
                        <img 
                          src={p.logo} 
                          alt={p.name} 
                          style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
                        />
                      </div>
                      <div className="mt-3 w-100">
                        <h3 className="h6 fw-bold text-dark mb-2 text-truncate" title={p.name}>{p.name}</h3>
                        {p.website && (
                          <a href={p.website} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline-primary py-1 px-3 rounded-pill small">
                            Visit Site <i className="fas fa-external-link-alt ms-1 text-xs"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Other Non-Governmental Organizations */}
          {ngoPartners.length > 0 && (
            <div className="mb-4" data-aos="fade-up">
              <h2 className="h4 fw-bold border-bottom pb-2 mb-4 text-dark" style={{ borderBottomWidth: '2px !important', borderColor: 'var(--primary-blue) !important' }}>
                <i className="fas fa-handshake text-primary me-2"></i> Non-Governmental Organizations
              </h2>
              <div className="row g-4">
                {ngoPartners.map(p => (
                  <div key={p.id} className="col-6 col-sm-4 col-md-3">
                    <div className="card h-100 border-0 shadow-xs text-center p-4 d-flex flex-column justify-content-between align-items-center" style={{ borderRadius: '12px', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                      <div className="d-flex align-items-center justify-content-center" style={{ height: '100px', width: '100%' }}>
                        <img 
                          src={p.logo} 
                          alt={p.name} 
                          style={{ maxHeight: '90px', maxWidth: '100%', objectFit: 'contain' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
                        />
                      </div>
                      <div className="mt-3 w-100">
                        <h3 className="h6 fw-bold text-dark mb-2 text-truncate" title={p.name}>{p.name}</h3>
                        {p.website && (
                          <a href={p.website} target="_blank" rel="noopener noreferrer" className="btn btn-xs btn-outline-primary py-1 px-3 rounded-pill small">
                            Visit Site <i className="fas fa-external-link-alt ms-1 text-xs"></i>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </main>
  );
}
