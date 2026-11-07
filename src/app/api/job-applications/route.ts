import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' };

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }


    const applications = await prisma.jobApplication.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(applications, { headers: NO_STORE_HEADERS });
  } catch (error: any) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json({ error: 'Failed to fetch job applications' }, { status: 500, headers: NO_STORE_HEADERS });
  }
}
