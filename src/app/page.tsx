'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

export default function HomePage() {
  const { t } = useTranslation();
  const { athletes, news, sports, partners, siteContent } = useData();

  const getSiteText = (key: string, fallback: string) => {
    return siteContent[key] || fallback;
  };

  return (
    <main id="main-content">
      {/* Hero Section */}
      <section
        className="hero bg-fit"
        style={{ backgroundImage: `url('${getSiteText('hero.image', '/assets/img/curated/home-hero.jpg')}')` }}
      >
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <div className="row align-items-center">
            <div className="col-lg-7" data-aos="fade-right">
              <span className="hero-kicker mb-3">{getSiteText('hero.kicker', t("phrase.RWANDA'S PARALYMPIC PRIDE"))}</span>
              <h1>
                <span>{getSiteText('hero.title1', t('phrase.Empowering Ability.'))}</span>
                <br />
                <span>{getSiteText('hero.title2', t('phrase.Inspiring Rwanda.'))}</span>
              </h1>
              <p className="lead mb-4">
                {getSiteText('hero.lead', t('phrase.We build inclusive pathways in sport and prepare elite para-athletes to represent Rwanda on the world stage. Ability comes first.'))}
              </p>
              <div className="d-flex gap-3">
                <Link href="/about" className="btn btn-primary btn-lg px-4 pulse-animation">
                  {t('phrase.Learn More')}
                </Link>
                <Link href="/contact" className="btn btn-outline-light btn-lg px-4">
                  {t('phrase.Partner With Us')}
                </Link>
              </div>
            </div>
            <div className="col-lg-5 d-none d-lg-block" data-aos="zoom-in">
              <div className="hero-stats p-4 bg-white rounded-4 shadow-lg text-dark">
                <div className="stat-list">
                  <div className="stat-item">
                    <div className="stat-title">{getSiteText('hero.stat1.title', t('phrase.Talent Identification'))}</div>
                    <p className="stat-sub">{getSiteText('hero.stat1.desc', t('phrase.Community scouting and development across all districts.'))}</p>
                  </div>
                  <div className="stat-item">
                    <div className="stat-title">{getSiteText('hero.stat2.title', t('phrase.High Performance'))}</div>
                    <p className="stat-sub">{getSiteText('hero.stat2.desc', t('phrase.Elite preparation for continental and global events.'))}</p>
                  </div>
                  <div className="stat-item">
                    <div className="stat-title">{getSiteText('hero.stat3.title', t('phrase.Athlete Welfare'))}</div>
                    <p className="stat-sub">{getSiteText('hero.stat3.desc', t('phrase.Medical, classification, and safeguarding support.'))}</p>
                  </div>
                  <div className="stat-item">
                    <div className="stat-title">{getSiteText('hero.stat4.title', t('phrase.Partnerships'))}</div>
                    <p className="stat-sub">{getSiteText('hero.stat4.desc', t('phrase.Working with federations, donors, and communities.'))}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Snapshot */}
      <section id="impact-strip" className="impact-strip">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-5">
              <span className="eyebrow">{getSiteText('impact.eyebrow', t('phrase.Impact Snapshot'))}</span>
              <h2 className="mb-3">{getSiteText('impact.title', t('phrase.Building Pathways for Inclusive Excellence'))}</h2>
              <p className="mb-0">
                {getSiteText('impact.desc', t('phrase.From grassroots participation to elite competition, NPC Rwanda connects athletes, coaches, and communities to grow para-sport opportunities nationwide.'))}
              </p>
            </div>
            <div className="col-lg-7">
              <div className="impact-grid">
                <div className="impact-card">
                  <div className="impact-number">{getSiteText('stats.districts', '30')}</div>
                  <div className="impact-label">{t('phrase.Districts (DPSCO)')}</div>
                </div>
                <div className="impact-card">
                  <div className="impact-number">{getSiteText('stats.disciplines', '12+')}</div>
                  <div className="impact-label">{t('phrase.Sport Disciplines')}</div>
                </div>
                <div className="impact-card">
                  <div className="impact-number">{getSiteText('stats.founded', '2001')}</div>
                  <div className="impact-label">{t('phrase.Founded Year')}</div>
                </div>
                <div className="impact-card">
                  <div className="impact-number">{getSiteText('stats.clubs', '30+')}</div>
                  <div className="impact-label">{t('phrase.Member Clubs')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section id="about-preview">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6" data-aos="fade-up">
              <img
                src={getSiteText('about.previewImage', '/assets/img/curated/about-hero.jpg')}
                alt="Para-athletics in Rwanda"
                className="img-fluid rounded-4 shadow-medium"
              />
            </div>
            <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
              <span className="text-uppercase fw-bold text-accent-green mb-2 d-block">
                {getSiteText('about.eyebrow', t('phrase.Who We Are'))}
              </span>
              <h2 className="mb-4">{getSiteText('about.previewTitle', t('phrase.Driving Inclusion Through Sport'))}</h2>
              <p className="text-justify mb-4">
                {getSiteText('about.previewText', t('phrase.The National Paralympic Committee of Rwanda (NPC Rwanda) is a national non-governmental organization established in 2001. Our vision is to be the leading Paralympic nation in Africa, and our mission is to build a sustainable system that enables para-athletes to achieve their sporting aspirations.'))}
              </p>
              <ul className="list-unstyled mb-4">
                <li className="mb-2">
                  <i className="fas fa-check-circle text-accent-green me-2" aria-hidden="true"></i>
                  <span>{getSiteText('about.bullet1', t('phrase.Member of IPC & World ParaVolley'))}</span>
                </li>
                <li className="mb-2">
                  <i className="fas fa-check-circle text-accent-green me-2" aria-hidden="true"></i>
                  <span>{getSiteText('about.bullet2', t('phrase.Presence in all 30 Districts (DPSCO)'))}</span>
                </li>
                <li className="mb-2">
                  <i className="fas fa-check-circle text-accent-green me-2" aria-hidden="true"></i>
                  <span>{getSiteText('about.bullet3', t('phrase.Inclusive Sports for All Abilities'))}</span>
                </li>
              </ul>
              <Link href="/about" className="btn btn-outline-primary fw-bold">
                {t('phrase.Read Full Mission')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Programs Grid */}
      <section id="sports-programs" className="bg-white">
        <div className="container">
          <div className="section-title" data-aos="fade-up">
            <span className="text-uppercase fw-bold text-accent-green mb-2 d-block">
              {t('phrase.Disciplines')}
            </span>
            <h2>{t('phrase.Our Sports Programs')}</h2>
            <p className="text-muted">
              {t('phrase.Explore the diverse para-sports disciplines we manage and support across Rwanda.')}
            </p>
          </div>
          {sports.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No sports programs available.</p>
            </div>
          ) : (
            <div className="row g-4">
              {sports.map((sport, i) => (
                <div key={sport.id} className="col-md-6 col-lg-3" data-aos="fade-up" data-aos-delay={`${i * 100}`}>
                  <div className="custom-card sport-card">
                    <img 
                      src={sport.img.startsWith('http') || sport.img.startsWith('/') ? sport.img : `/assets/img/curated/${sport.img}`} 
                      className="card-img-top" 
                      alt={t(sport.title)} 
                    />
                    <div className="card-body">
                      <h3>{t(sport.title)}</h3>
                      <p className="small text-muted">{t(sport.desc)}</p>
                      <Link href={`/sports#${sport.id}`} className="fw-bold text-primary text-decoration-none">
                        <span>{t('phrase.Learn More')}</span> <i className="fas fa-arrow-right small" aria-hidden="true"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Athletes */}
      <section id="featured-athletes" className="bg-light">
        <div className="container">
          <div className="section-title" data-aos="fade-up">
            <span className="text-uppercase fw-bold text-accent-green mb-2 d-block">
              {t('phrase.Inspiration')}
            </span>
            <h2>{t('phrase.Featured Athletes')}</h2>
            <p className="text-muted">{t('phrase.Meet the heroes who represent Rwanda with courage and excellence.')}</p>
          </div>
          {athletes.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No featured athletes available.</p>
            </div>
          ) : (
            <div className="row g-4">
              {athletes.slice(0, 3).map((a, i) => {
                const anchor = a.name.toLowerCase().split(' ').pop();
                return (
                  <div key={a.id} className="col-md-4" data-aos="zoom-in" data-aos-delay={`${i * 100}`}>
                    <div className="custom-card athlete-card p-4">
                      <div className="athlete-thumb">
                        <img 
                          src={a.avatar.startsWith('http') || a.avatar.startsWith('/') ? a.avatar : `/assets/img/${a.avatar}`} 
                          alt={`${a.name} portrait`} 
                          onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/avatar-1.svg'; }}
                        />
                      </div>
                      <h3>{a.name}</h3>
                      <p className="text-accent-green fw-bold">{t(a.sport)}</p>
                      <p className="small text-muted mb-4">{t(a.desc)}</p>
                      <Link href={`/athletes#${anchor}`} className="btn btn-sm btn-outline-primary">
                        {t('phrase.View Profile')}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="text-center mt-5">
            <Link href="/athletes" className="btn btn-primary px-5">
              {t('phrase.View All Athlete Profiles')}
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section id="news-preview">
        <div className="container">
          <div className="row align-items-end mb-5">
            <div className="col-md-8">
              <span className="text-uppercase fw-bold text-accent-green mb-2 d-block">
                {t('phrase.Stay Updated')}
              </span>
              <h2>{t('phrase.Latest News & Updates')}</h2>
            </div>
            <div className="col-md-4 text-md-end">
              <Link href="/news" className="btn btn-link text-primary fw-bold text-decoration-none p-0">
                <span>{t('phrase.All News')}</span> <i className="fas fa-arrow-right ms-1" aria-hidden="true"></i>
              </Link>
            </div>
          </div>
          {news.filter(article => article.status === 'Published').length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">No published news available.</p>
            </div>
          ) : (
            <div className="row g-4">
              {news.filter(article => article.status === 'Published').slice(0, 3).map((article, i) => (
                <div key={article.slug} className="col-lg-4" data-aos="fade-up" data-aos-delay={`${i * 100}`}>
                  <div className="custom-card news-card h-100">
                    <div className="news-img">
                      <img
                        src={article.img.startsWith('http') || article.img.startsWith('/') ? article.img : `/assets/img/curated/${article.img}`}
                        alt={t(article.title)}
                        className="img-fluid w-100"
                        style={{ height: '200px', objectFit: 'cover' }}
                      />
                    </div>
                    <div className="p-4">
                      <div className="news-date">{t(article.date)}</div>
                      <h4 className="h5 mb-3">{t(article.title)}</h4>
                      <p className="small text-muted">{t(article.desc)}</p>
                      <Link href={`/news/${article.slug}`} className="text-primary fw-bold text-decoration-none small">
                        <span>{t('phrase.Read More')}</span> <i className="fas fa-arrow-right ms-1" aria-hidden="true"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Governance Preview */}
      <section id="governance-preview" className="bg-light">
        <div className="container">
          <div className="section-title" data-aos="fade-up">
            <span className="text-uppercase fw-bold text-accent-green mb-2 d-block">
              {t('phrase.Accountability')}
            </span>
            <h2>{t('phrase.Governance & Transparency')}</h2>
            <p className="text-muted">
              {t('phrase.We are committed to the highest standards of transparency and professional management.')}
            </p>
          </div>
          <div className="row g-4">
            {[
              { icon: 'fa-users-gear', label: 'phrase.Board Members', sub: 'phrase.Our leadership', anchor: 'board' },
              { icon: 'fa-file-invoice', label: 'phrase.Annual Reports', sub: 'phrase.2024-2025 Activity', anchor: 'reports' },
              { icon: 'fa-scale-balanced', label: 'phrase.Policies', sub: 'phrase.Rules & Regulations', anchor: 'policies' },
              { icon: 'fa-chess-knight', label: 'phrase.Strategic Plan', sub: 'phrase.Vision for 2028', anchor: 'strategic-plan' },
            ].map(({ icon, label, sub, anchor }, i) => (
              <div key={anchor} className="col-6 col-lg-3" data-aos="zoom-in" data-aos-delay={`${i * 100}`}>
                <Link href={`/governance#${anchor}`} className="text-decoration-none">
                  <div className="custom-card p-4 text-center">
                    <i className={`fas ${icon} fa-3x text-primary mb-3`} aria-hidden="true"></i>
                    <h4 className="h6">{t(label)}</h4>
                    <p className="small text-muted mb-0">{t(sub)}</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Strip */}
      <div className="partners-strip">
        <div className="container">
          <div className="row align-items-center justify-content-center g-4 text-center">
            {partners.filter(p => p.active).length === 0 ? (
              <p className="text-muted small">Supporting partners program active</p>
            ) : (
              partners.filter(p => p.active).map(p => (
                <div key={p.id} className="col-4 col-md-2" title={p.name}>
                  <a href={p.website || '#'} target="_blank" rel="noopener noreferrer">
                    <img 
                      src={p.logo.startsWith('http') || p.logo.startsWith('/') ? p.logo : `/assets/img/${p.logo}`} 
                      alt={p.name} 
                      className="partner-logo" 
                      style={{ maxHeight: '60px', objectFit: 'contain' }}
                    />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* CTA Band */}
      <section className="cta-band">
        <div className="container">
          <div className="row align-items-center justify-content-between g-4">
            <div className="col-lg-8 text-lg-start" data-aos="fade-right">
              <h2 className="mb-2">{getSiteText('cta.title', t('phrase.Support Inclusive Sports in Rwanda'))}</h2>
              <p className="mb-0">
                {getSiteText('cta.desc', t('phrase.Help us expand access, strengthen athlete pathways, and deliver excellence in para-sport.'))}
              </p>
            </div>
            <div className="col-lg-4 text-lg-end" data-aos="fade-left">
              <div className="d-flex flex-wrap justify-content-lg-end gap-3 mt-3 mt-lg-0">
                <Link href="/donate" className="btn btn-warning btn-lg fw-bold px-4">
                  {t('phrase.Donate Now')}
                </Link>
                <Link href="/volunteer" className="btn btn-outline-light btn-lg fw-bold px-4">
                  {t('phrase.Volunteer')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
