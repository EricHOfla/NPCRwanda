import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { ensureAutoMigrated } from '@/lib/autoMigrate';

export const dynamic = 'force-dynamic';

const schema = z.object({
  eventTitle: z.string().trim().min(2).max(180),
  competitionDate: z.string().min(4).max(40),
  athleteName: z.string().trim().min(2).max(160),
  sport: z.string().trim().min(2).max(100),
  category: z.string().max(120).default(''),
  position: z.string().max(80).default(''),
  medal: z.string().max(40).default(''),
  result: z.string().max(120).default(''),
  notes: z.string().max(3000).default(''),
  published: z.boolean().default(false),
});

export async function GET() {
  try {
    await ensureAutoMigrated();
    const data = await prisma.competitionResult.findMany({
      where: { published: true },
      orderBy: [{ competitionDate: 'desc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Competition results fetch failed:', error);
    return NextResponse.json({ error: 'Unable to load competition results' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureAutoMigrated();
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid result details', details: parsed.error.flatten() }, { status: 400 });
    const data = await prisma.competitionResult.create({ data: parsed.data });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Competition result create failed:', error);
    return NextResponse.json({ error: 'Unable to save competition result' }, { status: 500 });
  }
}
