import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(7).max(40),
  district: z.string().trim().min(2).max(100),
  sport: z.string().trim().min(2).max(100),
  ageRange: z.string().max(40).default(''),
  message: z.string().trim().min(10).max(3000),
});

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Please check the required fields', details: parsed.error.flatten() }, { status: 400 });
    const item = await prisma.athleteEnquiry.create({ data: parsed.data });
    return NextResponse.json({ success: true, id: item.id, message: 'Your interest has been submitted. NPC Rwanda will contact you.' }, { status: 201 });
  } catch (error) {
    console.error('Athlete enquiry submission failed:', error);
    return NextResponse.json({ error: 'We could not submit your enquiry. Please try again.' }, { status: 500 });
  }
}
