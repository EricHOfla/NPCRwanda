import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/rbac-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
  'Cache-Control': 'private, no-store, no-cache, must-revalidate, max-age=0',
  Vary: 'Cookie',
};

export async function GET(request: NextRequest) {
  const auth = await authorizeRequest(request, 'inbox.view');
  if (!auth.authorized) return auth.response;

  try {
    const [messageCount, volunteerCount, messages, volunteers] = await Promise.all([
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.volunteerApplication.count({ where: { read: false } }),
      prisma.contactMessage.findMany({
        where: { read: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, subject: true, message: true, date: true, createdAt: true },
      }),
      prisma.volunteerApplication.findMany({
        where: { read: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, interest: true, createdAt: true },
      }),
    ]);

    const items = [
      ...messages.map((item) => ({
        id: item.id,
        type: 'Message',
        sender: item.name,
        snippet: `${item.subject || 'Inquiry'}: ${(item.message || '').slice(0, 180)}`,
        date: item.date || item.createdAt.toISOString(),
        createdAt: item.createdAt.toISOString(),
        color: '#0b63b6',
        href: '/dashboard?tab=contacts&subtab=messages',
      })),
      ...volunteers.map((item) => ({
        id: item.id,
        type: 'Volunteer Form',
        sender: item.name,
        snippet: `Interested in ${item.interest || 'Volunteering'}`,
        date: item.createdAt.toISOString(),
        createdAt: item.createdAt.toISOString(),
        color: '#2e9e57',
        href: '/dashboard?tab=contacts&subtab=volunteers',
      })),

    ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 12)
      .map(({ createdAt: _createdAt, ...item }) => item);

    return NextResponse.json({
      unreadCount: messageCount + volunteerCount,
      items,
    }, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('[Dashboard notifications] Failed to load unread notifications:', error);
    return NextResponse.json({ error: 'Unable to load notifications.' }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
