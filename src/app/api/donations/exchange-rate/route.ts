import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const rate = Number(process.env.USD_RWF_MOBILE_MONEY_RATE);
  const rateDate = process.env.USD_RWF_MOBILE_MONEY_RATE_DATE || '';
  const rateAgeDays = Math.floor((Date.now() - Date.parse(`${rateDate}T00:00:00Z`)) / 86400000);
  if (!Number.isFinite(rate) || rate <= 1 || rate >= 100000 || !/^\d{4}-\d{2}-\d{2}$/.test(rateDate) || !Number.isFinite(rateAgeDays) || rateAgeDays < 0 || rateAgeDays > 7) {
    return NextResponse.json({ error: 'USD to RWF mobile-money conversion is temporarily unavailable. Please choose RWF or pay by card.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
  return NextResponse.json({ base: 'USD', quote: 'RWF', rate, rateDate, source: 'NPC Rwanda configured daily rate' }, { headers: { 'Cache-Control': 'no-store' } });
}
