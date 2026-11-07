import { NextRequest, NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/rbac-server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  acronym: z.string().min(1, 'Acronym is required'),
  desc: z.string().min(1, 'Description is required'),
  activities: z.array(z.string()),
  icon: z.string().min(1, 'Icon is required'),
  order: z.number().int().default(0),
  active: z.boolean().default(true),
});

export async function GET(request: NextRequest) {
  try {
    const showAll = request.nextUrl.searchParams.get('active') === 'all';
    if (showAll) {
      const auth = await authorizeRequest(request, 'members.view');
      if (!auth.authorized) return auth.response;
    }
    const data = await prisma.npcAssociation.findMany({
      where: showAll ? undefined : { active: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch associations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    const result = await prisma.npcAssociation.create({ data: parsed });
    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    console.error('Create error:', error);
    return NextResponse.json({ error: 'Failed to create association' }, { status: 500 });
  }
}
