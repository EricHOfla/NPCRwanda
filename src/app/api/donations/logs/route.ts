import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/rbac-server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const auth = await authorizeRequest(request, 'donations.view');
  if (!auth.authorized) return auth.response;

  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Math.min(100000, Number(params.get('page')) || 1));
  const pageSize = Math.max(10, Math.min(100, Number(params.get('pageSize')) || 25));
  const event = params.get('event')?.trim();
  const status = params.get('status')?.trim();
  const search = params.get('search')?.trim().slice(0, 120);
  const from = params.get('from');
  const to = params.get('to');

  const where = {
    ...(event && event !== 'ALL' ? { event } : {}),
    ...(status && status !== 'ALL' ? { status } : {}),
    ...(search ? { OR: [{ txRef: { contains: search, mode: 'insensitive' as const } }, { message: { contains: search, mode: 'insensitive' as const } }] } : {}),
    ...(from || to ? { createdAt: { ...(from ? { gte: new Date(from) } : {}), ...(to ? { lte: new Date(to + 'T23:59:59.999Z') } : {}) } } : {}),
  };

  try {
    const [logs, total] = await Promise.all([
      prisma.donationPaymentLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.donationPaymentLog.count({ where }),
    ]);
    return NextResponse.json({
      logs: logs.map((log) => ({ ...log, metadata: log.metadata ? (() => { try { return JSON.parse(log.metadata!); } catch { return null; } })() : null })),
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
    }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } });
  } catch (error) {
    console.error('[Admin donation logs] Failed to load logs:', error);
    return NextResponse.json({ error: 'Unable to load donation payment logs.' }, { status: 500 });
  }
}
