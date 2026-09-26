import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function ensureJobApplicationTable() {
  try {
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "JobApplication" (
        "id"          TEXT NOT NULL,
        "careerId"    TEXT,
        "careerTitle" TEXT NOT NULL,
        "fullName"    TEXT NOT NULL,
        "email"       TEXT NOT NULL,
        "phone"       TEXT NOT NULL,
        "coverLetter" TEXT NOT NULL,
        "resumeUrl"   TEXT,
        "status"      TEXT NOT NULL DEFAULT 'Pending',
        "read"        BOOLEAN NOT NULL DEFAULT false,
        "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
      )
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "JobApplication_careerId_idx" ON "JobApplication"("careerId")
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "JobApplication_read_idx" ON "JobApplication"("read")
    `;
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS "JobApplication_status_idx" ON "JobApplication"("status")
    `;
  } catch (e) {
    // Ignore
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureJobApplicationTable();

    const applications = await prisma.jobApplication.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(applications);
  } catch (error: any) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json({ error: 'Failed to fetch job applications' }, { status: 500 });
  }
}
