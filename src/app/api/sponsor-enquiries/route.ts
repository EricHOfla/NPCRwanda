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

export async function POST() {
  return NextResponse.json(
    { error: 'Partnership enquiries are handled through the Contact Us page.' },
    { status: 410 }
  );
}
