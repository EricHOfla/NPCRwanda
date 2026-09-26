import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
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
      // Safe fallback
    }

    const [
      athletes,
      news,
      careers,
      sports,
      leaders,
      governanceDocs,
      governancePolicies,
      events,
      partners,
      siteContentList,
      rawContactInfo,
      socialLinks,
      systemComponents,
      rawSystemSettings,
      associations,
      clubs,
      federations,
      dpscoContacts,
    ] = await Promise.all([
      prisma.athlete.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.newsArticle.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.career.findMany({
        take: 100,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.sportDiscipline.findMany({
        orderBy: { title: 'asc' },
      }),
      prisma.leader.findMany({
        orderBy: { name: 'asc' },
      }),
      prisma.governanceDocument.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
      }),
      prisma.governancePolicy.findMany({
        where: { published: true },
        orderBy: { order: 'asc' },
      }),
      prisma.event.findMany({
        take: 100,
        orderBy: { date: 'asc' },
      }),
      prisma.partner.findMany({
        orderBy: { order: 'asc' },
      }),
      prisma.siteContent.findMany(),
      prisma.contactInfo.findFirst(),
      prisma.socialLink.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.systemComponent.findMany({
        orderBy: { createdAt: 'asc' },
      }),
      prisma.systemSetting.findMany(),
      prisma.npcAssociation.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.npcClub.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.npcFederation.findMany({
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.dpscoContact.findMany({
        orderBy: [{ province: 'asc' }, { district: 'asc' }],
      }),
    ]);

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
    const missingEntries = Object.entries(seedDefaults).filter(([k]) => !settingsMap[k]);
    if (missingEntries.length > 0) {
      try {
        await prisma.$transaction(
          missingEntries.map(([key, value]) =>
            prisma.systemSetting.upsert({ where: { key }, update: {}, create: { key, value } })
          )
        );
        missingEntries.forEach(([k, v]) => { settingsMap[k] = v; });
      } catch (seedErr) {
        console.error('Failed to auto-seed system settings in bundle:', seedErr);
        missingEntries.forEach(([k, v]) => { settingsMap[k] = v; });
      }
    }

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
      events,
      partners,
      siteContent: siteContentList,
      siteContentMap,
      contactInfo,
      socialLinks,
      systemComponents,
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
