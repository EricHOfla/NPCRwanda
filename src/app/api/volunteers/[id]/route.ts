import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const updateSchema = z.object({
  read: z.boolean(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await prisma.volunteerApplication.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = updateSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 });

    const updated = await prisma.volunteerApplication.updateMany({
      where: { id },
      data: { read: result.data.read },
    });
    return NextResponse.json({ success: true, count: updated.count });
  } catch (error) {
    console.error('Update volunteer application error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await prisma.volunteerApplication.deleteMany({ where: { id } });
    return NextResponse.json({
      success: true,
      count: deleted.count,
      message: 'Volunteer application deleted successfully from database',
    }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } });
  } catch (error) {
    console.error('Delete volunteer application error:', error);
    return NextResponse.json({ error: 'Failed to delete volunteer application from database' }, { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } });
  }
}
