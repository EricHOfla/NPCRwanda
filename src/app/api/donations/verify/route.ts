import { NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyDonationPayment } from '@/lib/flutterwave';

export const runtime = 'nodejs';

const schema = z.object({
  tx_ref: z.string().min(10).max(100),
  transaction_id: z.union([z.string(), z.number()]).transform(String).refine((value) => /^\d+$/.test(value)),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payment reference.' }, { status: 400 });

  try {
    const donation = await verifyDonationPayment(parsed.data.transaction_id, parsed.data.tx_ref);
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
