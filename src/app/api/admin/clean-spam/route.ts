import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/rbac';

export const dynamic = 'force-dynamic';

const KNOWN_SPAM_DOMAINS = [
  'example.com',
  'test.com',
  'sample.com',
  'dummy.com',
  'mailinator.com',
  'guerrillamail.com',
  '10minutemail.com',
  'tempmail.com',
  'dispostable.com',
  'yopmail.com',
  'trashmail.com',
];

/**
 * POST /api/admin/clean-spam
 * Cleans fake/spam or demo records from submissions tables.
 * Requires authenticated session (ADMIN or SUPER_ADMIN).
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRequest(request, 'inbox.clean-spam');
    if (!auth.authorized) {
      return auth.response;
    }

    const body = await request.json();
    const { target, mode } = body;
    // target: 'contacts' | 'volunteers' | 'donations' | 'subscribers' | 'all'
    // mode: 'spam' (removes obvious bot/test/disposable emails) | 'all' (wipes the section)

    const result: Record<string, number> = {};

    // 1. Contact Messages
    if (target === 'contacts' || target === 'all') {
      if (mode === 'all') {
        const deleted = await prisma.contactMessage.deleteMany({});
        result.contacts = deleted.count;
      } else {
        const spamOrClause = KNOWN_SPAM_DOMAINS.map(domain => ({
          email: { contains: domain },
        }));
        const deleted = await prisma.contactMessage.deleteMany({
          where: {
            OR: [
              ...spamOrClause,
              { name: { in: ['test', 'Test', 'John Doe', 'Jane Doe', 'Admin'] } },
              { subject: { contains: 'test', mode: 'insensitive' } },
            ],
          },
        });
        result.contacts = deleted.count;
      }
    }

    // 2. Volunteer Applications
    if (target === 'volunteers' || target === 'all') {
      if (mode === 'all') {
        const deleted = await prisma.volunteerApplication.deleteMany({});
        result.volunteers = deleted.count;
      } else {
        const spamOrClause = KNOWN_SPAM_DOMAINS.map(domain => ({
          email: { contains: domain },
        }));
        const deleted = await prisma.volunteerApplication.deleteMany({
          where: {
            OR: [
              ...spamOrClause,
              { name: { in: ['test', 'Test', 'John Doe', 'Jane Doe', 'Volunteer Test'] } },
              { skills: { contains: 'test', mode: 'insensitive' } },
            ],
          },
        });
        result.volunteers = deleted.count;
      }
    }

    // 3. Donation Inquiries
    if (target === 'donations' || target === 'all') {
      if (mode === 'all') {
        const deleted = await prisma.donationInquiry.deleteMany({});
        result.donations = deleted.count;
      } else {
        const spamOrClause = KNOWN_SPAM_DOMAINS.map(domain => ({
          email: { contains: domain },
        }));
        const deleted = await prisma.donationInquiry.deleteMany({
          where: {
            OR: [
              ...spamOrClause,
              { name: { in: ['test', 'Test', 'John Doe', 'Jane Doe'] } },
              { details: { contains: 'test', mode: 'insensitive' } },
            ],
          },
        });
        result.donations = deleted.count;
      }
    }

    // 4. Subscribers
    if (target === 'subscribers' || target === 'all') {
      if (mode === 'all') {
        const deleted = await prisma.subscriber.deleteMany({});
        result.subscribers = deleted.count;
      } else {
        const spamOrClause = KNOWN_SPAM_DOMAINS.map(domain => ({
          email: { contains: domain },
        }));
        const deleted = await prisma.subscriber.deleteMany({
          where: {
            OR: [
              ...spamOrClause,
              { email: { startsWith: 'test' } },
            ],
          },
        });
        result.subscribers = deleted.count;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Cleanup operation completed successfully.',
      cleaned: result,
    });
  } catch (error: any) {
    console.error('[Admin Clean Spam] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to complete cleanup operation' },
      { status: 500 }
    );
  }
}
