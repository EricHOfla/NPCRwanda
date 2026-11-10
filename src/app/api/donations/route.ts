import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' };

export async function GET(request: Request) {
  try {
    const donations = await prisma.donationInquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(donations, { headers: NO_STORE_HEADERS });
  } catch (error) {
    console.error('Fetch donations error:', error);
    return NextResponse.json({ error: 'Failed to fetch donation inquiries' }, { status: 500, headers: NO_STORE_HEADERS });
  }
}

export async function POST() {
  return NextResponse.json(
    { error: 'Donation inquiries are no longer accepted. Please use the online donation checkout.' },
    { status: 410, headers: NO_STORE_HEADERS }
  );
}
