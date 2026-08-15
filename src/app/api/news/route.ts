import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// News validation schema
const newsSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['Published', 'Draft']).default('Draft'),
  img: z.string().default('news-volleyball.jpg'),
  desc: z.string().min(1, 'Description is required'),
  content: z.string().default(''),
  slug: z.string().min(1, 'Slug is required'),
});

// GET: Fetch news articles with optional filters and pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const slug = searchParams.get('slug') || '';
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page');
    const limit = searchParams.get('limit') || '10';

    const whereClause: any = {};

    if (category && category !== 'All') {
      whereClause.category = category;
    }
    
    if (status) {
      whereClause.status = status;
    }

    if (slug) {
      whereClause.slug = slug;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { desc: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (page) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const skip = (pageNum - 1) * limitNum;

      const [data, totalRecords] = await Promise.all([
        prisma.newsArticle.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.newsArticle.count({ where: whereClause }),
      ]);

      const totalPages = Math.ceil(totalRecords / limitNum);

      return NextResponse.json({
        data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalRecords,
          totalPages,
          currentPage: pageNum,
          nextPage: pageNum < totalPages ? pageNum + 1 : null,
          previousPage: pageNum > 1 ? pageNum - 1 : null,
        },
      });
    }

    const articles = await prisma.newsArticle.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Fetch news error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch news articles' },
      { status: 500 }
    );
  }
}

// POST: Create a new news article
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Auto-generate slug if not provided or empty
    if (!body.slug && body.title) {
      body.slug = body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const result = newsSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }

    // Verify slug uniqueness
    const existing = await prisma.newsArticle.findUnique({
      where: { slug: result.data.slug },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Slug must be unique.' },
        { status: 400 }
      );
    }

    const newArticle = await prisma.newsArticle.create({
      data: result.data,
    });

    return NextResponse.json(newArticle, { status: 201 });
  } catch (error) {
    console.error('Create news error:', error);
    return NextResponse.json(
      { error: 'Failed to create news article' },
      { status: 500 }
    );
  }
}
