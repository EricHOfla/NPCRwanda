'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import { isAnnouncementCategory } from '@/lib/newsUtils';

export default function HomeClient() {
  const { t } = useTranslation();
  const { athletes, news, events, sports, partners, siteContent } = useData();

  const getSiteText = (key: string, fallback: string) => siteContent[key] || fallback;

  const publishedNews = news.filter(
    a => a.status === 'Published' && !isAnnouncementCategory(a.category || '')
  ).slice(0, 3);

  const publishedAnnouncements = news.filter(
    a => a.status === 'Published' && isAnnouncementCategory(a.category || '')
  ).slice(0, 3);

  const upcomingEvents = events
    .filter(e => e.status === 'Upcoming' || e.status === 'Ongoing')
    .slice(0, 3);

  return (
    <main id="main-content">

      {/* ═══════════════════════════════════════════════════════════
          HERO — Full-bleed, mission-first
      ═══════════════════════════════════════════════════════════ */}
      <section
        className="ngo-hero"
        style={{ backgroundImage: `url('${getSiteText('hero.image', '/assets/img/curated/home-hero.jpg')}')` }}
        aria-label="Hero section"
      >
        <div className="ngo-hero__overlay" />
        <div className="container ngo-hero__body">
          <div className="row justify-content-center text-center">
            <div className="col-lg-9">
              <span className="ngo-hero__kicker">
                {getSiteText('hero.kicker', 'NPC RWANDA · NATIONAL PARALYMPIC COMMITTEE')}
              </span>
              <h1 className="ngo-hero__title">
                {getSiteText('hero.title1', 'Empowering Ability.')}{' '}
                <span className="ngo-hero__title--accent">
                  {getSiteText('hero.title2', 'Inspiring Rwanda.')}
                </span>
              </h1>
              <p className="ngo-hero__lead">
                {getSiteText(
                  'hero.lead',
                  'We build inclusive pathways in sport and prepare elite para-athletes to represent Rwanda on the world stage. Ability comes first.'
                )}
              </p>
              <div className="ngo-hero__actions">
                <Link href="/about" className="btn btn-primary btn-lg px-5 fw-bold">
                  {t('phrase.Our Mission')}
                </Link>
                <Link href="/donate" className="btn btn-warning btn-lg px-5 fw-bold">
                  {t('phrase.Donate Now')}
                </Link>
                <Link href="/contact" className="btn btn-outline-light btn-lg px-5">
                  {t('phrase.Partner With Us')}
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Scroll cue */}
        <a href="#impact" className="ngo-hero__scroll-cue" aria-label="Scroll down">
          <i className="fas fa-chevron-down" />
        </a>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          IMPACT NUMBERS — thin dark bar
      ═══════════════════════════════════════════════════════════ */}
      <section id="impact" className="ngo-impact-bar">
        <div className="container">
          <div className="row g-0 justify-content-center">
            {[
              { value: getSiteText('stats.athletes', '500+'),  label: t('phrase.Para-athletes Supported') },
              { value: getSiteText('stats.districts', '30'),   label: t('phrase.Districts (DPSCO)') },
              { value: getSiteText('stats.disciplines', '12+'), label: t('phrase.Sport Disciplines') },
              { value: getSiteText('stats.founded', '2001'),   label: t('phrase.Year Established') },
              { value: getSiteText('stats.clubs', '30+'),      label: t('phrase.Member Clubs') },
            ].map(({ value, label }, i) => (
              <div key={i} className="col-6 col-md-4 col-lg ngo-impact-bar__item">
                <div className="ngo-impact-bar__value">{value}</div>
                <div className="ngo-impact-bar__label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          MISSION PILLARS — 3-column cards with icon
      ═══════════════════════════════════════════════════════════ */}
      <section className="ngo-pillars">
        <div className="container">
          <div className="ngo-section-header text-center mb-5">
            <span className="ngo-eyebrow">{t('phrase.What We Do')}</span>
            <h2 className="ngo-section-header__title">
              {getSiteText('pillars.title', 'Our Core Mission Areas')}
            </h2>
            <p className="ngo-section-header__sub">
              {getSiteText(
                'pillars.desc',
                'NPC Rwanda operates across four strategic pillars to ensure every person with a disability in Rwanda can access, enjoy and excel in sport.'
              )}
            </p>
          </div>
          <div className="row g-4">
            {[
              {
                icon: 'fa-magnifying-glass-chart',
                title: getSiteText('pillar1.title', 'Talent Identification'),
                desc: getSiteText('pillar1.desc', 'Community scouting across all 30 districts, connecting grassroots DPSCO networks with national competition pathways.'),
                color: '#0072C6',
              },
              {
                icon: 'fa-trophy',
                title: getSiteText('pillar2.title', 'High Performance'),
                desc: getSiteText('pillar2.desc', 'Elite training, coaching certification, and full preparation for continental and global Paralympic events.'),
                color: '#E67E22',
              },
              {
                icon: 'fa-heart-pulse',
                title: getSiteText('pillar3.title', 'Athlete Welfare'),
                desc: getSiteText('pillar3.desc', 'Medical support, classification, anti-doping education, and athlete safeguarding programmes.'),
                color: '#27AE60',
              },
              {
                icon: 'fa-handshake',
                title: getSiteText('pillar4.title', 'Inclusive Communities'),
                desc: getSiteText('pillar4.desc', 'Removing barriers through policy advocacy, disability awareness, and partnerships with government and civil society.'),
                color: '#8E44AD',
              },
            ].map(({ icon, title, desc, color }, i) => (
              <div key={i} className="col-sm-6 col-lg-3" data-aos="fade-up" data-aos-delay={`${i * 80}`}>
                <div className="ngo-pillar-card">
                  <div className="ngo-pillar-card__icon" style={{ background: `${color}18`, color }}>
                    <i className={`fas ${icon}`} aria-hidden="true" />
                  </div>
                  <h3 className="ngo-pillar-card__title">{title}</h3>
                  <p className="ngo-pillar-card__desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ABOUT SPLIT — image left, text right
      ═══════════════════════════════════════════════════════════ */}
      <section className="ngo-about-split">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-5" data-aos="fade-right">
              <div className="ngo-about-split__img-wrap">
                <img
                  src={getSiteText('about.previewImage', '/assets/img/curated/about-hero.jpg')}
                  alt="NPC Rwanda para-athletes in action"
                  className="ngo-about-split__img"
                />
                {/* Floating badge */}
                <div className="ngo-about-split__badge">
                  <i className="fas fa-medal" />
                  <div>
                    <div className="ngo-about-split__badge-val">IPC</div>
                    <div className="ngo-about-split__badge-sub">Member</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-7" data-aos="fade-left">
              <span className="ngo-eyebrow">{getSiteText('about.eyebrow', 'Who We Are')}</span>
              <h2 className="ngo-section-header__title mb-4">
                {getSiteText('about.previewTitle', 'Driving Inclusion Through Sport')}
              </h2>
              <p className="ngo-about-split__text">
                {getSiteText(
                  'about.previewText',
                  'The National Paralympic Committee of Rwanda (NPC Rwanda) is a national non-governmental organization established in 2001. Our vision is to be the leading Paralympic nation in Africa — our mission is to build a sustainable system that enables para-athletes to achieve their sporting aspirations.'
                )}
              </p>
              <div className="ngo-about-split__checks">
                {[
                  getSiteText('about.bullet1', 'Full member of IPC & World ParaVolley'),
                  getSiteText('about.bullet2', 'Present in all 30 Districts via DPSCO'),
                  getSiteText('about.bullet3', 'Inclusive sports for all abilities'),
                  getSiteText('about.bullet4', 'Aligned with Rwanda Vision 2050'),
                ].map((text, i) => (
                  <div key={i} className="ngo-about-split__check">
                    <i className="fas fa-circle-check" aria-hidden="true" />
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <div className="d-flex gap-3 flex-wrap mt-4">
                <Link href="/about" className="btn btn-primary fw-bold px-4">
                  {t('phrase.Read Full Mission')}
                </Link>
                <Link href="/governance" className="btn btn-outline-secondary fw-bold px-4">
                  {t('phrase.View Governance')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          SPORTS PROGRAMS — icon grid, compact
      ═══════════════════════════════════════════════════════════ */}
      {sports.length > 0 && (
        <section className="ngo-sports">
          <div className="container">
            <div className="ngo-section-header text-center mb-5">
              <span className="ngo-eyebrow">{t('phrase.Disciplines')}</span>
              <h2 className="ngo-section-header__title">{t('phrase.Our Sports Programs')}</h2>
              <p className="ngo-section-header__sub">
                {t('phrase.Explore the diverse para-sports disciplines we manage and support across Rwanda.')}
              </p>
            </div>
            <div className="row g-4">
              {sports.slice(0, 8).map((sport, i) => (
                <div key={sport.id} className="col-6 col-md-4 col-lg-3" data-aos="fade-up" data-aos-delay={`${i * 60}`}>
                  <Link href={`/sports#${sport.id}`} className="text-decoration-none">
                    <div className="ngo-sport-card">
                      <div className="ngo-sport-card__img-wrap">
                        <img
                          src={sport.img.startsWith('http') || sport.img.startsWith('/') ? sport.img : `/assets/img/curated/${sport.img}`}
                          alt={t(sport.title)}
                          className="ngo-sport-card__img"
                        />
                        <div className="ngo-sport-card__overlay" />
                      </div>
                      <div className="ngo-sport-card__body">
                        <h3 className="ngo-sport-card__title">{t(sport.title)}</h3>
                        <span className="ngo-sport-card__cta">
                          {t('phrase.Learn More')} <i className="fas fa-arrow-right ms-1" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            {sports.length > 8 && (
              <div className="text-center mt-5">
                <Link href="/sports" className="btn btn-outline-primary px-5 fw-bold">
                  {t('phrase.All Sports')} <i className="fas fa-arrow-right ms-2" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          ATHLETES SPOTLIGHT — horizontal scroll cards
      ═══════════════════════════════════════════════════════════ */}
      {athletes.length > 0 && (
        <section className="ngo-athletes">
          <div className="container">
            <div className="d-flex align-items-end justify-content-between mb-5 flex-wrap gap-3">
              <div>
                <span className="ngo-eyebrow">{t('phrase.Inspiration')}</span>
                <h2 className="ngo-section-header__title mb-0">{t('phrase.Featured Athletes')}</h2>
              </div>
              <Link href="/athletes" className="btn btn-outline-primary fw-bold">
                {t('phrase.All Athletes')} <i className="fas fa-arrow-right ms-2" />
              </Link>
            </div>
            <div className="row g-4">
              {athletes.slice(0, 4).map((a, i) => {
                const anchor = a.name.toLowerCase().split(' ').pop();
                return (
                  <div key={a.id} className="col-sm-6 col-lg-3" data-aos="zoom-in" data-aos-delay={`${i * 80}`}>
                    <Link href={`/athletes#${anchor}`} className="text-decoration-none">
                      <div className="ngo-athlete-card">
                        <div className="ngo-athlete-card__img-wrap">
                          <img
                            src={a.avatar.startsWith('http') || a.avatar.startsWith('/') ? a.avatar : `/assets/img/${a.avatar}`}
                            alt={`${a.name} — ${a.sport}`}
                            className="ngo-athlete-card__img"
                            onError={e => { (e.target as HTMLImageElement).src = '/assets/img/avatar-1.svg'; }}
                          />
                        </div>
                        <div className="ngo-athlete-card__body">
                          <span className="ngo-athlete-card__sport">{t(a.sport)}</span>
                          <h3 className="ngo-athlete-card__name">{a.name}</h3>
                          <p className="ngo-athlete-card__desc">{t(a.desc)}</p>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          NEWS + ANNOUNCEMENTS — two-column split
      ═══════════════════════════════════════════════════════════ */}
      <section className="ngo-updates">
        <div className="container">
          <div className="row g-5">
            {/* News column */}
            <div className="col-lg-7">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <span className="ngo-eyebrow">{t('phrase.Stay Updated')}</span>
                  <h2 className="ngo-section-header__title mb-0">{t('phrase.Latest News')}</h2>
                </div>
                <Link href="/news" className="ngo-updates__all-link">
                  {t('phrase.All News')} <i className="fas fa-arrow-right ms-1" />
                </Link>
              </div>
              {publishedNews.length === 0 ? (
                <p className="text-muted">{t('phrase.No published news available.')}</p>
              ) : (
                <div className="ngo-news-list">
                  {publishedNews.map((article, i) => (
                    <Link key={article.slug} href={`/news/${encodeURIComponent(article.slug || article.id)}`} className="text-decoration-none">
                      <div className={`ngo-news-item ${i === 0 ? 'ngo-news-item--featured' : ''}`}>
                        {i === 0 && (
                          <div className="ngo-news-item__img-wrap">
                            <img
                              src={article.img.startsWith('http') || article.img.startsWith('/') ? article.img : `/assets/img/curated/${article.img}`}
                              alt={t(article.title)}
                              className="ngo-news-item__img"
                            />
                          </div>
                        )}
                        <div className="ngo-news-item__body">
                          <span className="ngo-news-item__cat">{article.category || 'News'}</span>
                          <h3 className="ngo-news-item__title">{t(article.title)}</h3>
                          <p className="ngo-news-item__desc">{t(article.desc)}</p>
                          <div className="ngo-news-item__meta">
                            <i className="fas fa-calendar-alt me-1" />
                            {article.date}
                            <span className="ngo-news-item__read ms-3">
                              {t('phrase.Read More')} <i className="fas fa-arrow-right ms-1" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Announcements + Events sidebar */}
            <div className="col-lg-5">
              {/* Official Notices */}
              <div className="mb-5">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <div>
                    <span className="ngo-eyebrow">{t('phrase.Official')}</span>
                    <h2 className="ngo-section-header__title mb-0" style={{ fontSize: '1.3rem' }}>
                      {t('phrase.Announcements')}
                    </h2>
                  </div>
                  <Link href="/announcements" className="ngo-updates__all-link">
                    {t('phrase.View All')} <i className="fas fa-arrow-right ms-1" />
                  </Link>
                </div>
                {publishedAnnouncements.length === 0 ? (
                  <p className="text-muted small">{t('phrase.No announcements available.')}</p>
                ) : (
                  <div className="ngo-notice-list">
                    {publishedAnnouncements.map(a => (
                      <Link key={a.slug} href={`/announcements/${encodeURIComponent(a.slug || a.id)}`} className="text-decoration-none">
                        <div className="ngo-notice-item">
                          <div className="ngo-notice-item__icon">
                            <i className="fas fa-bullhorn" />
                          </div>
                          <div>
                            <span className={`ngo-notice-item__badge ngo-notice-item__badge--${(a.category || 'announcement').toLowerCase().replace(/\s+/g, '-')}`}>
                              {a.category || 'Announcement'}
                            </span>
                            <p className="ngo-notice-item__title">{t(a.title)}</p>
                            <span className="ngo-notice-item__date">
                              <i className="fas fa-calendar-alt me-1" />{a.date}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming Events */}
              {upcomingEvents.length > 0 && (
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div>
                      <span className="ngo-eyebrow">{t('phrase.Calendar')}</span>
                      <h2 className="ngo-section-header__title mb-0" style={{ fontSize: '1.3rem' }}>
                        {t('phrase.Upcoming Events')}
                      </h2>
                    </div>
                    <Link href="/events" className="ngo-updates__all-link">
                      {t('phrase.View All')} <i className="fas fa-arrow-right ms-1" />
                    </Link>
                  </div>
                  <div className="ngo-event-list">
                    {upcomingEvents.map(ev => {
                      const d = ev.date ? new Date(ev.date) : null;
                      return (
                        <Link key={ev.id} href="/events" className="text-decoration-none">
                          <div className="ngo-event-item">
                            {d && (
                              <div className="ngo-event-item__date">
                                <span className="ngo-event-item__day">{d.getDate()}</span>
                                <span className="ngo-event-item__mon">{d.toLocaleString('en-US', { month: 'short' })}</span>
                              </div>
                            )}
                            <div className="ngo-event-item__body">
                              <h4 className="ngo-event-item__title">{ev.title}</h4>
                              <span className="ngo-event-item__loc">
                                <i className="fas fa-location-dot me-1" />{ev.location}
                              </span>
                              <span className={`ngo-event-item__status ngo-event-item__status--${ev.status.toLowerCase()}`}>
                                {ev.status}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          GOVERNANCE — accountability strip
      ═══════════════════════════════════════════════════════════ */}
      <section className="ngo-governance">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-4">
              <span className="ngo-eyebrow ngo-eyebrow--light">{t('phrase.Accountability')}</span>
              <h2 className="ngo-section-header__title" style={{ color: '#fff' }}>
                {t('phrase.Governance & Transparency')}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
                {t('phrase.We are committed to the highest standards of transparency and professional management.')}
              </p>
              <Link href="/governance" className="btn btn-warning fw-bold px-4 mt-2">
                {t('phrase.View Governance')} <i className="fas fa-arrow-right ms-2" />
              </Link>
            </div>
            <div className="col-lg-8">
              <div className="row g-3">
                {[
                  { icon: 'fa-users-gear',     label: t('phrase.Board Members'),  sub: t('phrase.Our leadership'),         anchor: 'board' },
                  { icon: 'fa-file-invoice',   label: t('phrase.Annual Reports'), sub: t('phrase.2024-2025 Activity'),      anchor: 'reports' },
                  { icon: 'fa-scale-balanced', label: t('phrase.Policies'),       sub: t('phrase.Rules & Regulations'),     anchor: 'policies' },
                  { icon: 'fa-chess-knight',   label: t('phrase.Strategic Plan'), sub: t('phrase.Vision for 2028'),         anchor: 'strategic-plan' },
                ].map(({ icon, label, sub, anchor }, i) => (
                  <div key={anchor} className="col-sm-6" data-aos="fade-up" data-aos-delay={`${i * 80}`}>
                    <Link href={`/governance#${anchor}`} className="text-decoration-none">
                      <div className="ngo-gov-card">
                        <i className={`fas ${icon} ngo-gov-card__icon`} aria-hidden="true" />
                        <div>
                          <div className="ngo-gov-card__label">{label}</div>
                          <div className="ngo-gov-card__sub">{sub}</div>
                        </div>
                        <i className="fas fa-arrow-right ngo-gov-card__arrow" />
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          PARTNERS LOGOS
      ═══════════════════════════════════════════════════════════ */}
      {partners.filter(p => p.active).length > 0 && (
        <section className="ngo-partners">
          <div className="container">
            <p className="ngo-partners__label">{t('phrase.Our Partners & Supporters')}</p>
            <div className="ngo-partners__logos">
              {partners.filter(p => p.active).map(p => (
                <a key={p.id} href={p.website || '#'} target="_blank" rel="noopener noreferrer" title={p.name} className="ngo-partners__logo-link">
                  <img
                    src={p.logo.startsWith('http') || p.logo.startsWith('/') ? p.logo : `/assets/img/${p.logo}`}
                    alt={p.name}
                    className="ngo-partners__logo"
                  />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          CTA BAND — support & volunteer
      ═══════════════════════════════════════════════════════════ */}
      <section className="ngo-cta">
        <div className="ngo-cta__overlay" />
        <div className="container ngo-cta__body">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <span className="ngo-eyebrow ngo-eyebrow--light">{t('phrase.Take Action')}</span>
              <h2 className="ngo-cta__title">
                {getSiteText('cta.title', 'Support Inclusive Sports in Rwanda')}
              </h2>
              <p className="ngo-cta__desc">
                {getSiteText(
                  'cta.desc',
                  'Help us expand access, strengthen athlete pathways, and deliver excellence in para-sport. Every contribution changes lives.'
                )}
              </p>
              <div className="ngo-cta__actions">
                <Link href="/donate" className="btn btn-warning btn-lg fw-bold px-5">
                  <i className="fas fa-heart me-2" /> {t('phrase.Donate Now')}
                </Link>
                <Link href="/volunteer" className="btn btn-outline-light btn-lg fw-bold px-5">
                  <i className="fas fa-hands-helping me-2" /> {t('phrase.Volunteer')}
                </Link>
                <Link href="/contact" className="btn btn-outline-light btn-lg fw-bold px-5">
                  <i className="fas fa-envelope me-2" /> {t('phrase.Contact Us')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
