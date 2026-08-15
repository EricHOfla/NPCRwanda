import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Career updates validation schema
const careerUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  location: z.string().min(1, 'Location is required').optional(),
  status: z.enum(['Open', 'Closed']).optional(),
  desc: z.string().min(1, 'Description is required').optional(),
  slug: z.string().min(1, 'Slug is required').optional(),
  applicants: z.number().int().nonnegative().optional(),
});

// GET: Fetch a single career position
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const career = await prisma.career.findUnique({
      where: { id },
    });

    if (!career) {
      return NextResponse.json({ error: 'Career not found' }, { status: 404 });
    }

    return NextResponse.json(career);
  } catch (error) {
    console.error('Fetch career by id error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch career position' },
      { status: 500 }
    );
  }
}

// PUT: Update a career position
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = careerUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    // Verify slug uniqueness if updated
    if (result.data.slug) {
      const existing = await prisma.career.findFirst({
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

    const updatedCareer = await prisma.career.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(updatedCareer);
  } catch (error) {
    console.error('Update career error:', error);
    return NextResponse.json(
      { error: 'Failed to update career position' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a career position
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.career.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Career position deleted successfully' });
  } catch (error) {
    console.error('Delete career error:', error);
    return NextResponse.json(
      { error: 'Failed to delete career position' },
      { status: 500 }
    );
  }
}
