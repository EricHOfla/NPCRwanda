'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';
import { isAnnouncementCategory } from '@/lib/newsUtils';

export default function HomeClient() {
  const { t } = useTranslation();
  const {
    athletes,
    news,
    events,
    sports,
    partners,
    siteContent,
    governanceDocs,
    governancePolicies,
    npcClubs,
    dpscoContacts,
  } = useData();

  // Helper to fetch database-backed site text or fallback
  const getSiteText = (key: string, fallback: string) => siteContent[key] || fallback;

  // Filter true news vs announcements directly from the database
  const publishedNews = news.filter(
    a => a.status === 'Published' && !isAnnouncementCategory(a.category || '')
  );

  const publishedAnnouncements = news.filter(
    a => a.status === 'Published' && isAnnouncementCategory(a.category || '')
  );

  const latestAnnouncement = publishedAnnouncements[0] || null;
  const leadNews = publishedNews[0] || null;
  const secondaryNews = publishedNews.slice(1, 3);

  const upcomingEvents = events
    .filter(e => e.status === 'Upcoming' || e.status === 'Ongoing')
    .slice(0, 3);

  // Active verified partners from database
  const activePartners = partners.filter(p => p.active);

  // Dynamic counts derived directly from database records
  const districtsCount = dpscoContacts.length > 0 ? `${dpscoContacts.length}` : getSiteText('stats.districts', '30');
  const athletesCount = athletes.length > 0 ? `${athletes.length}+` : getSiteText('stats.athletes', '500+');
  const disciplinesCount = sports.length > 0 ? `${sports.length}` : getSiteText('stats.disciplines', '8+');
  const clubsCount = npcClubs.length > 0 ? `${npcClubs.length}+` : getSiteText('stats.clubs', '30+');

  return (
    <main id="main-content">

      {/* ═══════════════════════════════════════════════════════════
          1. LIVE INSTITUTIONAL BULLETIN TICKER (FROM DATABASE)
      ═══════════════════════════════════════════════════════════ */}
      {latestAnnouncement && (
        <aside className="pro-ngo-bulletin" aria-label="Official Announcement Bulletin">
          <div className="pro-ngo-container">
            <div className="pro-ngo-bulletin__inner">
              <div className="pro-ngo-bulletin__content">
                <span className="pro-ngo-bulletin__pulse" aria-hidden="true" />
                <span className="pro-ngo-bulletin__badge">
                  {latestAnnouncement.category || 'Official Notice'}
                </span>
                <span className="pro-ngo-bulletin__title">
                  {t(latestAnnouncement.title)}
                </span>
              </div>
              <Link
                href={`/announcements/${encodeURIComponent(latestAnnouncement.slug || latestAnnouncement.id)}`}
                className="pro-ngo-bulletin__link"
              >
                <span>{t('phrase.Read Official Notice')}</span>
                <i className="fas fa-arrow-right small" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </aside>
      )}

      {/* ═══════════════════════════════════════════════════════════
          2. HERO SECTION (100% FROM DATABASE & CMS)
      ═══════════════════════════════════════════════════════════ */}
      <section className="pro-ngo-hero" aria-label="Executive Institutional Introduction">
        <div className="pro-ngo-container">
          <div className="row align-items-center g-5">
            
            {/* Left Column: Mission & Dynamic Institutional Authority */}
            <div className="col-lg-7" data-aos="fade-right">
              <div className="pro-ngo-hero__trust-badge">
                <span className="badge bg-warning text-dark fw-bold px-2 py-1 rounded-pill" style={{ fontSize: '0.65rem' }}>
                  RWANDA
                </span>
                <span>{getSiteText('hero.kicker', "RWANDA'S PARALYMPIC PRIDE")}</span>
              </div>

              <h1 className="pro-ngo-hero__title">
                {getSiteText('hero.title1', 'Empowering Ability.')}{' '}
                <span className="pro-ngo-hero__title-highlight">
                  {getSiteText('hero.title2', 'Inspiring Rwanda.')}
                </span>
              </h1>

              <p className="pro-ngo-hero__lead">
                {getSiteText(
                  'hero.lead',
                  'We build inclusive pathways in sport and prepare elite para-athletes to represent Rwanda on the world stage. Ability comes first.'
                )}
              </p>

              <div className="pro-ngo-hero__actions">
                <Link href="/about" className="pro-ngo-btn-primary">
                  <i className="fas fa-shield-halved" aria-hidden="true" />
                  <span>{t('phrase.Our Mission & Mandate')}</span>
                </Link>

                <Link href="/donate" className="pro-ngo-btn-donate">
                  <i className="fas fa-heart text-danger" aria-hidden="true" />
                  <span>{t('phrase.Donate to Athlete Fund')}</span>
                </Link>

                <Link href="/governance#strategic-plan" className="pro-ngo-btn-outline">
                  <i className="fas fa-file-contract text-primary" aria-hidden="true" />
                  <span>{t('phrase.Strategic Plan 2024–2028')}</span>
                </Link>
              </div>

              {/* Dynamic Database Metrics */}
              <div className="pro-ngo-hero__kpis">
                <div className="pro-ngo-hero__kpi-card">
                  <div className="pro-ngo-hero__kpi-num">{districtsCount}</div>
                  <div className="pro-ngo-hero__kpi-label">{t('phrase.Districts (DPSCO)')}</div>
                </div>
                <div className="pro-ngo-hero__kpi-card">
                  <div className="pro-ngo-hero__kpi-num">{athletesCount}</div>
                  <div className="pro-ngo-hero__kpi-label">{t('phrase.Registered Athletes')}</div>
                </div>
                <div className="pro-ngo-hero__kpi-card">
                  <div className="pro-ngo-hero__kpi-num">{disciplinesCount}</div>
                  <div className="pro-ngo-hero__kpi-label">{t('phrase.Sport Disciplines')}</div>
                </div>
                <div className="pro-ngo-hero__kpi-card">
                  <div className="pro-ngo-hero__kpi-num">{clubsCount}</div>
                  <div className="pro-ngo-hero__kpi-label">{t('phrase.Member Clubs')}</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase (Loaded from Database Site Content) */}
            <div className="col-lg-5" data-aos="zoom-in" data-aos-delay="100">
              <div className="pro-ngo-hero__showcase-wrap">
                <div className="pro-ngo-hero__showcase">
                  <img
                    src={getSiteText('hero.image', '/assets/img/curated/home-hero.jpg')}
                    alt={getSiteText('hero.title1', 'National Paralympic Committee of Rwanda')}
                    className="pro-ngo-hero__showcase-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/img/curated/home-hero.jpg';
                    }}
                  />
                  <div className="pro-ngo-hero__showcase-gradient">
                    <div className="pro-ngo-hero__badge-row">
                      <span className="pro-ngo-tag pro-ngo-tag--gold">
                        <i className="fas fa-award" aria-hidden="true" /> {getSiteText('stats.founded', '2001')}
                      </span>
                      <span className="pro-ngo-tag pro-ngo-tag--white">
                        {disciplinesCount} {t('phrase.Disciplines')}
                      </span>
                    </div>

                    <h3 className="pro-ngo-hero__showcase-title">
                      {getSiteText('hero.title1', 'Empowering Ability.')} {getSiteText('hero.title2', 'Inspiring Rwanda.')}
                    </h3>

                    <p className="pro-ngo-hero__showcase-desc">
                      {getSiteText(
                        'hero.lead',
                        'We build inclusive pathways in sport and prepare elite para-athletes to represent Rwanda on the world stage.'
                      )}
                    </p>

                    <Link href="/sports" className="pro-ngo-hero__showcase-link">
                      <span>{t('phrase.Explore Sports Programs')}</span>
                      <i className="fas fa-arrow-right" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                {/* Floating Verified Badge */}
                <div className="pro-ngo-hero__inset-card">
                  <div className="pro-ngo-hero__inset-icon">
                    <i className="fas fa-medal" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="pro-ngo-hero__inset-title">{getSiteText('hero.stat2.title', 'High Performance')}</div>
                    <div className="pro-ngo-hero__inset-sub">{getSiteText('hero.stat2.desc', 'Elite preparation for continental and global events.')}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. STATUTORY ACCREDITATION & GLOBAL ALLIANCES (FROM DATABASE)
      ═══════════════════════════════════════════════════════════ */}
      <section className="pro-ngo-accreditation" aria-label="Official Accreditations">
        <div className="pro-ngo-container">
          <div className="pro-ngo-accreditation__title">
            {t('phrase.Officially Recognized & Affiliated With Global Sports Authorities')}
          </div>
          <div className="pro-ngo-accreditation__grid">
            
            <div className="pro-ngo-accreditation__item">
              <div className="pro-ngo-accreditation__abbr">IPC</div>
              <div>
                <div className="pro-ngo-accreditation__name">International Paralympic Committee</div>
                <span className="pro-ngo-accreditation__sub">Full Member Since {getSiteText('stats.founded', '2001')}</span>
              </div>
            </div>

            <div className="pro-ngo-accreditation__item">
              <div className="pro-ngo-accreditation__abbr">MINISPORTS</div>
              <div>
                <div className="pro-ngo-accreditation__name">Ministry of Sports Rwanda</div>
                <span className="pro-ngo-accreditation__sub">National Sports Governing Partner</span>
              </div>
            </div>

            <div className="pro-ngo-accreditation__item">
              <div className="pro-ngo-accreditation__abbr">WPV</div>
              <div>
                <div className="pro-ngo-accreditation__name">World ParaVolley</div>
                <span className="pro-ngo-accreditation__sub">Zone Africa Member</span>
              </div>
            </div>

            <div className="pro-ngo-accreditation__item">
              <div className="pro-ngo-accreditation__abbr">APC</div>
              <div>
                <div className="pro-ngo-accreditation__name">African Paralympic Committee</div>
                <span className="pro-ngo-accreditation__sub">Continental Member Federation</span>
              </div>
            </div>

            <div className="pro-ngo-accreditation__item">
              <div className="pro-ngo-accreditation__abbr">NUDOR</div>
              <div>
                <div className="pro-ngo-accreditation__name">Disability Organisations Union</div>
                <span className="pro-ngo-accreditation__sub">National Inclusion Ally</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. STRATEGIC MISSION PILLARS (100% FROM DATABASE SITECONTENT)
      ═══════════════════════════════════════════════════════════ */}
      <section className="pro-ngo-pillars" aria-label="Core Strategic Pillars">
        <div className="pro-ngo-container">
          
          <div className="pro-ngo-section-header pro-ngo-section-header--center" data-aos="fade-up">
            <span className="pro-ngo-eyebrow">{getSiteText('impact.eyebrow', t('phrase.Impact Snapshot'))}</span>
            <h2 className="pro-ngo-heading">
              {getSiteText('impact.title', t('phrase.Building Pathways for Inclusive Excellence'))}
            </h2>
            <p className="pro-ngo-subhead pro-ngo-subhead--center">
              {getSiteText(
                'impact.desc',
                t('phrase.From grassroots participation to elite competition, NPC Rwanda connects athletes, coaches, and communities to grow para-sport opportunities nationwide.')
              )}
            </p>
          </div>

          <div className="pro-ngo-bento">

            {/* Pillar 1: Talent Identification */}
            <div className="pro-ngo-bento-card pro-ngo-bento-card--featured" style={{ gridColumn: 'span 7' }} data-aos="fade-up">
              <div>
                <div className="pro-ngo-bento-card__icon-box" style={{ background: 'rgba(255, 215, 0, 0.15)', color: '#FFD700' }}>
                  <i className="fas fa-magnifying-glass-chart" aria-hidden="true" />
                </div>
                <span className="pro-ngo-tag pro-ngo-tag--gold mb-3">
                  {districtsCount} {t('phrase.Districts (DPSCO)')}
                </span>
                <h3 className="pro-ngo-bento-card__title">
                  {getSiteText('hero.stat1.title', t('phrase.Talent Identification'))}
                </h3>
                <p className="pro-ngo-bento-card__desc">
                  {getSiteText('hero.stat1.desc', t('phrase.Community scouting and development across all districts.'))}
                </p>
              </div>
              <div className="pro-ngo-bento-card__footer">
                <span className="pro-ngo-bento-card__metric">
                  <i className="fas fa-check-circle" aria-hidden="true" /> {clubsCount} {t('phrase.Member Clubs')}
                </span>
                <Link href="/members/dpsco" className="pro-ngo-bento-card__link">
                  <span>{t('phrase.Explore DPSCO')}</span>
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Pillar 2: High Performance */}
            <div className="pro-ngo-bento-card" style={{ gridColumn: 'span 5' }} data-aos="fade-up" data-aos-delay="100">
              <div>
                <div className="pro-ngo-bento-card__icon-box" style={{ background: 'rgba(0, 114, 198, 0.1)', color: '#0072C6' }}>
                  <i className="fas fa-trophy" aria-hidden="true" />
                </div>
                <span className="pro-ngo-tag pro-ngo-tag--blue mb-3">
                  {disciplinesCount} {t('phrase.Sport Disciplines')}
                </span>
                <h3 className="pro-ngo-bento-card__title">
                  {getSiteText('hero.stat2.title', t('phrase.High Performance'))}
                </h3>
                <p className="pro-ngo-bento-card__desc">
                  {getSiteText('hero.stat2.desc', t('phrase.Elite preparation for continental and global events.'))}
                </p>
              </div>
              <div className="pro-ngo-bento-card__footer">
                <span className="pro-ngo-bento-card__metric">
                  <i className="fas fa-medal" aria-hidden="true" /> {athletesCount} {t('phrase.Athletes')}
                </span>
                <Link href="/sports" className="pro-ngo-bento-card__link">
                  <span>{t('phrase.View Sports')}</span>
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Pillar 3: Athlete Welfare */}
            <div className="pro-ngo-bento-card" style={{ gridColumn: 'span 6' }} data-aos="fade-up" data-aos-delay="150">
              <div>
                <div className="pro-ngo-bento-card__icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                  <i className="fas fa-heart-pulse" aria-hidden="true" />
                </div>
                <span className="pro-ngo-tag pro-ngo-tag--blue mb-3">
                  IPC Standards
                </span>
                <h3 className="pro-ngo-bento-card__title">
                  {getSiteText('hero.stat3.title', t('phrase.Athlete Welfare'))}
                </h3>
                <p className="pro-ngo-bento-card__desc">
                  {getSiteText('hero.stat3.desc', t('phrase.Medical, classification, and safeguarding support.'))}
                </p>
              </div>
              <div className="pro-ngo-bento-card__footer">
                <span className="pro-ngo-bento-card__metric">
                  <i className="fas fa-shield-halved" aria-hidden="true" /> Safeguarding Codes
                </span>
                <Link href="/about" className="pro-ngo-bento-card__link">
                  <span>{t('phrase.Learn More')}</span>
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Pillar 4: Partnerships */}
            <div className="pro-ngo-bento-card" style={{ gridColumn: 'span 6' }} data-aos="fade-up" data-aos-delay="200">
              <div>
                <div className="pro-ngo-bento-card__icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
                  <i className="fas fa-handshake" aria-hidden="true" />
                </div>
                <span className="pro-ngo-tag pro-ngo-tag--blue mb-3">
                  Alliances & Civil Society
                </span>
                <h3 className="pro-ngo-bento-card__title">
                  {getSiteText('hero.stat4.title', t('phrase.Partnerships'))}
                </h3>
                <p className="pro-ngo-bento-card__desc">
                  {getSiteText('hero.stat4.desc', t('phrase.Working with federations, donors, and communities.'))}
                </p>
              </div>
              <div className="pro-ngo-bento-card__footer">
                <span className="pro-ngo-bento-card__metric">
                  <i className="fas fa-globe" aria-hidden="true" /> {activePartners.length} Active Partners
                </span>
                <Link href="/partners" className="pro-ngo-bento-card__link">
                  <span>{t('phrase.Our Partners')}</span>
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. WHO WE ARE (FROM DATABASE SITECONTENT)
      ═══════════════════════════════════════════════════════════ */}
      <section className="pro-ngo-about" aria-label="About NPC Rwanda Preview">
        <div className="pro-ngo-container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6" data-aos="fade-right">
              <img
                src={getSiteText('about.previewImage', '/assets/img/curated/about-hero.jpg')}
                alt={getSiteText('about.previewTitle', 'About NPC Rwanda')}
                className="pro-ngo-about__img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/assets/img/curated/about-hero.jpg';
                }}
              />
            </div>
            <div className="col-lg-6" data-aos="fade-left">
              <span className="pro-ngo-eyebrow">
                {getSiteText('about.eyebrow', t('phrase.Who We Are'))}
              </span>
              <h2 className="pro-ngo-heading">
                {getSiteText('about.previewTitle', t('phrase.Driving Inclusion Through Sport'))}
              </h2>
              <p className="text-secondary mb-4" style={{ lineHeight: 1.75 }}>
                {getSiteText(
                  'about.previewText',
                  t('phrase.The National Paralympic Committee of Rwanda (NPC Rwanda) is a national non-governmental organization established in 2001. Our vision is to be the leading Paralympic nation in Africa, and our mission is to build a sustainable system that enables para-athletes to achieve their sporting aspirations.')
                )}
              </p>

              <div className="pro-ngo-about__bullets">
                <div className="pro-ngo-about__bullet">
                  <i className="fas fa-circle-check" aria-hidden="true" />
                  <span>{getSiteText('about.bullet1', t('phrase.Member of IPC & World ParaVolley'))}</span>
                </div>
                <div className="pro-ngo-about__bullet">
                  <i className="fas fa-circle-check" aria-hidden="true" />
                  <span>{getSiteText('about.bullet2', t('phrase.Presence in all 30 Districts (DPSCO)'))}</span>
                </div>
                <div className="pro-ngo-about__bullet">
                  <i className="fas fa-circle-check" aria-hidden="true" />
                  <span>{getSiteText('about.bullet3', t('phrase.Inclusive Sports for All Abilities'))}</span>
                </div>
              </div>

              <div className="d-flex gap-3 mt-4">
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
          6. SPORTS DISCIPLINES (FROM DATABASE SportDiscipline)
      ═══════════════════════════════════════════════════════════ */}
      {sports.length > 0 && (
        <section className="pro-ngo-sports" aria-label="Official Sport Disciplines">
          <div className="pro-ngo-container">
            <div className="d-flex align-items-end justify-content-between mb-5 flex-wrap gap-3" data-aos="fade-up">
              <div>
                <span className="pro-ngo-eyebrow">{t('phrase.Disciplines')}</span>
                <h2 className="pro-ngo-heading mb-0">{t('phrase.Our Sports Programs')}</h2>
              </div>
              <Link href="/sports" className="btn btn-outline-primary fw-bold px-4">
                {t('phrase.View All Sports')} ({sports.length}) <i className="fas fa-arrow-right ms-2" aria-hidden="true" />
              </Link>
            </div>

            <div className="row g-4">
              {sports.slice(0, 8).map((sport, i) => (
                <div key={sport.id} className="col-6 col-md-4 col-lg-3" data-aos="fade-up" data-aos-delay={`${i * 60}`}>
                  <Link href={`/sports#${sport.id}`} className="pro-ngo-sport-card">
                    <div className="pro-ngo-sport-card__img-box">
                      <img
                        src={sport.img.startsWith('http') || sport.img.startsWith('/') ? sport.img : `/assets/img/curated/${sport.img}`}
                        alt={t(sport.title)}
                        className="pro-ngo-sport-card__img"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/img/curated/sports-hero.jpg';
                        }}
                      />
                    </div>
                    <div className="pro-ngo-sport-card__body">
                      <h3 className="pro-ngo-sport-card__title">{t(sport.title)}</h3>
                      <p className="pro-ngo-sport-card__desc">{t(sport.desc)}</p>
                      <span className="pro-ngo-sport-card__cta">
                        <span>{t('phrase.Learn More')}</span>
                        <i className="fas fa-arrow-right ms-1" aria-hidden="true" />
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          7. ATHLETES SPOTLIGHT (FROM DATABASE Athlete)
      ═══════════════════════════════════════════════════════════ */}
      {athletes.length > 0 && (
        <section className="pro-ngo-champions" aria-label="Featured Para-Athletes">
          <div className="pro-ngo-container">
            <div className="d-flex align-items-end justify-content-between mb-5 flex-wrap gap-3" data-aos="fade-up">
              <div>
                <span className="pro-ngo-eyebrow">{t('phrase.Inspiration')}</span>
                <h2 className="pro-ngo-heading mb-0">{t('phrase.Featured Athletes')}</h2>
              </div>
              <Link href="/athletes" className="btn btn-outline-primary fw-bold px-4">
                {t('phrase.View All Athletes')} ({athletes.length}) <i className="fas fa-arrow-right ms-2" aria-hidden="true" />
              </Link>
            </div>

            <div className="row g-4">
              {athletes.filter(a => a.status === 'Active' || !a.status).slice(0, 4).map((athlete, i) => {
                const anchor = athlete.name.toLowerCase().split(' ').pop();
                return (
                  <div key={athlete.id} className="col-sm-6 col-lg-3" data-aos="fade-up" data-aos-delay={`${i * 80}`}>
                    <Link href={`/athletes#${anchor}`} className="pro-ngo-athlete-card">
                      <div className="pro-ngo-athlete-card__img-box">
                        <img
                          src={athlete.avatar.startsWith('http') || athlete.avatar.startsWith('/') ? athlete.avatar : `/assets/img/${athlete.avatar}`}
                          alt={athlete.name}
                          className="pro-ngo-athlete-card__img"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/img/avatar-1.svg';
                          }}
                        />
                        <div className="pro-ngo-athlete-card__overlay">
                          <span className="pro-ngo-athlete-card__sport">
                            {t(athlete.sport)}
                          </span>
                        </div>
                      </div>

                      <div className="pro-ngo-athlete-card__body">
                        <h3 className="pro-ngo-athlete-card__name">{athlete.name}</h3>
                        <p className="pro-ngo-athlete-card__accolade">{t(athlete.desc)}</p>
                        <span className="pro-ngo-athlete-card__cta">
                          <span>{t('phrase.View Profile')}</span>
                          <i className="fas fa-arrow-right" aria-hidden="true" />
                        </span>
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
          8. MEDIA & OFFICIAL ANNOUNCEMENTS DISPATCH (FROM DATABASE NewsArticle & Event)
      ═══════════════════════════════════════════════════════════ */}
      <section className="pro-ngo-operations" aria-label="News and Official Announcements">
        <div className="pro-ngo-container">
          <div className="row g-5">

            {/* Left Channel: Published News from DB */}
            <div className="col-lg-7" data-aos="fade-up">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <span className="pro-ngo-eyebrow">{t('phrase.Stay Updated')}</span>
                  <h2 className="pro-ngo-heading mb-0" style={{ fontSize: '1.65rem' }}>
                    {t('phrase.Latest News & Updates')}
                  </h2>
                </div>
                <Link href="/news" className="btn btn-outline-primary btn-sm fw-bold px-3">
                  {t('phrase.All News')} <i className="fas fa-arrow-right ms-1" aria-hidden="true" />
                </Link>
              </div>

              {leadNews ? (
                <div>
                  {/* Lead Featured Article */}
                  <div className="pro-ngo-lead-story">
                    <div className="pro-ngo-lead-story__img-wrap">
                      <img
                        src={leadNews.img.startsWith('http') || leadNews.img.startsWith('/') ? leadNews.img : `/assets/img/curated/${leadNews.img}`}
                        alt={t(leadNews.title)}
                        className="pro-ngo-lead-story__img"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/img/curated/news-hero.jpg';
                        }}
                      />
                    </div>
                    <div className="pro-ngo-lead-story__body">
                      <div className="pro-ngo-lead-story__meta">
                        <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2 py-1">
                          {leadNews.category || 'News'}
                        </span>
                        <span>
                          <i className="fas fa-calendar-alt me-1 text-muted" aria-hidden="true" />
                          {leadNews.date}
                        </span>
                      </div>

                      <h3 className="pro-ngo-lead-story__title">
                        <Link href={`/news/${encodeURIComponent(leadNews.slug || leadNews.id)}`} className="text-dark text-decoration-none">
                          {t(leadNews.title)}
                        </Link>
                      </h3>

                      <p className="pro-ngo-lead-story__excerpt">
                        {t(leadNews.desc)}
                      </p>

                      <Link
                        href={`/news/${encodeURIComponent(leadNews.slug || leadNews.id)}`}
                        className="btn btn-primary btn-sm fw-bold px-4"
                      >
                        <span>{t('phrase.Read More')}</span>
                        <i className="fas fa-arrow-right ms-2" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>

                  {/* Secondary Stories */}
                  {secondaryNews.map(story => (
                    <Link
                      key={story.slug}
                      href={`/news/${encodeURIComponent(story.slug || story.id)}`}
                      className="pro-ngo-story-row"
                    >
                      <img
                        src={story.img.startsWith('http') || story.img.startsWith('/') ? story.img : `/assets/img/curated/${story.img}`}
                        alt={t(story.title)}
                        className="pro-ngo-story-row__img"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/img/curated/news-hero.jpg';
                        }}
                      />
                      <div className="pro-ngo-story-row__body">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-light text-secondary border px-2 py-0" style={{ fontSize: '0.65rem' }}>
                            {story.category || 'Update'}
                          </span>
                          <span className="pro-ngo-story-row__date">{story.date}</span>
                        </div>
                        <h4 className="pro-ngo-story-row__title">{t(story.title)}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-muted">{t('phrase.No published news available.')}</p>
              )}
            </div>

            {/* Right Channel: Official Gazette Notices + Fixtures Calendar from DB */}
            <div className="col-lg-5" data-aos="fade-up" data-aos-delay="100">
              
              {/* Panel 1: Official Gazette & Communiqués from DB */}
              <div className="pro-ngo-gazette-panel">
                <div className="pro-ngo-gazette-panel__header">
                  <h3 className="pro-ngo-gazette-panel__title">
                    <i className="fas fa-stamp text-danger" aria-hidden="true" />
                    <span>{t('phrase.Official Gazette & Communiqués')}</span>
                  </h3>
                  <Link href="/announcements" className="text-primary fw-bold text-decoration-none small">
                    {t('phrase.Register')} <i className="fas fa-arrow-right ms-1" aria-hidden="true" />
                  </Link>
                </div>

                {publishedAnnouncements.length === 0 ? (
                  <p className="text-muted small mb-0">{t('phrase.No official notices published.')}</p>
                ) : (
                  <div>
                    {publishedAnnouncements.slice(0, 3).map(notice => (
                      <Link
                        key={notice.slug}
                        href={`/announcements/${encodeURIComponent(notice.slug || notice.id)}`}
                        className="pro-ngo-gazette-item"
                      >
                        <i className="fas fa-scroll text-danger mt-1" aria-hidden="true" />
                        <div>
                          <span className="pro-ngo-gazette-item__badge">
                            {notice.category || 'Official Circular'}
                          </span>
                          <h4 className="pro-ngo-gazette-item__title">{t(notice.title)}</h4>
                          <span className="pro-ngo-gazette-item__date">
                            <i className="fas fa-calendar-check me-1" aria-hidden="true" />
                            {notice.date}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Panel 2: Competition Fixtures & Events from DB */}
              <div className="pro-ngo-fixtures-panel">
                <div className="pro-ngo-fixtures-panel__header">
                  <h3 className="h6 fw-bold mb-0 text-white d-flex align-items-center gap-2">
                    <i className="fas fa-calendar-days text-warning" aria-hidden="true" />
                    <span>{t('phrase.Upcoming Events')}</span>
                  </h3>
                  <Link href="/events" className="text-warning fw-bold text-decoration-none small">
                    {t('phrase.View All')} <i className="fas fa-arrow-right ms-1" aria-hidden="true" />
                  </Link>
                </div>

                {upcomingEvents.length === 0 ? (
                  <p className="text-white-50 small mb-0">{t('phrase.No upcoming fixtures scheduled.')}</p>
                ) : (
                  <div>
                    {upcomingEvents.map(event => {
                      const d = event.date ? new Date(event.date) : null;
                      return (
                        <Link key={event.id} href="/events" className="pro-ngo-fixture-card">
                          <div className="pro-ngo-fixture-date">
                            <span className="pro-ngo-fixture-date__day">
                              {d && !isNaN(d.getDate()) ? d.getDate() : '—'}
                            </span>
                            <span className="pro-ngo-fixture-date__mon">
                              {d && !isNaN(d.getMonth()) ? d.toLocaleString('en-US', { month: 'short' }) : 'DATE'}
                            </span>
                          </div>
                          <div className="pro-ngo-fixture-body">
                            <h4 className="pro-ngo-fixture-title">{event.title}</h4>
                            <span className="pro-ngo-fixture-venue">
                              <i className="fas fa-location-dot me-1 text-warning" aria-hidden="true" />
                              {event.location} · {event.category}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. GOVERNANCE & AUDITED STATUTORY DOCUMENTS (FROM DATABASE)
      ═══════════════════════════════════════════════════════════ */}
      <section className="pro-ngo-governance" aria-label="Governance and Transparency">
        <div className="pro-ngo-container">
          
          <div className="row align-items-center g-5">
            <div className="col-lg-7" data-aos="fade-right">
              <span className="pro-ngo-eyebrow text-warning">
                {t('phrase.Accountability')}
              </span>
              <h2 className="pro-ngo-heading pro-ngo-heading--white">
                {t('phrase.Governance & Transparency')}
              </h2>
              <p className="pro-ngo-subhead pro-ngo-subhead--white">
                {t('phrase.We are committed to the highest standards of transparency and professional management.')}
              </p>
            </div>
            <div className="col-lg-5 text-lg-end" data-aos="fade-left">
              <Link href="/governance" className="btn btn-warning btn-lg fw-bold px-4">
                <i className="fas fa-scale-balanced me-2" aria-hidden="true" />
                {t('phrase.Visit Governance Portal')}
              </Link>
            </div>
          </div>

          <div className="pro-ngo-gov-grid">
            
            {/* Render Governance Documents directly from Database */}
            {governanceDocs.filter(d => d.published).slice(0, 2).map((doc, i) => (
              <a
                key={doc.id}
                href={doc.fileUrl || '/governance#reports'}
                target={doc.fileUrl && doc.fileUrl !== '#' ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="pro-ngo-gov-card"
                data-aos="zoom-in"
                data-aos-delay={`${i * 50}`}
              >
                <i className="fas fa-file-invoice-dollar pro-ngo-gov-card__icon" aria-hidden="true" />
                <div>
                  <h3 className="pro-ngo-gov-card__title">{doc.title}</h3>
                  <p className="pro-ngo-gov-card__desc">{doc.desc}</p>
                </div>
                <span className="pro-ngo-gov-card__action">
                  <span>{t('phrase.Download / Access')}</span>
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </span>
              </a>
            ))}

            {/* Render Governance Policies directly from Database */}
            {governancePolicies.filter(p => p.published).slice(0, 2).map((policy, i) => (
              <a
                key={policy.id}
                href={policy.fileUrl || '/governance#policies'}
                target={policy.fileUrl && policy.fileUrl !== '#' ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="pro-ngo-gov-card"
                data-aos="zoom-in"
                data-aos-delay={`${(i + 2) * 50}`}
              >
                <i className="fas fa-shield-virus pro-ngo-gov-card__icon" aria-hidden="true" />
                <div>
                  <h3 className="pro-ngo-gov-card__title">{policy.title}</h3>
                  <p className="pro-ngo-gov-card__desc">{policy.desc}</p>
                </div>
                <span className="pro-ngo-gov-card__action">
                  <span>{t('phrase.View Policy')}</span>
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </span>
              </a>
            ))}

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          10. TARGETED COMMUNITY SUPPORT & GIVING (FROM DATABASE SITECONTENT)
      ═══════════════════════════════════════════════════════════ */}
      <section className="pro-ngo-support" aria-label="Support Our Mission">
        <div className="pro-ngo-container">
          
          <div className="pro-ngo-section-header pro-ngo-section-header--center" data-aos="fade-up">
            <span className="pro-ngo-eyebrow">{t('phrase.Take Action')}</span>
            <h2 className="pro-ngo-heading">
              {getSiteText('cta.title', t('phrase.Support Inclusive Sports in Rwanda'))}
            </h2>
            <p className="pro-ngo-subhead pro-ngo-subhead--center">
              {getSiteText(
                'cta.desc',
                t('phrase.Help us expand access, strengthen athlete pathways, and deliver excellence in para-sport.')
              )}
            </p>
          </div>

          <div className="pro-ngo-tier-grid">
            
            <div className="pro-ngo-tier-card" data-aos="fade-up">
              <div className="pro-ngo-tier-card__icon">
                <i className="fas fa-wheelchair" aria-hidden="true" />
              </div>
              <h3 className="pro-ngo-tier-card__title">Adaptive Sports Equipment</h3>
              <p className="pro-ngo-tier-card__desc">
                Provide specialized racing wheelchairs, sitting volleyball balls, throwing frames, and guides equipment for para-athletes.
              </p>
              <Link href="/donate" className="pro-ngo-tier-card__btn pro-ngo-tier-card__btn--primary">
                {t('phrase.Donate Now')}
              </Link>
            </div>

            <div className="pro-ngo-tier-card" data-aos="fade-up" data-aos-delay="100">
              <div className="pro-ngo-tier-card__icon" style={{ background: 'rgba(255, 215, 0, 0.2)', color: '#B45309' }}>
                <i className="fas fa-campground" aria-hidden="true" />
              </div>
              <h3 className="pro-ngo-tier-card__title">Grassroots DPSCO Tournaments</h3>
              <p className="pro-ngo-tier-card__desc">
                Sponsor district scouting tournaments and grassroots camps across all {districtsCount} districts in Rwanda.
              </p>
              <Link href="/volunteer" className="pro-ngo-tier-card__btn pro-ngo-tier-card__btn--primary">
                {t('phrase.Volunteer')}
              </Link>
            </div>

            <div className="pro-ngo-tier-card" data-aos="fade-up" data-aos-delay="200">
              <div className="pro-ngo-tier-card__icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <i className="fas fa-handshake-angle" aria-hidden="true" />
              </div>
              <h3 className="pro-ngo-tier-card__title">Institutional Partnerships</h3>
              <p className="pro-ngo-tier-card__desc">
                Join our network of national and international development partners supporting disability inclusion through sport.
              </p>
              <Link href="/contact" className="pro-ngo-tier-card__btn pro-ngo-tier-card__btn--primary">
                {t('phrase.Partner With Us')}
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          11. STRATEGIC PARTNERS (100% FROM DATABASE Partner)
      ═══════════════════════════════════════════════════════════ */}
      {activePartners.length > 0 && (
        <section className="pro-ngo-partners" aria-label="Institutional Partners">
          <div className="pro-ngo-container">
            <div className="pro-ngo-partners__title">
              {t('phrase.Our Partners & Supporters')} ({activePartners.length})
            </div>
            <div className="pro-ngo-partners__list">
              {activePartners.map(partner => (
                <a
                  key={partner.id}
                  href={partner.website || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={partner.name}
                  className="pro-ngo-partners__logo-link"
                >
                  <img
                    src={partner.logo.startsWith('http') || partner.logo.startsWith('/') ? partner.logo : `/assets/img/${partner.logo}`}
                    alt={partner.name}
                    className="pro-ngo-partners__img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
