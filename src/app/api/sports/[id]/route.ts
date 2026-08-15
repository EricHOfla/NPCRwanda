import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const sportUpdateSchema = z.object({
  slug: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  img: z.string().optional(),
  desc: z.string().min(1).optional(),
});

// GET: Fetch a single sport discipline
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sport = await prisma.sportDiscipline.findUnique({
      where: { id },
    });

    if (!sport) {
      return NextResponse.json({ error: 'Sport not found' }, { status: 404 });
    }

    return NextResponse.json(sport);
  } catch (error) {
    console.error('Fetch sport by id error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sport' },
      { status: 500 }
    );
  }
}

// PUT: Update a sport discipline
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = sportUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    // Verify slug uniqueness if updated
    if (result.data.slug) {
      const existing = await prisma.sportDiscipline.findFirst({
        where: {
          slug: result.data.slug,
          NOT: { id },
        },
      });

      if (existing) {
        return NextResponse.json(
          { error: 'Slug must be unique.' },
          { status: 400 }
        );
      }
    }

    const updatedSport = await prisma.sportDiscipline.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(updatedSport);
  } catch (error) {
    console.error('Update sport error:', error);
    return NextResponse.json(
      { error: 'Failed to update sport discipline' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a sport discipline
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.sportDiscipline.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Sport discipline deleted successfully' });
  } catch (error) {
    console.error('Delete sport error:', error);
    return NextResponse.json(
      { error: 'Failed to delete sport discipline' },
      { status: 500 }
    );
  }
}
