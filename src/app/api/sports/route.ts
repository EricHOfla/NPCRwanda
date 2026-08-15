import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const sportSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
  title: z.string().min(1, 'Title is required'),
  img: z.string().default('index-sport-1.jpg'),
  desc: z.string().min(1, 'Description is required'),
});

// GET: Fetch sports list
export async function GET() {
  try {
    const sports = await prisma.sportDiscipline.findMany({
      orderBy: { title: 'asc' },
    });
    return NextResponse.json(sports);
  } catch (error) {
    console.error('Fetch sports error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sports disciplines' },
      { status: 500 }
    );
  }
}

// POST: Create a new sport discipline
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = sportSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    // Verify slug uniqueness
    const existing = await prisma.sportDiscipline.findUnique({
      where: { slug: result.data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Slug must be unique.' },
        { status: 400 }
      );
    }

    const newSport = await prisma.sportDiscipline.create({
      data: result.data,
    });

    return NextResponse.json(newSport, { status: 201 });
  } catch (error) {
    console.error('Create sport error:', error);
    return NextResponse.json(
      { error: 'Failed to create sport discipline' },
      { status: 500 }
    );
  }
}
