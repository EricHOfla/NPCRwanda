import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { autoUpdateEventStatuses, ensureAutoMigrated } from '@/lib/autoMigrate';

export const dynamic = 'force-dynamic';

const schema = z.object({
  eventId: z.string().min(1),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(180),
  phone: z.string().trim().min(7).max(40),
  organization: z.string().max(160).default(''),
  accessibilityNeeds: z.string().max(1500).default(''),
});

export async function POST(request: Request) {
  try {
    await ensureAutoMigrated();
    await autoUpdateEventStatuses();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Please check the required fields', details: parsed.error.flatten() }, { status: 400 });
    const event = await prisma.event.findUnique({ where: { id: parsed.data.eventId } });
    if (!event || event.status === 'Cancelled' || event.status === 'Completed') {
      return NextResponse.json({ error: 'This event is not accepting registrations.' }, { status: 400 });
    }
    const item = await prisma.eventRegistration.create({
      data: { ...parsed.data, eventTitle: event.title },
    });
    return NextResponse.json({ success: true, id: item.id, message: 'Your event registration request has been received.' }, { status: 201 });
  } catch (error) {
    console.error('Event registration failed:', error);
    return NextResponse.json({ error: 'We could not submit your registration. Please try again.' }, { status: 500 });
  }
}
