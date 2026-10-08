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

  // Filter true news vs announcements
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

  return (
    <main id="main-content">

      {/* ═══════════════════════════════════════════════════════════
          1. LIVE INSTITUTIONAL BULLETIN TICKER
      ═══════════════════════════════════════════════════════════ */}
      {latestAnnouncement && (
        <aside className="pro-ngo-bulletin" aria-label="Official Announcement Bulletin">
          <div className="pro-ngo-container">
            <div className="pro-ngo-bulletin__inner">
              <div className="pro-ngo-bulletin__content">
                <span className="pro-ngo-bulletin__pulse" aria-hidden="true" />
                <span className="pro-ngo-bulletin__badge">
                  {latestAnnouncement.category || 'Official Gazette'}
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
          2. HERO SECTION — EXECUTIVE ASYMMETRIC EDITORIAL
      ═══════════════════════════════════════════════════════════ */}
      <section className="pro-ngo-hero" aria-label="Executive Institutional Introduction">
        <div className="pro-ngo-container">
          <div className="row align-items-center g-5">
            
            {/* Left Column: Institutional Authority & Mandate */}
            <div className="col-lg-7" data-aos="fade-right">
              <div className="pro-ngo-hero__trust-badge">
                <span className="badge bg-warning text-dark fw-bold px-2 py-1 rounded-pill" style={{ fontSize: '0.65rem' }}>
                  RWANDA
                </span>
                <span>{getSiteText('hero.kicker', 'NATIONAL PARALYMPIC COMMITTEE · FOUNDED 2001')}</span>
              </div>

              <h1 className="pro-ngo-hero__title">
                {getSiteText('hero.title1', 'Empowering Rwandan Para-Athletes.')}{' '}
                <span className="pro-ngo-hero__title-highlight">
                  {getSiteText('hero.title2', 'Championing National Inclusion.')}
                </span>
              </h1>

              <p className="pro-ngo-hero__lead">
                {getSiteText(
                  'hero.lead',
                  'As Rwanda\'s apex governing body for para-sport, we scout grassroots talent across all 30 districts and forge world-class Paralympic champions. Ability, dignity, and national pride come first.'
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

              {/* Verified Institutional Indicators */}
              <div className="pro-ngo-hero__kpis">
                <div className="pro-ngo-hero__kpi-card">
                  <div className="pro-ngo-hero__kpi-num">{getSiteText('stats.districts', '30')}</div>
                  <div className="pro-ngo-hero__kpi-label">{t('phrase.Districts (DPSCO)')}</div>
                </div>
                <div className="pro-ngo-hero__kpi-card">
                  <div className="pro-ngo-hero__kpi-num">{getSiteText('stats.athletes', '500+')}</div>
                  <div className="pro-ngo-hero__kpi-label">{t('phrase.Registered Athletes')}</div>
                </div>
                <div className="pro-ngo-hero__kpi-card">
                  <div className="pro-ngo-hero__kpi-num">4×</div>
                  <div className="pro-ngo-hero__kpi-label">{t('phrase.African Champions')}</div>
                </div>
                <div className="pro-ngo-hero__kpi-card">
                  <div className="pro-ngo-hero__kpi-num">{getSiteText('stats.disciplines', '12+')}</div>
                  <div className="pro-ngo-hero__kpi-label">{t('phrase.Sport Disciplines')}</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Spotlight Card (Authentic Rwanda Para-Sport) */}
            <div className="col-lg-5" data-aos="zoom-in" data-aos-delay="100">
              <div className="pro-ngo-hero__showcase-wrap">
                <div className="pro-ngo-hero__showcase">
                  <img
                    src="/assets/img/curated/news-volleyball.jpg"
                    alt="Rwanda National Para-Sports Team in Action"
                    className="pro-ngo-hero__showcase-img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/img/curated/sports-hero.jpg';
                    }}
                  />
                  <div className="pro-ngo-hero__showcase-gradient">
                    <div className="pro-ngo-hero__badge-row">
                      <span className="pro-ngo-tag pro-ngo-tag--gold">
                        <i className="fas fa-trophy" aria-hidden="true" /> 4× African Champions
                      </span>
                      <span className="pro-ngo-tag pro-ngo-tag--white">
                        Paris 2024 Paralympians
                      </span>
                    </div>

                    <h3 className="pro-ngo-hero__showcase-title">
                      Rwanda National Para-Sports Movement
                    </h3>

                    <p className="pro-ngo-hero__showcase-desc">
                      From grassroots scouting in 30 districts to continental championships and the Paralympic podium.
                    </p>

                    <Link href="/athletes" className="pro-ngo-hero__showcase-link">
                      <span>{t('phrase.Meet Our Champions')}</span>
                      <i className="fas fa-arrow-right" aria-hidden="true" />
                    </Link>
                  </div>
                </div>

                {/* Floating Verified Trust Badge */}
                <div className="pro-ngo-hero__inset-card">
                  <div className="pro-ngo-hero__inset-icon">
                    <i className="fas fa-medal" aria-hidden="true" />
                  </div>
                  <div>
                    <div className="pro-ngo-hero__inset-title">World ParaVolley &amp; IPC</div>
                    <div className="pro-ngo-hero__inset-sub">Affiliated Member Since 2001</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          3. STATUTORY ACCREDITATION & GLOBAL AFFILIATIONS
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
                <span className="pro-ngo-accreditation__sub">Full Member Since 2001</span>
              </div>
            </div>

            <div className="pro-ngo-accreditation__item">
              <div className="pro-ngo-accreditation__abbr">MINISPORTS</div>
              <div>
                <div className="pro-ngo-accreditation__name">Ministry of Sports Rwanda</div>
                <span className="pro-ngo-accreditation__sub">National Sports Federation</span>
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
                <span className="pro-ngo-accreditation__sub">Continental Member</span>
              </div>
            </div>

            <div className="pro-ngo-accreditation__item">
              <div className="pro-ngo-accreditation__abbr">NUDOR</div>
              <div>
                <div className="pro-ngo-accreditation__name">Disability Organisations Union</div>
                <span className="pro-ngo-accreditation__sub">National Civil Society Partner</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          4. STRATEGIC MISSION BENTO GRID
      ═══════════════════════════════════════════════════════════ */}
      <section className="pro-ngo-pillars" aria-label="Core Strategic Pillars">
        <div className="pro-ngo-container">
          
          <div className="pro-ngo-section-header pro-ngo-section-header--center" data-aos="fade-up">
            <span className="pro-ngo-eyebrow">{t('phrase.Our Mandate & Strategy')}</span>
            <h2 className="pro-ngo-heading">
              {getSiteText('pillars.title', 'Four Pillars of Inclusive Impact')}
            </h2>
            <p className="pro-ngo-subhead pro-ngo-subhead--center">
              {getSiteText(
                'pillars.desc',
                'We operate an end-to-end framework: from grassroots identification in rural sectors to medal podiums at the Paralympic Games.'
              )}
            </p>
          </div>

          <div className="pro-ngo-bento">

            {/* Pillar 1: High Performance (Wide, Featured) */}
            <div className="pro-ngo-bento-card pro-ngo-bento-card--featured" style={{ gridColumn: 'span 7' }} data-aos="fade-up">
              <div>
                <div className="pro-ngo-bento-card__icon-box" style={{ background: 'rgba(255, 215, 0, 0.15)', color: '#FFD700' }}>
                  <i className="fas fa-trophy" aria-hidden="true" />
                </div>
                <span className="pro-ngo-tag pro-ngo-tag--gold mb-3">
                  Continental & Global Podiums
                </span>
                <h3 className="pro-ngo-bento-card__title">
                  {getSiteText('pillar1.title', 'Elite Pathway & High Performance')}
                </h3>
                <p className="pro-ngo-bento-card__desc">
                  Providing national team squads with world-class coaching, scientific conditioning, international training tours, and competitive exposure. Preparing athletes for the African Para Games and the Paralympic Games.
                </p>
              </div>
              <div className="pro-ngo-bento-card__footer">
                <span className="pro-ngo-bento-card__metric">
                  <i className="fas fa-check-circle" aria-hidden="true" /> 12+ Official Para-Sports Sanctioned
                </span>
                <Link href="/sports" className="pro-ngo-bento-card__link">
                  <span>{t('phrase.View Sports Programs')}</span>
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Pillar 2: Grassroots Scouting DPSCO */}
            <div className="pro-ngo-bento-card" style={{ gridColumn: 'span 5' }} data-aos="fade-up" data-aos-delay="100">
              <div>
                <div className="pro-ngo-bento-card__icon-box" style={{ background: 'rgba(0, 114, 198, 0.1)', color: '#0072C6' }}>
                  <i className="fas fa-map-location-dot" aria-hidden="true" />
                </div>
                <span className="pro-ngo-tag pro-ngo-tag--blue mb-3">
                  All 30 Districts (DPSCO)
                </span>
                <h3 className="pro-ngo-bento-card__title">
                  {getSiteText('pillar2.title', 'Grassroots Talent Scouting')}
                </h3>
                <p className="pro-ngo-bento-card__desc">
                  Active District Paralympic Sports Committees (DPSCO) discovering and nurturing raw athletic potential in schools and community centers across every sector of Rwanda.
                </p>
              </div>
              <div className="pro-ngo-bento-card__footer">
                <span className="pro-ngo-bento-card__metric">
                  <i className="fas fa-shield-halved" aria-hidden="true" /> 100% District Coverage
                </span>
                <Link href="/members/dpsco" className="pro-ngo-bento-card__link">
                  <span>{t('phrase.Explore DPSCO')}</span>
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Pillar 3: Medical Classification & Welfare */}
            <div className="pro-ngo-bento-card" style={{ gridColumn: 'span 6' }} data-aos="fade-up" data-aos-delay="150">
              <div>
                <div className="pro-ngo-bento-card__icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                  <i className="fas fa-heart-pulse" aria-hidden="true" />
                </div>
                <span className="pro-ngo-tag pro-ngo-tag--blue mb-3">
                  IPC Certified Fair Play
                </span>
                <h3 className="pro-ngo-bento-card__title">
                  {getSiteText('pillar3.title', 'Functional Classification & Welfare')}
                </h3>
                <p className="pro-ngo-bento-card__desc">
                  Ensuring fair competition through international functional classification panels, athlete safeguarding protocols, mental health services, and anti-doping education.
                </p>
              </div>
              <div className="pro-ngo-bento-card__footer">
                <span className="pro-ngo-bento-card__metric">
                  <i className="fas fa-certificate" aria-hidden="true" /> IPC Code of Ethics
                </span>
                <Link href="/about" className="pro-ngo-bento-card__link">
                  <span>{t('phrase.Learn More')}</span>
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </div>

            {/* Pillar 4: Gender Equality & Advocacy */}
            <div className="pro-ngo-bento-card" style={{ gridColumn: 'span 6' }} data-aos="fade-up" data-aos-delay="200">
              <div>
                <div className="pro-ngo-bento-card__icon-box" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>
                  <i className="fas fa-venus-mars" aria-hidden="true" />
                </div>
                <span className="pro-ngo-tag pro-ngo-tag--blue mb-3">
                  Inclusion & Dignity
                </span>
                <h3 className="pro-ngo-bento-card__title">
                  {getSiteText('pillar4.title', 'Gender Equity & Community Advocacy')}
                </h3>
                <p className="pro-ngo-bento-card__desc">
                  Challenging stigma and cultural misconceptions around disability. Championing equal leadership, female coach development, and inclusive participation across Rwandan society.
                </p>
              </div>
              <div className="pro-ngo-bento-card__footer">
                <span className="pro-ngo-bento-card__metric">
                  <i className="fas fa-users" aria-hidden="true" /> Over 40% Female Athletes
                </span>
                <Link href="/about" className="pro-ngo-bento-card__link">
                  <span>{t('phrase.Read Full Mission')}</span>
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          5. OPERATIONS & MEDIA CENTER (NEWS + GAZETTE + FIXTURES)
      ═══════════════════════════════════════════════════════════ */}
      <section className="pro-ngo-operations" aria-label="News and Official Announcements">
        <div className="pro-ngo-container">
          
          <div className="row g-5">

            {/* Left Channel: Field Dispatches & News Feed */}
            <div className="col-lg-7" data-aos="fade-up">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div>
                  <span className="pro-ngo-eyebrow">{t('phrase.Field Reports & Press')}</span>
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
                        <span className="text-muted">
                          <i className="fas fa-building-columns me-1" aria-hidden="true" />
                          NPC Communications
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
                        <span>{t('phrase.Read Full Story')}</span>
                        <i className="fas fa-arrow-right ms-2" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>

                  {/* Secondary News Stories */}
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

            {/* Right Channel: Official Gazette & Fixtures Calendar */}
            <div className="col-lg-5" data-aos="fade-up" data-aos-delay="100">
              
              {/* Panel 1: Official Gazette & Communiqués */}
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

              {/* Panel 2: Competition Fixtures & Calendar */}
              <div className="pro-ngo-fixtures-panel">
                <div className="pro-ngo-fixtures-panel__header">
                  <h3 className="h6 fw-bold mb-0 text-white d-flex align-items-center gap-2">
                    <i className="fas fa-calendar-days text-warning" aria-hidden="true" />
                    <span>{t('phrase.Upcoming Competitions')}</span>
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
                              {d ? d.getDate() : '—'}
                            </span>
                            <span className="pro-ngo-fixture-date__mon">
                              {d ? d.toLocaleString('en-US', { month: 'short' }) : 'DATE'}
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
          6. HALL OF CHAMPIONS (ATHLETES SPOTLIGHT)
      ═══════════════════════════════════════════════════════════ */}
      {athletes.length > 0 && (
        <section className="pro-ngo-champions" aria-label="Featured Para-Athletes">
          <div className="pro-ngo-container">
            
            <div className="d-flex align-items-end justify-content-between mb-5 flex-wrap gap-3" data-aos="fade-up">
              <div>
                <span className="pro-ngo-eyebrow">{t('phrase.National Pride & Inspiration')}</span>
                <h2 className="pro-ngo-heading mb-0">
                  {t('phrase.The Hall of Champions')}
                </h2>
              </div>
              <Link href="/athletes" className="btn btn-outline-primary fw-bold px-4">
                {t('phrase.View All Athletes')} <i className="fas fa-arrow-right ms-2" aria-hidden="true" />
              </Link>
            </div>

            <div className="row g-4">
              {athletes.slice(0, 4).map((athlete, i) => {
                const anchor = athlete.name.toLowerCase().split(' ').pop();
                return (
                  <div key={athlete.id} className="col-sm-6 col-lg-3" data-aos="fade-up" data-aos-delay={`${i * 80}`}>
                    <Link href={`/athletes#${anchor}`} className="pro-ngo-athlete-card">
                      <div className="pro-ngo-athlete-card__img-box">
                        <img
                          src={athlete.avatar.startsWith('http') || athlete.avatar.startsWith('/') ? athlete.avatar : `/assets/img/${athlete.avatar}`}
                          alt={athlete.name}
                          className="pro-ngo-athlete-card__img"
                          onError={e => { (e.target as HTMLImageElement).src = '/assets/img/avatar-1.svg'; }}
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
                          <span>{t('phrase.Biography & Records')}</span>
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
          7. FIDUCIARY INTEGRITY & OPEN GOVERNANCE
      ═══════════════════════════════════════════════════════════ */}
      <section className="pro-ngo-governance" aria-label="Governance and Transparency">
        <div className="pro-ngo-container">
          
          <div className="row align-items-center g-5">
            <div className="col-lg-6" data-aos="fade-right">
              <span className="pro-ngo-eyebrow text-warning">
                {t('phrase.Public Trust & Accountability')}
              </span>
              <h2 className="pro-ngo-heading pro-ngo-heading--white">
                {t('phrase.Open Governance & Statutory Integrity')}
              </h2>
              <p className="pro-ngo-subhead pro-ngo-subhead--white">
                {t('phrase.As an accredited non-governmental sports entity, NPC Rwanda adheres to strict public financial audits, democratic elections, and the International Paralympic Committee Code of Ethics.')}
              </p>
            </div>
            <div className="col-lg-6 text-lg-end" data-aos="fade-left">
              <Link href="/governance" className="btn btn-warning btn-lg fw-bold px-4">
                <i className="fas fa-scale-balanced me-2" aria-hidden="true" />
                {t('phrase.Visit Governance Portal')}
              </Link>
            </div>
          </div>

          <div className="pro-ngo-gov-grid">
            
            <Link href="/governance#policies" className="pro-ngo-gov-card" data-aos="zoom-in" data-aos-delay="50">
              <i className="fas fa-book-bookmark pro-ngo-gov-card__icon" aria-hidden="true" />
              <div>
                <h3 className="pro-ngo-gov-card__title">{t('phrase.NPC Constitution')}</h3>
                <p className="pro-ngo-gov-card__desc">
                  Statutes and bylaws governing the National Paralympic Committee of Rwanda.
                </p>
              </div>
              <span className="pro-ngo-gov-card__action">
                <span>{t('phrase.View Legal Framework')}</span>
                <i className="fas fa-arrow-right" aria-hidden="true" />
              </span>
            </Link>

            <Link href="/governance#reports" className="pro-ngo-gov-card" data-aos="zoom-in" data-aos-delay="100">
              <i className="fas fa-file-invoice-dollar pro-ngo-gov-card__icon" aria-hidden="true" />
              <div>
                <h3 className="pro-ngo-gov-card__title">{t('phrase.Audited Reports')}</h3>
                <p className="pro-ngo-gov-card__desc">
                  Independent annual financial statements and fiscal year activity audits.
                </p>
              </div>
              <span className="pro-ngo-gov-card__action">
                <span>{t('phrase.View Annual Audits')}</span>
                <i className="fas fa-arrow-right" aria-hidden="true" />
              </span>
            </Link>

            <Link href="/governance#strategic-plan" className="pro-ngo-gov-card" data-aos="zoom-in" data-aos-delay="150">
              <i className="fas fa-compass-drafting pro-ngo-gov-card__icon" aria-hidden="true" />
              <div>
                <h3 className="pro-ngo-gov-card__title">{t('phrase.Strategic Plan')}</h3>
                <p className="pro-ngo-gov-card__desc">
                  Five-year developmental roadmap for para-sports growth across Rwanda (2024–2028).
                </p>
              </div>
              <span className="pro-ngo-gov-card__action">
                <span>{t('phrase.Read Strategy')}</span>
                <i className="fas fa-arrow-right" aria-hidden="true" />
              </span>
            </Link>

            <Link href="/resources" className="pro-ngo-gov-card" data-aos="zoom-in" data-aos-delay="200">
              <i className="fas fa-shield-virus pro-ngo-gov-card__icon" aria-hidden="true" />
              <div>
                <h3 className="pro-ngo-gov-card__title">{t('phrase.Athlete Safeguarding')}</h3>
                <p className="pro-ngo-gov-card__desc">
                  Zero tolerance protection code, medical rights, and anti-doping regulations.
                </p>
              </div>
              <span className="pro-ngo-gov-card__action">
                <span>{t('phrase.Compliance Codes')}</span>
                <i className="fas fa-arrow-right" aria-hidden="true" />
              </span>
            </Link>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          8. TARGETED COMMUNITY SUPPORT & GIVING TIERS
      ═══════════════════════════════════════════════════════════ */}
      <section className="pro-ngo-support" aria-label="Support Our Mission">
        <div className="pro-ngo-container">
          
          <div className="pro-ngo-section-header pro-ngo-section-header--center" data-aos="fade-up">
            <span className="pro-ngo-eyebrow">{t('phrase.Make a Direct Impact')}</span>
            <h2 className="pro-ngo-heading">
              {getSiteText('cta.title', 'Invest in Rwandan Para-Sports Excellence')}
            </h2>
            <p className="pro-ngo-subhead pro-ngo-subhead--center">
              {getSiteText(
                'cta.desc',
                'Your support directly funds life-changing equipment, grassroots district tournaments, and high-performance training for athletes with disabilities.'
              )}
            </p>
          </div>

          <div className="pro-ngo-tier-grid">
            
            {/* Tier 1: Para-Equipment */}
            <div className="pro-ngo-tier-card" data-aos="fade-up">
              <div className="pro-ngo-tier-card__icon">
                <i className="fas fa-wheelchair" aria-hidden="true" />
              </div>
              <h3 className="pro-ngo-tier-card__title">Adaptive Sports Equipment</h3>
              <p className="pro-ngo-tier-card__desc">
                Provide specialized racing wheelchairs, sitting volleyball regulation balls, throwing frames, and guide runners gear for aspiring athletes.
              </p>
              <Link href="/donate" className="pro-ngo-tier-card__btn pro-ngo-tier-card__btn--primary">
                {t('phrase.Fund Equipment')}
              </Link>
            </div>

            {/* Tier 2: Grassroots District Camps */}
            <div className="pro-ngo-tier-card" data-aos="fade-up" data-aos-delay="100">
              <div className="pro-ngo-tier-card__icon" style={{ background: 'rgba(255, 215, 0, 0.2)', color: '#B45309' }}>
                <i className="fas fa-campground" aria-hidden="true" />
              </div>
              <h3 className="pro-ngo-tier-card__title">Grassroots DPSCO Camps</h3>
              <p className="pro-ngo-tier-card__desc">
                Sponsor district talent scouting camps and coaching clinics in all 5 provinces, discovering children with disabilities in rural areas.
              </p>
              <Link href="/donate" className="pro-ngo-tier-card__btn pro-ngo-tier-card__btn--primary">
                {t('phrase.Sponsor a Camp')}
              </Link>
            </div>

            {/* Tier 3: Podium Preparation */}
            <div className="pro-ngo-tier-card" data-aos="fade-up" data-aos-delay="200">
              <div className="pro-ngo-tier-card__icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <i className="fas fa-plane-departure" aria-hidden="true" />
              </div>
              <h3 className="pro-ngo-tier-card__title">Podium & International Tours</h3>
              <p className="pro-ngo-tier-card__desc">
                Support national squad travel, medical classification fees, and international qualification events leading to the Paralympic Games.
              </p>
              <Link href="/contact" className="pro-ngo-tier-card__btn pro-ngo-tier-card__btn--primary">
                {t('phrase.Corporate Partnership')}
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          9. STRATEGIC PARTNERS & DONORS
      ═══════════════════════════════════════════════════════════ */}
      {partners.filter(p => p.active).length > 0 && (
        <section className="pro-ngo-partners" aria-label="Institutional Partners">
          <div className="pro-ngo-container">
            <div className="pro-ngo-partners__title">
              {t('phrase.Our Supporting Partners & Development Allies')}
            </div>
            <div className="pro-ngo-partners__list">
              {partners.filter(p => p.active).map(partner => (
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
