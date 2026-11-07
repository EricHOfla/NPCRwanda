import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/rbac-server';

export const dynamic = 'force-dynamic';

/**
 * Readiness check only. Database schema changes must be applied through
 * reviewed Prisma migrations, never through a public/admin GET request.
 */
export async function GET(request: NextRequest) {
  const auth = await authorizeRequest(request, 'subscribers.manage');
  if (!auth.authorized) return auth.response;

  try {
    await prisma.subscriber.count();
    return NextResponse.json({ success: true, message: 'Subscriber storage is ready.' });
  } catch (error) {
    console.error('Subscriber storage readiness check failed:', error);
    return NextResponse.json(
      { success: false, error: 'Subscriber storage is not ready. Apply the pending Prisma migrations.' },
      { status: 503 }
    );
  }
}
