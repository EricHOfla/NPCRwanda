import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { authorizeRequest } from '@/lib/rbac-server';

export const dynamic = 'force-dynamic';

const types = ['programmes'] as const;

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeRequest(request, 'community.view');
    if (!auth.authorized) {
      return auth.response;
    }

    const programmes = await prisma.trainingProgram.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ programmes });
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
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Community admin delete failed:', error);
    return NextResponse.json({ error: 'Unable to delete this record. It may already be removed.' }, { status: 500 });
  }
}
