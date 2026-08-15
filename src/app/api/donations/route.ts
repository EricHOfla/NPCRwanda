import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const donationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  category: z.string().min(1, 'Category is required'),
  supportType: z.string().min(1, 'Support type is required'),
  details: z.string().min(1, 'Details are required'),
});

export async function GET(request: Request) {
  try {
    const donations = await prisma.donationInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(donations);
  } catch (error) {
    console.error('Fetch donations error:', error);
    return NextResponse.json({ error: 'Failed to fetch donation inquiries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = donationSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const newInquiry = await prisma.donationInquiry.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        category: result.data.category,
        supportType: result.data.supportType,
        details: result.data.details,
        read: false,
      },
    });
    return NextResponse.json(newInquiry, { status: 201 });
  } catch (error) {
    console.error('Create donation error:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}
