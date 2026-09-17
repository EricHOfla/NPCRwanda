import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { testSmtpConnection } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await testSmtpConnection();
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Error testing SMTP' }, { status: 500 });
  }
}
