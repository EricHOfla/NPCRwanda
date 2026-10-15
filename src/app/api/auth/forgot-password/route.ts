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

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      const token = await signResetToken(user.email, user.id);
      
      // Determine origin from request or fallback
      const origin = request.headers.get('origin') || 'https://npcrwanda.org';
      const resetUrl = `${origin}/login?token=${token}&mode=reset`;

      // Send email via SMTP
      sendPasswordResetEmail(user.email, resetUrl, user.name).catch(err => {
        console.error('[Auth] Background reset email error:', err);
      });
    }

    // Always return success to protect privacy
    return NextResponse.json({
      success: true,
      message: 'If an account matches that email address, a password reset link has been dispatched.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' },
      { status: 500 }
    );
  }
}
