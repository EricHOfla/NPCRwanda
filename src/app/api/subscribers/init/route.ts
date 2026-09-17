import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Creates the Subscriber table on the production DB if it doesn't exist
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create Subscriber table if it doesn't exist (PostgreSQL)
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Subscriber" (
        "id"         TEXT NOT NULL,
        "email"      TEXT NOT NULL,
        "active"     BOOLEAN NOT NULL DEFAULT true,
        "categories" TEXT[] NOT NULL DEFAULT '{}',
        "token"      TEXT,
        "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Subscriber_pkey" PRIMARY KEY ("id")
      )
    `;

    // Create unique index on email
    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Subscriber_email_key" ON "Subscriber"("email")
    `;

    return NextResponse.json({ 
      success: true, 
      message: 'Subscriber table is ready.' 
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('DB init error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
