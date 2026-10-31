'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { useData } from '@/context/DataContext';

const AMOUNTS = [5000, 10000, 25000, 50000];

const formatRwf = (amount: number) =>
  new Intl.NumberFormat('en-RW', { maximumFractionDigits: 0 }).format(amount);

export default function DonatePage() {
  const { t } = useTranslation();
  const { addDonationInquiry } = useData();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Individual Contribution');
  const [supportType, setSupportType] = useState('General Donation');
  const [frequency, setFrequency] = useState('One-time');
  const [amountChoice, setAmountChoice] = useState<number | 'custom'>(10000);
  const [customAmount, setCustomAmount] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const amount = useMemo(
    () => amountChoice === 'custom' ? Number(customAmount) : amountChoice,
    [amountChoice, customAmount]
  );

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCategory('Individual Contribution');
    setSupportType('General Donation');
    setFrequency('One-time');
    setAmountChoice(10000);
    setCustomAmount('');
    setAnonymous(false);
    setDetails('');
    setError('');
    setSubmitted(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!Number.isFinite(amount) || amount < 1000) {
      setError('Please enter a contribution amount of at least RWF 1,000.');
      return;
    }

    setLoading(true);
    try {
      const donorDetails = [
        'DONATION PLEDGE (NOT A PAYMENT CONFIRMATION)',
        `Amount: RWF ${formatRwf(amount)}`,
        `Frequency requested: ${frequency}`,
        `Purpose: ${supportType}`,
        `Donor display preference: ${anonymous ? 'Anonymous' : 'May be acknowledged by name'}`,
        `Phone: ${phone.trim() || 'Not provided'}`,
        '',
        'Additional message:',
        details.trim() || 'No additional message provided.',
      ].join('\n');

      await addDonationInquiry({
        name: name.trim(),
        email: email.trim(),
        category,
        supportType,
        details: donorDetails,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Donation inquiry submission failed:', err);
      setError('We could not submit your request. Your information is still here. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main id="main-content">
      <header className="page-header">
        <div className="container">
          <nav aria-label="breadcrumb" data-aos="fade-up">
            <ol className="breadcrumb mb-2">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item active" aria-current="page">{t('common.donate') || 'Donate'}</li>
            </ol>
          </nav>
          <h1 className="page-title mb-2" data-aos="fade-up" data-aos-delay="50">
            {t('common.donate') || 'Support NPC Rwanda'}
          </h1>
          <p className="page-subtitle" data-aos="fade-up" data-aos-delay="100">
            Help create more opportunities for persons with disabilities to participate, train and excel in sport.
          </p>
        </div>
      </header>

      <section id="donate-section" className="py-5">
        <div className="container">
          <div className="row g-4 g-xl-5 align-items-start">
            <div className="col-lg-5" data-aos="fade-right">
              <div className="section-title text-start mb-4">
                <span className="text-uppercase fw-bold text-accent-green mb-2 d-block">Make an impact</span>
                <h2>Every contribution helps move inclusive sport forward.</h2>
              </div>
              <p className="text-muted mb-4">
                Your support can help athletes access equipment, coaching, training and competitions across Rwanda.
                Choose the area you would like to support and tell us how we can follow up with you.
              </p>

              <div className="d-flex flex-column gap-3">
                {[
                  { icon: 'fa-wheelchair', title: 'Sports equipment', description: 'Help athletes access appropriate and sport-specific equipment.' },
                  { icon: 'fa-person-running', title: 'Athlete development', description: 'Support coaching, training, preparation and athlete welfare.' },
                  { icon: 'fa-trophy', title: 'Competition participation', description: 'Help athletes take part in local and international competitions.' },
                  { icon: 'fa-handshake', title: 'Partnerships', description: 'Work with NPC Rwanda through corporate or institutional support.' },
                ].map((item) => (
                  <div key={item.title} className="d-flex gap-3 p-3 bg-white border rounded-3 align-items-center">
                    <div className="flex-shrink-0 bg-primary-light text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                      <i className={`fas ${item.icon} fa-lg`} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="h6 mb-1">{item.title}</h3>
                      <p className="small text-muted mb-0">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 rounded-3" style={{ background: '#F1F6FB', borderLeft: '4px solid #0B5CAB' }}>
                <h3 className="h6 mb-2">How this works</h3>
                <p className="small text-muted mb-0">
                  This form records your donation interest or pledge. The NPC Rwanda team will contact you to confirm
                  the contribution and provide an approved payment method. Submitting this form does not charge you.
                </p>
              </div>
            </div>

            <div className="col-lg-7" data-aos="fade-left">
              <div className="bg-white p-4 p-md-5 rounded-4 shadow-medium border">
                {submitted ? (
                  <div className="text-center py-4" role="status" aria-live="polite">
                    <div className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ width: 68, height: 68, background: '#E8F5E9', color: '#237A3B' }}>
                      <i className="fas fa-check fa-2x" aria-hidden="true" />
                    </div>
                    <h2 className="h4 mb-2">Thank you for your support!</h2>
                    <p className="text-muted mb-4">
                      Your donation interest has been sent to NPC Rwanda. The team will contact you about the next steps.
                      No payment has been taken and this is not a payment receipt.
                    </p>
                    <button type="button" className="btn btn-primary px-4" onClick={resetForm}>Submit another pledge</button>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <h2 className="h4 mb-1">Make a donation pledge</h2>
                      <p className="text-muted small mb-0">Share your intended contribution. You will confirm payment with our team.</p>
                    </div>

                    {error && (
                      <div className="alert alert-danger" role="alert" aria-live="assertive">{error}</div>
                    )}

                    <form onSubmit={handleSubmit}>
                      <fieldset className="mb-4">
                        <legend className="form-label fw-bold mb-3">1. Choose an amount (RWF)</legend>
                        <div className="row g-2">
                          {AMOUNTS.map((value) => (
                            <div className="col-6 col-sm-3" key={value}>
                              <button
                                type="button"
                                className={`btn w-100 py-3 ${amountChoice === value ? 'btn-primary' : 'btn-outline-primary'}`}
                                aria-pressed={amountChoice === value}
                                onClick={() => setAmountChoice(value)}
                              >
                                {formatRwf(value)}
                              </button>
                            </div>
                          ))}
                          <div className="col-12 mt-3">
                            <button
                              type="button"
                              className={`btn btn-sm ${amountChoice === 'custom' ? 'btn-dark' : 'btn-outline-secondary'}`}
                              aria-pressed={amountChoice === 'custom'}
                              onClick={() => setAmountChoice('custom')}
                            >
                              Enter a different amount
                            </button>
                          </div>
                          {amountChoice === 'custom' && (
                            <div className="col-12 mt-2">
                              <label htmlFor="customAmount" className="form-label small fw-semibold">Custom amount (RWF)</label>
                              <input
                                id="customAmount"
                                type="number"
                                min="1000"
                                step="1"
                                inputMode="numeric"
                                className="form-control py-3"
                                placeholder="Enter amount in RWF"
                                value={customAmount}
                                onChange={(e) => setCustomAmount(e.target.value)}
                                required
                              />
                            </div>
                          )}
                        </div>
                        <p className="small text-muted mt-2 mb-0">Minimum pledge: RWF 1,000.</p>
                      </fieldset>

                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="frequency" className="form-label small fw-bold">Contribution frequency</label>
                          <select id="frequency" className="form-select py-3" value={frequency} onChange={(e) => setFrequency(e.target.value)}>
                            <option value="One-time">One-time</option>
                            <option value="Monthly pledge">Monthly pledge</option>
                          </select>
                          <small className="text-muted">Monthly means an intended pledge, not an automatic charge.</small>
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="supportType" className="form-label small fw-bold">What would you like to support?</label>
                          <select id="supportType" className="form-select py-3" value={supportType} onChange={(e) => setSupportType(e.target.value)}>
                            <option value="General Donation">General support</option>
                            <option value="Athlete Development">Athlete development</option>
                            <option value="Sports Equipment">Sports equipment</option>
                            <option value="Competition Participation">Competition participation</option>
                            <option value="Youth Para-sports">Youth para-sports</option>
                            <option value="Training Programmes">Training programmes</option>
                            <option value="Event Sponsorship">Event sponsorship</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="category" className="form-label small fw-bold">I am donating as</label>
                          <select id="category" className="form-select py-3" value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="Individual Contribution">An individual</option>
                            <option value="Corporate Partnership">A company / organization</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="phone" className="form-label small fw-bold">Phone number (optional)</label>
                          <input id="phone" type="tel" className="form-control py-3" placeholder="+250 ..." value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="name" className="form-label small fw-bold">Full name / organization</label>
                          <input id="name" type="text" className="form-control py-3" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required autoComplete="name" />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="email" className="form-label small fw-bold">Email address</label>
                          <input id="email" type="email" className="form-control py-3" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                        </div>
                        <div className="col-12">
                          <div className="form-check">
                            <input id="anonymous" type="checkbox" className="form-check-input" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} />
                            <label htmlFor="anonymous" className="form-check-label">I prefer my name not to be publicly acknowledged.</label>
                          </div>
                        </div>
                        <div className="col-12">
                          <label htmlFor="details" className="form-label small fw-bold">Message (optional)</label>
                          <textarea id="details" className="form-control py-3" rows={3} placeholder="Tell us more about your intended support..." value={details} onChange={(e) => setDetails(e.target.value)} />
                        </div>
                        <div className="col-12 pt-2">
                          <button type="submit" className="btn btn-primary px-4 py-3 fw-bold" disabled={loading}>
                            {loading ? 'Sending your pledge...' : 'Send donation pledge'}
                            <i className="fas fa-arrow-right ms-2" aria-hidden="true" />
                          </button>
                          <p className="small text-muted mt-3 mb-0">
                            By submitting, you agree that NPC Rwanda may contact you about this contribution. Your pledge is not a completed donation.
                          </p>
                        </div>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
