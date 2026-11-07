import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/mailer';
import { validateAntiSpam, isRateLimited, getClientIp } from '@/lib/antiSpam';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const { searchParams } = new URL(request.url);
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const search = (searchParams.get('search') || '').trim();
    const status = searchParams.get('status') || 'all';

    const whereClause: any = {};
    if (search) {
      whereClause.email = { contains: search, mode: 'insensitive' };
    }
    if (status === 'active') {
      whereClause.active = true;
    } else if (status === 'inactive') {
      whereClause.active = false;
    }

    const isPaginated = pageParam !== null || limitParam !== null;
    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(limitParam || '10', 10) || 10));

    if (isPaginated) {
      const [items, total, totalAll, activeTotal] = await Promise.all([
        prisma.subscriber.findMany({
          where: whereClause,
          take: limit,
          skip: (page - 1) * limit,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.subscriber.count({ where: whereClause }),
        prisma.subscriber.count({}),
        prisma.subscriber.count({ where: { active: true } }),
      ]);

      return NextResponse.json({
        data: items,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
        counts: {
          total: totalAll,
          active: activeTotal,
          inactive: totalAll - activeTotal,
        },
      }, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' },
      });
    }

    // Fallback for unpaginated callers (capped at 100 for safety)
    const subscribers = await prisma.subscriber.findMany({
      where: whereClause,
      take: 100,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(subscribers, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' },
    });
  } catch (err: unknown) {
    console.error('Error fetching subscribers:', err);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // IP rate limiting check
    const clientIp = getClientIp(request);
    if (isRateLimited(clientIp, 6, 10)) {
      console.warn(`[AntiSpam] Rate limited subscription from IP: ${clientIp}`);
      return NextResponse.json({ success: true, message: 'Subscribed successfully!' }, { status: 200 });
    }

    // Bot & Spam validation
    const spamCheck = validateAntiSpam({
      website_url: body.website_url,
      hp_field: body.hp_field,
      _ts: body._ts,
      email: body.email,
    });

    if (spamCheck.isSpam) {
      console.warn(`[AntiSpam] Dropped fake/bot subscriber (${spamCheck.reason}) from IP: ${clientIp}`);
      return NextResponse.json({ success: true, message: 'Subscribed successfully!' }, { status: 200 });
    }

    const email = (body.email || '').trim().toLowerCase();
    const categories = Array.isArray(body.categories) && body.categories.length > 0 
      ? body.categories 
      : ['news', 'events', 'careers', 'announcements'];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }


    // Generate a unique ID and token
    const { randomBytes } = await import('crypto');
    const id = randomBytes(12).toString('hex');
    const token = randomBytes(24).toString('hex');

    const existing = await prisma.subscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.active) {
        return NextResponse.json({ message: 'You are already subscribed to updates!' });
      }
      // Re-activate if was inactive
      const updated = await prisma.subscriber.update({
        where: { email },
        data: { active: true, categories },
      });
      sendWelcomeEmail(email, updated.token).catch(() => {});
      return NextResponse.json({ message: 'Welcome back! Your subscription has been reactivated.' });
    }

    const newSubscriber = await prisma.subscriber.create({
      data: {
        id,
        email,
        categories,
        token,
      },
    });

    // Send welcome email asynchronously
    sendWelcomeEmail(email, newSubscriber.token).catch(() => {});

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for subscribing! You will receive notifications when new updates are published.' 
    });
  } catch (err: unknown) {
    console.error('Subscription error:', err);
    return NextResponse.json({ error: 'Failed to complete subscription. Please try again later.' }, { status: 500 });
  }
}
