import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { notifySubscribers } from '@/lib/mailer';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await prisma.event.update({ where: { id }, data: body });

    if (updated.status === 'Upcoming' || updated.status === 'Ongoing') {
      notifySubscribers({
        category: 'events',
        title: updated.title,
        description: `${updated.description} | Location: ${updated.location} | Date: ${updated.date}`,
        url: `/events#${updated.id}`,
        imageUrl: updated.img,
      }).catch(err => console.warn('Notification error on event update:', err));
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
  }
}
