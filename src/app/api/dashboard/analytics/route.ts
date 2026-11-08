import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/rbac-server';
import { ANNOUNCEMENT_CATEGORIES } from '@/lib/newsUtils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' };

export async function GET(request: NextRequest) {
  const auth = await authorizeRequest(request, 'reports.view');
  if (!auth.authorized) return auth.response;

  const usersAuth = await authorizeRequest(request, 'users.view');
  const requestedDays = Number(request.nextUrl.searchParams.get('days') || 30);
  const days = [7, 30, 90, 365].includes(requestedDays) ? requestedDays : 30;
  const now = new Date();
  const from = new Date(now.getTime());
  from.setDate(from.getDate() - (days - 1));
  from.setHours(0, 0, 0, 0);

  try {
    const [
      athletes, activeAthletes, athleteSports, partners, totalUsers, totalAnnouncements, publishedNews, draftNews,
      upcomingEvents, totalEvents, trainingPrograms, unreadMessages, totalMessages, volunteers,
      pendingJobs, eventRegistrations, sponsorInquiries,
      activeSubscribers, successfulPayments, pendingPayments, failedPayments,
      allSuccessfulTotals
    ] = await Promise.all([
      prisma.athlete.count(),
      prisma.athlete.count({ where: { status: 'Active' } }),
      prisma.athlete.groupBy({ by: ['sport'], _count: { _all: true }, orderBy: { _count: { sport: 'desc' } } }),
      prisma.partner.count({ where: { active: true } }),
      usersAuth.authorized ? prisma.user.count() : Promise.resolve(null),
      prisma.newsArticle.count({
        where: { OR: ANNOUNCEMENT_CATEGORIES.map((category) => ({ category: { contains: category, mode: 'insensitive' as const } })) }
      }),
      prisma.newsArticle.count({ where: { status: 'Published' } }),
      prisma.newsArticle.count({ where: { status: 'Draft' } }),
      prisma.event.count({ where: { status: { in: ['Upcoming', 'Ongoing'] } } }),
      prisma.event.count(),
      prisma.trainingProgram.count(),
      prisma.contactMessage.count({ where: { read: false } }),
      prisma.contactMessage.count(),
      prisma.volunteerApplication.count(),
      prisma.jobApplication.count({ where: { status: 'Pending' } }),
      prisma.eventRegistration.count({ where: { status: { in: ['Pending', 'New'] } } }),
      prisma.sponsorInquiry.count({ where: { status: { in: ['New', 'Pending'] } } }),
      prisma.subscriber.count({ where: { active: true } }),
      prisma.donationPayment.findMany({
        where: { status: 'SUCCESSFUL', createdAt: { gte: from } },
        select: { amount: true, currency: true, createdAt: true }
      }),
      prisma.donationPayment.count({ where: { status: 'PENDING' } }),
      prisma.donationPayment.count({ where: { status: 'FAILED' } }),
      prisma.donationPayment.groupBy({ by: ['currency'], where: { status: 'SUCCESSFUL' }, _sum: { amount: true }, _count: { _all: true } })
    ]);

    const buckets = Array.from({ length: days }, (_, index) => {
      const date = new Date(from.getTime());
      date.setDate(from.getDate() + index);
      return { date: date.toISOString().slice(0, 10), rwf: 0, usd: 0, count: 0 };
    });
    const bucketMap = new Map(buckets.map((bucket) => [bucket.date, bucket] as const));
    for (const payment of successfulPayments) {
      const bucket = bucketMap.get(payment.createdAt.toISOString().slice(0, 10));
      if (!bucket) continue;
      if (payment.currency === 'RWF') bucket.rwf += payment.amount;
      if (payment.currency === 'USD') bucket.usd += payment.amount;
      bucket.count += 1;
    }

    const totals = {
      RWF: allSuccessfulTotals.find((item) => item.currency === 'RWF')?._sum.amount || 0,
      USD: allSuccessfulTotals.find((item) => item.currency === 'USD')?._sum.amount || 0,
      count: allSuccessfulTotals.reduce((sum, item) => sum + item._count._all, 0)
    };

    return NextResponse.json({
      generatedAt: now.toISOString(),
      range: { days, from: from.toISOString(), to: now.toISOString() },
      members: { athletes, activeAthletes, partners, totalUsers },
      content: { totalAnnouncements, publishedNews, draftNews, upcomingEvents, totalEvents, trainingPrograms },
      engagement: {
        unreadMessages, totalMessages, volunteers, pendingJobs,
        eventRegistrations, sponsorInquiries, activeSubscribers,
        pendingWork: unreadMessages + pendingJobs + eventRegistrations + sponsorInquiries
      },
      donations: {
        rangeRwf: successfulPayments.filter((p) => p.currency === 'RWF').reduce((sum, p) => sum + p.amount, 0),
        rangeUsd: successfulPayments.filter((p) => p.currency === 'USD').reduce((sum, p) => sum + p.amount, 0),
        rangeCount: successfulPayments.length,
        pendingPayments,
        failedPayments,
        lifetime: totals,
        daily: buckets
      },
      sports: athleteSports.map((item) => ({ sport: item.sport || 'Unspecified', athletes: item._count._all }))
    }, { headers: noStore });
  } catch (error) {
    console.error('[Dashboard analytics] Failed to aggregate live data:', error);
    return NextResponse.json({ error: 'Unable to load dashboard analytics.' }, { status: 500, headers: noStore });
  }
}
