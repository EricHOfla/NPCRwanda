import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/rbac-server';
import { ANNOUNCEMENT_CATEGORIES } from '@/lib/newsUtils';
import { createReadStream } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { createGunzip } from 'node:zlib';
import { createHash } from 'node:crypto';
import { createInterface } from 'node:readline';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const noStore = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' };

type TrafficDay = { date: string; views: number; visitors: number };

async function readWebsiteTraffic(from: Date, days: number) {
  const logDirectory = '/var/log/nginx';
  const logName = 'npcrwanda-access.log';
  const dayMap = new Map<string, TrafficDay>();
  const pageCounts = new Map<string, number>();
  const referrerCounts = new Map<string, number>();
  const sourceCounts = new Map<string, number>();
  const deviceCounts = new Map<string, number>();
  const browserCounts = new Map<string, number>();
  const osCounts = new Map<string, number>();
  const visitorDays = new Map<string, Set<string>>();
  const hourlyCounts = new Map<string, number>();
  const visitorHashes = new Set<string>();
  const visitorHashesByDay = new Map<string, Set<string>>();
  let pageViews = 0;
  let notFoundPages = 0;
  let downloads = 0;

  for (let index = 0; index < days; index += 1) {
    const date = new Date(from);
    date.setDate(from.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    dayMap.set(key, { date: key, views: 0, visitors: 0 });
    visitorHashesByDay.set(key, new Set());
  }

  try {
    const names = (await readdir(logDirectory))
      .filter((name) => /^npcrwanda-access\.log(?:\.\d+)?(?:\.gz)?$/.test(name))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    for (const name of names) {
      const fullPath = path.join(logDirectory, name);
      const input = createReadStream(fullPath);
      const stream = name.endsWith('.gz') ? input.pipe(createGunzip()) : input;
      const lines = createInterface({ input: stream, crlfDelay: Infinity });

      for await (const line of lines) {
        const match = line.match(/^([^ ]+) [^ ]+ [^ ]+ \[([^\]]+)\] "([A-Z]+) ([^ "]+) HTTP\/[^"]+" (\d{3}) [^ ]+ "([^"]*)" "([^"]*)"/);
        if (!match) continue;

        const [, ip, timestamp, method, rawTarget, statusText, rawReferrer, userAgent] = match;
        if (method !== 'GET') continue;
        if (/bot|crawler|spider|slurp|headless|preview|monitor|uptime|curl|wget|python-requests|facebookexternalhit|whatsapp|MSIE [1-8]|Windows 98|AOL/i.test(userAgent)) continue;
        if (rawTarget.includes('_rsc=') || rawTarget.includes('__next')) continue;

        const pathname = rawTarget.split('?')[0];
        if (!pathname.startsWith('/') || pathname.startsWith('/api/') || pathname.startsWith('/_next/')) continue;
        const parsedDate = new Date(timestamp.replace(/^(\d{2})\/([A-Za-z]{3})\/(\d{4}):/, '$2 $1 $3 '));
        if (Number.isNaN(parsedDate.getTime()) || parsedDate < from) continue;
        const status = Number(statusText);
        const isDownload = /\.(?:pdf|docx?|xlsx?|pptx?|zip)$/i.test(pathname);
        if (status >= 200 && status < 400 && isDownload) downloads += 1;
        if (status === 404 && !/\.(?:avif|css|csv|gif|ico|jpe?g|js|json|map|png|svg|txt|webp|woff2?|xml)$/i.test(pathname)) notFoundPages += 1;
        if (status < 200 || status >= 400 || isDownload) continue;
        if (/\.(?:avif|css|csv|gif|ico|jpe?g|js|json|map|png|svg|txt|webp|woff2?|xml)$/i.test(pathname)) continue;

        const day = parsedDate.toISOString().slice(0, 10);
        const bucket = dayMap.get(day);
        if (!bucket) continue;

        const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';
        bucket.views += 1;
        pageViews += 1;
        pageCounts.set(normalizedPath, (pageCounts.get(normalizedPath) || 0) + 1);

        const visitorHash = createHash('sha256')
          .update(`${process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'npcrwanda-local-traffic'}:${ip}`)
          .digest('hex');
        visitorHashes.add(visitorHash);
        visitorHashesByDay.get(day)?.add(visitorHash);
        const seenDays = visitorDays.get(visitorHash) || new Set<string>();
        seenDays.add(day);
        visitorDays.set(visitorHash, seenDays);

        const hour = String(parsedDate.getHours()).padStart(2, '0') + ':00';
        hourlyCounts.set(hour, (hourlyCounts.get(hour) || 0) + 1);
        const device = /ipad|tablet/i.test(userAgent) ? 'Tablet' : /mobile|android|iphone|ipod/i.test(userAgent) ? 'Mobile' : 'Desktop';
        deviceCounts.set(device, (deviceCounts.get(device) || 0) + 1);
        const browser = /edg\//i.test(userAgent) ? 'Edge' : /opr\//i.test(userAgent) ? 'Opera' : /firefox\//i.test(userAgent) ? 'Firefox' : /chrome\//i.test(userAgent) ? 'Chrome' : /safari\//i.test(userAgent) ? 'Safari' : 'Other';
        browserCounts.set(browser, (browserCounts.get(browser) || 0) + 1);
        const os = /android/i.test(userAgent) ? 'Android' : /iphone|ipad|ipod/i.test(userAgent) ? 'iOS' : /windows/i.test(userAgent) ? 'Windows' : /mac os/i.test(userAgent) ? 'macOS' : /linux/i.test(userAgent) ? 'Linux' : 'Other';
        osCounts.set(os, (osCounts.get(os) || 0) + 1);

        let source = 'Direct';
        if (rawReferrer && rawReferrer !== '-') {
          try {
            const referrerUrl = new URL(rawReferrer);
            const hostname = referrerUrl.hostname.replace(/^www\./, '').toLowerCase();
            if (hostname && hostname !== 'npcrwanda.org') {
              referrerCounts.set(hostname, (referrerCounts.get(hostname) || 0) + 1);
              source = /google\.|bing\.|yahoo\.|duckduckgo\./i.test(hostname) ? 'Search' : /facebook\.|instagram\.|linkedin\.|x\.com|twitter\.|tiktok\.|youtube\./i.test(hostname) ? 'Social' : 'Referral';
            }
          } catch {
            // Ignore malformed referrer values.
          }
        }
        sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
      }
    }

    for (const [day, visitors] of visitorHashesByDay) {
      const bucket = dayMap.get(day);
      if (bucket) bucket.visitors = visitors.size;
    }

    return {
      available: true,
      pageViews,
      uniqueVisitors: visitorHashes.size,
      returningVisitors: Array.from(visitorDays.values()).filter((seen) => seen.size > 1).length,
      notFoundPages,
      downloads,
      daily: Array.from(dayMap.values()),
      hourly: Array.from(hourlyCounts, ([hour, views]) => ({ hour, views })).sort((a, b) => a.hour.localeCompare(b.hour)),
      devices: Array.from(deviceCounts, ([name, visits]) => ({ name, visits })).sort((a, b) => b.visits - a.visits),
      browsers: Array.from(browserCounts, ([name, visits]) => ({ name, visits })).sort((a, b) => b.visits - a.visits),
      operatingSystems: Array.from(osCounts, ([name, visits]) => ({ name, visits })).sort((a, b) => b.visits - a.visits),
      sources: Array.from(sourceCounts, ([name, visits]) => ({ name, visits })).sort((a, b) => b.visits - a.visits),
      topPages: Array.from(pageCounts, ([page, views]) => ({ page, views })).sort((a, b) => b.views - a.views).slice(0, 8),
      referrers: Array.from(referrerCounts, ([source, visits]) => ({ source, visits })).sort((a, b) => b.visits - a.visits).slice(0, 8),
      note: 'Traffic is read from the public Nginx access log. Visitor counts are approximate and use hashed IP addresses. Device, browser and operating-system details are inferred from browser user-agent strings.'
    };
  } catch (error) {
    console.error('[Dashboard analytics] Website traffic log unavailable:', error);
    return {
      available: false,
      pageViews: 0,
      uniqueVisitors: 0,
      daily: Array.from(dayMap.values()),
      topPages: [],
      referrers: [],
      note: 'The public Nginx traffic log is not readable by the application process.'
    };
  }
}


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
      upcomingEvents, totalEvents, trainingPrograms, unreadMessages, totalMessages, volunteers, unreadVolunteers,
      pendingJobs, eventRegistrations, sponsorInquiries,
      activeSubscribers, successfulPayments, pendingPayments, failedPayments,
      allSuccessfulTotals,
      websiteTraffic,
      trafficConversions
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
      prisma.volunteerApplication.count({ where: { read: false } }),
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
      prisma.donationPayment.groupBy({ by: ['currency'], where: { status: 'SUCCESSFUL' }, _sum: { amount: true }, _count: { _all: true } }),
      readWebsiteTraffic(from, days),
      Promise.all([
        prisma.contactMessage.count({ where: { createdAt: { gte: from } } }),
        prisma.volunteerApplication.count({ where: { createdAt: { gte: from } } }),
        prisma.jobApplication.count({ where: { createdAt: { gte: from } } }),
        prisma.eventRegistration.count({ where: { createdAt: { gte: from } } }),
        prisma.sponsorInquiry.count({ where: { createdAt: { gte: from } } }),
        prisma.subscriber.count({ where: { createdAt: { gte: from } } }),
        prisma.donationPayment.count({ where: { status: 'SUCCESSFUL', createdAt: { gte: from } } })
      ])
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
        unreadMessages, totalMessages, volunteers, unreadVolunteers, pendingJobs,
        eventRegistrations, sponsorInquiries, activeSubscribers,
        pendingWork: unreadMessages + unreadVolunteers + pendingJobs + eventRegistrations + sponsorInquiries
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
      sports: athleteSports.map((item) => ({ sport: item.sport || 'Unspecified', athletes: item._count._all })),
      websiteTraffic: {
        ...websiteTraffic,
        conversions: {
          contactMessages: trafficConversions[0],
          volunteerApplications: trafficConversions[1],
          jobApplications: trafficConversions[2],
          eventRegistrations: trafficConversions[3],
          sponsorInquiries: trafficConversions[4],
          newsletterSubscriptions: trafficConversions[5],
          successfulDonations: trafficConversions[6]
        }
      }
    }, { headers: noStore });
  } catch (error) {
    console.error('[Dashboard analytics] Failed to aggregate live data:', error);
    return NextResponse.json({ error: 'Unable to load dashboard analytics.' }, { status: 500, headers: noStore });
  }
}
