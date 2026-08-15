import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const contactInfoSchema = z.object({
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Valid email is required'),
  mapUrl: z.string().default(''),
});

export async function GET() {
  try {
    let info = await prisma.contactInfo.findFirst();
    if (!info) {
      // Return default values if database is unseeded
      info = {
        id: 'default',
        address: 'Amahoro National Stadium, Remera, Kigali, Rwanda',
        phone: '+250 788 400 887',
        email: 'info@npcrwanda.org',
        mapUrl: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    return NextResponse.json(info);
  } catch (error) {
    console.error('Fetch contact info error:', error);
    return NextResponse.json({ error: 'Failed to fetch contact info' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const result = contactInfoSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const first = await prisma.contactInfo.findFirst();

    let updated;
    if (first) {
      updated = await prisma.contactInfo.update({
        where: { id: first.id },
        data: result.data,
      });
    } else {
      updated = await prisma.contactInfo.create({
        data: result.data,
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update contact info error:', error);
    return NextResponse.json({ error: 'Failed to update contact info' }, { status: 500 });
  }
}
