import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const [payments, successfulTotals, successfulCount, pendingCount, failedCount] = await Promise.all([
      prisma.donationPayment.findMany({ orderBy: { createdAt: 'desc' }, take: 250 }),
      prisma.donationPayment.groupBy({ by: ['currency'], where: { status: 'SUCCESSFUL' }, _sum: { amount: true } }),
      prisma.donationPayment.count({ where: { status: 'SUCCESSFUL' } }),
      prisma.donationPayment.count({ where: { status: 'PENDING' } }),
      prisma.donationPayment.count({ where: { status: 'FAILED' } }),
    ]);

    return NextResponse.json({
      payments: payments.map((payment) => ({
        ...payment,
        providerId: payment.providerId ? payment.providerId.toString() : null,
      })),
      summary: {
        successfulRwfAmount: successfulTotals.find((item) => item.currency === 'RWF')?._sum.amount || 0,
        successfulUsdAmount: successfulTotals.find((item) => item.currency === 'USD')?._sum.amount || 0,
        successfulCount,
        pendingCount,
        failedCount,
      },
    }, { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } });
  } catch (error) {
    console.error('[Admin donations] Failed to load payment records:', error);
    return NextResponse.json({ error: 'Unable to load donation payments.' }, { status: 500 });
  }
}
