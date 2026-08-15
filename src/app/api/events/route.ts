import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  endDate: z.string().default(''),
  location: z.string().min(1, 'Location is required'),
  category: z.string().default('National'),
  status: z.enum(['Upcoming', 'Ongoing', 'Completed', 'Cancelled']).default('Upcoming'),
  img: z.string().default('sports-hero.jpg'),
  featured: z.boolean().default(false),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const page = searchParams.get('page');
    const limit = searchParams.get('limit') || '10';

    const whereClause: any = {};
    if (status && status !== 'All') whereClause.status = status;
    if (category && category !== 'All') whereClause.category = category;

    if (page) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const skip = (pageNum - 1) * limitNum;

      const [data, totalRecords] = await Promise.all([
        prisma.event.findMany({
          where: whereClause,
          orderBy: { date: 'asc' },
          skip,
          take: limitNum,
        }),
        prisma.event.count({ where: whereClause }),
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

    const events = await prisma.event.findMany({ where: whereClause, orderBy: { date: 'asc' } });
    return NextResponse.json(events);
  } catch (error) {
    console.error('Fetch events error:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = eventSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }
    const event = await prisma.event.create({ data: result.data });
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
