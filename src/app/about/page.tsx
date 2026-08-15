'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import Pagination from '@/components/Pagination';

export default function AboutPage() {
  const { t } = useTranslation();
  const { leadership, siteContent } = useData();
  const [currentLeaderPage, setCurrentLeaderPage] = React.useState(1);

  const ITEMS_PER_PAGE_LEADERSHIP = 6;
  const totalLeaderPages = Math.ceil(leadership.length / ITEMS_PER_PAGE_LEADERSHIP);
  const visibleLeaderPage = Math.min(currentLeaderPage, Math.max(totalLeaderPages, 1));
  const paginatedLeadership = leadership.slice((visibleLeaderPage - 1) * ITEMS_PER_PAGE_LEADERSHIP, visibleLeaderPage * ITEMS_PER_PAGE_LEADERSHIP);

  const getSiteText = (key: string, fallback: string) => {
    return siteContent[key] || fallback;
  };

  const coreValues = [
    { icon: 'fa-heart', title: 'phrase.Courage', desc: 'phrase.The courage to compete at the highest level and redefine what is possible.' },
    { icon: 'fa-fire', title: 'phrase.Determination', desc: 'phrase.Relentless commitment to preparation, discipline, and sporting excellence.' },
    { icon: 'fa-equals', title: 'phrase.Equality', desc: 'phrase.Ensuring fair access, respect, and opportunity for all athletes.' },
    { icon: 'fa-lightbulb', title: 'phrase.Inspiration', desc: 'phrase.Inspiring communities through achievement and leadership on and off the field.' },
    { icon: 'fa-fist-raised', title: 'phrase.Empowerment', desc: 'phrase.Equipping athletes with the tools, training, and support they need to thrive.' },
    { icon: 'fa-project-diagram', title: 'phrase.Intersectionality', desc: 'phrase.Recognizing the diverse experiences that shape our athletes and communities.' },
  ];

  const strategicObjectives = [
    { icon: 'fa-chart-line', title: 'phrase.Athlete Excellence', desc: 'phrase.Strengthen coaching, science, and athlete support to compete for podium finishes internationally.' },
    { icon: 'fa-users-viewfinder', title: 'phrase.Grassroots Development', desc: 'phrase.Expand access in all 30 districts and identify talent early for long-term development.' },
    { icon: 'fa-shield-halved', title: 'phrase.Safeguarding & Governance', desc: 'phrase.Maintain strong safeguarding practices and transparent governance at all levels.' },
    { icon: 'fa-handshake-angle', title: 'phrase.Partnership Growth', desc: 'phrase.Build sustainable partnerships with government, federations, and private sector sponsors.' },
  ];

  return (
    <main id="main-content">
      {/* Page Header */}
      <header
        className="py-5 text-white bg-contain"
        style={{
          background: `linear-gradient(rgba(229,57,53,0.7), rgba(0,114,198,0.75), rgba(76,175,80,0.72)), url('${getSiteText('about.heroImage', '/assets/img/curated/about-hero.jpg')}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container py-4">
          <h1 className="text-white mb-2" data-aos="fade-up">
            {t('phrase.About NPC Rwanda')}
          </h1>
          <nav aria-label="breadcrumb" data-aos="fade-up" data-aos-delay="100">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/" className="text-white text-decoration-none">
                  {t('nav.home')}
                </Link>
              </li>
              <li className="breadcrumb-item active text-white opacity-75" aria-current="page">
                {t('phrase.About Us')}
              </li>
            </ol>
          </nav>
        </div>
      </header>

      {/* History Section */}
      <section id="history">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6" data-aos="fade-right">
              <h2 className="section-title text-start mb-4">{t('phrase.Our History')}</h2>
              <p className="text-justify">
                {getSiteText('about.historyParagraph1', t('phrase.Founded in November 2001, the National Paralympic Committee of Rwanda has grown from a small group of advocates into a nationally coordinated movement. We have worked consistently to expand opportunities for athletes with disabilities while building a high-performance pathway that meets international standards.'))}
              </p>
              <p className="text-justify">
                {getSiteText('about.historyParagraph2', t("phrase.Rwanda's first Paralympic participation was in Athens 2004. Since then, our athletes have continued to prove that disability is not inability, delivering strong performances and inspiring the nation through resilience and excellence."))}
              </p>
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <img
                src={getSiteText('about.historyImage', '/assets/img/curated/about-history.jpg')}
                alt="Historical photo"
                className="img-fluid rounded-4 shadow-medium"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section id="vision-mission" className="bg-primary text-white">
        <div className="container">
          <div className="row g-4">
            <div className="col-md-6" data-aos="fade-up">
              <div className="p-4 rounded-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="icon-box mb-3">
                  <i className="fas fa-eye fa-3x text-accent-yellow" aria-hidden="true"></i>
                </div>
                <h2 className="text-white h3">{t('phrase.Our Vision')}</h2>
                <p className="mb-0">{getSiteText('about.vision', t('phrase.To be the leading Paralympic nation in Africa.'))}</p>
              </div>
            </div>
            <div className="col-md-6" data-aos="fade-up" data-aos-delay="100">
              <div className="p-4 rounded-4" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="icon-box mb-3">
                  <i className="fas fa-bullseye fa-3x text-accent-yellow" aria-hidden="true"></i>
                </div>
                <h2 className="text-white h3">{t('phrase.Our Mission')}</h2>
                <p className="mb-0">
                  {getSiteText('about.mission', t('phrase.To develop a sustainable Paralympic sport system in Rwanda for enabling Para-athletes to achieve their sporting aspirations in local and International sport arena.'))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section id="core-values" className="bg-light">
        <div className="container">
          <div className="section-title" data-aos="fade-up">
            <span className="text-uppercase fw-bold text-accent-green mb-2 d-block">
              {t('phrase.Our Foundation')}
            </span>
            <h2>{t('phrase.Core Values')}</h2>
            <p className="text-muted">{t('phrase.The principles that guide our movement and athletes.')}</p>
          </div>
          <div className="row g-4">
            {coreValues.map(({ icon, title, desc }, i) => (
              <div
                key={title}
                className="col-lg-4 col-md-6"
                data-aos="fade-up"
                data-aos-delay={`${(i % 3) * 100}`}
              >
                <div className="custom-card p-4 h-100">
                  <i className={`fas ${icon} text-primary mb-3 fa-2x`} aria-hidden="true"></i>
                  <h4>{t(title)}</h4>
                  <p className="small text-muted mb-0">{getSiteText(`about.value.${title}`, t(desc))}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section id="leadership">
        <div className="container">
          <div className="section-title" data-aos="fade-up">
            <h2>{t('phrase.Our Leadership')}</h2>
            <p className="text-muted">
              {t('phrase.The dedicated team steering the strategic direction of NPC Rwanda.')}
            </p>
          </div>
          {leadership.length === 0 ? (
            <p className="text-muted text-center">No leadership team loaded.</p>
          ) : (
            <>
              <div className="row g-4">
                {paginatedLeadership.map(({ avatar, name, role, desc }, i) => (
                  <div key={name} className="col-md-4" data-aos="fade-up" data-aos-delay={`${i * 100}`}>
                    <div className="custom-card p-4 text-center">
                      <div className="athlete-thumb mb-3">
                        <img 
                          src={avatar.startsWith('http') || avatar.startsWith('/') ? avatar : `/assets/img/${avatar}`} 
                          alt={`${name} portrait`} 
                          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/avatar-4.svg'; }}
                        />
                      </div>
                      <h4 className="h5 mb-1">{name}</h4>
                      <p className="text-accent-green fw-bold">{t(role)}</p>
                      <p className="small text-muted">{t(desc)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination currentPage={visibleLeaderPage} totalPages={totalLeaderPages} onPageChange={setCurrentLeaderPage} ariaLabel="Leadership pagination" />
            </>
          )}
        </div>
      </section>

      {/* Strategic Objectives */}
      <section id="objectives" className="bg-light">
        <div className="container">
          <div className="section-title" data-aos="fade-up">
            <h2>{t('phrase.Strategic Objectives')}</h2>
            <p className="text-muted">{t('phrase.Our key focus areas for the 2024-2028 strategic period.')}</p>
          </div>
          <div className="row g-4">
            {strategicObjectives.map(({ icon, title, desc }, i) => (
              <div key={title} className="col-md-6" data-aos="fade-up" data-aos-delay={`${i * 100}`}>
                <div className="d-flex align-items-start p-4 bg-white rounded-4 shadow-soft">
                  <div
                    className="bg-primary text-white rounded-circle p-3 me-3"
                    style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <i className={`fas ${icon} fa-lg`} aria-hidden="true"></i>
                  </div>
                  <div>
                    <h4 className="h5">{t(title)}</h4>
                    <p className="small text-muted mb-0">{getSiteText(`about.objective.${title}`, t(desc))}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
