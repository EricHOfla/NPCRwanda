import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [payments, total] = await Promise.all([
      prisma.donationPayment.findMany({ orderBy: { createdAt: 'desc' }, take: 250 }),
      prisma.donationPayment.aggregate({
        where: { status: 'SUCCESSFUL' },
        _sum: { amount: true },
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json({
      payments: payments.map((payment) => ({
        ...payment,
        providerId: payment.providerId ? payment.providerId.toString() : null,
      })),
      summary: {
        successfulAmount: total._sum.amount || 0,
        successfulCount: total._count._all,
        pendingCount: payments.filter((payment) => payment.status === 'PENDING').length,
        failedCount: payments.filter((payment) => payment.status === 'FAILED').length,
      },
    }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } });
  } catch (error) {
    console.error('[Admin donations] Failed to load payment records:', error);
    return NextResponse.json({ error: 'Unable to load donation payments.' }, { status: 500 });
  }
}
