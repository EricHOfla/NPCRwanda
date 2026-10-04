import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { notifySubscribers } from '@/lib/mailer';
import { isAnnouncementCategory } from '@/lib/newsUtils';

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

// GET: Fetch a single news article (by id or slug)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let decoded = id;
    try {
      decoded = decodeURIComponent(id);
    } catch {}

    const clean = decoded.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // 1. Try direct ID or direct slug match
    let article = await prisma.newsArticle.findFirst({
      where: {
        OR: [
          { id },
          { slug: id },
          { slug: decoded },
          { slug: clean },
        ],
      },
    });

    // 2. If not found, search all for case-insensitive / normalized match
    if (!article) {
      const all = await prisma.newsArticle.findMany();
      article = all.find(a => 
        a.id === id ||
        a.slug.toLowerCase() === id.toLowerCase() ||
        a.slug.toLowerCase() === decoded.toLowerCase() ||
        a.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') === clean
      ) || null;
    }

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

    const existingArticle = await prisma.newsArticle.findUnique({
      where: { id },
      select: { status: true },
    });

    const updatedArticle = await prisma.newsArticle.update({
      where: { id },
      data: result.data,
    });

    // Only notify subscribers when status transitions to Published (not on every update)
    const wasAlreadyPublished = existingArticle?.status === 'Published';
    if (updatedArticle.status === 'Published' && !wasAlreadyPublished) {
      const isAnnouncement = isAnnouncementCategory(updatedArticle.category || '');
      const cat = isAnnouncement ? 'announcements' : 'news';
      const targetUrl = isAnnouncement
        ? `/announcements/${updatedArticle.slug}`
        : `/news/${updatedArticle.slug}`;

      notifySubscribers({
        category: cat,
        title: updatedArticle.title,
        description: updatedArticle.desc,
        url: targetUrl,
        imageUrl: updatedArticle.img,
      }).catch(err => console.warn('Notification error on news update:', err));
    }

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
