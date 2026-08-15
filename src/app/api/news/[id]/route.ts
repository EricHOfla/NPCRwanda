import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

// News validation update schema
const newsUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  date: z.string().min(1, 'Date is required').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  status: z.enum(['Published', 'Draft']).optional(),
  img: z.string().optional(),
  desc: z.string().min(1, 'Description is required').optional(),
  content: z.string().optional(),
  slug: z.string().min(1, 'Slug is required').optional(),
});

// GET: Fetch a single news article
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const article = await prisma.newsArticle.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Fetch news article error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news article' },
      { status: 500 }
    );
  }
}

// PUT: Update a news article
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = newsUpdateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    // Verify slug uniqueness if slug is being updated
    if (result.data.slug) {
      const existing = await prisma.newsArticle.findFirst({
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

    const updatedArticle = await prisma.newsArticle.update({
      where: { id },
      data: result.data,
    });

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('Update news article error:', error);
    return NextResponse.json(
      { error: 'Failed to update news article' },
      { status: 500 }
    );
  }
}

// DELETE: Remove a news article
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.newsArticle.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'News article deleted successfully' });
  } catch (error) {
    console.error('Delete news article error:', error);
    return NextResponse.json(
      { error: 'Failed to delete news article' },
      { status: 500 }
    );
  }
}
