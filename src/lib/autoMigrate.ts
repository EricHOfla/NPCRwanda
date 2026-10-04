import { prisma } from './prisma';

let migrationExecuted = false;
let migrationRunningPromise: Promise<void> | null = null;

const MIGRATION_STATEMENTS = [
  // 1. Table creation statements (safe if already exist)
  `CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Athlete" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "country" TEXT NOT NULL DEFAULT 'Rwanda',
    "avatar" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "NewsArticle" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "img" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "slug" TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Career" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "applicants" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Open',
    "desc" TEXT NOT NULL,
    "slug" TEXT UNIQUE NOT NULL,
    "deadline" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Leader" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "avatar" TEXT NOT NULL,
    "committee" TEXT NOT NULL DEFAULT 'Board of Directors',
    "email" TEXT,
    "phone" TEXT,
    "impairment" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "SportDiscipline" (
    "id" TEXT PRIMARY KEY,
    "slug" TEXT UNIQUE NOT NULL,
    "title" TEXT NOT NULL,
    "img" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Event" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "endDate" TEXT NOT NULL DEFAULT '',
    "location" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'National',
    "status" TEXT NOT NULL DEFAULT 'Upcoming',
    "img" TEXT NOT NULL DEFAULT 'sports-hero.jpg',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Partner" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "website" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'Government Sector',
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "GovernanceDocument" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL DEFAULT '#',
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "GovernancePolicy" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL DEFAULT '#',
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "SiteContent" (
    "id" TEXT PRIMARY KEY,
    "key" TEXT UNIQUE NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'text',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "ContactInfo" (
    "id" TEXT PRIMARY KEY,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mapUrl" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "SocialLink" (
    "id" TEXT PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "SystemSetting" (
    "id" TEXT PRIMARY KEY,
    "key" TEXT UNIQUE NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "SystemComponent" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "VolunteerApplication" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "interest" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "JobApplication" (
    "id" TEXT PRIMARY KEY,
    "careerId" TEXT,
    "careerTitle" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "resumeUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "DonationInquiry" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "supportType" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "MediaAsset" (
    "id" TEXT PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "NpcAssociation" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "activities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "icon" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "NpcClub" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "NpcFederation" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "website" TEXT,
    "role" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "DpscoContact" (
    "id" TEXT PRIMARY KEY,
    "province" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "coordinator" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS "Subscriber" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "categories" TEXT[] DEFAULT ARRAY['news', 'events', 'careers', 'announcements']::TEXT[],
    "token" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,

  // 2. Incremental column additions (self-healing for columns added over time)
  `ALTER TABLE "Career" ADD COLUMN IF NOT EXISTS "deadline" TEXT`,
  `ALTER TABLE "Career" ADD COLUMN IF NOT EXISTS "applicants" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "Career" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Open'`,
  `ALTER TABLE "Leader" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "Leader" ADD COLUMN IF NOT EXISTS "committee" TEXT NOT NULL DEFAULT 'Board of Directors'`,
  `ALTER TABLE "Leader" ADD COLUMN IF NOT EXISTS "email" TEXT`,
  `ALTER TABLE "Leader" ADD COLUMN IF NOT EXISTS "phone" TEXT`,
  `ALTER TABLE "Leader" ADD COLUMN IF NOT EXISTS "impairment" TEXT`,
  `ALTER TABLE "NewsArticle" ADD COLUMN IF NOT EXISTS "content" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "NewsArticle" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Draft'`,
  `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "endDate" TEXT NOT NULL DEFAULT ''`,
  `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'National'`,
  `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Upcoming'`,
  `ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "featured" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "Partner" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "Partner" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "GovernanceDocument" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "GovernanceDocument" ADD COLUMN IF NOT EXISTS "published" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "GovernancePolicy" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "GovernancePolicy" ADD COLUMN IF NOT EXISTS "published" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "SocialLink" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0`,
  `ALTER TABLE "SocialLink" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true`,
  `ALTER TABLE "JobApplication" ADD COLUMN IF NOT EXISTS "careerId" TEXT`,
  `ALTER TABLE "JobApplication" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Pending'`,
  `ALTER TABLE "JobApplication" ADD COLUMN IF NOT EXISTS "read" BOOLEAN NOT NULL DEFAULT false`,
  `ALTER TABLE "Subscriber" ADD COLUMN IF NOT EXISTS "categories" TEXT[] DEFAULT ARRAY['news', 'events', 'careers', 'announcements']::TEXT[]`,
  `ALTER TABLE "Subscriber" ADD COLUMN IF NOT EXISTS "token" TEXT`,
];

