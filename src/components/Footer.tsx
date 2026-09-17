'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { contactInfo, socialLinks, siteContent, systemSettings } = useData();

  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMsg, setSubscribeMsg] = useState<{ text: string; success: boolean } | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail) return;
    setSubscribing(true);
    setSubscribeMsg(null);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: subscribeEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubscribeMsg({ text: data.message || 'Subscribed successfully!', success: true });
        setSubscribeEmail('');
      } else {
        setSubscribeMsg({ text: data.error || 'Failed to subscribe', success: false });
      }
    } catch {
      setSubscribeMsg({ text: 'Error connecting to server. Please try again.', success: false });
    } finally {
      setSubscribing(false);
    }
  };

  const getSiteText = (key: string, fallback: string) => {
    return siteContent[key] || fallback;
  };

  const address = systemSettings.address || contactInfo?.address || '';
  const phone = systemSettings.contactPhone || contactInfo?.phone || '';
  const email = systemSettings.contactEmail || contactInfo?.email || '';
  const siteName = systemSettings.siteName || 'NPC Rwanda';
  const siteLogo = systemSettings.siteLogo || getSiteText('footer.logo', '/assets/img/logo.png');
  const configuredSocialLinks = socialLinks
    .filter(s => s.active)
    .map(s => ({ ...s, url: systemSettings[s.platform] || s.url }));
  const footerDesc = getSiteText('footer.description', '');

  return (
    <footer id="main-footer">
      <div className="container">
        <div className="row g-5">
          {/* Column 1: Logo & Description */}
          <div className="col-lg-4">
            <div className="footer-logo d-flex align-items-center mb-4">
              <img
                src={siteLogo}
                alt={`${siteName} Logo`}
                className="me-2"
                style={{ height: '50px', width: 'auto', objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).src = '/assets/img/logo.png'; }}
              />
              <h5 className="mb-0">{siteName}</h5>
            </div>
            <p className="small">
              {footerDesc}
            </p>
            {/* Social media icons dynamically loaded */}
            {configuredSocialLinks.length > 0 && (
              <div className="d-flex gap-3 mt-3">
                {configuredSocialLinks.map(s => (
                  <a 
                    key={s.id} 
                    href={s.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-white opacity-75 hover-opacity-100"
                    title={s.platform}
                  >
                    <i className={`fab ${s.icon} fa-lg`}></i>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div className="col-6 col-lg-2">
            <h5>{t('footer.quick_links')}</h5>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <Link href="/">
                  {t('nav.home')}
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/about">
                  {t('footer.about_npc')}
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/sports">
                  {t('footer.sports_programs')}
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/athletes">
                  {t('footer.our_athletes')}
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/news">
                  {t('nav.news_events')}
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/careers">
                  {t('nav.careers')}
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/system">
                  {t('footer.system_directory')}
                </Link>
              </li>
              <li className="mb-2">
                <a href="https://webmail.npcrwanda.org/" target="_blank" rel="noopener noreferrer">
                  Webmail Login
                </a>
              </li>
              <li className="mb-2">
                <Link href="/login">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Governance */}
          <div className="col-6 col-lg-2">
            <h5>{t('nav.governance')}</h5>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <Link href="/governance#board">
                  {t('system.board_members')}
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/governance#reports">
                  {t('footer.annual_reports')}
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/governance#policies">
                  {t('footer.policies')}
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/governance#strategic-plan">
                  {t('footer.strategic_plan')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="col-lg-4">
            <h5>{t('footer.contact_info')}</h5>
            <ul className="list-unstyled small">
              <li className="mb-3">
                <i className="fas fa-location-dot me-3 text-accent-yellow"></i> {address}
              </li>
              <li className="mb-3">
                <i className="fas fa-phone me-3 text-accent-yellow"></i> {phone}
              </li>
              <li className="mb-3">
                <i className="fas fa-envelope me-3 text-accent-yellow"></i> {email}
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription Row */}
        <div className="border-top border-secondary pt-4 mt-4 pb-2">
          <div className="row align-items-center g-3">
            <div className="col-lg-6">
              <h5 className="mb-1 text-white fw-bold">
                <i className="fas fa-bell me-2 text-accent-yellow"></i>Subscribe to Official Updates
              </h5>
              <p className="small text-white-50 mb-0">
                Get notified automatically when we publish new Announcements, News, Events, and Careers.
              </p>
            </div>
            <div className="col-lg-6">
              <form onSubmit={handleSubscribe} className="d-flex flex-column flex-sm-row gap-2">
                <input
                  type="email"
                  className="form-control form-control-sm"
                  placeholder="Enter your email address..."
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  disabled={subscribing}
                  required
                  style={{ borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.9)' }}
                />
                <button
                  type="submit"
                  className="btn btn-sm btn-primary px-3 text-nowrap fw-bold"
                  disabled={subscribing}
                  style={{ borderRadius: '6px' }}
                >
                  {subscribing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-1" />
                      Subscribe
                    </>
                  )}
                </button>
              </form>
              {subscribeMsg && (
                <div className={`small mt-2 ${subscribeMsg.success ? 'text-success fw-bold' : 'text-danger'}`}>
                  {subscribeMsg.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="footer-bottom justify-content-center text-center">
          <p className="mb-0 text-center w-100">
            &copy; <span id="year">{new Date().getFullYear()}</span> <span>{t('footer.rights')}</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
