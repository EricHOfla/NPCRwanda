'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

export default function ContactPage() {
  const { t } = useTranslation();
  const { addContactMessage, contactInfo, socialLinks, systemSettings } = useData();

  const address = systemSettings.address || contactInfo?.address || 'Amahoro Stadium, Kigali';
  const phone = systemSettings.contactPhone || contactInfo?.phone || '+250 788 672 739';
  const contactEmail = systemSettings.contactEmail || contactInfo?.email || 'info@npcrwanda.org';
  const configuredSocialLinks = socialLinks
    .filter(s => s.active)
    .map(s => ({ ...s, url: systemSettings[s.platform] || s.url }));

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    try {
      await addContactMessage(name, email, subject || 'General Inquiry', message);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content">
      {/* Page Header */}
      <header className="page-header">
        <div className="container">
          <nav aria-label="breadcrumb" data-aos="fade-up">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item">
                <Link href="/">
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {t('nav.contact')}
              </li>
            </ol>
          </nav>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">
            {t('phrase.Contact Us')}
          </h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100">
            Get in touch with the National Paralympic Committee of Rwanda team.
          </p>
        </div>
      </header>

      {/* Contact Details & Form */}
      <section id="contact-info">
        <div className="container">
          <div className="row g-5">
            {/* Column 1: Contact Details */}
            <div className="col-lg-5" data-aos="fade-right">
              <h2 className="mb-4">{t('phrase.Get in Touch')}</h2>
              <p className="text-muted mb-5">
                {t(
                  'phrase.Have questions about our programs or interested in partnership? Reach us using the form or the contact details below. We respond as quickly as possible.'
                )}
              </p>

              <div className="d-flex align-items-start mb-4">
                <div
                  className="bg-primary text-white p-3 rounded-circle me-3"
                  style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <i className="fas fa-location-dot" />
                </div>
                <div>
                  <h4 className="h6 fw-bold mb-1">{t('phrase.Our Office')}</h4>
                  <p className="small text-muted mb-0">
                    {address}
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-start mb-4">
                <div
                  className="bg-primary text-white p-3 rounded-circle me-3"
                  style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <i className="fas fa-phone" />
                </div>
                <div>
                  <h4 className="h6 fw-bold mb-1">{t('phrase.Phone Number')}</h4>
                  <p className="small text-muted mb-0">{phone}</p>
                </div>
              </div>

              <div className="d-flex align-items-start mb-4">
                <div
                  className="bg-primary text-white p-3 rounded-circle me-3"
                  style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <i className="fas fa-envelope" />
                </div>
                <div>
                  <h4 className="h6 fw-bold mb-1">{t('phrase.Email Address')}</h4>
                  <p className="small text-muted mb-0">{contactEmail}</p>
                </div>
              </div>

              <div className="mt-5">
                <h4 className="h6 fw-bold mb-3">{t('phrase.Connect With Us')}</h4>
                <div className="social-links d-flex gap-3">
                  {configuredSocialLinks.map(s => (
                    <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary rounded-circle" aria-label={s.platform} style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className={`fab ${s.icon}`} />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Contact Form */}
            <div className="col-lg-7" data-aos="fade-left">
              <div className="bg-white p-4 p-md-5 rounded-4 shadow-medium border">
                <h3 className="h4 mb-4">{t('phrase.Send a Message')}</h3>

                {submitted ? (
                  <div
                    style={{
                      padding: '24px',
                      background: '#E8F5E9',
                      border: '1px solid #C8E6C9',
                      borderRadius: '12px',
                      textAlign: 'center',
                    }}
                  >
                    <i className="fas fa-circle-check text-success mb-3" style={{ fontSize: '3rem' }} />
                    <h4 style={{ color: '#2E7D32', margin: '0 0 8px 0' }}>{t('phrase.Message Sent Successfully!') || 'Message Sent!'}</h4>
                    <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#4E7D50' }}>
                      {t('phrase.Thank you for contacting NPC Rwanda. Your message has been sent to our administrator dashboard.') || 'Thank you! Your message has been submitted to the admin dashboard.'}
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      style={{
                        background: '#2E7D32',
                        color: '#fff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {t('phrase.Send Another Message') || 'Send Another Message'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="name" className="form-label small fw-bold">
                          {t('phrase.Full Name')}
                        </label>
                        <input
                          type="text"
                          className="form-control bg-light border-0 py-3"
                          id="name"
                          placeholder={t('phrase.Your Name') || 'Your Name'}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label small fw-bold">
                          {t('phrase.Email Address')}
                        </label>
                        <input
                          type="email"
                          className="form-control bg-light border-0 py-3"
                          id="email"
                          placeholder={t('phrase.Email Address') || 'Email Address'}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label htmlFor="subject" className="form-label small fw-bold">
                          {t('phrase.Subject')}
                        </label>
                        <input
                          type="text"
                          className="form-control bg-light border-0 py-3"
                          id="subject"
                          placeholder={t('phrase.Subject') || 'Subject'}
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label htmlFor="message" className="form-label small fw-bold">
                          {t('phrase.Message')}
                        </label>
                        <textarea
                          className="form-control bg-light border-0 py-3"
                          id="message"
                          rows={5}
                          placeholder={t('phrase.Tell us how we can help') || 'Tell us how we can help'}
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-12 mt-4">
                        <button
                          type="submit"
                          className="btn btn-primary px-5 py-2.5 fw-bold w-auto"
                          disabled={loading}
                        >
                          <span>{loading ? 'Sending...' : t('phrase.Send Message')}</span>
                          <i className="fas fa-paper-plane ms-2" />
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section id="location-map" className="p-0 border-top mt-5">
        <div className="ratio ratio-21x9">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5028549641776!2d30.119!3d-1.948!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca688b1b88e1b%3A0xc3b446a364be22b6!2sAmahoro%20Stadium!5e0!3m2!1sen!2srw!4v1700000000000!5m2!1sen!2srw"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="NPC Rwanda Map Location"
          />
        </div>
      </section>
    </main>
  );
}

