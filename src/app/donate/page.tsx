'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const PURPOSES = [
  { value: 'General Support', label: 'Where it is needed most', description: 'Support NPC Rwanda programmes and priorities.' },
  { value: 'Athlete Development', label: 'Athlete development', description: 'Coaching, training and athlete welfare.' },
  { value: 'Sports Equipment', label: 'Sports equipment', description: 'Adaptive and sport-specific equipment.' },
  { value: 'Competition Participation', label: 'Competition participation', description: 'Help athletes compete locally and internationally.' },
  { value: 'Youth Para-sports', label: 'Youth para-sports', description: 'Create pathways for young people with disabilities.' },
];

const money = (value: number, currency: 'RWF' | 'USD') => new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-RW', { maximumFractionDigits: 0 }).format(value);

export default function DonatePage() {
  const [customAmount, setCustomAmount] = useState('');
  const [currency, setCurrency] = useState<'RWF' | 'USD'>('RWF');
  const [purpose, setPurpose] = useState('General Support');
  const [paymentMethod, setPaymentMethod] = useState<'mobile_money_rwanda' | 'card'>('mobile_money_rwanda');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [exchangeRateDate, setExchangeRateDate] = useState('');
  const [exchangeRateError, setExchangeRateError] = useState('');

  const selectedAmount = Number(customAmount);

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
        if (active) { setExchangeRate(Number(result.rate)); setExchangeRateDate(String(result.rateDate || '')); }
      })
      .catch((err) => { if (active) { setExchangeRate(null); setExchangeRateError(err instanceof Error ? err.message : 'Exchange rate is unavailable.'); } });
    return () => { active = false; };
  }, [currency, paymentMethod]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    if (!Number.isSafeInteger(selectedAmount) || selectedAmount < (currency === 'USD' ? 1 : 1000)) {
      setError(currency === 'USD' ? 'Please enter at least USD 1.' : 'Please enter an amount of at least RWF 1,000.');
      return;
    }
    if (currency === 'USD' && paymentMethod === 'mobile_money_rwanda' && exchangeRate === null) {
      setError('USD to RWF conversion is not available right now. Please choose card or try again later.');
      return;
    }
    if (!/^\+?[0-9\s()-]{9,20}$/.test(phone.trim())) {
      setError('Enter a valid mobile phone number, including the country code if needed.');
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
          amount: selectedAmount,
          currency,
          supportType: purpose,
          frequency: 'One-time',
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
  }

  return (
    <main id="main-content" className="npc-donation-page">
      <section className="donation-hero">
        <div className="container position-relative">
          <nav aria-label="breadcrumb" className="mb-4">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item"><Link href="/">Home</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Donate</li>
            </ol>
          </nav>
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <span className="donation-eyebrow"><i className="fas fa-heart me-2" aria-hidden="true" />MAKE A DIFFERENCE</span>
              <h1>Every athlete deserves a chance to shine.</h1>
              <p className="donation-hero-copy">Your contribution helps persons with disabilities access sport, build confidence and represent Rwanda with pride.</p>
              <div className="d-flex flex-wrap gap-3 mt-4">
                <span className="donation-trust"><i className="fas fa-lock me-2" aria-hidden="true" />Secure checkout</span>
                <span className="donation-trust"><i className="fas fa-mobile-alt me-2" aria-hidden="true" />Mobile money & cards</span>
                <span className="donation-trust"><i className="fas fa-receipt me-2" aria-hidden="true" />Payment confirmation</span>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="donation-impact-card">
                <div className="impact-icon"><i className="fas fa-medal" aria-hidden="true" /></div>
                <p className="impact-kicker">YOUR SUPPORT MATTERS</p>
                <h2>Help build a more inclusive sporting future.</h2>
                <p className="mb-0">From grassroots participation to high-performance competition, every gift helps open doors.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="donation-main-section">
        <div className="container">
          <div className="row g-4 g-xl-5 align-items-start">
            <div className="col-lg-7">
              <div className="donation-form-card">
                <div className="donation-card-heading">
                  <div>
                    <span className="donation-step">YOUR CONTRIBUTION</span>
                    <h2>Make a donation</h2>
                    <p>Enter the amount you would like to contribute and complete your secure payment.</p>
                  </div>
                  <span className="donation-currency">{currency}</span>
                </div>

                {error && <div className="alert alert-danger" role="alert" aria-live="assertive">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <fieldset className="mb-4">
                    <legend className="donation-label">1. Enter your donation amount</legend>
                    <label htmlFor="donationCurrency" className="form-label small fw-semibold">Donation currency</label>
                    <select id="donationCurrency" className="form-select mb-3" value={currency} onChange={(event) => setCurrency(event.target.value as 'RWF' | 'USD')}><option value="RWF">Rwandan Franc (RWF)</option><option value="USD">US Dollar (USD)</option></select>
                    <label htmlFor="customAmount" className="form-label small fw-semibold">How much would you like to contribute?</label>
                    <div className="input-group donation-custom-amount">
                      <span className="input-group-text">{currency}</span>
                      <input id="customAmount" type="number" min={currency === 'USD' ? 1 : 1000} step="1" inputMode="numeric" className="form-control" placeholder="Enter any amount" value={customAmount} onChange={(event) => setCustomAmount(event.target.value)} />
                    </div>
                    <small className="text-muted d-block">Minimum donation: {currency === 'USD' ? 'USD 1' : 'RWF 1,000'}.</small>
                    {currency === 'USD' && paymentMethod === 'mobile_money_rwanda' && (
                      <div className="small mt-2" aria-live="polite">
                        {exchangeRate !== null ? <span>Estimated mobile-money charge: <strong>RWF {money(Math.ceil((Number.isFinite(selectedAmount) ? selectedAmount : 0) * exchangeRate), 'RWF')}</strong> · Rate: 1 USD = {exchangeRate.toLocaleString('en-US')} RWF · Updated {exchangeRateDate}</span> : <span className="text-muted">{exchangeRateError || 'Loading the current conversion rate…'}</span>}
                      </div>
                    )}
                  </fieldset>

                  <fieldset className="mb-4">
                    <legend className="donation-label">2. Choose what to support</legend>
                    <div className="donation-purpose-list">
                      {PURPOSES.map((item) => (
                        <label key={item.value} className={`donation-purpose-option ${purpose === item.value ? 'selected' : ''}`}>
                          <input type="radio" name="purpose" value={item.value} checked={purpose === item.value} onChange={() => setPurpose(item.value)} />
                          <span className="purpose-radio" aria-hidden="true" />
                          <span className="purpose-copy"><strong>{item.label}</strong><small>{item.description}</small></span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="mb-4">
                    <legend className="donation-label">3. Your details</legend>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label htmlFor="donorName" className="form-label">Full name</label>
                        <input id="donorName" className="form-control form-control-lg" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" autoComplete="name" required maxLength={120} />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="donorEmail" className="form-label">Email address</label>
                        <input id="donorEmail" type="email" className="form-control form-control-lg" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required maxLength={254} />
                      </div>
                      <div className="col-12">
                        <label htmlFor="donorPhone" className="form-label">Mobile phone number</label>
                        <input id="donorPhone" type="tel" className="form-control form-control-lg" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+250 7XX XXX XXX" autoComplete="tel" required maxLength={20} />
                        <small className="text-muted">Use the number linked to your mobile money account when paying by mobile money.</small>
                      </div>
                      <div className="col-12">
                        <label className="donation-anonymous">
                          <input type="checkbox" checked={anonymous} onChange={(event) => setAnonymous(event.target.checked)} />
                          <span>I prefer not to have my name publicly acknowledged.</span>
                        </label>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="mb-4">
                    <legend className="donation-label">4. Select payment method</legend>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className={`donation-payment-option ${paymentMethod === 'mobile_money_rwanda' ? 'selected' : ''} ${currency === 'USD' ? 'disabled' : ''}`}>
                          <input type="radio" name="paymentMethod" value="mobile_money_rwanda" checked={paymentMethod === 'mobile_money_rwanda'} onChange={() => setPaymentMethod('mobile_money_rwanda')} />
                          <span className="payment-method-icon"><i className="fas fa-mobile-alt" aria-hidden="true" /></span>
                          <span><strong>Mobile Money</strong><small>MTN MoMo & Airtel Money · RWF charge</small></span>
                          <i className="fas fa-check-circle payment-selected-icon" aria-hidden="true" />
                        </label>
                      </div>
                      <div className="col-md-6">
                        <label className={`donation-payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}>
                          <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                          <span className="payment-method-icon"><i className="far fa-credit-card" aria-hidden="true" /></span>
                          <span><strong>Bank card</strong><small>Visa & Mastercard · Pay in RWF or USD</small></span>
                          <i className="fas fa-check-circle payment-selected-icon" aria-hidden="true" />
                        </label>
                      </div>
                    </div>
                  </fieldset>

                  <div className="donation-total-row">
                    <span>Your donation</span>
                    <strong>{currency} {money(Number.isFinite(selectedAmount) ? selectedAmount : 0, currency)}</strong>
                  </div>
                  <button type="submit" className="btn donation-submit-btn w-100" disabled={loading}>
                    {loading ? <><span className="spinner-border spinner-border-sm me-2" role="status" />Connecting securely...</> : <>Continue to secure payment <i className="fas fa-arrow-right ms-2" aria-hidden="true" /></>}
                  </button>
                  <p className="donation-legal"><i className="fas fa-shield-alt me-1" aria-hidden="true" /> Your payment is processed by Flutterwave. NPC Rwanda does not collect or store your card details.</p>
                </form>
              </div>
            </div>

            <aside className="col-lg-5">
              <div className="donation-side-card">
                <span className="donation-step">WHY GIVE?</span>
                <h2>Sport changes lives.</h2>
                <p>Support helps NPC Rwanda strengthen opportunities for persons with disabilities through sport.</p>
                <div className="donation-benefit"><span><i className="fas fa-running" aria-hidden="true" /></span><div><strong>Develop talent</strong><small>Support coaching and athlete pathways.</small></div></div>
                <div className="donation-benefit"><span><i className="fas fa-wheelchair" aria-hidden="true" /></span><div><strong>Improve access</strong><small>Help provide adaptive sports equipment.</small></div></div>
                <div className="donation-benefit"><span><i className="fas fa-flag" aria-hidden="true" /></span><div><strong>Represent Rwanda</strong><small>Help athletes reach competitions and new opportunities.</small></div></div>
              </div>
              <div className="donation-help-card">
                <h3>Need help with your donation?</h3>
                <p>For corporate partnerships, equipment donations or assistance with payment, contact the NPC Rwanda team.</p>
                <Link href="/contact" className="donation-contact-link">Contact NPC Rwanda <i className="fas fa-arrow-right ms-1" aria-hidden="true" /></Link>
              </div>
              <p className="donation-payment-note"><i className="fas fa-lock me-2" aria-hidden="true" />Secure payment handled by Flutterwave. Your donation is recorded only after payment verification.</p>
            </aside>
          </div>
        </div>
      </section>

      <style jsx>{`
        .npc-donation-page{background:#f5f7fb;color:#17243a}
        .donation-hero{position:relative;overflow:hidden;padding:46px 0 70px;background:linear-gradient(120deg,#071e3d 0%,#0b4e87 60%,#087c82 100%);color:#fff}
        .donation-hero:after{content:"";position:absolute;width:460px;height:460px;border:1px solid rgba(255,255,255,.12);border-radius:50%;right:-120px;top:-230px;box-shadow:0 0 0 55px rgba(255,255,255,.035),0 0 0 110px rgba(255,255,255,.025);pointer-events:none}
        .donation-hero .breadcrumb a,.donation-hero .breadcrumb-item{color:rgba(255,255,255,.72)}
        .donation-hero .breadcrumb-item.active{color:#fff}
        .donation-eyebrow,.donation-step{font-size:.72rem;letter-spacing:.14em;font-weight:800;color:#f2c94c}
        .donation-hero h1{font-size:clamp(2.35rem,5vw,4.25rem);font-weight:800;line-height:1.08;max-width:700px;margin:18px 0}
        .donation-hero-copy{font-size:1.1rem;line-height:1.7;color:rgba(255,255,255,.82);max-width:620px}
        .donation-trust{font-size:.83rem;color:#fff;background:rgba(255,255,255,.1);padding:9px 13px;border:1px solid rgba(255,255,255,.16);border-radius:30px}
        .donation-impact-card{position:relative;z-index:1;padding:30px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:22px;backdrop-filter:blur(8px)}
        .impact-icon{width:52px;height:52px;border-radius:15px;background:#f2c94c;color:#08284b;display:grid;place-items:center;font-size:1.35rem;margin-bottom:22px}
        .impact-kicker{font-size:.7rem;font-weight:800;letter-spacing:.13em;color:#f2c94c;margin-bottom:8px}
        .donation-impact-card h2{font-size:1.7rem;font-weight:800;line-height:1.25}
        .donation-impact-card p:last-child{color:rgba(255,255,255,.76);line-height:1.7}
        .donation-main-section{padding:54px 0 80px}
        .donation-form-card,.donation-side-card,.donation-help-card{background:#fff;border:1px solid #e5eaf1;border-radius:20px;box-shadow:0 14px 45px rgba(16,42,75,.06)}
        .donation-form-card{padding:clamp(22px,4vw,42px)}
        .donation-card-heading{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px}
        .donation-card-heading h2,.donation-side-card h2{font-size:1.8rem;font-weight:800;margin:7px 0}
        .donation-card-heading p,.donation-side-card>p{color:#69788c;margin:0}
        .donation-currency{background:#edf4fb;color:#0c5794;font-size:.8rem;font-weight:800;padding:8px 12px;border-radius:9px}
        .donation-label{font-size:1rem;font-weight:800;margin-bottom:14px;color:#17243a}
                .donation-custom-amount .input-group-text{background:#f3f6fa;border-color:#dce4ed;font-weight:700}
        .donation-custom-amount .form-control{border-color:#dce4ed;min-height:48px}
        .donation-purpose-list{display:grid;gap:9px}
        .donation-purpose-option{display:flex;align-items:center;gap:12px;padding:13px 14px;border:1.5px solid #e0e6ee;border-radius:12px;cursor:pointer;transition:.18s}
        .donation-purpose-option.selected{border-color:#0b63a5;background:#f2f8fe}
        .donation-purpose-option input,.donation-payment-option input{position:absolute;opacity:0}
        .purpose-radio{width:18px;height:18px;flex:0 0 18px;border:2px solid #b6c2d0;border-radius:50%;position:relative}
        .selected .purpose-radio{border-color:#0b63a5}
        .selected .purpose-radio:after{content:"";position:absolute;inset:3px;background:#0b63a5;border-radius:50%}
        .purpose-copy strong,.purpose-copy small{display:block}
        .purpose-copy strong{font-size:.91rem}
        .purpose-copy small{font-size:.78rem;color:#718096;margin-top:2px}
        .donation-form-card .form-label{font-weight:700;font-size:.84rem}
        .donation-form-card .form-control{border-color:#dce4ed;border-radius:10px;font-size:.95rem}
        .donation-form-card .form-control:focus{border-color:#0b63a5;box-shadow:0 0 0 .2rem rgba(11,99,165,.12)}
        .donation-anonymous{display:flex;align-items:center;gap:10px;font-size:.86rem;color:#526174;cursor:pointer}
        .donation-anonymous input{width:17px;height:17px;accent-color:#0b63a5}
        .donation-payment-option{height:100%;min-height:82px;position:relative;display:flex;align-items:center;gap:12px;padding:14px;border:1.5px solid #dfe6ee;border-radius:13px;cursor:pointer}
        .donation-payment-option.selected{border-color:#0b63a5;background:#f2f8fe}
        .payment-method-icon{width:42px;height:42px;display:grid;place-items:center;border-radius:11px;background:#edf3f8;color:#0b5790;font-size:1.2rem}
        .donation-payment-option strong,.donation-payment-option small{display:block}
        .donation-payment-option strong{font-size:.9rem}
        .donation-payment-option small{font-size:.75rem;color:#718096;margin-top:3px}
        .payment-selected-icon{margin-left:auto;color:#0b63a5;opacity:0}
        .donation-payment-option.selected .payment-selected-icon{opacity:1}
        .donation-total-row{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #e7ecf2;padding:20px 0 16px;margin-top:8px;color:#526174}
        .donation-total-row strong{font-size:1.35rem;color:#102d4d}
        .donation-submit-btn{background:#0b5f9f;color:#fff;border:0;border-radius:11px;padding:16px;font-weight:800;font-size:1rem;box-shadow:0 7px 18px rgba(11,95,159,.18)}
        .donation-submit-btn:hover{background:#084b7e;color:#fff}
        .donation-submit-btn:disabled{opacity:.7}
        .donation-legal,.donation-payment-note{font-size:.76rem;line-height:1.6;color:#7b8796;text-align:center;margin:14px 0 0}
        .donation-side-card{padding:28px;margin-bottom:18px}
        .donation-side-card h2{font-size:1.65rem}
        .donation-benefit{display:flex;align-items:center;gap:13px;margin-top:22px}
        .donation-benefit>span{width:43px;height:43px;flex:0 0 43px;border-radius:12px;background:#edf5fc;color:#0b5f9f;display:grid;place-items:center;font-size:1.05rem}
        .donation-benefit strong,.donation-benefit small{display:block}
        .donation-benefit strong{font-size:.91rem}
        .donation-benefit small{font-size:.8rem;color:#738195;margin-top:3px}
        .donation-help-card{padding:24px;background:#f0f6fb}
        .donation-help-card h3{font-size:1.1rem;font-weight:800}
        .donation-help-card p{font-size:.87rem;color:#69788c;line-height:1.6}
        .donation-contact-link{font-weight:800;color:#075a96;text-decoration:none}
        .donation-payment-note{text-align:left;padding:0 8px}
        @media(max-width:575px){.donation-hero{padding:30px 0 48px}.donation-main-section{padding:30px 0 48px}.donation-impact-card{padding:22px}.donation-form-card{border-radius:15px}.donation-card-heading h2{font-size:1.5rem}}
        @media(prefers-reduced-motion:reduce){.donation-purpose-option{transition:none}}
      `}</style>
    </main>
  );
}
