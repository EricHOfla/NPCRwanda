import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const policies = await prisma.governancePolicy.findMany({
      where: { published: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(policies);
  } catch (error) {
    console.error('Fetch governance policies error:', error);
    return NextResponse.json({ error: 'Failed to fetch policies' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, desc, fileUrl, order, published } = body;

    if (!title?.trim() || !desc?.trim()) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const policy = await prisma.governancePolicy.create({
      data: {
        title: title.trim(),
        desc: desc.trim(),
        fileUrl: fileUrl?.trim() || '#',
        order: Number(order) || 0,
        published: published !== false,
      },
    });

    return NextResponse.json(policy, { status: 201 });
  } catch (error) {
    console.error('Create governance policy error:', error);
    return NextResponse.json({ error: 'Failed to create policy' }, { status: 500 });
  }
}
