import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

// Auto-creates the Subscriber table if it doesn't exist yet (production safety)
async function ensureSubscriberTable() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Subscriber" (
        "id"         TEXT NOT NULL,
        "email"      TEXT NOT NULL,
        "active"     BOOLEAN NOT NULL DEFAULT true,
        "categories" TEXT[] NOT NULL DEFAULT '{}',
        "token"      TEXT,
        "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
      )
    `;
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Subscriber_email_key" ON "Subscriber"("email")
    `;
  } catch {
    // Table may already exist — safe to ignore
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureSubscriberTable();

    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(subscribers);
  } catch (err: unknown) {
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

    await ensureSubscriberTable();

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
