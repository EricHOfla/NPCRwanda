import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const link = await prisma.socialLink.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(link);
  } catch (error) {
    console.error('Update social link error:', error);
    return NextResponse.json({ error: 'Failed to update social link' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.socialLink.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete social link error:', error);
    return NextResponse.json({ error: 'Failed to delete social link' }, { status: 500 });
  }
}
