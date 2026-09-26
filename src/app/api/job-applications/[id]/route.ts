import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { sendApplicationStatusEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const dataToUpdate: any = {};
    if (typeof body.read === 'boolean') {
      dataToUpdate.read = body.read;
    }
    if (body.status) {
      dataToUpdate.status = body.status;
    }

    const currentApp = await prisma.jobApplication.findUnique({
      where: { id },
    });

    if (!currentApp) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const updated = await prisma.jobApplication.update({
      where: { id },
      data: dataToUpdate,
    });

    // If the status has changed to Shortlisted or Rejected, send an official update email
    if (body.status && body.status !== currentApp.status && (body.status === 'Shortlisted' || body.status === 'Rejected')) {
      sendApplicationStatusEmail({
        fullName: updated.fullName,
        email: updated.email,
        careerTitle: updated.careerTitle,
        status: updated.status,
      }).catch(err => console.warn('[Recruitment] Error sending status email:', err));
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating job application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    await prisma.jobApplication.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Application deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting job application:', error);
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}
