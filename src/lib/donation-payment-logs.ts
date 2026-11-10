import { prisma } from '@/lib/prisma';

export type DonationLogInput = {
  donationPaymentId?: string | null;
  txRef: string;
  event: string;
  status: string;
  source: 'CHECKOUT' | 'VERIFY' | 'WEBHOOK' | 'EMAIL' | 'ADMIN';
  message: string;
  metadata?: Record<string, string | number | boolean | null | undefined>;
};

/**
 * Append-only operational history for donation payments.
 * Never pass credentials, card data, donor contact details, or raw provider payloads.
 * Logging failures must not interrupt payment processing.
 */
export async function logDonationPayment(input: DonationLogInput): Promise<void> {
  try {
    const safeMetadata = input.metadata
      ? Object.fromEntries(Object.entries(input.metadata).filter(([, value]) => value !== undefined))
      : undefined;
    await prisma.donationPaymentLog.create({
      data: {
        donationPaymentId: input.donationPaymentId ?? null,
        txRef: input.txRef.slice(0, 120),
        event: input.event.slice(0, 80),
        status: input.status.slice(0, 40),
        source: input.source,
        message: input.message.slice(0, 1000),
        metadata: safeMetadata ? JSON.stringify(safeMetadata).slice(0, 8000) : null,
      },
    });
  } catch (error) {
    console.error('[Donation payment log] Could not persist event:', error);
  }
}
