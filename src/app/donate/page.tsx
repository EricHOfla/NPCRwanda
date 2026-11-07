'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface PurposeOption {
  value: string;
  label: string;
  icon: string;
  description: string;
}

const PURPOSES: PurposeOption[] = [
  {
    value: 'General Support',
    label: 'Where Most Needed',
    icon: 'fa-globe-africa',
    description: 'Flexible funding deployed where NPC Rwanda needs it most.',
  },
  {
    value: 'Athlete Development',
    label: 'Athlete Development',
    icon: 'fa-running',
    description: 'Specialized coaching, training clinics, nutrition, and welfare.',
  },
  {
    value: 'Sports Equipment',
    label: 'Sports Equipment',
    icon: 'fa-wheelchair',
    description: 'Adaptive wheelchairs, goalball gear, sitting volleyball kits.',
  },
  {
    value: 'Competition Participation',
    label: 'Competitions & Travel',
    icon: 'fa-medal',
    description: 'Funding travel, accommodation, and entry fees for tournaments.',
  },
  {
    value: 'Youth Para-sports',
    label: 'Youth Grassroots',
    icon: 'fa-child',
    description: 'Pathways for children and young people with disabilities.',
  },
];

const formatMoney = (value: number, currency: 'RWF' | 'USD') =>
  new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-RW', {
    maximumFractionDigits: 0,
  }).format(value);

