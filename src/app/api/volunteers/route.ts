import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const volunteerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  interest: z.string().min(1, 'Interest area is required'),
  skills: z.string().min(1, 'Skills description is required'),
  details: z.string().min(1, 'Details are required'),
});

export async function GET(request: Request) {
  try {
    const volunteers = await prisma.volunteerApplication.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(volunteers);
  } catch (error) {
    console.error('Fetch volunteers error:', error);
    return NextResponse.json({ error: 'Failed to fetch volunteer applications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = volunteerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const newApp = await prisma.volunteerApplication.create({
      data: {
        name: result.data.name,
        email: result.data.email,
        interest: result.data.interest,
        skills: result.data.skills,
        details: result.data.details,
        read: false,
      },
    });
    return NextResponse.json(newApp, { status: 201 });
  } catch (error) {
    console.error('Create volunteer error:', error);
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
