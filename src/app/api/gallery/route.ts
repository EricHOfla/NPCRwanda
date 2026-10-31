import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const schema = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().max(3000).default(''),
  mediaUrl: z.string().trim().min(1).max(2000),
  mediaType: z.enum(['image', 'video']).default('image'),
  category: z.string().max(100).default('General'),
  eventDate: z.string().max(40).default(''),
  published: z.boolean().default(false),
  order: z.number().int().default(0),
});

export async function GET() {
  try {
    const data = await prisma.galleryItem.findMany({
      where: { published: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error('Gallery fetch failed:', error);
    return NextResponse.json({ error: 'Unable to load gallery' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid media details', details: parsed.error.flatten() }, { status: 400 });
    const data = await prisma.galleryItem.create({ data: parsed.data });
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Gallery item create failed:', error);
    return NextResponse.json({ error: 'Unable to save gallery item' }, { status: 500 });
  }
}
