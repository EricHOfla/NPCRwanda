import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { authorizeRequest } from '@/lib/rbac-server';

export const dynamic = 'force-dynamic';

// GET: Public — fetch all published governance documents ordered by `order`
export async function GET(request: NextRequest) {
  try {
    const adminScope = request.nextUrl.searchParams.get('scope') === 'admin';
    if (adminScope) {
      const auth = await authorizeRequest(request, 'content.view');
      if (!auth.authorized) return auth.response;
    }
    const docs = await prisma.governanceDocument.findMany({
      where: adminScope ? undefined : { published: true },
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(docs);
  } catch (error) {
    console.error('Fetch governance documents error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

// POST: Admin — create a new governance document
export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { title, desc, fileUrl, order, published } = body;

    if (!title?.trim() || !desc?.trim()) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    const doc = await prisma.governanceDocument.create({
      data: {
        title: title.trim(),
        desc: desc.trim(),
        fileUrl: fileUrl?.trim() || '#',
        order: Number(order) || 0,
        published: published !== false,
      },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error('Create governance document error:', error);
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
