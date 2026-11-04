import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' };

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE });
    }

    const { id } = await context.params;
    // Idempotent deletion so retrying does not throw Prisma P2025 error
    const deleted = await prisma.subscriber.deleteMany({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      count: deleted.count,
      message: 'Subscriber deleted successfully from database',
    }, { headers: NO_STORE });
  } catch (err: any) {
    console.error('Delete subscriber error:', err);
    return NextResponse.json({ error: 'Failed to delete subscriber from database' }, { status: 500, headers: NO_STORE });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: NO_STORE });
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

    return NextResponse.json(updated, { headers: NO_STORE });
  } catch (err: any) {
    console.error('Update subscriber error:', err);
    return NextResponse.json({ error: 'Failed to update subscriber' }, { status: 500, headers: NO_STORE });
  }
}
