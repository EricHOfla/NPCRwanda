import { NextRequest, NextResponse } from 'next/server';
import { authorizeRequest } from '@/lib/rbac-server';
import { sendCustomNewsletter } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRequest(request, 'subscribers.send');
    if (!auth.authorized) return auth.response;

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
