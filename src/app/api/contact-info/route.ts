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
        address: 'Amahoro Stadium, Kigali',
        phone: '+250 788 672 739',
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

    // Also synchronize into systemSetting table
    try {
      await prisma.systemSetting.upsert({
        where: { key: 'address' },
        update: { value: result.data.address },
        create: { key: 'address', value: result.data.address },
      });
      await prisma.systemSetting.upsert({
        where: { key: 'contactPhone' },
        update: { value: result.data.phone },
        create: { key: 'contactPhone', value: result.data.phone },
      });
      await prisma.systemSetting.upsert({
        where: { key: 'contactEmail' },
        update: { value: result.data.email },
        create: { key: 'contactEmail', value: result.data.email },
      });
    } catch (e) {
      console.error('Failed to sync systemSetting from contactInfo:', e);
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update contact info error:', error);
    return NextResponse.json({ error: 'Failed to update contact info' }, { status: 500 });
  }
}

// Support POST method (e.g. from DataContext updateContactInfo)
export const POST = PUT;
