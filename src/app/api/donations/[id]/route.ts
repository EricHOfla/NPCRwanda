import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/rbac';

const updateSchema = z.object({
  read: z.boolean(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeRequest(request, 'donations.view');
    if (!auth.authorized) {
      return auth.response;
    }

    const { id } = await params;
    const item = await prisma.donationInquiry.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeRequest(request, 'donations.manage');
    if (!auth.authorized) {
      return auth.response;
    }

    const { id } = await params;
    const body = await request.json();
    const result = updateSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 });

    const updated = await prisma.donationInquiry.updateMany({
      where: { id },
      data: { read: result.data.read },
    });
    return NextResponse.json({ success: true, count: updated.count });
  } catch (error) {
    console.error('Update donation inquiry error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authorizeRequest(request, 'donations.manage');
    if (!auth.authorized) {
      return auth.response;
    }

    const { id } = await params;
    const deleted = await prisma.donationInquiry.deleteMany({ where: { id } });
    return NextResponse.json({ success: true, count: deleted.count });
  } catch (error) {
    console.error('Delete donation inquiry error:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
