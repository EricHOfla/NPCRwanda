import { timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/prisma';
import { sendVerifiedDonationReceipt } from '@/lib/mailer';
import { logDonationPayment } from '@/lib/donation-payment-logs';

const FLUTTERWAVE_API = 'https://api.flutterwave.com/v3';

type FlutterwaveVerification = {
  status?: string;
  message?: string;
  data?: {
    id?: number;
    tx_ref?: string;
    flw_ref?: string;
    status?: string;
    amount?: number | string;
    currency?: string;
    processor_response?: string;
  };
};

export async function verifyDonationPayment(transactionId: string, expectedTxRef?: string) {
  const secretKey = process.env.FLW_SECRET_KEY;
  if (!secretKey) throw new Error('Flutterwave is not configured. Set FLW_SECRET_KEY.');

  if (!/^\d+$/.test(transactionId)) throw new Error('Invalid payment transaction ID.');

  const response = await fetch(`${FLUTTERWAVE_API}/transactions/${transactionId}/verify`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${secretKey}`, Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) throw new Error(`Flutterwave verification failed (HTTP ${response.status}).`);
  const payload = await response.json() as FlutterwaveVerification;
  const transaction = payload.data;
  if (payload.status !== 'success' || !transaction) throw new Error('Flutterwave could not verify this payment.');

  const txRef = transaction.tx_ref;
  if (!txRef || (expectedTxRef && txRef !== expectedTxRef)) throw new Error('Payment reference does not match.');

  const donation = await prisma.donationPayment.findUnique({ where: { txRef } });
  if (!donation) throw new Error('Donation reference was not found.');
  await logDonationPayment({ donationPaymentId: donation.id, txRef, event: 'VERIFICATION_RECEIVED', status: 'INFO', source: 'VERIFY', message: 'Flutterwave transaction verification response received.', metadata: { providerTransactionId: String(transaction.id || transactionId), providerStatus: transaction.status || 'unknown', amount: Number(transaction.amount), currency: transaction.currency || null } });
  if (donation.status === 'SUCCESSFUL') return donation;

  const amount = Number(transaction.amount);
  const providerStatus = String(transaction.status || '').toLowerCase();
  const isSuccessful =
    providerStatus === 'successful' &&
    transaction.currency === donation.currency &&
    Number.isFinite(amount) &&
    amount >= donation.amount;

  if (isSuccessful) {
    const transition = await prisma.donationPayment.updateMany({
      where: { id: donation.id, status: { not: 'SUCCESSFUL' } },
      data: {
        status: 'SUCCESSFUL',
        providerId: BigInt(transaction.id || transactionId),
        providerRef: transaction.flw_ref || null,
        failureReason: null,
        verifiedAt: new Date(),
      },
    });

    if (transition.count > 0) {
      await logDonationPayment({ donationPaymentId: donation.id, txRef, event: 'PAYMENT_SUCCESSFUL', status: 'SUCCESSFUL', source: 'VERIFY', message: 'Payment was verified successfully with Flutterwave.', metadata: { providerTransactionId: String(transaction.id || transactionId), amount, currency: transaction.currency || null } });
      try {
        const receiptResult = await sendVerifiedDonationReceipt({
        name: donation.name,
        email: donation.email,
        amount: donation.amount,
        currency: donation.currency,
        donorAmount: donation.donorAmount ?? donation.amount,
        donorCurrency: donation.donorCurrency ?? donation.currency,
        exchangeRate: donation.exchangeRate,
        supportType: donation.supportType,
        txRef: donation.txRef,
        });
        if (receiptResult?.success) {
          await logDonationPayment({ donationPaymentId: donation.id, txRef, event: 'RECEIPT_SENT', status: 'SUCCESSFUL', source: 'EMAIL', message: 'Donor receipt and finance notification emails were sent.' });
        } else {
          await logDonationPayment({ donationPaymentId: donation.id, txRef, event: 'RECEIPT_FAILED', status: 'FAILED', source: 'EMAIL', message: receiptResult?.reason || 'Donation receipt email could not be sent.' });
        }
      } catch (emailError) {
        await logDonationPayment({ donationPaymentId: donation.id, txRef, event: 'RECEIPT_FAILED', status: 'FAILED', source: 'EMAIL', message: emailError instanceof Error ? emailError.message : 'Donation receipt email could not be sent.' });
        console.error('[Donation receipt] Email delivery failed:', emailError);
      }
    }

    const updated = await prisma.donationPayment.findUnique({ where: { id: donation.id } });
    if (!updated) throw new Error('Donation payment record could not be reloaded.');
    return updated;
  }

  if (providerStatus === 'failed' || providerStatus === 'cancelled') {
    const failureMessage = transaction.processor_response || (providerStatus === 'cancelled' ? 'Payment was cancelled.' : 'Payment was not completed.');
    await logDonationPayment({ donationPaymentId: donation.id, txRef, event: providerStatus === 'cancelled' ? 'PAYMENT_CANCELLED' : 'PAYMENT_FAILED', status: 'FAILED', source: 'VERIFY', message: failureMessage, metadata: { providerTransactionId: String(transaction.id || transactionId), providerStatus } });
    return prisma.donationPayment.update({
      where: { id: donation.id },
      data: {
        status: 'FAILED',
        providerId: BigInt(transaction.id || transactionId),
        providerRef: transaction.flw_ref || null,
        failureReason: failureMessage,
        verifiedAt: new Date(),
      },
    });
  }

  if (providerStatus === 'successful') {
    await logDonationPayment({ donationPaymentId: donation.id, txRef, event: 'PAYMENT_VERIFICATION_REJECTED', status: 'FAILED', source: 'VERIFY', message: 'Flutterwave reported success, but the amount or currency did not match the donation record. The donation was not credited.', metadata: { providerTransactionId: String(transaction.id || transactionId), providerAmount: amount, providerCurrency: transaction.currency || null, expectedAmount: donation.amount, expectedCurrency: donation.currency } });
    return donation;
  }

  await logDonationPayment({ donationPaymentId: donation.id, txRef, event: 'PAYMENT_PENDING', status: 'PENDING', source: 'VERIFY', message: 'Provider has not reported a final successful or failed payment status.', metadata: { providerTransactionId: String(transaction.id || transactionId), providerStatus } });
  return donation;
}

export function isValidFlutterwaveWebhook(signature: string | null): boolean {
  const secretHash = process.env.FLW_SECRET_HASH;
  if (!secretHash || !signature) return false;
  const a = Buffer.from(secretHash);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
