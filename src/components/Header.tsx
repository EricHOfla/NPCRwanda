'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from '../context/LanguageContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { lang, setLang, t } = useTranslation();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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
      {/* Topbar */}
      <div className="topbar">
        <div className="container d-flex flex-wrap justify-content-between align-items-center gap-2">
          <div className="d-flex flex-wrap align-items-center gap-3">
            <a href="mailto:info@npcrwanda.org" className="topbar-link">
              <i className="fas fa-envelope me-1" aria-hidden="true"></i> info@npcrwanda.org
            </a>
            <a href="tel:+250788400887" className="topbar-link">
              <i className="fas fa-phone me-1" aria-hidden="true"></i> +250 788 400 887
            </a>
          </div>
          <div className="d-flex flex-wrap align-items-center gap-3">
            {/* Language Switcher Dropdown */}
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
                <li>
                  <button
                    className={`dropdown-item lang-btn ${lang === 'en' ? 'active' : ''}`}
                    type="button"
                    onClick={() => setLang('en')}
                  >
                    English
                  </button>
                </li>
                <li>
                  <button
                    className={`dropdown-item lang-btn ${lang === 'fr' ? 'active' : ''}`}
                    type="button"
                    onClick={() => setLang('fr')}
                  >
                    Français
                  </button>
                </li>
                <li>
                  <button
                    className={`dropdown-item lang-btn ${lang === 'rw' ? 'active' : ''}`}
                    type="button"
                    onClick={() => setLang('rw')}
                  >
                    Kinyarwanda
                  </button>
                </li>
              </ul>
            </div>
            <Link href="/volunteer" className="topbar-link" onClick={closeMobileMenu}>
              {t('common.volunteer')}
            </Link>
            <Link href="/donate" className="topbar-link" onClick={closeMobileMenu}>
              {t('common.donate')}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className={`navbar navbar-expand-lg navbar-light bg-white border-0${isScrolled ? ' scrolled' : ''}`} id="main-nav">
        <div className="container border-0">
          <Link href="/" className="navbar-brand d-flex align-items-center" onClick={closeMobileMenu}>
            <img
              src="/assets/img/logo.png"
              alt={t('phrase.NPC Rwanda Logo')}
              className="me-2"
              style={{ height: '60px', width: 'auto', objectFit: 'contain' }}
            />
            <div className="brand-text">
              <span className="d-block fw-bold" style={{ color: 'var(--dark-blue)', fontSize: '1.1rem', lineHeight: 1 }}>
                NPC RWANDA
              </span>
              <small className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                PARALYMPIC COMMITTEE
              </small>
            </div>
          </Link>

          <button
            className={`navbar-toggler border-0 ${!isNavOpen ? 'collapsed' : ''}`}
            type="button"
            onClick={() => setIsNavOpen(prev => !prev)}
            aria-controls="navbarNav"
            aria-expanded={isNavOpen}
            aria-label={t('phrase.Toggle navigation')}
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`} id="navbarNav" onClick={handleNavContainerClick}>
            <ul className="navbar-nav mx-auto">

              {/* Home */}
              <li className="nav-item">
                <Link href="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={closeMobileMenu}>
                  {t('nav.home')}
                </Link>
              </li>

              {/* About (dropdown) */}
              <li className="nav-item dropdown">
                <Link
                  className={`nav-link dropdown-toggle ${isActive('/about') ? 'active' : ''}`}
                  href="/about"
                  id="aboutMenu"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {t('nav.about')}
                </Link>
                <ul className="dropdown-menu" aria-labelledby="aboutMenu">
                  <li>
                    <Link href="/about#history" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-landmark me-2 text-primary opacity-75"></i>
                      {t('phrase.Our History') || 'Our History'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/about#vision-mission" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-eye me-2 text-primary opacity-75"></i>
                      {t('phrase.Our Vision') || 'Vision & Mission'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/npc-background" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-circle-info me-2 text-primary opacity-75"></i>
                      NPC Background & SWOT
                    </Link>
                  </li>
                  <li>
                    <Link href="/leaders" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-users me-2 text-primary opacity-75"></i>
                      {t('phrase.Our Leadership') || 'Our Leadership'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/about#core-values" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-heart me-2 text-primary opacity-75"></i>
                      {t('phrase.Core Values') || 'Core Values'}
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Sports */}
              <li className="nav-item">
                <Link href="/sports" className={`nav-link ${isActive('/sports') ? 'active' : ''}`} onClick={closeMobileMenu}>
                  {t('nav.sports')}
                </Link>
              </li>

              {/* Athletes */}
              <li className="nav-item">
                <Link href="/athletes" className={`nav-link ${isActive('/athletes') ? 'active' : ''}`} onClick={closeMobileMenu}>
                  {t('nav.athletes')}
                </Link>
              </li>

              {/* Governance (dropdown) */}
              <li className="nav-item dropdown">
                <Link
                  className={`nav-link dropdown-toggle ${isActive('/governance') || isActive('/leaders') || isActive('/system') ? 'active' : ''}`}
                  href="/governance"
                  id="governanceMenu"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {t('nav.governance')}
                </Link>
                <ul className="dropdown-menu" aria-labelledby="governanceMenu">
                  <li>
                    <Link href="/governance" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-shield-alt me-2 text-primary opacity-75"></i>
                      {t('phrase.Governance & Transparency') || 'Governance & Transparency'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/leaders" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-users me-2 text-primary opacity-75"></i>
                      {t('phrase.Our Leadership') || 'Leaders'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/system" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-sitemap me-2 text-primary opacity-75"></i>
                      {t('system.page_title') || 'System Directory'}
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Members (dropdown) */}
              <li className="nav-item dropdown">
                <Link
                  className={`nav-link dropdown-toggle ${isActive('/partners') || pathname.startsWith('/members') ? 'active' : ''}`}
                  href="#"
                  id="membersMenu"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {t('nav.members') || 'Members'}
                </Link>
                <ul className="dropdown-menu" aria-labelledby="membersMenu">
                  <li>
                    <Link href="/partners" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-handshake me-2 text-primary opacity-75"></i>
                      {t('nav.partners') || 'Partners'}
                    </Link>
                  </li>
                  <li>
                    <Link href="/members/associations" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-users me-2 text-primary opacity-75"></i>
                      NPC Associations
                    </Link>
                  </li>
                  <li>
                    <Link href="/members/federations" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-medal me-2 text-primary opacity-75"></i>
                      NPC Federations
                    </Link>
                  </li>
                  <li>
                    <Link href="/members/dpsco" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-map-marker-alt me-2 text-primary opacity-75"></i>
                      DPSCO Contacts
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Publications (dropdown) */}
              <li className="nav-item dropdown">
                <Link
                  className={`nav-link dropdown-toggle ${isActive('/announcements') || isActive('/news') || isActive('/events') || isActive('/careers') ? 'active' : ''}`}
                  href="/announcements"
                  id="publicationsMenu"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Publications
                </Link>
                <ul className="dropdown-menu" aria-labelledby="publicationsMenu">
                  <li>
                    <Link href="/announcements" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-bullhorn me-2 text-primary opacity-75"></i>
                      Announcements
                    </Link>
                  </li>
                  <li>
                    <Link href="/news" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-newspaper me-2 text-primary opacity-75"></i>
                      {t('nav.news')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/events" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-calendar-alt me-2 text-primary opacity-75"></i>
                      {t('nav.events')}
                    </Link>
                  </li>
                  <li>
                    <Link href="/resources" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-folder-open me-2 text-primary opacity-75"></i>
                      Resources & Files
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link href="/careers" className="dropdown-item" onClick={closeMobileMenu}>
                      <i className="fas fa-briefcase me-2 text-primary opacity-75"></i>
                      Careers & Positions
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Contact */}
              <li className="nav-item">
                <Link href="/contact" className={`nav-link ${isActive('/contact') ? 'active' : ''}`} onClick={closeMobileMenu}>
                  {t('nav.contact')}
                </Link>
              </li>

            </ul>

          </div>
        </div>
      </nav>
    </header>
  );
};
