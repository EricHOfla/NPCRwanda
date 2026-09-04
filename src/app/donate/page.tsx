'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

export default function DonatePage() {
  const { t } = useTranslation();
  const { addDonationInquiry } = useData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Individual Contribution');
  const [supportType, setSupportType] = useState('General Donation');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !details) return;

    setLoading(true);
    try {
      await addDonationInquiry({
        name,
        email,
        category,
        supportType,
        details,
      });
      setName('');
      setEmail('');
      setDetails('');
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit donation inquiry. Please try again.');
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
                {t('common.donate')}
              </li>
            </ol>
          </nav>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">
            {t('common.donate') || 'Donate'}
          </h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100">
            Support para-athletes and expand inclusive sports opportunities across Rwanda.
          </p>
        </div>
      </header>

      {/* Donate Page Layout */}
      <section id="donate-section">
        <div className="container">
          <div className="row g-5">
            {/* Column 1: Info */}
            <div className="col-lg-5" data-aos="fade-right">
              <div className="section-title text-start mb-4">
                <span className="text-uppercase fw-bold text-accent-green mb-2 d-block">
                  {t('phrase.Support') || 'Support'}
                </span>
                <h2>{t('phrase.Donate to Inclusive Sport')}</h2>
              </div>
              <p className="text-muted mb-4">
                {t(
                  'phrase.Your support helps expand access, training, and athlete welfare across Rwanda. Choose a category and fill out the details so our coordination desk can follow up.'
                )}
              </p>

              <div className="d-flex flex-column gap-3">
                <div className="d-flex gap-3 p-3 bg-white border rounded-3 align-items-center">
                  <div className="flex-shrink-0 bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                    <i className="fas fa-wheelchair fa-lg"></i>
                  </div>
                  <div>
                    <h4 className="h6 mb-1">{t('phrase.Assistive Equipment') || 'Assistive Equipment'}</h4>
                    <p className="small text-muted mb-0">{t('phrase.Sponsor wheelchairs, prosthetics, and sport-specific training aids.') || 'Sponsor wheelchairs and prosthetics.'}</p>
                  </div>
                </div>
                
                <div className="d-flex gap-3 p-3 bg-white border rounded-3 align-items-center">
                  <div className="flex-shrink-0 bg-success-light text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                    <i className="fas fa-user-graduate fa-lg"></i>
                  </div>
                  <div>
                    <h4 className="h6 mb-1">{t('phrase.Athlete Preparation') || 'Athlete Preparation'}</h4>
                    <p className="small text-muted mb-0">{t('phrase.Fund coaching, medical care, nutrition, and trial events.') || 'Fund coaching, medical care, and nutrition.'}</p>
                  </div>
                </div>
                
                <div className="d-flex gap-3 p-3 bg-white border rounded-3 align-items-center">
                  <div className="flex-shrink-0 bg-warning-light text-warning rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                    <i className="fas fa-handshake fa-lg"></i>
                  </div>
                  <div>
                    <h4 className="h6 mb-1">{t('phrase.Institutional Partnership') || 'Institutional Partnership'}</h4>
                    <p className="small text-muted mb-0">{t('phrase.Long-term organizational collaborations and event sponsorships.') || 'Long-term collaborations and sponsorships.'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Inquiry Form */}
            <div className="col-lg-7" data-aos="fade-left">
              <div className="bg-white p-4 p-md-5 rounded-4 shadow-medium border">
                <h3 className="h4 mb-4">{t('phrase.Donation Inquiry Form') || 'Donation Inquiry Form'}</h3>

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
                    <h4 style={{ color: '#2E7D32', margin: '0 0 8px 0' }}>{t('phrase.Inquiry Submitted!') || 'Inquiry Submitted!'}</h4>
                    <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#4E7D50' }}>
                      {t('phrase.Thank you for your support. Your donation request has been recorded and sent to the administrator dashboard.') || 'Thank you! Your donation inquiry has been received.'}
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
                      {t('phrase.Submit Another Inquiry') || 'Submit Another Inquiry'}
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
                      <div className="col-md-6">
                        <label htmlFor="category" className="form-label small fw-bold">
                          {t('phrase.Donation Category') || 'Donation Category'}
                        </label>
                        <select
                          className="form-select bg-light border-0 py-3"
                          id="category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <option value="Individual Contribution">{t('phrase.Individual Contribution') || 'Individual Contribution'}</option>
                          <option value="Institutional Partnership">{t('phrase.Institutional Partnership') || 'Institutional Partnership'}</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="supportType" className="form-label small fw-bold">
                          {t('phrase.Type of Support') || 'Type of Support'}
                        </label>
                        <select
                          className="form-select bg-light border-0 py-3"
                          id="supportType"
                          value={supportType}
                          onChange={(e) => setSupportType(e.target.value)}
                        >
                          <option value="General Donation">{t('phrase.General Donation') || 'General Donation'}</option>
                          <option value="Athlete Preparation">{t('phrase.Sponsor Athlete Preparation') || 'Sponsor Athlete Preparation'}</option>
                          <option value="Assistive Equipment">{t('phrase.Assistive Equipment') || 'Assistive Equipment'}</option>
                          <option value="District Program">{t('phrase.District-level Talent Program') || 'District-level Talent Program'}</option>
                          <option value="Event Sponsorship">{t('phrase.Event Sponsorship') || 'Event Sponsorship'}</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label htmlFor="details" className="form-label small fw-bold">
                          {t('phrase.Message / Inquiry Details') || 'Message / Inquiry Details'}
                        </label>
                        <textarea
                          className="form-control bg-light border-0 py-3"
                          id="details"
                          rows={5}
                          placeholder={t('phrase.Please share how you would like to contribute') || 'Please share details...'}
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-12 mt-4">
                        <button
                          type="submit"
                          className="btn btn-primary px-5 py-2.5 fw-bold w-auto"
                          disabled={loading}
                        >
                          <span>{loading ? 'Submitting...' : t('phrase.Submit Inquiry') || 'Submit Inquiry'}</span>
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
    </main>
  );
}
