import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const systemComponentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  desc: z.string().min(1, 'Description is required'),
});

// GET: Fetch system components
export async function GET() {
  try {
    const components = await prisma.systemComponent.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(components);
  } catch (error) {
    console.error('Fetch system components error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system components' },
      { status: 500 }
    );
  }
}

// POST: Create a new system component
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = systemComponentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const newComponent = await prisma.systemComponent.create({
      data: result.data,
    });

    return NextResponse.json(newComponent, { status: 201 });
  } catch (error) {
    console.error('Create system component error:', error);
    return NextResponse.json(
      { error: 'Failed to create system component' },
      { status: 500 }
    );
  }
}
