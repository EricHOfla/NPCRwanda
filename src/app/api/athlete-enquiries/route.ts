import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { validateAntiSpam, isRateLimited, getClientIp } from '@/lib/antiSpam';

export const dynamic = 'force-dynamic';

const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(7).max(40),
  district: z.string().trim().min(2).max(100),
  sport: z.string().trim().min(2).max(100),
  ageRange: z.string().max(40).default(''),
  message: z.string().trim().min(10).max(3000),
  website_url: z.string().optional(),
  hp_field: z.string().optional(),
  _ts: z.union([z.number(), z.string()]).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Check rate limiting
    const clientIp = getClientIp(request);
    if (isRateLimited(`athlete-enquiry:${clientIp}`, 5, 60 * 1000)) {
      return NextResponse.json(
        { error: 'Too many submissions. Please wait a moment and try again.' },
        { status: 429 }
      );
    }

    // Validate anti-spam honeypot
    const spamCheck = validateAntiSpam(body);
    if (spamCheck.isSpam) {
      return NextResponse.json({ error: 'Bot activity detected' }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Please check the required fields', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { fullName, email, phone, district, sport, ageRange, message } = parsed.data;
    const item = await prisma.athleteEnquiry.create({
      data: { fullName, email, phone, district, sport, ageRange, message },
    });

    return NextResponse.json(
      { success: true, id: item.id, message: 'Your interest has been submitted. NPC Rwanda will contact you.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Athlete enquiry submission failed:', error);
    return NextResponse.json({ error: 'We could not submit your enquiry. Please try again.' }, { status: 500 });
  }
}
