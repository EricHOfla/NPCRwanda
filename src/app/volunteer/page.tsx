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
  const [phone, setPhone] = useState('');
  const [interest, setInterest] = useState('General Help');
  const [skills, setSkills] = useState('');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [hpField, setHpField] = useState('');
  const [mountTime] = useState(() => Date.now());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !skills.trim() || !details.trim()) return;

    setLoading(true);
    try {
      await addVolunteerApplication({
        name: name.trim(),
        email: email.trim(),
        interest,
        skills: phone.trim() ? `${skills.trim()} (Phone: ${phone.trim()})` : skills.trim(),
        details: details.trim(),
        website_url: websiteUrl,
        hp_field: hpField,
        _ts: mountTime,
      });
      setName('');
      setEmail('');
      setPhone('');
      setSkills('');
      setDetails('');
      setSubmitted(true);
      window.scrollTo({ top: 320, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      alert('Failed to submit volunteer application. Please check your network connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const volunteerPillars = [
    {
      icon: 'fa-medal',
      title: 'phrase.Athlete Support',
      fallbackTitle: 'Athlete Support & Logistics',
      desc: 'phrase.Assist athletes at events, classification sessions, and training camps.',
      fallbackDesc: 'Provide hands-on support during national squad training camps, classification clinics, and adaptive equipment transport.',
      color: '#0B5F9F',
      bg: '#EFF6FF',
    },
    {
      icon: 'fa-calendar-check',
      title: 'phrase.Events & Competitions',
      fallbackTitle: 'Events & Tournament Operations',
      desc: 'phrase.Help with event coordination, logistics, and digital coverage.',
      fallbackDesc: 'Facilitate national championships, Sitting Volleyball leagues, protocol, guest welcoming, and court management.',
      color: '#059669',
      bg: '#ECFDF5',
    },
    {
      icon: 'fa-camera-retro',
      title: 'phrase.Communications & Media',
      fallbackTitle: 'Communications, Media & Photography',
      desc: 'phrase.Help with photography, storytelling, social media, and digital coverage.',
      fallbackDesc: 'Capture match action, produce athlete feature stories, and amplify inclusive sports awareness online.',
      color: '#7C3AED',
      bg: '#EDE9FE',
    },
    {
      icon: 'fa-users',
      title: 'phrase.Grassroots Mobilization',
      fallbackTitle: 'District Grassroots Mobilization',
      desc: 'phrase.Spread awareness about inclusive sport in schools and local districts.',
      fallbackDesc: 'Champion disability inclusion across all 30 districts, schools, and community centers throughout Rwanda.',
      color: '#D97706',
      bg: '#FEF3C7',
    },
  ];

  return (
    <main id="main-content" className="volunteer-page-root">
      {/* ═══════════════════════════════════════════════════════════
          PAGE HEADER (Consistent Light Design System & Black Text)
      ═══════════════════════════════════════════════════════════ */}
      <header className="page-header" style={{ borderBottom: '1px solid #E2E8F0', background: '#F8FAFC', color: '#000000', padding: '44px 0 52px' }}>
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-3">
              <li className="breadcrumb-item">
                <Link href="/" style={{ color: '#000000', fontWeight: 600, textDecoration: 'none' }}>
                  Home
                </Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page" style={{ color: '#000000', fontWeight: 800 }}>
                {t('common.volunteer') || 'Volunteer'}
              </li>
            </ol>
          </nav>

          <div className="d-flex align-items-center gap-2 mb-3">
            <span
              className="badge rounded-pill text-uppercase fw-bold px-3 py-2"
              style={{
                background: '#FEF3C7',
                color: '#000000',
                border: '1.5px solid #F59E0B',
                fontSize: '0.78rem',
                letterSpacing: '0.08em',
              }}
            >
              <i className="fas fa-hands-helping me-2" style={{ color: '#D97706' }} aria-hidden="true" />
              Community &amp; Paralympic Impact
            </span>
          </div>

          <h1
            className="page-title mb-3 fw-bold"
            style={{
              color: '#000000',
              fontSize: 'clamp(2.1rem, 3.8vw, 3.1rem)',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
            }}
          >
            Volunteer With NPC Rwanda
          </h1>

          <p
            className="page-subtitle mb-0"
            style={{
              color: '#000000',
              maxWidth: '860px',
              fontSize: '1.1rem',
              lineHeight: 1.7,
              fontWeight: 500,
            }}
          >
            Join dedicated volunteers supporting Rwandan para-athletes, organizing national championships, and driving
            inclusion across communities. Your skills and passion create meaningful sporting opportunities.
          </p>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════
          VOLUNTEER SECTION (Tracks & Application Form)
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-5" style={{ background: '#FFFFFF', minHeight: '600px' }}>
        <div className="container">
          <div className="row g-5 align-items-start">
            {/* Left Column: Volunteer Tracks & Experience */}
            <div className="col-lg-5">
              <div className="mb-4">
                <span
                  className="badge rounded-pill text-uppercase fw-bold px-3 py-1 mb-2"
                  style={{ background: '#EFF6FF', color: '#1D4ED8', fontSize: '0.78rem' }}
                >
                  {t('phrase.Get Involved') || 'Get Involved'}
                </span>
                <h2 className="h3 fw-bold text-dark mb-3">Where You Can Make a Difference</h2>
                <p className="text-secondary small mb-4" style={{ lineHeight: 1.65 }}>
                  {t(
                    'phrase.Join events, communication, athlete support, or grassroots mobilization as a volunteer. Send your skills and availability details using the form.'
                  )}
                </p>
              </div>

              {/* Tracks List */}
              <div className="d-flex flex-column gap-3 mb-4">
                {volunteerPillars.map((pillar) => (
                  <div
                    key={pillar.fallbackTitle}
                    className="p-3 bg-white border rounded-3 d-flex align-items-start gap-3"
                    style={{
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                      borderColor: '#E2E8F0',
                    }}
                  >
                    <div
                      className="rounded-3 flex-shrink-0"
                      style={{
                        width: '46px',
                        height: '46px',
                        background: pillar.bg,
                        color: pillar.color,
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '1.25rem',
                      }}
                    >
                      <i className={`fas ${pillar.icon}`} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="h6 fw-bold text-dark mb-1">{t(pillar.title) || pillar.fallbackTitle}</h3>
                      <p className="small text-muted mb-0" style={{ lineHeight: 1.5 }}>
                        {t(pillar.desc) || pillar.fallbackDesc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Volunteer Commitment Promise */}
              <div
                className="p-3 rounded-3"
                style={{ background: '#F8FAFC', border: '1.5px solid #E2E8F0' }}
              >
                <div className="d-flex align-items-center gap-2 mb-2">
                  <i className="fas fa-certificate text-success" />
                  <strong className="small text-dark">Volunteer Benefits &amp; Recognition</strong>
                </div>
                <p className="small text-muted mb-0" style={{ lineHeight: 1.55 }}>
                  All active volunteers receive official event accreditation, branded volunteer apparel during duties,
                  and an official Certificate of Appreciation from NPC Rwanda leadership.
                </p>
              </div>
            </div>

            {/* Right Column: Application Form */}
            <div className="col-lg-7">
              <div
                className="bg-white p-4 p-md-5 rounded-4 border"
                style={{
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.06)',
                  borderColor: '#CBD5E1',
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
                  <div>
                    <h2 className="h4 fw-bold text-dark mb-1">
                      {t('phrase.Volunteer Application Form') || 'Volunteer Application Form'}
                    </h2>
                    <p className="small text-muted mb-0">Fill in your information to join our volunteer pool.</p>
                  </div>
                  <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-2">
                    Open Applications
                  </span>
                </div>

                {submitted ? (
                  <div
                    style={{
                      padding: '36px 24px',
                      background: '#F0FDF4',
                      border: '2px solid #86EFAC',
                      borderRadius: '16px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        background: '#166534',
                        color: '#FFFFFF',
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '2rem',
                        margin: '0 auto 16px',
                      }}
                    >
                      <i className="fas fa-check" />
                    </div>
                    <h3 className="h4 fw-bold mb-2" style={{ color: '#14532D' }}>
                      {t('phrase.Application Submitted!') || 'Application Submitted Successfully!'}
                    </h3>
                    <p style={{ maxWidth: '480px', margin: '0 auto 20px', color: '#15803D', fontSize: '0.94rem', lineHeight: 1.6 }}>
                      {t(
                        'phrase.Thank you for applying. Your volunteer request has been recorded and sent to the administrator dashboard.'
                      ) ||
                        'Thank you for joining our movement. The NPC Rwanda team will review your profile and contact you prior to upcoming events.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="btn btn-success fw-bold px-4 py-2"
                      style={{ background: '#166534', borderColor: '#166534' }}
                    >
                      <i className="fas fa-redo me-2" />
                      {t('phrase.Submit Another Application') || 'Submit Another Application'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      {/* Name */}
                      <div className="col-md-6">
                        <label htmlFor="volName" className="form-label small fw-bold text-dark">
                          {t('phrase.Full Name')} <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light text-muted border-end-0">
                            <i className="far fa-user" />
                          </span>
                          <input
                            type="text"
                            className="form-control border-start-0 py-2.5"
                            id="volName"
                            placeholder={t('phrase.Your Name') || 'e.g. Marie Louise Mukamana'}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="col-md-6">
                        <label htmlFor="volEmail" className="form-label small fw-bold text-dark">
                          {t('phrase.Email Address')} <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light text-muted border-end-0">
                            <i className="far fa-envelope" />
                          </span>
                          <input
                            type="email"
                            className="form-control border-start-0 py-2.5"
                            id="volEmail"
                            placeholder={t('phrase.Email Address') || 'you@domain.rw'}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="col-md-6">
                        <label htmlFor="volPhone" className="form-label small fw-bold text-dark">
                          Phone Number (WhatsApp)
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light text-muted border-end-0">
                            <i className="fas fa-phone-alt" />
                          </span>
                          <input
                            type="tel"
                            className="form-control border-start-0 py-2.5"
                            id="volPhone"
                            placeholder="+250 78X XXX XXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Area of Interest */}
                      <div className="col-md-6">
                        <label htmlFor="volInterest" className="form-label small fw-bold text-dark">
                          {t('phrase.Area of Interest') || 'Area of Interest'} <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select py-2.5"
                          id="volInterest"
                          value={interest}
                          onChange={(e) => setInterest(e.target.value)}
                        >
                          <option value="General Help">{t('phrase.General Help') || 'General Help'}</option>
                          <option value="Events & Competitions">
                            {t('phrase.Events & Competitions') || 'Events & Competitions'}
                          </option>
                          <option value="Communications & Media">
                            {t('phrase.Communications & Media') || 'Communications & Media'}
                          </option>
                          <option value="Athlete Support">{t('phrase.Athlete Support') || 'Athlete Support'}</option>
                          <option value="Grassroots Mobilization">
                            {t('phrase.Grassroots Mobilization') || 'Grassroots Mobilization'}
                          </option>
                        </select>
                      </div>

                      {/* Skills / Background */}
                      <div className="col-12">
                        <label htmlFor="volSkills" className="form-label small fw-bold text-dark">
                          {t('phrase.Skills / Background') || 'Your Skills & Profession'} <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control py-2.5"
                          id="volSkills"
                          placeholder={
                            t('phrase.e.g. Medical background, Photography, Coaching') ||
                            'e.g. First Aid, Media/Photography, Translation (Kinyarwanda/French/English), Sport Coaching'
                          }
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          required
                        />
                      </div>

                      {/* Availability & Details */}
                      <div className="col-12">
                        <label htmlFor="volDetails" className="form-label small fw-bold text-dark">
                          {t('phrase.Availability & Details') || 'Availability & How You Want to Help'} <span className="text-danger">*</span>
                        </label>
                        <textarea
                          className="form-control py-2.5"
                          id="volDetails"
                          rows={4}
                          placeholder={
                            t('phrase.Please share your availability and what you would like to help with') ||
                            'Tell us your availability (weekends, specific months) and any relevant experience with sports or disability inclusion.'
                          }
                          value={details}
                          onChange={(e) => setDetails(e.target.value)}
                          required
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

                      {/* Submit Button */}
                      <div className="col-12 mt-4 pt-2">
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg fw-bold px-5 w-100 w-md-auto"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status" />
                              Submitting Application...
                            </>
                          ) : (
                            <>
                              <span>{t('phrase.Submit Application') || 'Submit Application'}</span>
                              <i className="fas fa-paper-plane ms-2" />
                            </>
                          )}
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
