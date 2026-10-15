import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

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
      users,
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
      // Sanitize user passwords
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

    const timestamp = new Date().toISOString();
    const backupData = {
      meta: {
        system: 'National Paralympic Committee of Rwanda (NPC Rwanda)',
        version: '1.0.0',
        exportedAt: timestamp,
        exportedBy: session.email,
        counts: {
          users: users.length,
          athletes: athletes.length,
          newsArticles: newsArticles.length,
          careers: careers.length,
          contactMessages: contactMessages.length,
          sportDisciplines: sportDisciplines.length,
          leaders: leaders.length,
          volunteerApplications: volunteerApplications.length,
          jobApplications: jobApplications.length,
          donationInquiries: donationInquiries.length,
          systemSettings: systemSettings.length,
          governanceDocuments: governanceDocuments.length,
          governancePolicies: governancePolicies.length,
          events: events.length,
          partners: partners.length,
          siteContents: siteContents.length,
          contactInfos: contactInfos.length,
          socialLinks: socialLinks.length,
          mediaAssets: mediaAssets.length,
          npcAssociations: npcAssociations.length,
          npcClubs: npcClubs.length,
          npcFederations: npcFederations.length,
          dpscoContacts: dpscoContacts.length,
          subscribers: subscribers.length,
        },
      },
      data: {
        users,
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
      },
    };

    const dateFormatted = new Date().toISOString().slice(0, 10);
    const jsonString = JSON.stringify(backupData, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="npcrwanda_backup_${dateFormatted}.json"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Backup export error:', error);
    return NextResponse.json({ error: 'Failed to generate database export' }, { status: 500 });
  }
}
