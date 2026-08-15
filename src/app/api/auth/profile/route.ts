import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSessionUser, signJWT } from '@/lib/auth';

// GET: Retrieve current logged-in user profile details
export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look up by email (stable across reseeds) rather than relying on JWT userId
    const user = await prisma.user.findUnique({
      where: { email: session.email },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Fetch profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update current logged-in user profile details
export async function PUT(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password } = body;

    // Basic validation
    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters' }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }
    if (password && password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Find current user by their session email (stable identifier)
    const currentUser = await prisma.user.findUnique({ where: { email: session.email } });
    if (!currentUser) {
      return NextResponse.json({ error: 'Your account was not found. Please log in again.' }, { status: 404 });
    }

    // Check if the new email is already taken by a DIFFERENT user
    if (email.trim() !== session.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: email.trim() } });
      if (emailTaken && emailTaken.id !== currentUser.id) {
        return NextResponse.json({ error: 'Email already in use by another account' }, { status: 400 });
      }
    }

    // Build update payload
    const updateData: { name: string; email: string; passwordHash?: string } = {
      name: name.trim(),
      email: email.trim(),
    };
    if (password && password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    // Update user in DB using the real DB id
    const updatedUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: updateData,
    });

    // Issue a fresh JWT with updated info
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
      },
      message: 'Profile updated successfully',
    });

    // Replace the session cookie with fresh token
    response.cookies.set('npc_session', newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
