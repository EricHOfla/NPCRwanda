'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

export default function ContactPage() {
  const { t } = useTranslation();
  const { addContactMessage, contactInfo, socialLinks, systemSettings } = useData();

  const address = systemSettings.address || contactInfo?.address || 'Amahoro Stadium, Remera, Kigali, Rwanda';
  const phone = systemSettings.contactPhone || contactInfo?.phone || '+250 788 672 739';
  const contactEmail = systemSettings.contactEmail || contactInfo?.email || 'info@npcrwanda.org';
  const configuredSocialLinks = socialLinks
    .filter(s => s.active)
    .map(s => ({ ...s, url: systemSettings[s.platform] || s.url }));
  const configuredMapUrl = contactInfo?.mapUrl?.trim();
  const mapSrc = configuredMapUrl && configuredMapUrl.includes('google.com/maps/embed')
    ? configuredMapUrl
    : `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [hpField, setHpField] = useState('');
  const [mountTime] = useState(() => Date.now());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;

    setLoading(true);
    try {
      await addContactMessage(
        name.trim(),
        email.trim(),
        subject.trim() || 'General Inquiry',
        message.trim(),
        { website_url: websiteUrl, hp_field: hpField, _ts: mountTime }
      );
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSubmitted(true);
      window.scrollTo({ top: 300, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert('Failed to send message. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content" style={{ background: '#F8FAFC', minHeight: '100vh' }}>
      {/* ================= PAGE HEADER ================= */}
      <header
        className="page-header"
        style={{
          borderBottom: '1px solid #E2E8F0',
          background: '#F8FAFC',
          color: '#000000',
          padding: '44px 0 52px',
        }}
      >
        <div className="container">
          <nav aria-label="breadcrumb" data-aos="fade-up">
            <ol className="breadcrumb mb-3" style={{ fontSize: '0.88rem' }}>
              <li className="breadcrumb-item">
                <Link href="/" style={{ color: '#000000', fontWeight: 600, textDecoration: 'none' }}>
                  <i className="fas fa-home me-1" />
                  {t('nav.home') || 'Home'}
                </Link>
              </li>
              <li
                className="breadcrumb-item active"
                aria-current="page"
                style={{ color: '#000000', fontWeight: 800 }}
              >
                {t('nav.contact') || 'Contact Us'}
              </li>
            </ol>
          </nav>

          <div className="text-center mx-auto" style={{ maxWidth: '960px' }}>
            <span
              className="badge rounded-pill text-uppercase fw-bold px-3 py-2 mb-3"
              data-aos="fade-up"
              style={{
                background: '#FEF3C7',
                color: '#000000',
                border: '1.5px solid #F59E0B',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <i className="fas fa-headset text-warning" />
              OFFICIAL COMMUNICATIONS & HEADQUARTERS
            </span>

            <h1
              className="fw-black mb-3"
              data-aos="fade-up"
              data-aos-delay="50"
              style={{
                color: '#000000',
                fontSize: 'clamp(2.1rem, 3.8vw, 3.1rem)',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
              }}
            >
              {t('phrase.Contact Us') || 'Contact NPC Rwanda'}
            </h1>

            <p
              data-aos="fade-up"
              data-aos-delay="100"
              style={{
                color: '#000000',
                maxWidth: '860px',
                fontSize: '1.1rem',
                lineHeight: 1.7,
                fontWeight: 500,
                margin: '0 auto',
              }}
            >
              {t('phrase.Have questions about our programs or interested in partnership? Reach us using the form or the contact details below. We respond as quickly as possible.') ||
                'Reach out to the National Paralympic Committee of Rwanda Secretariat for partnership inquiries, athlete development, event accreditations, or general support.'}
            </p>

            {/* High-Contrast Quick Contact Bar */}
            <div
              className="row g-3 mt-4 pt-2 text-start"
              data-aos="fade-up"
              data-aos-delay="150"
            >
              <div className="col-6 col-md-3">
                <div
                  className="p-3 rounded-3 h-100 text-center"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="fw-black" style={{ color: '#0B5F9F', fontSize: '1.05rem', lineHeight: 1.3 }}>
                    Amahoro Stadium
                  </div>
                  <div className="small fw-bold mt-1" style={{ color: '#000000', fontSize: '0.78rem' }}>
                    Remera, Kigali
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div
                  className="p-3 rounded-3 h-100 text-center"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="fw-black" style={{ color: '#0B5F9F', fontSize: '1.05rem', lineHeight: 1.3 }}>
                    Mon – Fri
                  </div>
                  <div className="small fw-bold mt-1" style={{ color: '#000000', fontSize: '0.78rem' }}>
                    08:00 – 17:00 CAT
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div
                  className="p-3 rounded-3 h-100 text-center"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="fw-black" style={{ color: '#0B5F9F', fontSize: '1.05rem', lineHeight: 1.3 }}>
                    24 – 48 Hours
                  </div>
                  <div className="small fw-bold mt-1" style={{ color: '#000000', fontSize: '0.78rem' }}>
                    Response Target
                  </div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div
                  className="p-3 rounded-3 h-100 text-center"
                  style={{
                    background: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="fw-black" style={{ color: '#0B5F9F', fontSize: '1.05rem', lineHeight: 1.3 }}>
                    Direct Support
                  </div>
                  <div className="small fw-bold mt-1" style={{ color: '#000000', fontSize: '0.78rem' }}>
                    Call, Email & Form
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <section className="py-5" style={{ background: '#FFFFFF' }}>
        <div className="container">
          <div className="row g-5">
            {/* LEFT COLUMN: Contact Details & Office Channels */}
            <div className="col-lg-5" data-aos="fade-right">
              <div className="pe-lg-3">
                <span
                  className="badge px-3 py-1 mb-2 text-uppercase fw-bold"
                  style={{
                    background: '#E0F2FE',
                    color: '#075985',
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                  }}
                >
                  Reach The Secretariat
                </span>
                <h2 className="fw-bold mb-3" style={{ color: '#000000', fontSize: '1.75rem' }}>
                  {t('phrase.Get in Touch') || 'Get in Touch'}
                </h2>
                <p className="mb-4" style={{ color: '#475569', fontSize: '0.98rem', lineHeight: 1.6 }}>
                  Whether you are an athlete, club leader, national federation partner, media representative, or sponsor, our team is ready to assist you.
                </p>

                {/* Contact Cards */}
                <div className="d-flex flex-column gap-3 mb-4">
                  {/* Location Card */}
                  <div
                    className="p-3.5 rounded-3 d-flex align-items-start gap-3"
                    style={{
                      background: '#F8FAFC',
                      border: '1.5px solid #E2E8F0',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '48px',
                        height: '48px',
                        background: '#0B5F9F',
                        color: '#FFFFFF',
                        fontSize: '1.1rem',
                      }}
                    >
                      <i className="fas fa-location-dot" />
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1" style={{ color: '#000000', fontSize: '0.95rem' }}>
                        {t('phrase.Our Office') || 'Headquarters & Secretariat'}
                      </h4>
                      <p className="mb-1" style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.5 }}>
                        {address}
                      </p>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fw-bold text-decoration-none d-inline-flex align-items-center gap-1"
                        style={{ color: '#0B5F9F', fontSize: '0.82rem' }}
                      >
                        <span>Open in Google Maps</span>
                        <i className="fas fa-arrow-up-right-from-square" style={{ fontSize: '0.75rem' }} />
                      </a>
                    </div>
                  </div>

                  {/* Phone Card */}
                  <div
                    className="p-3.5 rounded-3 d-flex align-items-start gap-3"
                    style={{
                      background: '#F8FAFC',
                      border: '1.5px solid #E2E8F0',
                    }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '48px',
                        height: '48px',
                        background: '#10B981',
                        color: '#FFFFFF',
                        fontSize: '1.1rem',
                      }}
                    >
                      <i className="fas fa-phone" />
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1" style={{ color: '#000000', fontSize: '0.95rem' }}>
                        {t('phrase.Phone Number') || 'Phone & WhatsApp'}
                      </h4>
                      <p className="mb-1" style={{ color: '#334155', fontSize: '0.95rem', fontWeight: 600 }}>
                        <a
                          href={`tel:${phone.replace(/\s+/g, '')}`}
                          className="text-decoration-none"
                          style={{ color: '#000000' }}
                        >
                          {phone}
                        </a>
                      </p>
                      <span className="small" style={{ color: '#64748B', fontSize: '0.8rem' }}>
                        Official Working Hours (08:00 – 17:00 CAT)
                      </span>
                    </div>
                  </div>

                  {/* Email Card */}
                  <div
                    className="p-3.5 rounded-3 d-flex align-items-start gap-3"
                    style={{
                      background: '#F8FAFC',
                      border: '1.5px solid #E2E8F0',
                    }}
                  >
                    <div
                      className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                      style={{
                        width: '48px',
                        height: '48px',
                        background: '#F59E0B',
                        color: '#FFFFFF',
                        fontSize: '1.1rem',
                      }}
                    >
                      <i className="fas fa-envelope" />
                    </div>
                    <div>
                      <h4 className="fw-bold mb-1" style={{ color: '#000000', fontSize: '0.95rem' }}>
                        {t('phrase.Email Address') || 'Official Email'}
                      </h4>
                      <p className="mb-1" style={{ color: '#334155', fontSize: '0.95rem', fontWeight: 600 }}>
                        <a
                          href={`mailto:${contactEmail}`}
                          className="text-decoration-none"
                          style={{ color: '#0B5F9F' }}
                        >
                          {contactEmail}
                        </a>
                      </p>
                      <span className="small" style={{ color: '#64748B', fontSize: '0.8rem' }}>
                        Direct inquiries, formal partnerships & proposals
                      </span>
                    </div>
                  </div>
                </div>

                {/* Social Channels */}
                <div className="pt-2">
                  <h4 className="fw-bold mb-2" style={{ color: '#000000', fontSize: '0.95rem' }}>
                    {t('phrase.Connect With Us') || 'Connect on Official Channels'}
                  </h4>
                  <p className="small mb-3" style={{ color: '#64748B' }}>
                    Follow our live game coverage, national tournaments, and athlete achievements:
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    {configuredSocialLinks.map((s) => (
                      <a
                        key={s.id}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-dark d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3"
                        aria-label={s.platform}
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          borderColor: '#CBD5E1',
                          background: '#FFFFFF',
                        }}
                      >
                        <i className={`fab ${s.icon}`} style={{ color: '#0B5F9F' }} />
                        <span className="text-capitalize">{s.platform}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Contact Form */}
            <div className="col-lg-7" data-aos="fade-left">
              <div
                className="p-4 p-md-5 rounded-4 shadow-sm"
                style={{
                  background: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                  <div>
                    <h3 className="fw-bold mb-1" style={{ color: '#000000', fontSize: '1.45rem' }}>
                      {t('phrase.Send a Message') || 'Send Us an Official Message'}
                    </h3>
                    <p className="mb-0" style={{ color: '#64748B', fontSize: '0.88rem' }}>
                      All messages are routed directly to our Secretariat administration inbox.
                    </p>
                  </div>
                  <div
                    className="d-none d-sm-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{
                      width: '44px',
                      height: '44px',
                      background: '#EFF6FF',
                      color: '#0B5F9F',
                    }}
                  >
                    <i className="fas fa-paper-plane" />
                  </div>
                </div>

                {submitted ? (
                  <div
                    className="p-4 rounded-3 text-center"
                    style={{
                      background: '#ECFDF5',
                      border: '1.5px solid #A7F3D0',
                    }}
                  >
                    <div
                      className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: '64px',
                        height: '64px',
                        background: '#10B981',
                        color: '#FFFFFF',
                        fontSize: '1.8rem',
                      }}
                    >
                      <i className="fas fa-check" />
                    </div>
                    <h4 className="fw-bold mb-2" style={{ color: '#065F46' }}>
                      {t('phrase.Message Sent Successfully!') || 'Message Sent Successfully!'}
                    </h4>
                    <p className="mb-4" style={{ color: '#047857', fontSize: '0.92rem', maxWidth: '440px', margin: '0 auto 1.5rem' }}>
                      {t(
                        'phrase.Thank you for contacting NPC Rwanda. Your message has been sent to our administrator dashboard.'
                      ) ||
                        'Thank you for reaching out to NPC Rwanda. A secretariat officer will review your message and reply via email shortly.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="btn fw-bold px-4 py-2 rounded-3 text-white"
                      style={{ background: '#059669', border: 'none' }}
                    >
                      <i className="fas fa-rotate-left me-2" />
                      {t('phrase.Send Another Message') || 'Send Another Message'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      {/* Name */}
                      <div className="col-md-6">
                        <label htmlFor="name" className="form-label fw-bold" style={{ color: '#000000', fontSize: '0.85rem' }}>
                          {t('phrase.Full Name') || 'Full Name'} <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control py-2.5 rounded-3"
                          id="name"
                          placeholder={t('phrase.Your Name') || 'e.g. Jean Pierre Mugisha'}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          style={{
                            border: '1.5px solid #CBD5E1',
                            fontSize: '0.92rem',
                          }}
                        />
                      </div>

                      {/* Email */}
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label fw-bold" style={{ color: '#000000', fontSize: '0.85rem' }}>
                          {t('phrase.Email Address') || 'Email Address'} <span className="text-danger">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control py-2.5 rounded-3"
                          id="email"
                          placeholder={t('phrase.Email Address') || 'name@example.com'}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          style={{
                            border: '1.5px solid #CBD5E1',
                            fontSize: '0.92rem',
                          }}
                        />
                      </div>

                      {/* Subject */}
                      <div className="col-12">
                        <label htmlFor="subject" className="form-label fw-bold" style={{ color: '#000000', fontSize: '0.85rem' }}>
                          {t('phrase.Subject') || 'Subject / Purpose'} <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control py-2.5 rounded-3"
                          id="subject"
                          placeholder={t('phrase.Subject') || 'e.g. Partnership Proposal / Athlete Support / Media Accreditation'}
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          required
                          style={{
                            border: '1.5px solid #CBD5E1',
                            fontSize: '0.92rem',
                          }}
                        />
                      </div>

                      {/* Message */}
                      <div className="col-12">
                        <label htmlFor="message" className="form-label fw-bold" style={{ color: '#000000', fontSize: '0.85rem' }}>
                          {t('phrase.Message') || 'Your Message'} <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control rounded-3"
                          id="message"
                          rows={5}
                          placeholder={t('phrase.Tell us how we can help') || 'Please describe your request, project, or inquiry in detail...'}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                          style={{
                            border: '1.5px solid #CBD5E1',
                            fontSize: '0.92rem',
                            resize: 'vertical',
                          }}
                        />
                      </div>

                      {/* Anti-spam honeypot traps for web bots */}
                      <div
                        style={{
                          position: 'absolute',
                          left: '-9999px',
                          top: '-9999px',
                          opacity: 0,
                          height: '1px',
                          width: '1px',
                          overflow: 'hidden',
                        }}
                        aria-hidden="true"
                      >
                        <input
                          type="text"
                          name="website_url"
                          tabIndex={-1}
                          autoComplete="off"
                          value={websiteUrl}
                          onChange={(e) => setWebsiteUrl(e.target.value)}
                        />
                        <input
                          type="text"
                          name="hp_field"
                          tabIndex={-1}
                          autoComplete="off"
                          value={hpField}
                          onChange={(e) => setHpField(e.target.value)}
                        />
                      </div>

                      {/* Submit CTA */}
                      <div className="col-12 mt-4 pt-1">
                        <button
                          type="submit"
                          className="btn btn-primary px-4 py-2.5 fw-bold rounded-3 d-inline-flex align-items-center gap-2"
                          disabled={loading}
                          style={{
                            background: '#0B5F9F',
                            borderColor: '#0B5F9F',
                            fontSize: '0.95rem',
                            boxShadow: '0 2px 6px rgba(11,95,159,0.25)',
                          }}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                              <span>Sending Message...</span>
                            </>
                          ) : (
                            <>
                              <span>{t('phrase.Send Message') || 'Send Official Message'}</span>
                              <i className="fas fa-paper-plane" />
                            </>
                          )}
                        </button>
                        <span className="small ms-3 d-none d-sm-inline" style={{ color: '#64748B' }}>
                          <i className="fas fa-shield-halved me-1 text-success" />
                          Encrypted & spam-protected
                        </span>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAP SECTION ================= */}
      <section className="py-5" style={{ background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
        <div className="container">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-2">
            <div>
              <span
                className="badge px-3 py-1 mb-2 text-uppercase fw-bold"
                style={{
                  background: '#FEF3C7',
                  color: '#000000',
                  border: '1.5px solid #F59E0B',
                  fontSize: '0.72rem',
                }}
              >
                Physical Location
              </span>
              <h3 className="fw-bold mb-1" style={{ color: '#000000', fontSize: '1.4rem' }}>
                Find Us in Kigali, Rwanda
              </h3>
              <p className="mb-0 text-muted small">
                Located inside the iconic Amahoro National Stadium sports complex in Remera, Gasabo District.
              </p>
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-dark fw-bold btn-sm d-inline-flex align-items-center gap-1 rounded-3 px-3 py-2"
              style={{ borderColor: '#CBD5E1', background: '#FFFFFF' }}
            >
              <span>Get Directions</span>
              <i className="fas fa-arrow-up-right-from-square ms-1" style={{ fontSize: '0.75rem' }} />
            </a>
          </div>

          <div
            className="rounded-4 overflow-hidden shadow-sm"
            style={{
              border: '2px solid #E2E8F0',
              background: '#E2E8F0',
            }}
          >
            <div className="ratio ratio-21x9" style={{ minHeight: '380px' }}>
              <iframe
                src={mapSrc}
                style={{ border: 0, width: '100%', height: '100%' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="NPC Rwanda Map Location"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