async function runAutoMigration(): Promise<void> {
  if (migrationExecuted) return;

  for (const statement of MIGRATION_STATEMENTS) {
    try {
      await prisma.$executeRawUnsafe(statement);
    } catch {
      // Ignore if table/column exists or syntax variation across PG versions
    }
  }

  // Also auto-close any careers where application deadline has passed
  try {
    const today = new Date().toISOString().split('T')[0];
    await prisma.career.updateMany({
      where: {
        status: 'Open',
        deadline: {
          not: null,
          lt: today,
        },
      },
      data: {
        status: 'Closed',
      },
    });
  } catch {
    // Safe ignore
  }

  // Self-heal news articles with spaces in slugs
  try {
    const articlesWithSpaces = await prisma.newsArticle.findMany({
      where: {
        slug: {
          contains: ' ',
        },
      },
    });
    for (const art of articlesWithSpaces) {
      const clean = art.slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const existing = await prisma.newsArticle.findFirst({ where: { slug: clean } });
      if (!existing) {
        await prisma.newsArticle.update({
          where: { id: art.id },
          data: { slug: clean },
        });
        console.log(`[AutoMigrate] Cleaned news slug from "${art.slug}" to "${clean}"`);
      }
    }
  } catch {
    // Safe ignore
  }

  migrationExecuted = true;
}

export function ensureAutoMigrated(): Promise<void> {
  if (migrationExecuted) return Promise.resolve();

  if (!migrationRunningPromise) {
    migrationRunningPromise = runAutoMigration()
      .catch((err) => {
        console.error('[AutoMigrate] Migration warning:', err);
      })
      .finally(() => {
        migrationRunningPromise = null;
      });
  }

  return migrationRunningPromise;
}

/**
 * Auto-update event statuses based on today's date.
 *
 * Rules (Cancelled events are never touched):
 *   - date > today               → Upcoming
 *   - date <= today <= endDate   → Ongoing
 *   - endDate < today (or date < today when no endDate)  → Completed
 *
 * Uses a single bulk UPDATE per status bucket for efficiency.
 */
export async function autoUpdateEventStatuses(): Promise<void> {
  try {
    const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Fetch all non-cancelled events
    const events = await prisma.event.findMany({
      where: { status: { not: 'Cancelled' } },
      select: { id: true, date: true, endDate: true, status: true },
    });

    const toUpcoming: string[] = [];
    const toOngoing: string[]  = [];
    const toCompleted: string[] = [];

    for (const ev of events) {
      const start = ev.date?.trim() || '';            // "YYYY-MM-DD"
      const end   = ev.endDate?.trim() || '';         // "YYYY-MM-DD" or ""

      let computed: string;
      if (!start) {
        continue; // no date stored — skip
      } else if (start > today) {
        computed = 'Upcoming';
      } else if (end && end >= today) {
        // start <= today AND end >= today → Ongoing
        computed = 'Ongoing';
      } else if (!end && start === today) {
        // single-day event, happening today
        computed = 'Ongoing';
      } else {
        computed = 'Completed';
      }

      if (computed !== ev.status) {
        if (computed === 'Upcoming')  toUpcoming.push(ev.id);
        if (computed === 'Ongoing')   toOngoing.push(ev.id);
        if (computed === 'Completed') toCompleted.push(ev.id);
      }
    }

    // Bulk updates — only run if there is something to change
    const updates: Promise<unknown>[] = [];
    if (toUpcoming.length)  updates.push(prisma.event.updateMany({ where: { id: { in: toUpcoming } },  data: { status: 'Upcoming' } }));
    if (toOngoing.length)   updates.push(prisma.event.updateMany({ where: { id: { in: toOngoing } },   data: { status: 'Ongoing' } }));
    if (toCompleted.length) updates.push(prisma.event.updateMany({ where: { id: { in: toCompleted } }, data: { status: 'Completed' } }));

    if (updates.length) {
      await Promise.all(updates);
      console.log(`[AutoStatus] Events updated — Upcoming:${toUpcoming.length} Ongoing:${toOngoing.length} Completed:${toCompleted.length}`);
    }
  } catch (err) {
    // Non-fatal — log and continue
    console.warn('[AutoStatus] Event status update skipped:', err);
  }
}
