import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSessionUser, signJWT, SESSION_MAX_AGE_SECONDS } from '@/lib/auth';

const avatarSettingKey = (userId: string) => `user.avatar.${userId}`;

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.email },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const avatarSetting = await prisma.systemSetting.findUnique({
      where: { key: avatarSettingKey(user.id) },
      select: { value: true },
    });

    return NextResponse.json({ ...user, avatar: avatarSetting?.value || '' });
  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const avatar = typeof body.avatar === 'string' ? body.avatar.trim() : undefined;

    if (name.length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (password && password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }
    if (avatar !== undefined && avatar && !avatar.startsWith('/') && !/^https:\\/\\//i.test(avatar)) {
      return NextResponse.json({ error: 'Invalid profile photo URL' }, { status: 400 });
    }

    const currentUser = await prisma.user.findUnique({ where: { email: session.email } });
    if (!currentUser) {
      return NextResponse.json({ error: 'Your account was not found. Please log in again.' }, { status: 404 });
    }

    if (email !== session.email.toLowerCase()) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken && emailTaken.id !== currentUser.id) {
        return NextResponse.json({ error: 'Email already in use by another account' }, { status: 400 });
      }
    }

    const updateData: { name: string; email: string; passwordHash?: string } = { name, email };
    if (password) updateData.passwordHash = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
    });

    if (avatar !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: avatarSettingKey(updatedUser.id) },
        create: { key: avatarSettingKey(updatedUser.id), value: avatar },
        update: { value: avatar },
      });
    }

    const newToken = await signJWT({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      name: updatedUser.name,
    });

    const response = NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        avatar: avatar ?? (await prisma.systemSetting.findUnique({
          where: { key: avatarSettingKey(updatedUser.id) },
          select: { value: true },
        }))?.value ?? '',
      },
      message: 'Profile updated successfully',
    });

    response.cookies.set('npc_session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
