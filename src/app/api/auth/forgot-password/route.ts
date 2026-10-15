import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signResetToken } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/mailer';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = (body.email || '').trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: `No registered administrative user found for "${email}". Please verify your email address.` },
        { status: 404 }
      );
    }

    const token = await signResetToken(user.email, user.id);
    
    // Determine origin from request headers or fallback
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const origin = request.headers.get('origin') || (host ? `${proto}://${host}` : 'https://npcrwanda.org');
    const resetUrl = `${origin}/login?token=${token}&mode=reset`;

    // Await email delivery via SMTP
    try {
      await sendPasswordResetEmail(user.email, resetUrl, user.name);
    } catch (mailErr: any) {
      console.error('[Auth] Reset email delivery error:', mailErr);
      return NextResponse.json(
        { error: 'Failed to dispatch reset email via SMTP. Please verify mail server configuration.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Password reset link has been dispatched to ${user.email}. Please check your inbox (and spam folder).`,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
