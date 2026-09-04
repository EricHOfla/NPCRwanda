import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const siteContentSchema = z.object({
  key: z.string().min(1, 'Key is required'),
  value: z.string().min(1, 'Value is required'),
  type: z.string().default('text'),
});

export async function GET() {
  try {
    const contents = await prisma.siteContent.findMany();
    return NextResponse.json(contents);
  } catch (error) {
    console.error('Fetch site content error:', error);
    return NextResponse.json({ error: 'Failed to fetch site content' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = siteContentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    const { key, value, type } = result.data;
    const content = await prisma.siteContent.upsert({
      where: { key },
      update: { value, type },
      create: { key, value, type },
    });

    return NextResponse.json(content);
  } catch (error) {
    console.error('Upsert site content error:', error);
    return NextResponse.json({ error: 'Failed to save site content' }, { status: 500 });
  }
}
