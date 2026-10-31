'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

type PaymentState = 'checking' | 'SUCCESSFUL' | 'PENDING' | 'FAILED' | 'ERROR';

export default function DonationConfirmationPage() {
  const [state, setState] = useState<PaymentState>('checking');
  const [message, setMessage] = useState('We are confirming your payment with the payment provider.');
  const [amount, setAmount] = useState<number | null>(null);
  const [currency, setCurrency] = useState('RWF');
  const [donorAmount, setDonorAmount] = useState<number | null>(null);
  const [donorCurrency, setDonorCurrency] = useState('RWF');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [txRef, setTxRef] = useState('');

  const verify = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const reference = params.get('tx_ref') || '';
    const transactionId = params.get('transaction_id') || '';
    const providerStatus = (params.get('status') || '').toLowerCase();
    setTxRef(reference);

    if (providerStatus === 'cancelled' || providerStatus === 'failed') {
      setState('FAILED');
      setMessage('The payment was not completed. You can return to the donation page and try again.');
      return;
    }

    if (!reference) {
      setState('PENDING');
      setMessage('We could not find a payment reference in this return link. If you completed a payment, contact NPC Rwanda with your payment details.');
      return;
    }

    setState('checking');
    try {
      const response = await fetch('/api/donations/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_ref: reference, ...(transactionId ? { transaction_id: transactionId } : {}) }),
        cache: 'no-store',
      });
      const result = await response.json().catch(() => ({}));
      setAmount(typeof result.amount === 'number' ? result.amount : null);
      setCurrency(typeof result.currency === 'string' ? result.currency : 'RWF');
      setDonorAmount(typeof result.donorAmount === 'number' ? result.donorAmount : (typeof result.amount === 'number' ? result.amount : null));
      setDonorCurrency(typeof result.donorCurrency === 'string' ? result.donorCurrency : (typeof result.currency === 'string' ? result.currency : 'RWF'));
      setExchangeRate(typeof result.exchangeRate === 'number' ? result.exchangeRate : null);
      if (result.status === 'SUCCESSFUL') {
        setState('SUCCESSFUL');
        setMessage('Thank you. Your donation payment has been verified and recorded successfully.');
      } else if (result.status === 'FAILED') {
        setState('FAILED');
        setMessage('The payment provider reports that this payment was not completed.');
      } else {
        setState('PENDING');
        setMessage(result.error || 'Your payment is still being processed. Please check again shortly.');
      }
    } catch {
      setState('ERROR');
      setMessage('We could not reach the payment verification service. Your payment may still be processing; please try again.');
    }
  }, []);

  useEffect(() => { void verify(); }, [verify]);

  const successful = state === 'SUCCESSFUL';
  const failed = state === 'FAILED' || state === 'ERROR';

  return (
    <main className="container py-5" style={{ minHeight: '65vh', maxWidth: 720 }}>
      <div className="bg-white border rounded-4 shadow-sm p-4 p-md-5 text-center">
        <div className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle" style={{ width: 76, height: 76, background: successful ? '#e7f6ec' : failed ? '#fff0ef' : '#edf4fb', color: successful ? '#218344' : failed ? '#b42318' : '#17649e', fontSize: 30 }}>
          <i className={successful ? 'fas fa-check' : failed ? 'fas fa-exclamation' : 'fas fa-clock'} aria-hidden="true" />
        </div>
        <p className="text-uppercase fw-bold small mb-2" style={{ letterSpacing: '.12em', color: '#17649e' }}>NPC Rwanda Donations</p>
        <h1 className="h3 fw-bold mb-3">{successful ? 'Donation confirmed' : failed ? 'Payment not confirmed' : 'Confirming your donation'}</h1>
        <p className="text-muted mb-4" role="status" aria-live="polite">{message}</p>
        {amount !== null && successful && (
          <div className="mb-3">
            <p className="h5 fw-bold mb-1">Donation: {donorCurrency} {new Intl.NumberFormat(donorCurrency === 'USD' ? 'en-US' : 'en-RW').format(donorAmount ?? amount)}</p>
            {donorCurrency !== currency && <><p className="text-muted mb-1">Mobile-money charge: {currency} {new Intl.NumberFormat('en-RW').format(amount)}</p>{exchangeRate !== null && <small className="text-muted">Exchange rate: 1 USD = {exchangeRate.toLocaleString('en-US')} RWF</small>}</>}
          </div>
        )}
        {txRef && <p className="small text-muted mb-4">Reference: <span className="font-monospace">{txRef}</span></p>}
        {!successful && state !== 'FAILED' && (
          <button type="button" className="btn btn-outline-primary px-4 me-2" onClick={() => void verify()}>Check payment status</button>
        )}
        <Link href="/donate" className="btn btn-primary px-4">{successful ? 'Make another donation' : 'Return to donations'}</Link>
        <p className="small text-muted mt-4 mb-0">If money was deducted but the status remains pending, please contact NPC Rwanda and provide your payment reference.</p>
      </div>
    </main>
  );
}
