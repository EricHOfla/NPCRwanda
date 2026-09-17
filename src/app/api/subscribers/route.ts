import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(subscribers);
  } catch (err: any) {
    console.error('Error fetching subscribers:', err);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();
    const categories = Array.isArray(body.categories) && body.categories.length > 0 
      ? body.categories 
      : ['news', 'events', 'careers', 'announcements'];

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

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
        email,
        categories,
      },
    });

    // Send welcome email asynchronously
    sendWelcomeEmail(email, newSubscriber.token).catch(() => {});

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for subscribing! You will receive notifications when new updates are published.' 
    });
  } catch (err: any) {
    console.error('Subscription error:', err);
    return NextResponse.json({ error: 'Failed to complete subscription. Please try again later.' }, { status: 500 });
  }
}
