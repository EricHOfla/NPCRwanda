import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendDonationNotification } from '@/lib/mailer';
import { validateAntiSpam, isRateLimited, getClientIp } from '@/lib/antiSpam';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' };

const donationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  category: z.string().min(1, 'Category is required'),
  supportType: z.string().min(1, 'Support type is required'),
  details: z.string().min(1, 'Details are required'),
  website_url: z.string().optional(), // Honeypot
  hp_field: z.string().optional(),    // Secondary honeypot
  _ts: z.union([z.number(), z.string()]).optional(),
});

export async function GET(request: Request) {
  try {
    const donations = await prisma.donationInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(donations, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Fetch donations error:', error);
    return NextResponse.json({ error: 'Failed to fetch donation inquiries' }, { status: 500, headers: NO_STORE_HEADERS });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = donationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    // IP rate limiting check
    const clientIp = getClientIp(request);
    if (isRateLimited(clientIp, 6, 10)) {
      console.warn(`[AntiSpam] Rate limited donation inquiry from IP: ${clientIp}`);
      return NextResponse.json({ success: true, message: 'Inquiry submitted.' }, { status: 200 });
    }

    // Bot & Spam validation
    const spamCheck = validateAntiSpam({
      website_url: result.data.website_url,
      hp_field: result.data.hp_field,
      _ts: result.data._ts,
      email: result.data.email,
      name: result.data.name,
      message: `${result.data.category} ${result.data.supportType} ${result.data.details}`,
    });

    if (spamCheck.isSpam) {
      console.warn(`[AntiSpam] Dropped fake/bot donation inquiry (${spamCheck.reason}) from IP: ${clientIp}`);
      return NextResponse.json({ success: true, message: 'Inquiry submitted.' }, { status: 200 });
    }

    const newInquiry = await prisma.donationInquiry.create({
      data: {
        name: result.data.name.trim(),
        email: result.data.email.trim().toLowerCase(),
        category: result.data.category.trim(),
        supportType: result.data.supportType.trim(),
        details: result.data.details.trim(),
        read: false,
      },
    });

    // Send notifications to admin and donor receipt
    try {
      await sendDonationNotification({
        name: newInquiry.name,
        email: newInquiry.email,
        category: newInquiry.category,
        supportType: newInquiry.supportType,
        details: newInquiry.details,
      });
    } catch (mailErr) {
      console.error('[Mailer] Donation alert error:', mailErr);
    }

    return NextResponse.json(newInquiry, { status: 201 });
  } catch (error) {
    console.error('Create donation error:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}
