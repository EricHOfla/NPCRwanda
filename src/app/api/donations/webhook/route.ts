import { NextResponse } from 'next/server';
import { isValidFlutterwaveWebhook, verifyDonationPayment } from '@/lib/flutterwave';
import { logDonationPayment } from '@/lib/donation-payment-logs';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  if (!isValidFlutterwaveWebhook(request.headers.get('verif-hash'))) {
    await logDonationPayment({ txRef: 'UNKNOWN', event: 'WEBHOOK_REJECTED', status: 'FAILED', source: 'WEBHOOK', message: 'Flutterwave webhook rejected because its signature was invalid.' });
    return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const data = payload?.data;
  if (payload?.event !== 'charge.completed' || !data?.id || !data?.tx_ref) {
    return NextResponse.json({ received: true }, { status: 200 });
  }

  await logDonationPayment({ txRef: String(data.tx_ref), event: 'WEBHOOK_RECEIVED', status: 'INFO', source: 'WEBHOOK', message: 'Flutterwave charge.completed webhook received.', metadata: { providerTransactionId: String(data.id), providerStatus: data.status || null } });

  try {
    await verifyDonationPayment(String(data.id), String(data.tx_ref));
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    await logDonationPayment({ txRef: String(data.tx_ref), event: 'WEBHOOK_VERIFICATION_FAILED', status: 'FAILED', source: 'WEBHOOK', message: error instanceof Error ? error.message : 'Webhook payment verification failed.', metadata: { providerTransactionId: String(data.id) } });
    console.error('[Flutterwave webhook] Could not verify event:', error);
    // Non-200 tells Flutterwave to retry delivery.
    return NextResponse.json({ error: 'Payment verification will be retried.' }, { status: 503 });
  }
}
