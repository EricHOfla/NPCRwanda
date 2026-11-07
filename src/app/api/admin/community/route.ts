import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/rbac-server';

export const dynamic = 'force-dynamic';

const types = ['programmes', 'athleteEnquiries', 'eventRegistrations', 'sponsorEnquiries'] as const;

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeRequest(request, 'community.view');
    if (!auth.authorized) {
      return auth.response;
    }

    const [programmes, athleteEnquiries, eventRegistrations, sponsorEnquiries] = await Promise.all([
      prisma.trainingProgram.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.athleteEnquiry.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.eventRegistration.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.sponsorInquiry.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);
    return NextResponse.json({ programmes, athleteEnquiries, eventRegistrations, sponsorEnquiries });
  } catch (error) {
    console.error('Community admin data fetch failed:', error);
    return NextResponse.json({ error: 'Unable to load community management data' }, { status: 500 });
  }
}

const updateSchema = z.object({
  type: z.enum(types),
  id: z.string().min(1),
  status: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const auth = await authorizeRequest(request, 'community.manage');
    if (!auth.authorized) {
      return auth.response;
    }

    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid update request' }, { status: 400 });
    const { type, id, status } = parsed.data;
    let updated: unknown;
    switch (type) {
      case 'programmes':
        if (status && !['Draft', 'Published', 'Archived'].includes(status)) return NextResponse.json({ error: 'Invalid programme status' }, { status: 400 });
        if (!status) return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        updated = await prisma.trainingProgram.update({ where: { id }, data: { status } }); break;
      case 'athleteEnquiries':
        if (!status || !['New', 'Contacted', 'Accepted', 'Closed'].includes(status)) return NextResponse.json({ error: 'Invalid enquiry status' }, { status: 400 });
        updated = await prisma.athleteEnquiry.update({ where: { id }, data: { status } }); break;
      case 'eventRegistrations':
        if (!status || !['Pending', 'Confirmed', 'Declined', 'Cancelled'].includes(status)) return NextResponse.json({ error: 'Invalid event registration status' }, { status: 400 });
        updated = await prisma.eventRegistration.update({ where: { id }, data: { status } }); break;
      case 'sponsorEnquiries':
        if (!status || !['New', 'Contacted', 'In Progress', 'Accepted', 'Declined', 'Closed'].includes(status)) return NextResponse.json({ error: 'Invalid sponsor enquiry status' }, { status: 400 });
        updated = await prisma.sponsorInquiry.update({ where: { id }, data: { status } }); break;
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Community admin update failed:', error);
    return NextResponse.json({ error: 'Unable to update this record. It may have already been removed.' }, { status: 500 });
  }
}

const deleteSchema = z.object({ type: z.enum(types), id: z.string().min(1) });
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authorizeRequest(request, 'community.delete');
    if (!auth.authorized) {
      return auth.response;
    }

    const parsed = deleteSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Invalid delete request' }, { status: 400 });
    const { type, id } = parsed.data;
    switch (type) {
      case 'programmes': await prisma.trainingProgram.delete({ where: { id } }); break;
      case 'athleteEnquiries': await prisma.athleteEnquiry.delete({ where: { id } }); break;
      case 'eventRegistrations': await prisma.eventRegistration.delete({ where: { id } }); break;
      case 'sponsorEnquiries': await prisma.sponsorInquiry.delete({ where: { id } }); break;
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Community admin delete failed:', error);
    return NextResponse.json({ error: 'Unable to delete this record. It may already be removed.' }, { status: 500 });
  }
}
