import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const socialLinkSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('URL must be valid'),
  icon: z.string().min(1, 'Icon class is required'),
  active: z.boolean().default(true),
  order: z.number().int().default(0),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeStr = searchParams.get('active');

    const whereClause: any = {};
    if (activeStr !== null) {
      whereClause.active = activeStr === 'true';
    }

    const links = await prisma.socialLink.findMany({
      where: whereClause,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error('Fetch social links error:', error);
    return NextResponse.json({ error: 'Failed to fetch social links' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = socialLinkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const link = await prisma.socialLink.create({
      data: result.data,
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error('Create social link error:', error);
    return NextResponse.json({ error: 'Failed to create social link' }, { status: 500 });
  }
}
