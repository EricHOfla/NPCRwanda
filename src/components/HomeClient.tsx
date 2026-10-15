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
    socialLinks,
  } = useData();

  // Helper to fetch database-backed site text or fallback
  const getSiteText = (key: string, fallback: string) => siteContent[key] || fallback;

  // Filter true news vs announcements directly from the database, sorted strictly by latest post first
  const publishedNews = news
    .filter(a => a.status === 'Published' && !isAnnouncementCategory(a.category || ''))
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

  const publishedAnnouncements = news
    .filter(a => a.status === 'Published' && isAnnouncementCategory(a.category || ''))
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });

  const latestAnnouncement = publishedAnnouncements[0] || null;

  // Exactly latest 2 news
  const displayNews = publishedNews.slice(0, 2);

  // Exactly latest 1 announcement
  const displayAnnouncement = publishedAnnouncements[0] || null;

  // Exactly latest 1 event (soonest upcoming or ongoing)
  const displayEvent = events
    .filter(e => e.status === 'Upcoming' || e.status === 'Ongoing')
    .sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : Infinity;
      const dateB = b.date ? new Date(b.date).getTime() : Infinity;
      return dateA - dateB;
    })[0] || null;

  // Active verified partners from database
  const activePartners = partners.filter(p => p.active);

  // Helper to parse YouTube link to embed URL ? returns null if URL is not embeddable (e.g. channel page)
  const formatYouTubeEmbed = (url: string): string | null => {
    if (!url) return null;
    if (url.includes('/embed/')) return url; // already an embed URL
    const plMatch = url.match(/[?&]list=([\w-]+)/);
    if (plMatch) return `https://www.youtube-nocookie.com/embed/videoseries?list=${plMatch[1]}`; // playlist
    const vidMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (vidMatch && vidMatch[1]) return `https://www.youtube-nocookie.com/embed/${vidMatch[1]}`; // single video
    return null; // channel URL or unknown ? not embeddable
  };

  const configuredSocials = socialLinks && socialLinks.length > 0 ? socialLinks.filter(s => s.active) : [
    { id: '1', platform: 'youtube', url: 'https://www.youtube.com/@npcrwandaofficial1716', icon: 'fa-youtube', active: true, order: 1 },
    { id: '2', platform: 'instagram', url: 'https://www.instagram.com/npc.rwanda/', icon: 'fa-instagram', active: true, order: 2 },
    { id: '3', platform: 'twitter', url: 'https://twitter.com/npcrwanda', icon: 'fa-twitter', active: true, order: 3 },
    { id: '4', platform: 'facebook', url: 'https://facebook.com/npcrwanda', icon: 'fa-facebook-f', active: true, order: 4 },
  ];

  // Dynamic counts derived directly from database records or admin siteContent
  const districtsCount = siteContent['stats.districts'] || (dpscoContacts.length > 0 ? `${dpscoContacts.length}` : '30');
  const athletesCount = siteContent['stats.athletes'] || (athletes.length > 0 ? `${athletes.length}+` : '0');
  const disciplinesCount = siteContent['stats.disciplines'] || (sports.length > 0 ? `${sports.length}` : '0');
  const clubsCount = siteContent['stats.clubs'] || (npcClubs.length > 0 ? `${npcClubs.length}+` : '0');

  return (
    <main id="main-content">

      {/* -----------------------------------------------------------
          1. LIVE INSTITUTIONAL BULLETIN TICKER (FROM DATABASE)
      ----------------------------------------------------------- */}
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

      {/* -----------------------------------------------------------
          2. HERO SECTION (100% FROM DATABASE & CMS)
      ----------------------------------------------------------- */}
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
                  <span>{t('phrase.Strategic Plan 2024-2028')}</span>
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

            {/* Right Column: Hero Visual Showcase from Database */}
            <div className="col-lg-5" data-aos="zoom-in" data-aos-delay="100">
              <div className="pro-ngo-hero__showcase-wrap h-100">
                <div 
                  className="pro-ngo-hero__showcase h-100" 
                  style={{ 
                    position: 'relative', 
                    borderRadius: '20px', 
                    overflow: 'hidden', 
                    minHeight: '480px',
                    boxShadow: '0 20px 50px rgba(10, 37, 64, 0.16)',
                    border: '4px solid #FFFFFF',
                    background: 'linear-gradient(145deg, #07192F 0%, #0F2D54 50%, #081B34 100%)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end'
                  }}
                >
                  {(() => {
                    const heroImg = siteContent['hero.image'];
                    const hasDbHeroImage = Boolean(heroImg && heroImg.trim() !== '' && !heroImg.includes('/assets/img/curated/'));
                    if (!hasDbHeroImage) return null;
                    return (
                      <img
                        src={heroImg}
                        alt={getSiteText('hero.showcaseTitle', 'National Paralympic Committee of Rwanda')}
                        className="pro-ngo-hero__showcase-img"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    );
                  })()}
                  
                  {/* High contrast gradient so words and button are always razor sharp and clearly visible */}
                  <div 
                    className="pro-ngo-hero__showcase-gradient"
                    style={{
                      position: 'relative',
                      zIndex: 3,
                      background: 'linear-gradient(to top, rgba(6, 21, 43, 0.96) 0%, rgba(6, 21, 43, 0.72) 65%, rgba(6, 21, 43, 0.15) 100%)',
                      padding: '30px 26px 26px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div className="pro-ngo-hero__badge-row">
                      <span 
                        className="badge rounded-pill text-dark fw-bold px-3 py-2 d-inline-flex align-items-center gap-1 shadow-sm"
                        style={{ background: '#FFD700', fontSize: '0.78rem', letterSpacing: '0.5px' }}
                      >
                        <i className="fas fa-trophy" aria-hidden="true" />
                        <span>{getSiteText('hero.showcaseBadge', t('phrase.Team Rwanda Spotlight'))}</span>
                      </span>
                    </div>

                    <h3 
                      className="pro-ngo-hero__showcase-title mb-0"
                      style={{ fontSize: '1.28rem', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.3 }}
                    >
                      {getSiteText('hero.showcaseTitle', t('phrase.Excellence in Motion: Leading Africa in Para-Sport'))}
                    </h3>

                    <p 
                      className="pro-ngo-hero__showcase-desc mb-2"
                      style={{ fontSize: '0.86rem', color: '#E2E8F0', lineHeight: 1.55 }}
                    >
                      {getSiteText(
                        'hero.showcaseDesc',
                        t('phrase.From grassroots talent scouting across 30 districts to continental championships and the Paralympic podium.')
                      )}
                    </p>

                    <div className="pt-1">
                      <Link
                        href="/athletes"
                        className="btn btn-warning fw-bold text-dark px-4 py-2 d-inline-flex align-items-center gap-2 shadow rounded-pill"
                        style={{ fontSize: '0.88rem', background: '#FFC107', borderColor: '#FFC107' }}
                      >
                        <span>{t('phrase.Meet Our Para-Athletes')}</span>
                        <i className="fas fa-arrow-right" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* -----------------------------------------------------------
          3. STRATEGIC MISSION PILLARS (100% FROM DATABASE SITECONTENT)
      ----------------------------------------------------------- */}
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

      {/* -----------------------------------------------------------
          5. WHO WE ARE (FROM DATABASE SITECONTENT)
      ----------------------------------------------------------- */}
      <section className="pro-ngo-about" aria-label="About NPC Rwanda Preview">
        <div className="pro-ngo-container">
          <div className="row align-items-center g-5">
            {(() => {
              const previewImg = siteContent['about.previewImage'];
              const hasAboutImg = Boolean(previewImg && previewImg.trim() !== '' && !previewImg.includes('/assets/img/curated/'));
              if (!hasAboutImg) return null;
              return (
                <div className="col-lg-6" data-aos="fade-right">
                  <img
                    src={previewImg}
                    alt={getSiteText('about.previewTitle', 'About NPC Rwanda')}
                    className="pro-ngo-about__img"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              );
            })()}
            <div className={Boolean(siteContent['about.previewImage'] && siteContent['about.previewImage'].trim() !== '' && !siteContent['about.previewImage'].includes('/assets/img/curated/')) ? 'col-lg-6' : 'col-lg-10 mx-auto'} data-aos="fade-left">
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

      {/* -----------------------------------------------------------
          6. SPORTS DISCIPLINES (FROM DATABASE SportDiscipline)
      ----------------------------------------------------------- */}
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

      {/* -----------------------------------------------------------
          7. ATHLETES SPOTLIGHT (FROM DATABASE Athlete)
      ----------------------------------------------------------- */}
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

      {/* -----------------------------------------------------------
          8. MEDIA & OFFICIAL ANNOUNCEMENTS DISPATCH (FROM DATABASE NewsArticle & Event)
      ----------------------------------------------------------- */}
      <section className="pro-ngo-operations" aria-label="News and Official Announcements">
        <div className="pro-ngo-container">
          <div className="row g-5">

            {/* Left Channel: Published News from DB (Latest 2 News) */}
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

              {displayNews.length > 0 ? (
                <div>
                  {/* Lead Featured Article (1st of 2) */}
                  {displayNews[0] && (
                    <div className="pro-ngo-lead-story">
                      <div className="pro-ngo-lead-story__img-wrap">
                        <img
                          src={displayNews[0].img.startsWith('http') || displayNews[0].img.startsWith('/') ? displayNews[0].img : `/assets/img/curated/${displayNews[0].img}`}
                          alt={t(displayNews[0].title)}
                          className="pro-ngo-lead-story__img"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/img/curated/news-hero.jpg';
                          }}
                        />
                      </div>
                      <div className="pro-ngo-lead-story__body">
                        <div className="pro-ngo-lead-story__meta">
                          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2 py-1">
                            {displayNews[0].category || 'News'}
                          </span>
                          <span>
                            <i className="fas fa-calendar-alt me-1 text-muted" aria-hidden="true" />
                            {displayNews[0].date}
                          </span>
                        </div>

                        <h3 className="pro-ngo-lead-story__title">
                          <Link href={`/news/${encodeURIComponent(displayNews[0].slug || displayNews[0].id)}`} className="text-dark text-decoration-none">
                            {t(displayNews[0].title)}
                          </Link>
                        </h3>

                        <p className="pro-ngo-lead-story__excerpt">
                          {t(displayNews[0].desc)}
                        </p>

                        <Link
                          href={`/news/${encodeURIComponent(displayNews[0].slug || displayNews[0].id)}`}
                          className="btn btn-primary btn-sm fw-bold px-4"
                        >
                          <span>{t('phrase.Read More')}</span>
                          <i className="fas fa-arrow-right ms-2" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Secondary Story (2nd of 2) */}
                  {displayNews[1] && (
                    <Link
                      href={`/news/${encodeURIComponent(displayNews[1].slug || displayNews[1].id)}`}
                      className="pro-ngo-story-row"
                    >
                      <img
                        src={displayNews[1].img.startsWith('http') || displayNews[1].img.startsWith('/') ? displayNews[1].img : `/assets/img/curated/${displayNews[1].img}`}
                        alt={t(displayNews[1].title)}
                        className="pro-ngo-story-row__img"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/assets/img/curated/news-hero.jpg';
                        }}
                      />
                      <div className="pro-ngo-story-row__body">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <span className="badge bg-light text-secondary border px-2 py-0" style={{ fontSize: '0.65rem' }}>
                            {displayNews[1].category || 'Update'}
                          </span>
                          <span className="pro-ngo-story-row__date">{displayNews[1].date}</span>
                        </div>
                        <h4 className="pro-ngo-story-row__title">{t(displayNews[1].title)}</h4>
                      </div>
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-muted">{t('phrase.No published news available.')}</p>
              )}
            </div>

            {/* Right Channel: 1 Announcement + 1 Event from DB */}
            <div className="col-lg-5" data-aos="fade-up" data-aos-delay="100">
              
              {/* Panel 1: Official Announcements (Exactly 1) */}
              <div className="pro-ngo-announcement-panel mb-4">
                <div className="pro-ngo-announcement-panel__header">
                  <h3 className="pro-ngo-announcement-panel__title">
                    <i className="fas fa-bullhorn text-danger" aria-hidden="true" />
                    <span>{t('phrase.Official Announcements')}</span>
                  </h3>
                  <Link href="/announcements" className="text-primary fw-bold text-decoration-none small">
                    {t('phrase.View More')} <i className="fas fa-arrow-right ms-1" aria-hidden="true" />
                  </Link>
                </div>

                {!displayAnnouncement ? (
                  <p className="text-muted small mb-0">{t('phrase.No official notices published.')}</p>
                ) : (
                  <div>
                    <Link
                      href={`/announcements/${encodeURIComponent(displayAnnouncement.slug || displayAnnouncement.id)}`}
                      className="pro-ngo-announcement-item"
                    >
                      <i className="fas fa-file-lines text-danger mt-1" aria-hidden="true" />
                      <div>
                        <span className="pro-ngo-announcement-item__badge">
                          {(displayAnnouncement.category || 'Official Circular').replace(/gazette/gi, 'Announcement')}
                        </span>
                        <h4 className="pro-ngo-announcement-item__title">{t(displayAnnouncement.title)}</h4>
                        <p className="small text-muted mb-2 text-truncate" style={{ maxWidth: '320px' }}>
                          {t(displayAnnouncement.desc)}
                        </p>
                        <span className="pro-ngo-announcement-item__date">
                          <i className="fas fa-calendar-check me-1" aria-hidden="true" />
                          {displayAnnouncement.date}
                        </span>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* Panel 2: Competition Fixtures & Events from DB (Exactly 1) */}
              <div className="pro-ngo-fixtures-panel">
                <div className="pro-ngo-fixtures-panel__header">
                  <h3 className="h6 fw-bold mb-0 text-white d-flex align-items-center gap-2">
                    <i className="fas fa-calendar-days text-warning" aria-hidden="true" />
                    <span>{t('phrase.Upcoming Event')}</span>
                  </h3>
                  <Link href="/events" className="text-warning fw-bold text-decoration-none small">
                    {t('phrase.View More')} <i className="fas fa-arrow-right ms-1" aria-hidden="true" />
                  </Link>
                </div>

                {!displayEvent ? (
                  <p className="text-white-50 small mb-0">{t('phrase.No upcoming fixtures scheduled.')}</p>
                ) : (
                  <div>
                    {(() => {
                      const d = displayEvent.date ? new Date(displayEvent.date) : null;
                      return (
                        <Link href="/events" className="pro-ngo-fixture-card">
                          <div className="pro-ngo-fixture-date">
                            <span className="pro-ngo-fixture-date__day">
                              {d && !isNaN(d.getDate()) ? d.getDate() : '-'}
                            </span>
                            <span className="pro-ngo-fixture-date__mon">
                              {d && !isNaN(d.getMonth()) ? d.toLocaleString('en-US', { month: 'short' }) : 'DATE'}
                            </span>
                          </div>
                          <div className="pro-ngo-fixture-body">
                            <h4 className="pro-ngo-fixture-title">{displayEvent.title}</h4>
                            <span className="pro-ngo-fixture-venue">
                              <i className="fas fa-location-dot me-1 text-warning" aria-hidden="true" />
                              {displayEvent.location} � {displayEvent.category}
                            </span>
                          </div>
                        </Link>
                      );
                    })()}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Social Media & Video Hub (YouTube, Instagram, Social Channels) */}
          <div className="pro-ngo-social-hub" data-aos="fade-up">
            <div className="row g-4 align-items-stretch">
              
              {/* YouTube Video Player & Channel */}
              {(() => {
                const youtubeChannelUrl = configuredSocials.find(s => s.platform === 'youtube')?.url || 'https://www.youtube.com/@npcrwandaofficial1716';
                const embedSrc = formatYouTubeEmbed(getSiteText('media.youtubeUrl', ''));
                const videoTitle = getSiteText('media.videoTitle', 'Rwanda Paralympic Highlights & Athlete Journeys');
                const videoDesc = getSiteText('media.videoDesc', 'Watch tournament highlights, athlete training diaries, and institutional coverage across all Rwanda para-sport disciplines.');
                return (
                  <div className="col-lg-7">
                    <div className="pro-ngo-video-card">
                      {embedSrc ? (
                        <div className="pro-ngo-video-card__embed-wrap">
                          <iframe
                            className="pro-ngo-video-card__iframe"
                            src={embedSrc}
                            title="National Paralympic Committee Rwanda Video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <a
                          href={youtubeChannelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="d-flex flex-column align-items-center justify-content-center text-decoration-none"
                          style={{ background: '#111', minHeight: '220px', borderRadius: '12px 12px 0 0', padding: '2rem', textAlign: 'center' }}
                        >
                          <i className="fab fa-youtube" style={{ fontSize: '3.5rem', color: '#FF0000', marginBottom: '0.75rem' }} aria-hidden="true" />
                          <span className="fw-bold text-white" style={{ fontSize: '1.1rem' }}>NPC Rwanda on YouTube</span>
                          <span className="text-white-50 small mt-1">@npcrwandaofficial1716</span>
                          <span className="btn btn-danger btn-sm mt-3 rounded-pill fw-bold px-4">
                            <i className="fas fa-play me-1" />Visit Channel
                          </span>
                        </a>
                      )}
                      <div className="pro-ngo-video-card__body">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="badge bg-danger text-white px-2 py-1">
                            <i className="fab fa-youtube me-1" aria-hidden="true" /> YouTube
                          </span>
                          <a
                            href={youtubeChannelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-sm btn-outline-danger fw-bold rounded-pill"
                          >
                            <span>Subscribe / Watch More</span>
                            <i className="fas fa-arrow-up-right-from-square ms-1" aria-hidden="true" />
                          </a>
                        </div>
                        <h3 className="pro-ngo-video-card__title">{videoTitle}</h3>
                        <p className="pro-ngo-video-card__desc">{videoDesc}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}
              {/* Instagram & Official Social Networks */}
              <div className="col-lg-5 d-flex flex-column gap-3">
                
                {/* Instagram Spotlight Card */}
                <div className="pro-ngo-social-card">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div className="pro-ngo-social-card__icon pro-ngo-social-card__icon--instagram">
                      <i className="fab fa-instagram" aria-hidden="true" />
                    </div>
                    <div>
                      <h4 className="fw-bold mb-0 text-dark" style={{ fontSize: '1rem' }}>Instagram @npc.rwanda</h4>
                      <small className="text-muted">Official Photo & Reel Updates</small>
                    </div>
                  </div>
                  <p className="small text-muted mb-3">
                    Follow Rwanda�s para-athletes in training, continental qualification rounds, and community events across the nation.
                  </p>
                  <a
                    href={configuredSocials.find(s => s.platform === 'instagram')?.url || 'https://www.instagram.com/npc.rwanda/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-dark fw-bold rounded-pill align-self-start"
                  >
                    <span>{t('phrase.Follow on Instagram')}</span>
                    <i className="fas fa-arrow-up-right-from-square ms-1" aria-hidden="true" />
                  </a>
                </div>

                {/* Social Channel Links */}
                <div className="pro-ngo-social-channels p-3 bg-light rounded-3 border">
                  <h4 className="fw-bold text-dark mb-2" style={{ fontSize: '0.88rem' }}>
                    <i className="fas fa-share-nodes text-primary me-2" aria-hidden="true" />
                    {t('phrase.Connect Across Channels')}
                  </h4>
                  <div className="d-flex flex-wrap gap-2">
                    {configuredSocials.map(soc => (
                      <a
                        key={soc.id || soc.platform}
                        href={soc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="pro-ngo-channel-item"
                      >
                        <i className={`fab ${soc.icon || (soc.platform === 'youtube' ? 'fa-youtube' : soc.platform === 'instagram' ? 'fa-instagram' : soc.platform === 'twitter' ? 'fa-twitter' : 'fa-facebook-f')}`} aria-hidden="true" />
                        <span className="text-capitalize">{soc.platform}</span>
                      </a>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* -----------------------------------------------------------
          9. GOVERNANCE & AUDITED STATUTORY DOCUMENTS (FROM DATABASE)
      ----------------------------------------------------------- */}
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

      {/* -----------------------------------------------------------
          10. TARGETED COMMUNITY SUPPORT & GIVING (FROM DATABASE SITECONTENT)
      ----------------------------------------------------------- */}
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

      {/* -----------------------------------------------------------
          11. STRATEGIC PARTNERS (100% FROM DATABASE Partner)
      ----------------------------------------------------------- */}
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
