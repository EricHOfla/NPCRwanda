import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const schema = z.object({
  organization: z.string().trim().min(2).max(180),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().max(40).default(''),
  supportType: z.string().trim().min(2).max(100),
  message: z.string().trim().min(10).max(3000),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Please check the required fields', details: parsed.error.flatten() }, { status: 400 });
    const item = await prisma.sponsorInquiry.create({ data: parsed.data });
    return NextResponse.json({ success: true, id: item.id, message: 'Thank you. Your partnership enquiry has been received.' }, { status: 201 });
  } catch (error) {
    console.error('Sponsor enquiry failed:', error);
    return NextResponse.json({ error: 'We could not submit your enquiry. Please try again.' }, { status: 500 });
  }
}
