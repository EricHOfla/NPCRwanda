import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/rbac-server';

export const dynamic = 'force-dynamic';

// Only settings required by public components may leave the server boundary.
// SMTP credentials, per-user preferences, and other private settings stay server-side.
const PUBLIC_SETTING_KEYS = [
  'siteName',
  'siteSubtitle',
  'siteLogo',
  'contactPhone',
  'contactEmail',
  'address',
  'facebook',
  'twitter',
  'instagram',
  'youtube',
  'linkedin',
] as const;

export async function GET(request: NextRequest) {
  try {
    // Admin data is requested explicitly and requires a valid session. Public requests
    // never receive drafts, inactive records, or private administrative data.
    const adminScope = request.nextUrl.searchParams.get('scope') === 'admin';
    const authorization = adminScope
      ? await authorizeRequest(request, 'content.view')
      : null;
    if (authorization && !authorization.authorized) return authorization.response;
    const isAdminRequest = Boolean(authorization?.authorized);
    const today = new Date().toISOString().slice(0, 10);

    const [
      athletes,
      news,
      careers,
      sports,
      leadersRaw,
      governanceDocs,
      governancePolicies,
      events,
      partners,
      siteContentList,
      rawContactInfo,
      socialLinks,
      rawSystemSettings,
      associations,
      clubs,
      federations,
      dpscoContacts,
    ] = await Promise.all([
      prisma.athlete.findMany({
        where: isAdminRequest ? undefined : { status: 'Active' },
        take: 100,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.newsArticle.findMany({
        where: isAdminRequest ? undefined : { status: 'Published' },
        take: 100,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.career.findMany({
        where: isAdminRequest ? undefined : { status: 'Open', OR: [{ deadline: null }, { deadline: { gte: today } }] },
        take: 100,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sportDiscipline.findMany({
        orderBy: { title: 'asc' },
      }),
      prisma.leader.findMany({
        orderBy: [{ order: 'asc' }, { name: 'asc' }],
      }).catch(() =>
        // Fallback: if 'order' column still doesn't exist, sort by name only
        prisma.leader.findMany({ orderBy: { name: 'asc' } })
      ),
      prisma.governanceDocument.findMany({
        where: isAdminRequest ? undefined : { published: true },
        orderBy: { order: 'asc' },
      }),
      prisma.governancePolicy.findMany({
        where: isAdminRequest ? undefined : { published: true },
        orderBy: { order: 'asc' },
      }),
      prisma.event.findMany({
        where: isAdminRequest ? undefined : { status: { not: 'Cancelled' } },
        take: 100,
        orderBy: { date: 'asc' },
      }),
      prisma.partner.findMany({
        where: isAdminRequest ? undefined : { active: true },
        orderBy: { order: 'asc' },
      }),
      prisma.siteContent.findMany(),
      prisma.contactInfo.findFirst(),
      prisma.socialLink.findMany({
        where: isAdminRequest ? undefined : { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.systemSetting.findMany({ where: { key: { in: [...PUBLIC_SETTING_KEYS] } } }),
      prisma.npcAssociation.findMany({
        where: isAdminRequest ? undefined : { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.npcClub.findMany({
        where: isAdminRequest ? undefined : { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.npcFederation.findMany({
        where: isAdminRequest ? undefined : { active: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.dpscoContact.findMany({
        where: isAdminRequest ? undefined : { active: true },
        orderBy: [{ province: 'asc' }, { district: 'asc' }],
      }),
    ]);

    const leaders = leadersRaw;

    const contactInfo = rawContactInfo || {
      id: 'default',
      address: 'Amahoro Stadium, Kigali',
      phone: '+250 788 672 739',
      email: 'info@npcrwanda.org',
      mapUrl: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const settingsMap = rawSystemSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    if (contactInfo) {
      if (!settingsMap.contactPhone && contactInfo.phone) settingsMap.contactPhone = contactInfo.phone;
      if (!settingsMap.contactEmail && contactInfo.email) settingsMap.contactEmail = contactInfo.email;
      if (!settingsMap.address && contactInfo.address) settingsMap.address = contactInfo.address;
    }

    const seedDefaults: Record<string, string> = {
      siteName: 'NPC Rwanda',
      siteSubtitle: 'NATIONAL PARALYMPIC COMMITTEE OF RWANDA',
      siteLogo: '/assets/img/logo.png',
    };
    // Defaults are response-only: reading the public bundle must never create records.
    Object.entries(seedDefaults).forEach(([key, value]) => {
      if (!settingsMap[key]) settingsMap[key] = value;
    });

    const siteContentMap: Record<string, string> = {};
    siteContentList.forEach((c) => {
      if (c.value !== undefined && c.value !== null) {
        siteContentMap[c.key] = c.value;
      }
    });

    return NextResponse.json({
      athletes,
      news,
      careers,
      sports,
      leaders,
      governanceDocs,
      governancePolicies,
      events: events.map((event) => {
        if (event.status === 'Cancelled' || !event.date) return event;
        const start = event.date.trim();
        const end = event.endDate?.trim() || '';
        const status = start > today ? 'Upcoming' : (end ? end >= today ? 'Ongoing' : 'Completed' : start === today ? 'Ongoing' : 'Completed');
        return { ...event, status };
      }),
      partners,
      siteContent: siteContentList,
      siteContentMap,
      contactInfo,
      socialLinks,
      systemSettings: settingsMap,
      associations,
      clubs,
      federations,
      dpscoContacts,
    });
  } catch (error) {
    console.error('Fetch public bundle error:', error);
    return NextResponse.json({ error: 'Failed to fetch public bundle' }, { status: 500 });
  }
}
