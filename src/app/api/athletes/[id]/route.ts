import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// Athlete validation schema
const athleteUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  sport: z.string().min(1, 'Sport is required').optional(),
  status: z.enum(['Active', 'Inactive']).optional(),
  country: z.string().optional(),
  avatar: z.string().optional(),
  desc: z.string().min(1, 'Description is required').optional(),
});

// GET: Fetch a single athlete
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const athlete = await prisma.athlete.findUnique({
      where: { id },
    });

    if (!athlete) {
      return NextResponse.json({ error: 'Athlete not found' }, { status: 404 });
    }

    return NextResponse.json(athlete);
  } catch (error) {
    console.error('Fetch athlete by id error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch athlete' },
      { status: 500 }
    );
  }
}

// PUT: Update an athlete profile
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = athleteUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const updatedAthlete = await prisma.athlete.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(updatedAthlete);
  } catch (error) {
    console.error('Update athlete error:', error);
    return NextResponse.json(
      { error: 'Failed to update athlete' },
      { status: 500 }
    );
  }
}

// DELETE: Remove an athlete profile
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.athlete.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Athlete deleted successfully' });
  } catch (error) {
    console.error('Delete athlete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete athlete' },
      { status: 500 }
    );
  }
}
