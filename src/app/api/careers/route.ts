import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Career validation schema
const careerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  location: z.string().min(1, 'Location is required'),
  status: z.enum(['Open', 'Closed']).default('Open'),
  desc: z.string().min(1, 'Description is required'),
  slug: z.string().min(1, 'Slug is required'),
});

// GET: Fetch careers list with optional filters and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const slug = searchParams.get('slug') || '';
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page');
    const limit = searchParams.get('limit') || '10';

    const whereClause: any = {};
    if (status && status !== 'All') {
      whereClause.status = status;
    }
    if (slug) {
      whereClause.slug = slug;
    }
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { desc: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (page) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const skip = (pageNum - 1) * limitNum;

      const [data, totalRecords] = await Promise.all([
        prisma.career.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.career.count({ where: whereClause }),
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

    const careers = await prisma.career.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(careers);
  } catch (error) {
    console.error('Fetch careers error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch career positions' },
      { status: 500 }
    );
  }
}

// POST: Create a new job position
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Auto-generate slug if not provided
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const result = careerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    // Verify unique slug
    const existing = await prisma.career.findUnique({
      where: { slug: result.data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Slug must be unique.' },
        { status: 400 }
      );
    }

    const newCareer = await prisma.career.create({
      data: {
        ...result.data,
        applicants: 0,
      },
    });

    return NextResponse.json(newCareer, { status: 201 });
  } catch (error) {
    console.error('Create career error:', error);
    return NextResponse.json(
      { error: 'Failed to create career position' },
      { status: 500 }
    );
  }
}
