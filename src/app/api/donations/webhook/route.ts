import { NextResponse } from 'next/server';
import { isValidFlutterwaveWebhook, verifyDonationPayment } from '@/lib/flutterwave';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!isValidFlutterwaveWebhook(request.headers.get('verif-hash'))) {
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const data = payload?.data;
  if (payload?.event !== 'charge.completed' || !data?.id || !data?.tx_ref) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    await verifyDonationPayment(String(data.id), String(data.tx_ref));
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('[Flutterwave webhook] Could not verify event:', error);
    // Non-200 tells Flutterwave to retry delivery.
    return NextResponse.json({ error: 'Payment verification will be retried.' }, { status: 503 });
  }
}
