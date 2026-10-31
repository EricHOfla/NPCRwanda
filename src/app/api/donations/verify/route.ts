import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyDonationPayment } from '@/lib/flutterwave';

export const runtime = 'nodejs';

const schema = z.object({
  tx_ref: z.string().min(10).max(100),
  transaction_id: z.union([z.string(), z.number()]).transform(String).refine((value) => /^\d+$/.test(value)).optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payment reference.' }, { status: 400 });

  try {
    const payment = await prisma.donationPayment.findUnique({ where: { txRef: parsed.data.tx_ref } });
    if (!payment) return NextResponse.json({ error: 'Donation reference was not found.' }, { status: 404 });
    if (payment.status === 'SUCCESSFUL' || payment.status === 'FAILED') {
      return NextResponse.json({ tx_ref: payment.txRef, status: payment.status, amount: payment.amount, currency: payment.currency }, { headers: { 'Cache-Control': 'no-store' } });
    }

    const transactionId = parsed.data.transaction_id || payment.providerId?.toString();
    if (!transactionId) {
      return NextResponse.json({ tx_ref: payment.txRef, status: 'PENDING' }, { status: 202, headers: { 'Cache-Control': 'no-store' } });
    }

    const donation = await verifyDonationPayment(transactionId, parsed.data.tx_ref);
    return NextResponse.json({
      tx_ref: donation.txRef,
      status: donation.status,
      amount: donation.amount,
      currency: donation.currency,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[Donation verify] Verification failed:', error);
    return NextResponse.json({ error: 'We are still confirming your payment. Please refresh in a moment.' }, { status: 202 });
  }
}
