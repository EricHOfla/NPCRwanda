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

    const policy = await prisma.governancePolicy.update({
      where: { id },
      data: {
        title: title?.trim(),
        desc: desc?.trim(),
        fileUrl: fileUrl?.trim() || '#',
        order: Number(order) || 0,
        published: published !== false,
      },
    });

    return NextResponse.json(policy);
  } catch (error) {
    console.error('Update governance policy error:', error);
    return NextResponse.json({ error: 'Failed to update policy' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await prisma.governancePolicy.delete({ where: { id } });
    return NextResponse.json({ message: 'Policy deleted' });
  } catch (error) {
    console.error('Delete governance policy error:', error);
    return NextResponse.json({ error: 'Failed to delete policy' }, { status: 500 });
  }
}
