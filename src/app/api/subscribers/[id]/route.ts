import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    await prisma.subscriber.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Subscriber removed' });
  } catch (err: any) {
    console.error('Delete subscriber error:', err);
    return NextResponse.json({ error: 'Failed to delete subscriber' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const updated = await prisma.subscriber.update({
      where: { id },
      data: {
        ...(typeof body.active === 'boolean' ? { active: body.active } : {}),
        ...(Array.isArray(body.categories) ? { categories: body.categories } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Update subscriber error:', err);
    return NextResponse.json({ error: 'Failed to update subscriber' }, { status: 500 });
  }
}
