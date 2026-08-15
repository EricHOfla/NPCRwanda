import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const systemComponentUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  desc: z.string().min(1).optional(),
});

// GET: Fetch a single system component
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const component = await prisma.systemComponent.findUnique({
      where: { id },
    });

    if (!component) {
      return NextResponse.json({ error: 'System component not found' }, { status: 404 });
    }

    return NextResponse.json(component);
  } catch (error) {
    console.error('Fetch system component by id error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system component' },
      { status: 500 }
    );
  }
}

// PUT: Update a system component
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = systemComponentUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const updatedComponent = await prisma.systemComponent.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(updatedComponent);
  } catch (error) {
    console.error('Update system component error:', error);
    return NextResponse.json(
      { error: 'Failed to update system component' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a system component
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.systemComponent.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'System component deleted successfully' });
  } catch (error) {
    console.error('Delete system component error:', error);
    return NextResponse.json(
      { error: 'Failed to delete system component' },
      { status: 500 }
    );
  }
}
