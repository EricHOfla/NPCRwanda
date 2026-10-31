import { timingSafeEqual } from 'node:crypto';
import { prisma } from '@/lib/prisma';

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
  if (donation.status === 'SUCCESSFUL') return donation;

  const amount = Number(transaction.amount);
  const providerStatus = String(transaction.status || '').toLowerCase();
  const isSuccessful =
    providerStatus === 'successful' &&
    transaction.currency === donation.currency &&
    Number.isFinite(amount) &&
    amount >= donation.amount;

  if (isSuccessful) {
    return prisma.donationPayment.update({
      where: { id: donation.id },
      data: {
        status: 'SUCCESSFUL',
        providerId: BigInt(transaction.id || transactionId),
        providerRef: transaction.flw_ref || null,
        failureReason: null,
        verifiedAt: new Date(),
      },
    });
  }

  if (providerStatus === 'failed' || providerStatus === 'cancelled') {
    return prisma.donationPayment.update({
      where: { id: donation.id },
      data: {
        status: 'FAILED',
        providerId: BigInt(transaction.id || transactionId),
        providerRef: transaction.flw_ref || null,
        failureReason: transaction.processor_response || 'Payment was not completed.',
        verifiedAt: new Date(),
      },
    });
  }

  return donation;
}

export function isValidFlutterwaveWebhook(signature: string | null): boolean {
  const secretHash = process.env.FLW_SECRET_HASH;
  if (!secretHash || !signature) return false;
  const a = Buffer.from(secretHash);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}
