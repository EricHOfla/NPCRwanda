'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslation } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { lang, setLang, t } = useTranslation();
  const { systemSettings, contactInfo, socialLinks } = useData();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const email = systemSettings.contactEmail || contactInfo?.email || '';
  const phone = systemSettings.contactPhone || contactInfo?.phone || '';
  const siteName = systemSettings.siteName || 'NPC Rwanda';
  const siteSubtitle = systemSettings.siteSubtitle || 'NATIONAL PARALYMPIC COMMITTEE';
  const siteLogo = systemSettings.siteLogo || '/assets/img/logo.png';
  const resolvedLogo = logoError ? '/assets/img/logo.png' : (siteLogo || '/assets/img/logo.png');
  const configuredSocialLinks = socialLinks
    .filter((social) => social.active && social.url)
    .map((social) => ({ ...social, url: systemSettings[social.platform] || social.url }))
    .filter((social) => Boolean(social.url));

  useEffect(() => {
    // Dynamic import of bootstrap JS on client side for dropdowns
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  // Scroll detection — adds .scrolled class for shadow/blur effect
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Automatically close mobile navbar whenever the route/pathname changes
  useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);

  const closeMobileMenu = () => {
    setIsNavOpen(false);
  };

  const handleNavContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('a, button');
    // If it's a dropdown toggle button, let it expand/collapse its sub-menu on mobile
    if (target && target.classList.contains('dropdown-toggle')) {
      return;
    }
    // Any navigating link clicked closes the navbar immediately
    if (target && (target.tagName === 'A' || target.classList.contains('dropdown-item') || target.classList.contains('nav-link') || target.classList.contains('btn'))) {
      setIsNavOpen(false);
    }
  };

  const isActive = (href: string) => {
    if (href === '/' || href === '/index.html') {
      return pathname === '/';
    }
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky-top shadow-sm w-100" style={{ zIndex: 1020 }}>
      {/* Topbar: contact, configured social accounts, and language */}
      <div className="topbar">
        <div className="container topbar-inner d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="topbar-contact d-flex flex-wrap align-items-center gap-3">
            {email && (
              <a href={`mailto:${email}`} className="topbar-link">
                <i className="fas fa-envelope me-1" aria-hidden="true"></i><span>{email}</span>
              </a>
            )}
            {phone && (
              <a href={`tel:${phone}`} className="topbar-link">
                <i className="fas fa-phone me-1" aria-hidden="true"></i><span>{phone}</span>
              </a>
            )}
          </div>
          <div className="topbar-tools d-flex align-items-center gap-3">
            {configuredSocialLinks.length > 0 && (
              <div className="topbar-socials d-flex align-items-center gap-2" aria-label="NPC Rwanda social media">
                {configuredSocialLinks.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="topbar-social-link"
                    aria-label={social.platform}
                    title={social.platform}
                  >
                    <i className={`fab ${social.icon}`} aria-hidden="true"></i>
                  </a>
                ))}
              </div>
            )}
            <div className="lang-switcher dropdown" aria-label={t('phrase.Language selector')}>
              <button
                className="btn btn-sm btn-light dropdown-toggle"
                type="button"
                id="langMenu"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <span>{lang === 'en' ? 'EN' : lang === 'fr' ? 'FR' : 'KIN'}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="langMenu">
                <li><button className={`dropdown-item lang-btn ${lang === 'en' ? 'active' : ''}`} type="button" onClick={() => setLang('en')}>English</button></li>
                <li><button className={`dropdown-item lang-btn ${lang === 'fr' ? 'active' : ''}`} type="button" onClick={() => setLang('fr')}>Français</button></li>
                <li><button className={`dropdown-item lang-btn ${lang === 'rw' ? 'active' : ''}`} type="button" onClick={() => setLang('rw')}>Kinyarwanda</button></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar — 3-column: [Logo | Nav links centered | Donate] */}
      <nav className={`navbar navbar-expand-xl navbar-light bg-white border-0${isScrolled ? ' scrolled' : ''}`} id="main-nav">
        <div className="container border-0" style={{ display: 'flex', alignItems: 'center' }}>

          {/* LEFT: Logo + Brand — fixed, does not compress center */}
          <Link
            href="/"
            className="navbar-brand d-flex align-items-center flex-shrink-0"
            onClick={closeMobileMenu}
            style={{ marginRight: '2rem' }}
          >
            <Image
              src={resolvedLogo}
              alt={`${siteName} - ${siteSubtitle}`}
              width={52}
              height={52}
              className="me-2 flex-shrink-0"
              style={{ height: '52px', width: 'auto', objectFit: 'contain' }}
              priority
              onError={() => setLogoError(true)}
              unoptimized={resolvedLogo.startsWith('data:')}
            />
            <div className="brand-text d-flex flex-column justify-content-center">
              <span className="fw-bold" style={{ color: 'var(--dark-blue)', fontSize: '1.05rem', lineHeight: 1.15 }}>
                {siteName}
              </span>
              {siteSubtitle && (
                <small className="text-muted text-uppercase mt-1" style={{ fontWeight: 600, fontSize: '0.62rem', letterSpacing: '0.04em', lineHeight: 1.2 }}>
                  {siteSubtitle}
                </small>
              )}
            </div>
          </Link>

          {/* Hamburger — mobile only, pushed to far right */}
          <button
            className={`navbar-toggler border-0 ms-auto ${!isNavOpen ? 'collapsed' : ''}`}
            type="button"
            onClick={() => setIsNavOpen(prev => !prev)}
            aria-controls="navbarNav"
            aria-expanded={isNavOpen}
            aria-label={t('phrase.Toggle navigation')}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Collapsible section: CENTER links + RIGHT donate */}
          <div
            className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`}
            id="navbarNav"
            onClick={handleNavContainerClick}
            style={{ flex: 1, minWidth: 0 }}
          >
            {/* CENTER: nav links truly centred in the remaining space */}
            <ul className="navbar-nav mx-auto" style={{ gap: '0.15rem' }}>
              <li className="nav-item">
                <Link href="/" className={`nav-link px-2${isActive('/') ? ' active' : ''}`} onClick={closeMobileMenu}>
                  {t('nav.home')}
                </Link>
              </li>

              <li className="nav-item dropdown">
                <Link className={`nav-link dropdown-toggle px-2${isActive('/about') || isActive('/npc-background') || isActive('/governance') || isActive('/leaders') ? ' active' : ''}`} href="/about" id="aboutMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Who We Are
                </Link>
                <ul className="dropdown-menu" aria-labelledby="aboutMenu">
                  <li><Link href="/about#history" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-landmark me-2" aria-hidden="true"></i>About Us</Link></li>
                  <li><Link href="/npc-background" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-book-open me-2" aria-hidden="true"></i>Background</Link></li>
                  <li><Link href="/leaders" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-users me-2" aria-hidden="true"></i>Leadership</Link></li>
                  <li><Link href="/governance" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-scale-balanced me-2" aria-hidden="true"></i>Governance</Link></li>
                </ul>
              </li>

              <li className="nav-item dropdown">
                <Link className={`nav-link dropdown-toggle px-2${isActive('/sports') || isActive('/athletes') ? ' active' : ''}`} href="/sports" id="sportsMembersMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Sports &amp; Athletes
                </Link>
                <ul className="dropdown-menu" aria-labelledby="sportsMembersMenu">
                  <li><Link href="/sports" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-medal me-2" aria-hidden="true"></i>Sports</Link></li>
                  <li><Link href="/athletes" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-person-running me-2" aria-hidden="true"></i>Athletes</Link></li>
                </ul>
              </li>

              <li className="nav-item dropdown">
                <Link className={`nav-link dropdown-toggle px-2${isActive('/partners') || isActive('/members') ? ' active' : ''}`} href="/partners" id="membersPartnersMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Members &amp; Partners
                </Link>
                <ul className="dropdown-menu" aria-labelledby="membersPartnersMenu">
                  <li><Link href="/partners" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-handshake me-2" aria-hidden="true"></i>Partners</Link></li>
                  <li><Link href="/members/associations" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-people-group me-2" aria-hidden="true"></i>NPC Associations</Link></li>
                  <li><Link href="/members/federations" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-flag me-2" aria-hidden="true"></i>NPC Federations</Link></li>
                  <li><Link href="/members/dpsco" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-address-card me-2" aria-hidden="true"></i>DPSCO Contacts</Link></li>
                </ul>
              </li>

              <li className="nav-item dropdown">
                <Link className={`nav-link dropdown-toggle px-2${isActive('/announcements') || isActive('/news') || isActive('/events') || isActive('/resources') ? ' active' : ''}`} href="/news" id="newsResourcesMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  News &amp; Resources
                </Link>
                <ul className="dropdown-menu" aria-labelledby="newsResourcesMenu">
                  <li><Link href="/news" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-newspaper me-2" aria-hidden="true"></i>News</Link></li>
                  <li><Link href="/announcements" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-bullhorn me-2" aria-hidden="true"></i>Announcements</Link></li>
                  <li><Link href="/events" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-calendar-days me-2" aria-hidden="true"></i>Events &amp; Results</Link></li>
                  <li><Link href="/resources" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-folder-open me-2" aria-hidden="true"></i>Resources</Link></li>
                </ul>
              </li>

              <li className="nav-item dropdown">
                <Link className={`nav-link dropdown-toggle px-2${isActive('/careers') || isActive('/volunteer') || isActive('/contact') ? ' active' : ''}`} href="/contact" id="getInvolvedMenu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  Get Involved
                </Link>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="getInvolvedMenu">
                  <li><Link href="/careers" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-briefcase me-2" aria-hidden="true"></i>Careers</Link></li>
                  <li><Link href="/volunteer" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-hand-holding-heart me-2" aria-hidden="true"></i>Volunteer</Link></li>
                  <li><Link href="/contact" className="dropdown-item" onClick={closeMobileMenu}><i className="fas fa-envelope me-2" aria-hidden="true"></i>Contact Us</Link></li>
                </ul>
              </li>
            </ul>

            {/* RIGHT: Donate button — desktop only */}
            <div className="header-desktop-cta d-none d-xl-flex flex-shrink-0" style={{ marginLeft: '2rem' }}>
              <Link href="/donate" className="btn btn-donate" onClick={closeMobileMenu}>
                <i className="fas fa-heart me-2" aria-hidden="true"></i>{t('common.donate') || 'Donate'}
              </Link>
            </div>

            {/* Mobile-Only Actions: keep primary actions reachable in the expanded menu */}
            <div className="header-mobile-cta d-xl-none pt-3 mt-2 border-top">
              <div className="d-grid gap-2">
                <Link
                  href="/volunteer"
                  className="btn btn-sm btn-outline-primary fw-bold py-2"
                  onClick={closeMobileMenu}
                >
                  <i className="fas fa-hand-holding-heart me-2"></i>
                  {t('common.volunteer') || 'Volunteer with NPC'}
                </Link>
                <Link
                  href="/donate"
                  className="btn btn-sm btn-donate fw-bold py-2"
                  onClick={closeMobileMenu}
                >
                  <i className="fas fa-heart me-2" aria-hidden="true"></i>
                  {t('common.donate') || 'Support & Donate'}
                </Link>
              </div>
            </div>

          </div>
        </div>
      </nav>
    </header>
  );
};
