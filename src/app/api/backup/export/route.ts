import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

function toSqlValue(val: any): string {
  if (val === null || val === undefined) {
    return 'NULL';
  }
  if (typeof val === 'boolean') {
    return val ? 'TRUE' : 'FALSE';
  }
  if (typeof val === 'number') {
    return Number.isFinite(val) ? String(val) : 'NULL';
  }
  if (val instanceof Date) {
    return `'${val.toISOString()}'`;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) {
      return `ARRAY[]::text[]`;
    }
    const escapedItems = val.map(item => `'${String(item).replace(/'/g, "''")}'`).join(', ');
    return `ARRAY[${escapedItems}]::text[]`;
  }
  if (typeof val === 'object') {
    const jsonStr = JSON.stringify(val).replace(/'/g, "''");
    return `'${jsonStr}'`;
  }
  const str = String(val).replace(/'/g, "''");
  return `'${str}'`;
}

function generateTableInserts(tableName: string, rows: Record<string, any>[]): string {
  if (!rows || rows.length === 0) {
    return `-- Table: "${tableName}" (0 rows)\n\n`;
  }

  const columns = Object.keys(rows[0]);
  const quotedColumns = columns.map(c => `"${c}"`).join(', ');

  let sql = `-- ========================================================\n`;
  sql += `-- Table: "${tableName}" (${rows.length} rows)\n`;
  sql += `-- ========================================================\n`;

  for (const row of rows) {
    const values = columns.map(col => toSqlValue(row[col])).join(', ');
    sql += `INSERT INTO "${tableName}" (${quotedColumns}) VALUES (${values}) ON CONFLICT ("id") DO NOTHING;\n`;
  }

  sql += `\n`;
  return sql;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden: Super Administrator privileges required to export system backups.' },
        { status: 403 }
      );
    }

    // Fetch all collections in parallel
    const [
      rawUsers,
      athletes,
      newsArticles,
      careers,
      contactMessages,
      sportDisciplines,
      leaders,
      volunteerApplications,
      jobApplications,
      donationInquiries,
      systemSettings,
      governanceDocuments,
      governancePolicies,
      events,
      partners,
      siteContents,
      contactInfos,
      socialLinks,
      mediaAssets,
      npcAssociations,
      npcClubs,
      npcFederations,
      dpscoContacts,
      subscribers,
    ] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.athlete.findMany(),
      prisma.newsArticle.findMany(),
      prisma.career.findMany(),
      prisma.contactMessage.findMany(),
      prisma.sportDiscipline.findMany(),
      prisma.leader.findMany(),
      prisma.volunteerApplication.findMany(),
      prisma.jobApplication.findMany(),
      prisma.donationInquiry.findMany(),
      prisma.systemSetting.findMany(),
      prisma.governanceDocument.findMany(),
      prisma.governancePolicy.findMany(),
      prisma.event.findMany(),
      prisma.partner.findMany(),
      prisma.siteContent.findMany(),
      prisma.contactInfo.findMany(),
      prisma.socialLink.findMany(),
      prisma.mediaAsset.findMany(),
      prisma.npcAssociation.findMany(),
      prisma.npcClub.findMany(),
      prisma.npcFederation.findMany(),
      prisma.dpscoContact.findMany(),
      prisma.subscriber.findMany(),
    ]);

    // Provide a safe placeholder password hash for User records so NOT NULL constraint is satisfied
    const users = rawUsers.map(u => ({
      ...u,
      passwordHash: '$SCRUBBED_SECURITY_HASH$',
    }));

    const timestamp = new Date().toISOString();
    const dateFormatted = timestamp.slice(0, 10);
    const totalRecords =
      users.length +
      athletes.length +
      newsArticles.length +
      careers.length +
      contactMessages.length +
      sportDisciplines.length +
      leaders.length +
      volunteerApplications.length +
      jobApplications.length +
      donationInquiries.length +
      systemSettings.length +
      governanceDocuments.length +
      governancePolicies.length +
      events.length +
      partners.length +
      siteContents.length +
      contactInfos.length +
      socialLinks.length +
      mediaAssets.length +
      npcAssociations.length +
      npcClubs.length +
      npcFederations.length +
      dpscoContacts.length +
      subscribers.length;

    let sql = `-- ========================================================\n`;
    sql += `-- National Paralympic Committee of Rwanda (NPC Rwanda)\n`;
    sql += `-- Database Backup (.SQL Dump)\n`;
    sql += `-- Exported At: ${timestamp}\n`;
    sql += `-- Exported By: ${session.email}\n`;
    sql += `-- Target DBMS: PostgreSQL (ANSI SQL compatible)\n`;
    sql += `-- Total Records Exported: ${totalRecords}\n`;
    sql += `-- Security Note: User credentials/passwords scrubbed with placeholders.\n`;
    sql += `-- ========================================================\n\n`;

    sql += `SET statement_timeout = 0;\n`;
    sql += `SET lock_timeout = 0;\n`;
    sql += `SET client_encoding = 'UTF8';\n`;
    sql += `SET standard_conforming_strings = on;\n`;
    sql += `SET check_function_bodies = false;\n`;
    sql += `SET xmloption = content;\n`;
    sql += `SET client_min_messages = warning;\n`;
    sql += `SET row_security = off;\n\n`;

    sql += `BEGIN;\n\n`;

    sql += generateTableInserts('User', users);
    sql += generateTableInserts('Athlete', athletes);
    sql += generateTableInserts('NewsArticle', newsArticles);
    sql += generateTableInserts('Career', careers);
    sql += generateTableInserts('ContactMessage', contactMessages);
    sql += generateTableInserts('SportDiscipline', sportDisciplines);
    sql += generateTableInserts('Leader', leaders);
    sql += generateTableInserts('VolunteerApplication', volunteerApplications);
    sql += generateTableInserts('JobApplication', jobApplications);
    sql += generateTableInserts('DonationInquiry', donationInquiries);
    sql += generateTableInserts('SystemSetting', systemSettings);
    sql += generateTableInserts('GovernanceDocument', governanceDocuments);
    sql += generateTableInserts('GovernancePolicy', governancePolicies);
    sql += generateTableInserts('Event', events);
    sql += generateTableInserts('Partner', partners);
    sql += generateTableInserts('SiteContent', siteContents);
    sql += generateTableInserts('ContactInfo', contactInfos);
    sql += generateTableInserts('SocialLink', socialLinks);
    sql += generateTableInserts('MediaAsset', mediaAssets);
    sql += generateTableInserts('NpcAssociation', npcAssociations);
    sql += generateTableInserts('NpcClub', npcClubs);
    sql += generateTableInserts('NpcFederation', npcFederations);
    sql += generateTableInserts('DpscoContact', dpscoContacts);
    sql += generateTableInserts('Subscriber', subscribers);

    sql += `COMMIT;\n\n`;
    sql += `-- ========================================================\n`;
    sql += `-- End of NPC Rwanda Database Backup\n`;
    sql += `-- ========================================================\n`;

    return new NextResponse(sql, {
      status: 200,
      headers: {
        'Content-Type': 'application/sql; charset=utf-8',
        'Content-Disposition': `attachment; filename="npcrwanda_backup_${dateFormatted}.sql"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Backup SQL export error:', error);
    return NextResponse.json({ error: 'Failed to generate SQL database export' }, { status: 500 });
  }
}
