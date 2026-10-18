'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '../context/LanguageContext';
import { useData } from '../context/DataContext';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { contactInfo, socialLinks, siteContent, systemSettings } = useData();

  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMsg, setSubscribeMsg] = useState<{ text: string; success: boolean } | null>(null);
  const [logoError, setLogoError] = useState(false);

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
  const resolvedLogo = logoError ? '/assets/img/logo.png' : (siteLogo || '/assets/img/logo.png');
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
              <Image
                src={resolvedLogo}
                alt={`${siteName} Logo`}
                width={50}
                height={50}
                className="me-2"
                style={{ height: '50px', width: 'auto', objectFit: 'contain' }}
                onError={() => setLogoError(true)}
                unoptimized={resolvedLogo.startsWith('data:')}
              />
              <h5 className="mb-0">{siteName}</h5>
            </div>
            <p className="small">
              {footerDesc}
            </p>
            {/* Social media icons dynamically loaded */}
            {configuredSocialLinks.length > 0 && (
              <div className="footer-socials d-flex flex-wrap gap-2 mt-3" aria-label="NPC Rwanda social media">
                {configuredSocialLinks.map(s => (
                  <a
                    key={s.id}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social-link"
                    title={s.platform}
                    aria-label={s.platform}
                  >
                    <i className={`fab ${s.icon} fa-lg`} aria-hidden="true"></i>
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
                <Link className="footer-link" href="/">
                  {t('nav.home')}
                </Link>
              </li>
              <li className="mb-2">
                <Link className="footer-link" href="/about">
                  {t('footer.about_npc')}
                </Link>
              </li>
              <li className="mb-2">
                <Link className="footer-link" href="/sports">
                  {t('footer.sports_programs')}
                </Link>
              </li>
              <li className="mb-2">
                <Link className="footer-link" href="/athletes">
                  {t('footer.our_athletes')}
                </Link>
              </li>
              <li className="mb-2">
                <Link className="footer-link" href="/news">
                  {t('nav.news_events')}
                </Link>
              </li>
              <li className="mb-2">
                <Link className="footer-link" href="/careers">
                  {t('nav.careers')}
                </Link>
              </li>
              <li className="mb-2">
                <Link className="footer-link" href="/contact">
                  {t('nav.contact') || 'Contact Us'}
                </Link>
              </li>
              <li className="mb-2">
                <Link className="footer-link" href="/donate">
                  {t('common.donate') || 'Support & Donate'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Governance */}
          <div className="col-6 col-lg-2">
            <h5>{t('nav.governance')}</h5>
            <ul className="list-unstyled small">
              <li className="mb-2">
                <Link className="footer-link" href="/governance#board">
                  {t('system.board_members')}
                </Link>
              </li>
              <li className="mb-2">
                <Link className="footer-link" href="/leaders">
                  {t('phrase.Our Leadership') || 'Our Leadership'}
                </Link>
              </li>
              <li className="mb-2">
                <Link className="footer-link" href="/governance#reports">
                  {t('footer.annual_reports')}
                </Link>
              </li>
              <li className="mb-2">
                <Link className="footer-link" href="/governance#policies">
                  {t('footer.policies')}
                </Link>
              </li>
              <li className="mb-2">
                <Link className="footer-link" href="/governance#strategic-plan">
                  {t('footer.strategic_plan')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div className="col-lg-4">
            <h5>{t('footer.contact_info')}</h5>
            <ul className="list-unstyled small">
              {address && (
                <li className="footer-contact-item mb-3">
                  <i className="fas fa-location-dot me-3 text-accent-yellow" aria-hidden="true"></i>
                  <span>{address}</span>
                </li>
              )}
              {phone && (
                <li className="footer-contact-item mb-3">
                  <i className="fas fa-phone me-3 text-accent-yellow" aria-hidden="true"></i>
                  <a href={`tel:${phone}`} className="footer-link">{phone}</a>
                </li>
              )}
              {email && (
                <li className="footer-contact-item mb-3">
                  <i className="fas fa-envelope me-3 text-accent-yellow" aria-hidden="true"></i>
                  <a href={`mailto:${email}`} className="footer-link">{email}</a>
                </li>
              )}
            </ul>
            <a
              className="footer-webmail-btn mt-2"
              href="https://webmail.npcrwanda.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fas fa-envelope-open-text" aria-hidden="true"></i>
              <span>Webmail Login</span>
              <i className="fas fa-arrow-up-right-from-square footer-webmail-external" aria-hidden="true"></i>
            </a>
            <p className="footer-webmail-note small mt-2 mb-0">
              Access your official NPC Rwanda email account.
            </p>
        </div>

        {/* Newsletter Subscription Row */}
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
