import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const partnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  logo: z.string().min(1, 'Logo is required'),
  website: z.string().default(''),
  category: z.string().default('Government Sector'),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeStr = searchParams.get('active');
    const page = searchParams.get('page');
    const limit = searchParams.get('limit') || '10';

    const whereClause: any = {};
    if (activeStr !== null) {
      whereClause.active = activeStr === 'true';
    }

    if (page) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const skip = (pageNum - 1) * limitNum;

      const [data, totalRecords] = await Promise.all([
        prisma.partner.findMany({
          where: whereClause,
          orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
          skip,
          take: limitNum,
        }),
        prisma.partner.count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(totalRecords / limitNum);

      return NextResponse.json({
        data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalRecords,
          totalPages,
          currentPage: pageNum,
          nextPage: pageNum < totalPages ? pageNum + 1 : null,
          previousPage: pageNum > 1 ? pageNum - 1 : null,
        },
      });
    }

    const data = await prisma.partner.findMany({
      where: whereClause,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch partners error:', error);
    return NextResponse.json({ error: 'Failed to fetch partners' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = partnerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const partner = await prisma.partner.create({
      data: result.data,
    });

    return NextResponse.json(partner, { status: 201 });
  } catch (error) {
    console.error('Create partner error:', error);
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
  }
}