export default function DonatePage() {
  // Wizard steps: 1: Amount & Cause | 2: Donor Info | 3: Payment
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Donation Parameters — user enters amount directly
  const [currency, setCurrency] = useState<'RWF' | 'USD'>('RWF');
  const [frequency, setFrequency] = useState<'One-time' | 'Monthly'>('One-time');
  const [amountInput, setAmountInput] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('General Support');

  // Donor Details
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [anonymous, setAnonymous] = useState(false);

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money_rwanda' | 'card'>('mobile_money_rwanda');

  // UI & Network State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [exchangeRateDate, setExchangeRateDate] = useState('');
  const [exchangeRateError, setExchangeRateError] = useState('');

  // Fetch exchange rate when USD is selected with Mobile Money
  useEffect(() => {
    if (currency !== 'USD' || paymentMethod !== 'mobile_money_rwanda') {
      setExchangeRate(null);
      setExchangeRateDate('');
      setExchangeRateError('');
      return;
    }
    let active = true;
    fetch('/api/donations/exchange-rate', { cache: 'no-store' })
      .then(async (response) => {
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || 'Exchange rate is unavailable.');
        if (active) {
          setExchangeRate(Number(result.rate));
          setExchangeRateDate(String(result.rateDate || ''));
        }
      })
      .catch((err) => {
        if (active) {
          setExchangeRate(null);
          setExchangeRateError(err instanceof Error ? err.message : 'Exchange rate is unavailable.');
        }
      });
    return () => {
      active = false;
    };
  }, [currency, paymentMethod]);

  // Current entered amount value
  const effectiveAmount = Number(amountInput);

  // Validation handlers for step progression
  const validateStep1 = () => {
    setError('');
    const minAmount = currency === 'USD' ? 1 : 1000;
    if (!amountInput || !Number.isSafeInteger(effectiveAmount) || effectiveAmount < minAmount) {
      setError(
        currency === 'USD'
          ? 'Please enter a donation amount of at least USD 1.'
          : 'Please enter a donation amount of at least RWF 1,000.'
      );
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    setError('');
    if (!name.trim()) {
      setError('Please provide your full name.');
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please provide a valid email address for receipt delivery.');
      return false;
    }
    if (!/^\+?[0-9\s()-]{9,20}$/.test(phone.trim())) {
      setError('Please provide a valid mobile phone number.');
      return false;
    }
    return true;
  };

  const handleNextToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
      window.scrollTo({ top: 320, behavior: 'smooth' });
    }
  };

  const handleNextToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep2()) {
      setStep(3);
      window.scrollTo({ top: 320, behavior: 'smooth' });
    }
  };

  // Final submission to Flutterwave checkout API
  const handleSubmitFinal = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!validateStep1() || !validateStep2()) return;

    if (currency === 'USD' && paymentMethod === 'mobile_money_rwanda' && exchangeRate === null) {
      setError('USD to RWF conversion is not available right now. Please choose card payment or try again later.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/donations/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          amount: effectiveAmount,
          currency,
          supportType: purpose,
          frequency,
          anonymous,
          paymentMethod,
        }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not start your payment. Please try again.');
      if (result.checkoutUrl) {
        window.location.assign(result.checkoutUrl);
        return;
      }
      if (result.txRef) {
        window.location.assign(`/donate/confirm?tx_ref=${encodeURIComponent(result.txRef)}`);
        return;
      }
      throw new Error('Payment was not started. Please try again.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const selectedPurposeObj = PURPOSES.find((p) => p.value === purpose) || PURPOSES[0];

  return (
    <main id="main-content" className="npc-donation-page">
      {/* ── Hero Banner ── */}
      <section className="donation-hero">
        <div className="container position-relative">
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link href="/">Home</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Donate
              </li>
            </ol>
          </nav>
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <span className="donation-eyebrow">
                <i className="fas fa-heart me-2" aria-hidden="true" />
                POWER INCLUSIVE SPORT
              </span>
              <h1>Empower Rwanda&apos;s Para-Athletes</h1>
              <p className="donation-hero-copy">
                Your support equips champions, builds grassroots academies, and proves that disability is never an
                inability. 100% of public gifts go directly into sports programmes.
              </p>
              <div className="d-flex flex-wrap gap-2 gap-sm-3 mt-3">
                <span className="donation-trust-badge">
                  <i className="fas fa-shield-alt me-2 text-warning" aria-hidden="true" />
                  Bank-Grade Encryption
                </span>
                <span className="donation-trust-badge">
                  <i className="fas fa-mobile-alt me-2 text-warning" aria-hidden="true" />
                  MTN MoMo, Airtel & Cards
                </span>
                <span className="donation-trust-badge">
                  <i className="fas fa-file-invoice me-2 text-warning" aria-hidden="true" />
                  Instant Tax Receipt
                </span>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="donation-impact-card">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="impact-icon">
                    <i className="fas fa-trophy" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="impact-kicker">NPC RWANDA INITIATIVE</span>
                    <h3 className="h5 text-white mb-0 fw-bold">From Grassroots to Paralympics</h3>
                  </div>
                </div>
                <p className="small text-white-50 mb-3">
                  Rwanda&apos;s National Paralympic Committee develops high-performing athletes representing our nation
                  globally in Sitting Volleyball, Para-Athletics, Wheelchair Basketball, and Para-Powerlifting.
                </p>
                <div className="impact-metrics-row">
                  <div>
                    <strong>1,200+</strong>
                    <small>Active Athletes</small>
                  </div>
                  <div className="divider" />
                  <div>
                    <strong>30</strong>
                    <small>Districts Covered</small>
                  </div>
                  <div className="divider" />
                  <div>
                    <strong>100%</strong>
                    <small>Direct Impact</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Donation Streamlined Wizard ── */}
      <section className="donation-main-section">
        <div className="container">
          <div className="row g-4 g-xl-5 align-items-start justify-content-center">
            {/* ── Form Column ── */}
            <div className="col-lg-8 col-xl-7">
              <div className="donation-wizard-card">
                {/* ── Wizard Progress Bar ── */}
                <div className="wizard-progress-header">
                  <div className="steps-indicator">
                    <button
                      type="button"
                      className={`step-btn ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}
                      onClick={() => setStep(1)}
                    >
                      <span className="step-num">{step > 1 ? <i className="fas fa-check" /> : '1'}</span>
                      <span className="step-title">Your Gift</span>
                    </button>
                    <div className={`step-connector ${step > 1 ? 'completed' : ''}`} />
                    <button
                      type="button"
                      className={`step-btn ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}
                      onClick={() => {
                        if (validateStep1()) setStep(2);
                      }}
                    >
                      <span className="step-num">{step > 2 ? <i className="fas fa-check" /> : '2'}</span>
                      <span className="step-title">Your Details</span>
                    </button>
                    <div className={`step-connector ${step > 2 ? 'completed' : ''}`} />
                    <button
                      type="button"
                      className={`step-btn ${step === 3 ? 'active' : ''}`}
                      onClick={() => {
                        if (validateStep1() && validateStep2()) setStep(3);
                      }}
                    >
                      <span className="step-num">3</span>
                      <span className="step-title">Payment</span>
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center gap-2 mb-4" role="alert">
                    <i className="fas fa-exclamation-circle flex-shrink-0" />
                    <div className="small fw-semibold">{error}</div>
                  </div>
                )}

                {/* ═══════════════════════════════════════════════
                    STEP 1: AMOUNT INPUT & CAUSE
                   ═══════════════════════════════════════════════ */}
                {step === 1 && (
                  <form onSubmit={handleNextToStep2} className="wizard-step-content">
                    {/* Frequency & Currency Pill Selectors */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
                      {/* Frequency Toggle */}
                      <div className="frequency-pills">
                        <button
                          type="button"
                          className={`pill-btn ${frequency === 'One-time' ? 'active' : ''}`}
                          onClick={() => setFrequency('One-time')}
                        >
                          Give Once
                        </button>
                        <button
                          type="button"
                          className={`pill-btn ${frequency === 'Monthly' ? 'active' : ''}`}
                          onClick={() => setFrequency('Monthly')}
                        >
                          <i className="fas fa-sync-alt me-1 text-warning" /> Monthly
                        </button>
                      </div>

                      {/* Currency Toggle */}
                      <div className="currency-selector">
                        <button
                          type="button"
                          className={`currency-btn ${currency === 'RWF' ? 'active' : ''}`}
                          onClick={() => setCurrency('RWF')}
                        >
                          🇷🇼 RWF
                        </button>
                        <button
                          type="button"
                          className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
                          onClick={() => setCurrency('USD')}
                        >
                          🇺🇸 USD ($)
                        </button>
                      </div>
                    </div>

                    {/* Direct Amount Input Card */}
                    <div className="amount-input-card mb-4">
                      <label htmlFor="donationAmountInput" className="amount-input-label">
                        Enter Contribution Amount ({currency})
                      </label>
                      <div className="amount-input-wrapper">
                        <span className="currency-badge">{currency}</span>
                        <input
                          id="donationAmountInput"
                          type="number"
                          min={currency === 'USD' ? 1 : 1000}
                          step="1"
                          inputMode="numeric"
                          autoFocus
                          className="form-control amount-large-input"
                          placeholder={currency === 'USD' ? 'e.g. 50' : 'e.g. 20,000'}
                          value={amountInput}
                          onChange={(e) => setAmountInput(e.target.value)}
                        />
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-2 px-1">
                        <small className="text-muted">
                          Minimum: {currency === 'USD' ? 'USD 1' : 'RWF 1,000'}
                        </small>
                        {Number.isFinite(effectiveAmount) && effectiveAmount > 0 && (
                          <span className="amount-preview-pill">
                            {currency} {formatMoney(effectiveAmount, currency)} {frequency === 'Monthly' ? '/ mo' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Purpose / Cause Selector */}
                    <div className="mt-4">
                      <label className="section-subheading mb-2">Designate Your Contribution</label>
                      <div className="purpose-grid">
                        {PURPOSES.map((item) => {
                          const isSelected = purpose === item.value;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              className={`purpose-card ${isSelected ? 'selected' : ''}`}
                              onClick={() => setPurpose(item.value)}
                            >
                              <div className="purpose-icon">
                                <i className={`fas ${item.icon}`} aria-hidden="true" />
                              </div>
                              <div className="purpose-info">
                                <strong>{item.label}</strong>
                                <small>{item.description}</small>
                              </div>
                              <div className="purpose-check">
                                {isSelected ? <i className="fas fa-check-circle" /> : <span className="circle" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 1 Footer Action */}
                    <div className="wizard-actions mt-4 pt-3 border-top">
                      <button type="submit" className="btn btn-primary btn-lg w-100 wizard-btn">
                        Continue to Your Details <i className="fas fa-arrow-right ms-2" />
                      </button>
                    </div>
                  </form>
                )}

                {/* ═══════════════════════════════════════════════
                    STEP 2: DONOR DETAILS
                   ═══════════════════════════════════════════════ */}
                {step === 2 && (
                  <form onSubmit={handleNextToStep3} className="wizard-step-content">
                    <div className="step-intro mb-4">
                      <h4 className="fw-bold mb-1">Donor Information</h4>
                      <p className="text-muted small mb-0">
                        We need this to generate your official donation receipt and verify payment.
                      </p>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-12">
                        <label htmlFor="donorFullName" className="form-label small fw-bold">
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light text-muted">
                            <i className="far fa-user" />
                          </span>
                          <input
                            id="donorFullName"
                            type="text"
                            required
                            autoFocus
                            autoComplete="name"
                            maxLength={120}
                            className="form-control"
                            placeholder="e.g. Jean Damascene Uwimana"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="donorEmailAddr" className="form-label small fw-bold">
                          Email Address <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light text-muted">
                            <i className="far fa-envelope" />
                          </span>
                          <input
                            id="donorEmailAddr"
                            type="email"
                            required
                            autoComplete="email"
                            maxLength={254}
                            className="form-control"
                            placeholder="you@domain.rw"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>
                        <small className="text-muted">Your receipt will be delivered here.</small>
                      </div>

                      <div className="col-md-6">
                        <label htmlFor="donorPhoneNum" className="form-label small fw-bold">
                          Mobile Phone <span className="text-danger">*</span>
                        </label>
                        <div className="input-group">
                          <span className="input-group-text bg-light text-muted">
                            <i className="fas fa-phone-alt" />
                          </span>
                          <input
                            id="donorPhoneNum"
                            type="tel"
                            required
                            autoComplete="tel"
                            maxLength={20}
                            className="form-control"
                            placeholder="+250 78X XXX XXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                          />
                        </div>
                        <small className="text-muted">Used for Mobile Money authorization prompt.</small>
                      </div>

                      <div className="col-12 mt-3">
                        <label className="anonymous-toggle-box">
                          <input
                            type="checkbox"
                            checked={anonymous}
                            onChange={(e) => setAnonymous(e.target.checked)}
                          />
                          <div className="toggle-copy">
                            <strong>Make this an anonymous gift</strong>
                            <small className="text-muted d-block">
                              We won&apos;t display your name in public reports or donor appreciation lists.
                            </small>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Step 2 Actions */}
                    <div className="wizard-actions pt-3 border-top d-flex gap-3">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-lg flex-grow-1"
                        onClick={() => setStep(1)}
                      >
                        <i className="fas fa-arrow-left me-2" /> Back
                      </button>
                      <button type="submit" className="btn btn-primary btn-lg flex-grow-2 wizard-btn">
                        Proceed to Payment <i className="fas fa-arrow-right ms-2" />
                      </button>
                    </div>
                  </form>
                )}

                {/* ═══════════════════════════════════════════════
                    STEP 3: PAYMENT METHOD & CHECKOUT
                   ═══════════════════════════════════════════════ */}
                {step === 3 && (
                  <form onSubmit={handleSubmitFinal} className="wizard-step-content">
                    {/* Order Summary Recap Card */}
                    <div className="summary-recap-card mb-4">
                      <div className="summary-row">
                        <span className="label">Amount:</span>
                        <span className="value fw-bold text-dark">
                          {currency} {formatMoney(effectiveAmount, currency)} ({frequency})
                        </span>
                      </div>
                      <div className="summary-row">
                        <span className="label">Designation:</span>
                        <span className="value text-primary fw-semibold">{selectedPurposeObj.label}</span>
                      </div>
                      <div className="summary-row">
                        <span className="label">Donor:</span>
                        <span className="value">{anonymous ? `${name} (Anonymous public)` : name}</span>
                      </div>
                    </div>

                    {/* Select Payment Method */}
                    <label className="section-subheading mb-3">Choose Payment Method</label>
                    <div className="row g-3 mb-4">
                      <div className="col-sm-6">
                        <button
                          type="button"
                          className={`payment-channel-btn ${paymentMethod === 'mobile_money_rwanda' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('mobile_money_rwanda')}
                        >
                          <div className="channel-icon momo">
                            <i className="fas fa-mobile-alt" />
                          </div>
                          <div className="channel-text">
                            <strong>Mobile Money</strong>
                            <small>MTN MoMo & Airtel Money</small>
                          </div>
                          <div className="channel-badge">Instant</div>
                        </button>
                      </div>

                      <div className="col-sm-6">
                        <button
                          type="button"
                          className={`payment-channel-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                          onClick={() => setPaymentMethod('card')}
                        >
                          <div className="channel-icon card">
                            <i className="far fa-credit-card" />
                          </div>
                          <div className="channel-text">
                            <strong>Bank Card</strong>
                            <small>Visa, Mastercard & Amex</small>
                          </div>
                          <div className="channel-badge">Worldwide</div>
                        </button>
                      </div>
                    </div>

                    {/* USD Mobile Money Exchange Rate Notice */}
                    {currency === 'USD' && paymentMethod === 'mobile_money_rwanda' && (
                      <div className="exchange-rate-banner mb-4">
                        <i className="fas fa-info-circle text-info me-2" />
                        {exchangeRate !== null ? (
                          <span>
                            Conversion: <strong>RWF {formatMoney(Math.ceil(effectiveAmount * exchangeRate), 'RWF')}</strong>{' '}
                            (Rate: 1 USD = {exchangeRate.toLocaleString('en-US')} RWF · {exchangeRateDate})
                          </span>
                        ) : (
                          <span className="text-muted">{exchangeRateError || 'Fetching current conversion rate...'}</span>
                        )}
                      </div>
                    )}

                    {/* Security Trust Callout */}
                    <div className="security-notice mb-4">
                      <i className="fas fa-lock text-success me-2" />
                      <span>
                        Secure transaction processed by <strong>Flutterwave</strong>. Your payment credentials are never
                        stored on NPC Rwanda servers.
                      </span>
                    </div>

                    {/* Step 3 Actions */}
                    <div className="wizard-actions pt-3 border-top d-flex gap-3">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-lg flex-grow-1"
                        disabled={loading}
                        onClick={() => setStep(2)}
                      >
                        <i className="fas fa-arrow-left me-2" /> Back
                      </button>
                      <button
                        type="submit"
                        className="btn btn-success btn-lg flex-grow-2 wizard-btn checkout-btn"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" />
                            Connecting to Gateway...
                          </>
                        ) : (
                          <>
                            Complete Donation ({currency} {formatMoney(effectiveAmount, currency)}){' '}
                            <i className="fas fa-lock ms-2" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* ── Side Impact & Assistance Column ── */}
            <aside className="col-lg-4 col-xl-5">
              <div className="donation-side-card mb-4">
                <span className="side-eyebrow">YOUR IMPACT MATTERS</span>
                <h3>Why Give to NPC Rwanda?</h3>
                <p className="text-muted small">
                  Sport is a powerful vehicle for inclusion, personal dignity, and social change for persons with
                  disabilities across Rwanda.
                </p>

                <div className="side-benefits-list">
                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <i className="fas fa-wheelchair" />
                    </div>
                    <div>
                      <strong>Adaptive Equipment</strong>
                      <small>Competition wheelchairs, prosthetic attachments, balls with audio bells.</small>
                    </div>
                  </div>

                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <i className="fas fa-user-graduate" />
                    </div>
                    <div>
                      <strong>Coaching & Classification</strong>
                      <small>Certified classifiers and professional coaches throughout Rwanda&apos;s districts.</small>
                    </div>
                  </div>

                  <div className="benefit-item">
                    <div className="benefit-icon">
                      <i className="fas fa-flag" />
                    </div>
                    <div>
                      <strong>Representing Rwanda</strong>
                      <small>Paralympic Games, African Championships, and World Para Volleyball qualifiers.</small>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assistance Box */}
              <div className="donation-help-card">
                <h4 className="h6 fw-bold mb-2">Corporate & Direct Inquiries</h4>
                <p className="small text-muted mb-3">
                  Interested in corporate sponsorship, CSR partnerships, or donating equipment?
                </p>
                <Link href="/contact" className="btn btn-sm btn-outline-primary fw-semibold">
                  Contact NPC Rwanda Office <i className="fas fa-arrow-right ms-1" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ── Component Scoped Styles ── */}
      <style jsx>{`
        .npc-donation-page {
          background: #f4f6fa;
          color: #17243a;
          min-height: 100vh;
        }

        /* Hero */
        .donation-hero {
          position: relative;
          overflow: hidden;
          padding: 40px 0 60px;
          background: linear-gradient(130deg, #071e3d 0%, #0b4e87 55%, #087c82 100%);
          color: #fff;
        }
        .donation-hero:after {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.08);
          right: -100px;
          top: -200px;
          pointer-events: none;
        }
        .donation-hero .breadcrumb a,
        .donation-hero .breadcrumb-item {
          color: rgba(255, 255, 255, 0.72);
          font-size: 0.85rem;
        }
        .donation-hero .breadcrumb-item.active {
          color: #fff;
        }
        .donation-eyebrow {
          display: inline-block;
          font-size: 0.75rem;
          letter-spacing: 0.12em;
          font-weight: 800;
          color: #f2c94c;
          margin-bottom: 8px;
        }
        .donation-hero h1 {
          font-size: clamp(2.1rem, 4vw, 3.2rem);
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 14px;
        }
        .donation-hero-copy {
          font-size: 1.05rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.85);
          max-width: 600px;
        }
        .donation-trust-badge {
          font-size: 0.8rem;
          color: #fff;
          background: rgba(255, 255, 255, 0.12);
          padding: 7px 13px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 20px;
          backdrop-filter: blur(4px);
        }

        /* Impact Card in Hero */
        .donation-impact-card {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 18px;
          padding: 24px;
          backdrop-filter: blur(8px);
        }
        .impact-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #f2c94c;
          color: #071e3d;
          display: grid;
          place-items: center;
          font-size: 1.25rem;
          flex-shrink: 0;
        }
        .impact-kicker {
          font-size: 0.65rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #f2c94c;
          display: block;
        }
        .impact-metrics-row {
          display: flex;
          align-items: center;
          justify-content: space-around;
          background: rgba(0, 0, 0, 0.18);
          padding: 12px;
          border-radius: 12px;
          text-align: center;
        }
        .impact-metrics-row strong {
          display: block;
          font-size: 1.15rem;
          color: #fff;
        }
        .impact-metrics-row small {
          font-size: 0.72rem;
          color: rgba(255, 255, 255, 0.7);
        }
        .impact-metrics-row .divider {
          width: 1px;
          height: 24px;
          background: rgba(255, 255, 255, 0.2);
        }

        /* Main Section */
        .donation-main-section {
          padding: 40px 0 80px;
        }

        /* Wizard Card */
        .donation-wizard-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(15, 30, 60, 0.05);
          padding: clamp(20px, 3.5vw, 36px);
        }

        /* Wizard Steps Progress */
        .wizard-progress-header {
          margin-bottom: 28px;
          padding-bottom: 20px;
          border-bottom: 1px solid #edf2f7;
        }
        .steps-indicator {
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }
        .step-btn {
          background: none;
          border: none;
          padding: 0;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          position: relative;
          z-index: 2;
        }
        .step-num {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-weight: 700;
          font-size: 0.85rem;
          background: #edf2f7;
          color: #64748b;
          transition: all 0.2s ease;
        }
        .step-btn.active .step-num {
          background: #0b5f9f;
          color: #fff;
          box-shadow: 0 0 0 4px rgba(11, 95, 159, 0.2);
        }
        .step-btn.completed .step-num {
          background: #10b981;
          color: #fff;
        }
        .step-title {
          font-size: 0.88rem;
          font-weight: 600;
          color: #64748b;
        }
        .step-btn.active .step-title {
          color: #0b5f9f;
          font-weight: 700;
        }
        .step-connector {
          flex: 1;
          height: 3px;
          background: #e2e8f0;
          margin: 0 12px;
          border-radius: 2px;
          transition: background 0.3s ease;
        }
        .step-connector.completed {
          background: #10b981;
        }

        /* Pill selectors */
        .frequency-pills,
        .currency-selector {
          display: inline-flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 12px;
        }
        .pill-btn,
        .currency-btn {
          border: none;
          background: none;
          padding: 7px 16px;
          border-radius: 9px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.18s;
        }
        .pill-btn.active,
        .currency-btn.active {
          background: #ffffff;
          color: #0b5f9f;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
          font-weight: 700;
        }

        .section-subheading {
          font-size: 0.92rem;
          font-weight: 700;
          color: #1e293b;
          display: block;
        }

        /* Direct Amount Input Card */
        .amount-input-card {
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 16px;
          padding: 20px;
          transition: border-color 0.2s ease;
        }
        .amount-input-card:focus-within {
          border-color: #0b5f9f;
          background: #ffffff;
          box-shadow: 0 4px 14px rgba(11, 95, 159, 0.06);
        }
        .amount-input-label {
          font-size: 0.95rem;
          font-weight: 700;
          color: #0f172a;
          display: block;
          margin-bottom: 12px;
        }
        .amount-input-wrapper {
          display: flex;
          align-items: stretch;
          background: #ffffff;
          border: 2px solid #cbd5e1;
          border-radius: 12px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .amount-input-wrapper:focus-within {
          border-color: #0b5f9f;
          box-shadow: 0 0 0 3px rgba(11, 95, 159, 0.12);
        }
        .currency-badge {
          background: #edf2f7;
          color: #1e293b;
          font-weight: 800;
          font-size: 1.05rem;
          padding: 0 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-right: 1.5px solid #cbd5e1;
        }
        .amount-large-input {
          border: none;
          outline: none;
          font-size: 1.35rem;
          font-weight: 800;
          color: #0f172a;
          padding: 12px 16px;
          width: 100%;
        }
        .amount-large-input:focus {
          border: none;
          box-shadow: none;
        }
        .amount-preview-pill {
          background: #eff6ff;
          color: #0b5f9f;
          font-weight: 700;
          font-size: 0.85rem;
          padding: 4px 10px;
          border-radius: 20px;
        }

        /* Purpose Grid */
        .purpose-grid {
          display: grid;
          gap: 8px;
        }
        .purpose-card {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          background: #fff;
          cursor: pointer;
          text-align: left;
          transition: all 0.16s;
        }
        .purpose-card:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }
        .purpose-card.selected {
          border-color: #0b5f9f;
          background: #eff6ff;
        }
        .purpose-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: #f1f5f9;
          color: #0b5f9f;
          display: grid;
          place-items: center;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .purpose-card.selected .purpose-icon {
          background: #0b5f9f;
          color: #fff;
        }
        .purpose-info {
          flex: 1;
        }
        .purpose-info strong {
          display: block;
          font-size: 0.9rem;
          color: #0f172a;
        }
        .purpose-info small {
          font-size: 0.77rem;
          color: #64748b;
          display: block;
          line-height: 1.35;
        }
        .purpose-check {
          color: #0b5f9f;
          font-size: 1.1rem;
        }
        .purpose-check .circle {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 1.5px solid #cbd5e1;
          border-radius: 50%;
        }

        /* Anonymous Toggle Box */
        .anonymous-toggle-box {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          cursor: pointer;
        }
        .anonymous-toggle-box input {
          margin-top: 3px;
          width: 18px;
          height: 18px;
          accent-color: #0b5f9f;
        }
        .toggle-copy strong {
          font-size: 0.9rem;
          color: #1e293b;
        }

        /* Payment Channel Buttons */
        .payment-channel-btn {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          padding: 14px;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          background: #fff;
          cursor: pointer;
          position: relative;
          transition: all 0.16s;
        }
        .payment-channel-btn:hover {
          border-color: #cbd5e1;
          background: #f8fafc;
        }
        .payment-channel-btn.active {
          border-color: #0b5f9f;
          background: #eff6ff;
          box-shadow: 0 0 0 1px #0b5f9f;
        }
        .channel-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          font-size: 1.15rem;
          margin-bottom: 10px;
        }
        .channel-icon.momo {
          background: #fef08a;
          color: #854d0e;
        }
        .channel-icon.card {
          background: #e0f2fe;
          color: #0369a1;
        }
        .channel-text strong {
          display: block;
          font-size: 0.92rem;
          color: #0f172a;
        }
        .channel-text small {
          font-size: 0.75rem;
          color: #64748b;
        }
        .channel-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          font-size: 0.68rem;
          font-weight: 700;
          background: #f1f5f9;
          color: #475569;
          padding: 3px 8px;
          border-radius: 6px;
        }
        .payment-channel-btn.active .channel-badge {
          background: #dbeafe;
          color: #1e40af;
        }

        /* Summary Recap in Step 3 */
        .summary-recap-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.88rem;
          padding: 4px 0;
        }
        .summary-row .label {
          color: #64748b;
        }

        .exchange-rate-banner {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.85rem;
          color: #1e40af;
        }

        .security-notice {
          font-size: 0.82rem;
          color: #64748b;
          line-height: 1.5;
        }

        /* Buttons & Wizard Actions */
        .wizard-btn {
          font-weight: 700;
          font-size: 0.95rem;
          padding: 12px 24px;
          border-radius: 10px;
        }
        .checkout-btn {
          background: #059669;
          border-color: #059669;
        }
        .checkout-btn:hover {
          background: #047857;
          border-color: #047857;
        }
        .flex-grow-2 {
          flex-grow: 2;
        }

        /* Sidebar Elements */
        .donation-side-card,
        .donation-help-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 24px;
        }
        .side-eyebrow {
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: #0b5f9f;
          display: block;
          margin-bottom: 6px;
        }
        .donation-side-card h3 {
          font-size: 1.35rem;
          font-weight: 800;
          margin-bottom: 8px;
        }
        .side-benefits-list {
          display: grid;
          gap: 16px;
          margin-top: 20px;
        }
        .benefit-item {
          display: flex;
          gap: 12px;
        }
        .benefit-icon {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #eff6ff;
          color: #0b5f9f;
          display: grid;
          place-items: center;
          font-size: 1rem;
          flex-shrink: 0;
        }
        .benefit-item strong {
          display: block;
          font-size: 0.9rem;
          color: #0f172a;
        }
        .benefit-item small {
          font-size: 0.8rem;
          color: #64748b;
          line-height: 1.4;
          display: block;
        }

        .donation-help-card {
          background: #f8fafc;
        }

        @media (max-width: 575px) {
          .step-title {
            display: none;
          }
          .wizard-progress-header {
            margin-bottom: 20px;
          }
          .donation-wizard-card {
            border-radius: 16px;
          }
        }
      `}</style>
    </main>
  );
}
