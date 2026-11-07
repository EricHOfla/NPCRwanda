import { NextRequest, NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/rbac-server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { notifySubscribers } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.string().min(1, 'Date is required'),
  endDate: z.string().default(''),
  location: z.string().min(1, 'Location is required'),
  category: z.string().default('National'),
  status: z.enum(['Upcoming', 'Ongoing', 'Completed', 'Cancelled']).default('Upcoming'),
  img: z.string().default(''),
  featured: z.boolean().default(false),
  resultsSummary: z.string().default(''),
  results: z.string().default(''),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const adminScope = searchParams.get('scope') === 'admin';
    if (adminScope) {
      const auth = await authorizeRequest(request, 'content.view');
      if (!auth.authorized) return auth.response;
    }
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const page = searchParams.get('page');
    const limit = searchParams.get('limit') || '10';

    const whereClause: any = adminScope ? {} : { status: { not: 'Cancelled' } };
    if (status && status !== 'All') {
      if (status === 'Cancelled' && !adminScope) return NextResponse.json([]);
      whereClause.status = status;
    }
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
        data: data.map((event) => {
          if (event.status === 'Cancelled' || !event.date) return event;
          const today = new Date().toISOString().slice(0, 10);
          const start = event.date.trim();
          const end = event.endDate?.trim() || '';
          const currentStatus = start > today ? 'Upcoming' : (end ? end >= today ? 'Ongoing' : 'Completed' : start === today ? 'Ongoing' : 'Completed');
          return { ...event, status: currentStatus };
        }),
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
    const today = new Date().toISOString().slice(0, 10);
    const responseEvents = events.map((event) => {
      if (event.status === 'Cancelled' || !event.date) return event;
      const start = event.date.trim();
      const end = event.endDate?.trim() || '';
      const currentStatus = start > today ? 'Upcoming' : (end ? end >= today ? 'Ongoing' : 'Completed' : start === today ? 'Ongoing' : 'Completed');
      return { ...event, status: currentStatus };
    });
    return NextResponse.json(responseEvents);
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

    // Only notify subscribers for upcoming events
    if (event.status === 'Upcoming') {
      const dateStr = event.date ? new Date(event.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : event.date;
      notifySubscribers({
        category: 'events',
        title: event.title,
        description: `${event.description}\n\nDate: ${dateStr}${event.endDate ? ` – ${new Date(event.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}\nLocation: ${event.location}\nCategory: ${event.category}`,
        url: `/events`,
        imageUrl: event.img,
      }).catch(err => console.warn('Notification error on event create:', err));
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
