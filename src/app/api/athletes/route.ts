import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Athlete validation schema
const athleteSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  sport: z.string().min(1, 'Sport is required'),
  status: z.enum(['Active', 'Inactive']).default('Active'),
  country: z.string().default('Rwanda'),
  avatar: z.string().default('avatar-1.svg'),
  desc: z.string().min(1, 'Description is required'),
});

// GET: Fetch list of athletes with optional search, status filtering, and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = searchParams.get('page');
    const limit = searchParams.get('limit') || '10';

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sport: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      whereClause.status = status;
    }

    if (page) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const skip = (pageNum - 1) * limitNum;

      const [data, totalRecords] = await Promise.all([
        prisma.athlete.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.athlete.count({ where: whereClause }),
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

    const athletes = await prisma.athlete.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(athletes);
  } catch (error) {
    console.error('Fetch athletes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch athletes' },
      { status: 500 }
    );
  }
}

// POST: Create a new athlete profile
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = athleteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const newAthlete = await prisma.athlete.create({
      data: result.data,
    });

    return NextResponse.json(newAthlete, { status: 201 });
  } catch (error) {
    console.error('Create athlete error:', error);
    return NextResponse.json(
      { error: 'Failed to create athlete' },
      { status: 500 }
    );
  }
}
