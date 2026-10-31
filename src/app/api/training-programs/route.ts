import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const schema = z.object({
  title: z.string().trim().min(3).max(160),
  sport: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10).max(10000),
  location: z.string().trim().min(2).max(160),
  schedule: z.string().max(500).default(''),
  startDate: z.string().max(40).default(''),
  endDate: z.string().max(40).default(''),
  eligibility: z.string().max(3000).default(''),
  contactEmail: z.string().email().or(z.literal('')).default(''),
  status: z.enum(['Draft', 'Published', 'Archived']).default('Draft'),
  featured: z.boolean().default(false),
});

export async function GET() {
  try {
    const data = await prisma.trainingProgram.findMany({
      where: { status: 'Published' },
      orderBy: [{ featured: 'desc' }, { startDate: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Training programs fetch failed:', error);
    return NextResponse.json({ error: 'Unable to load training programmes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid programme details', details: parsed.error.flatten() }, { status: 400 });
    const data = await prisma.trainingProgram.create({ data: parsed.data });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Training programme create failed:', error);
    return NextResponse.json({ error: 'Unable to save training programme' }, { status: 500 });
  }
}
