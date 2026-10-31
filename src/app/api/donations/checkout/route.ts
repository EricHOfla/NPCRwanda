import { NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().min(9).max(20),
  amount: z.number().int().min(1000).max(100000000),
  supportType: z.string().trim().min(2).max(80),
  frequency: z.enum(['One-time', 'Monthly pledge']),
  anonymous: z.boolean().default(false),
  paymentMethod: z.enum(['mobile_money_rwanda', 'card']),
});

export async function POST(request: Request) {
  try {
    const secretKey = process.env.FLW_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json({ error: 'Online payments are being configured. Please contact NPC Rwanda to donate.' }, { status: 503 });
    }

    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Please check your donation details.', details: parsed.error.flatten() }, { status: 400 });
    }

    const input = parsed.data;
    const txRef = `NPC-DON-${randomUUID()}`;
    const origin = new URL(request.url).origin;
    const callbackUrl = new URL('/donate/confirm', origin).toString();

    const donation = await prisma.donationPayment.create({
      data: {
        txRef,
        name: input.name,
        email: input.email,
        phone: input.phone,
        amount: input.amount,
        currency: 'RWF',
        supportType: input.supportType,
        frequency: input.frequency,
        anonymous: input.anonymous,
        paymentMethod: input.paymentMethod,
        status: 'PENDING',
      },
    });

    const payload = input.paymentMethod === 'mobile_money_rwanda'
      ? {
          phone_number: input.phone,
          amount: input.amount,
          currency: 'RWF',
          email: input.email,
          tx_ref: txRef,
          order_id: donation.id,
          fullname: input.name,
          redirect_url: callbackUrl,
          meta: { donation_id: donation.id, purpose: input.supportType },
        }
      : {
          tx_ref: txRef,
          amount: input.amount,
          currency: 'RWF',
          redirect_url: callbackUrl,
          payment_options: 'card',
          customer: { email: input.email, name: input.name, phonenumber: input.phone },
          customizations: {
            title: 'NPC Rwanda Donation',
            description: `Donation for ${input.supportType}`,
            logo: `${origin}/assets/img/logo.png`,
          },
          meta: { donation_id: donation.id, purpose: input.supportType },
        };

    const endpoint = input.paymentMethod === 'mobile_money_rwanda'
      ? 'https://api.flutterwave.com/v3/charges?type=mobile_money_rwanda'
      : 'https://api.flutterwave.com/v3/payments';

    const providerResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
      signal: AbortSignal.timeout(20000),
    });

    const result = await providerResponse.json().catch(() => ({}));
    if (!providerResponse.ok || result.status !== 'success') {
      await prisma.donationPayment.update({
        where: { id: donation.id },
        data: { status: 'FAILED', failureReason: String(result.message || 'Payment could not be initiated.').slice(0, 500) },
      });
      return NextResponse.json({ error: result.message || 'We could not start your payment. Please try again.' }, { status: 502 });
    }

    const checkoutUrl = input.paymentMethod === 'mobile_money_rwanda'
      ? result.data?.meta?.authorization?.redirect || result.data?.link || null
      : result.data?.link || null;

    await prisma.donationPayment.update({
      where: { id: donation.id },
      data: {
        checkoutUrl,
        providerId: result.data?.id ? BigInt(result.data.id) : null,
        providerRef: result.data?.flw_ref || null,
      },
    });

    return NextResponse.json({
      success: true,
      txRef,
      status: 'PENDING',
      checkoutUrl,
      message: input.paymentMethod === 'mobile_money_rwanda'
        ? 'Approve the payment request on your phone. Do not close this page until you have completed the prompt.'
        : 'Continue to the secure card payment page.',
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('[Donation checkout] Failed to initiate payment:', error);
    return NextResponse.json({ error: 'We could not start your donation. Please try again shortly.' }, { status: 500 });
  }
}
