import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { sendCustomNewsletter } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    if (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permission denied. Admin privileges required.' }, { status: 403 });
    }

    const body = await request.json();
    const { subject, contentHtml, category } = body;

    if (!subject || !subject.trim()) {
      return NextResponse.json({ error: 'Email subject line is required.' }, { status: 400 });
    }

    if (!contentHtml || !contentHtml.trim()) {
      return NextResponse.json({ error: 'Newsletter content is required.' }, { status: 400 });
    }

    const result = await sendCustomNewsletter({
      subject: subject.trim(),
      contentHtml: contentHtml.trim(),
      category: category || 'all',
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error sending newsletter broadcast:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to dispatch newsletter broadcast.' },
      { status: 500 }
    );
  }
}
