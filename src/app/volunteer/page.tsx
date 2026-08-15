'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

export default function VolunteerPage() {
  const { t } = useTranslation();
  const { addVolunteerApplication } = useData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('General Help');
  const [skills, setSkills] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !skills || !details) return;

    setLoading(true);
    try {
      await addVolunteerApplication({
        name,
        email,
        interest,
        skills,
        details,
      });
      setName('');
      setEmail('');
      setSkills('');
      setDetails('');
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert('Failed to submit volunteer application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content">
      {/* Page Header */}
      <header
        className="py-5 text-white bg-contain"
        style={{
          background:
            "linear-gradient(135deg, rgba(15, 37, 63, 0.9), rgba(0, 114, 198, 0.85)), url('/assets/img/curated/about-hero.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="container py-4">
          <h1 className="text-white mb-2" data-aos="fade-up">
            {t('common.volunteer') || 'Volunteer'}
          </h1>
          <nav aria-label="breadcrumb" data-aos="fade-up" data-aos-delay="100">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/" className="text-white text-decoration-none">
                  {t('nav.home')}
                </Link>
              </li>
              <li className="breadcrumb-item active text-white opacity-75" aria-current="page">
                {t('common.volunteer')}
              </li>
            </ol>
          </nav>
        </div>
      </header>

      {/* Volunteer Page Layout */}
      <section id="volunteer-section">
        <div className="container">
          <div className="row g-5">
            {/* Column 1: Info */}
            <div className="col-lg-5" data-aos="fade-right">
              <div className="section-title text-start mb-4">
                <span className="text-uppercase fw-bold text-accent-green mb-2 d-block">
                  {t('phrase.Get Involved') || 'Get Involved'}
                </span>
                <h2>{t('phrase.Volunteer With NPC Rwanda')}</h2>
              </div>
              <p className="text-muted mb-4">
                {t(
                  'phrase.Join events, communication, athlete support, or grassroots mobilization as a volunteer. Send your skills and availability details using the form.'
                )}
              </p>
              
              <div className="d-flex flex-column gap-3">
                <div className="d-flex gap-3 p-3 bg-white border rounded-3 align-items-center">
                  <div className="flex-shrink-0 bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                    <i className="fas fa-medal fa-lg"></i>
                  </div>
                  <div>
                    <h4 className="h6 mb-1">{t('phrase.Athlete Support') || 'Athlete Support'}</h4>
                    <p className="small text-muted mb-0">{t('phrase.Assist athletes at events, classification sessions, and training camps.') || 'Assist athletes at events and training camps.'}</p>
                  </div>
                </div>
                
                <div className="d-flex gap-3 p-3 bg-white border rounded-3 align-items-center">
                  <div className="flex-shrink-0 bg-success-light text-success rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                    <i className="fas fa-calendar-alt fa-lg"></i>
                  </div>
                  <div>
                    <h4 className="h6 mb-1">{t('phrase.Events & Competitions') || 'Events & Competitions'}</h4>
                    <p className="small text-muted mb-0">{t('phrase.Help with event coordination, logistics, and digital coverage.') || 'Help with event coordination and digital coverage.'}</p>
                  </div>
                </div>
                
                <div className="d-flex gap-3 p-3 bg-white border rounded-3 align-items-center">
                  <div className="flex-shrink-0 bg-warning-light text-warning rounded-circle d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                    <i className="fas fa-bullhorn fa-lg"></i>
                  </div>
                  <div>
                    <h4 className="h6 mb-1">{t('phrase.Grassroots Mobilization') || 'Grassroots Mobilization'}</h4>
                    <p className="small text-muted mb-0">{t('phrase.Spread awareness about inclusive sport in schools and local districts.') || 'Spread awareness about inclusive sport.'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Application Form */}
            <div className="col-lg-7" data-aos="fade-left">
              <div className="bg-white p-4 p-md-5 rounded-4 shadow-medium border">
                <h3 className="h4 mb-4">{t('phrase.Volunteer Application Form') || 'Volunteer Application Form'}</h3>

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
                    <h4 style={{ color: '#2E7D32', margin: '0 0 8px 0' }}>{t('phrase.Application Submitted!') || 'Application Submitted!'}</h4>
                    <p style={{ margin: '0 0 16px 0', fontSize: '0.88rem', color: '#4E7D50' }}>
                      {t('phrase.Thank you for applying. Your volunteer request has been recorded and sent to the administrator dashboard.') || 'Thank you! Your volunteer application has been received.'}
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
                      {t('phrase.Submit Another Application') || 'Submit Another Application'}
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
                        <label htmlFor="interest" className="form-label small fw-bold">
                          {t('phrase.Area of Interest') || 'Area of Interest'}
                        </label>
                        <select
                          className="form-select bg-light border-0 py-3"
                          id="interest"
                          value={interest}
                          onChange={(e) => setInterest(e.target.value)}
                        >
                          <option value="General Help">{t('phrase.General Help') || 'General Help'}</option>
                          <option value="Events & Competitions">{t('phrase.Events & Competitions') || 'Events & Competitions'}</option>
                          <option value="Communications & Media">{t('phrase.Communications & Media') || 'Communications & Media'}</option>
                          <option value="Athlete Support">{t('phrase.Athlete Support') || 'Athlete Support'}</option>
                          <option value="Grassroots Mobilization">{t('phrase.Grassroots Mobilization') || 'Grassroots Mobilization'}</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label htmlFor="skills" className="form-label small fw-bold">
                          {t('phrase.Skills / Background') || 'Skills / Background'}
                        </label>
                        <input
                          type="text"
                          className="form-control bg-light border-0 py-3"
                          id="skills"
                          placeholder={t('phrase.e.g. Medical background, Photography, Coaching') || 'e.g. Coaching, Media, Medicine'}
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label htmlFor="details" className="form-label small fw-bold">
                          {t('phrase.Availability & Details') || 'Availability & Details'}
                        </label>
                        <textarea
                          className="form-control bg-light border-0 py-3"
                          id="details"
                          rows={5}
                          placeholder={t('phrase.Please share your availability and what you would like to help with') || 'Availability and details...'}
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
                          <span>{loading ? 'Submitting...' : t('phrase.Submit Application') || 'Submit Application'}</span>
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
