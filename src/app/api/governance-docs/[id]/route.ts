import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { title, desc, fileUrl, order, published } = body;

    const doc = await prisma.governanceDocument.update({
      where: { id },
      data: {
        title: title?.trim(),
        desc: desc?.trim(),
        fileUrl: fileUrl?.trim() || '#',
        order: Number(order) || 0,
        published: published !== false,
      },
    });

    return NextResponse.json(doc);
  } catch (error) {
    console.error('Update governance document error:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await prisma.governanceDocument.delete({ where: { id } });
    return NextResponse.json({ message: 'Document deleted' });
  } catch (error) {
    console.error('Delete governance document error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
