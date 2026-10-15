import { NextResponse, NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { Role } from '@prisma/client';

// PUT: Update user profile, role, or password
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permission denied. Administrator access required.' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, email, role, password } = body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updateData: {
      name?: string;
      email?: string;
      role?: Role;
      passwordHash?: string;
    } = {};

    if (name && typeof name === 'string' && name.trim().length >= 2) {
      updateData.name = name.trim();
    }

    if (email && typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      const cleanEmail = email.trim().toLowerCase();
      if (cleanEmail !== existingUser.email) {
        const emailTaken = await prisma.user.findUnique({ where: { email: cleanEmail } });
        if (emailTaken) {
          return NextResponse.json({ error: 'This email is already in use by another user.' }, { status: 409 });
        }
        updateData.email = cleanEmail;
      }
    }

    if (role && ['SUPER_ADMIN', 'ADMIN', 'EDITOR'].includes(role)) {
      if (role === 'SUPER_ADMIN' && session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Only a Super Admin can promote a user to Super Admin.' }, { status: 403 });
      }
      // If demoting an existing SUPER_ADMIN, ensure at least one other remains
      if (existingUser.role === 'SUPER_ADMIN' && role !== 'SUPER_ADMIN') {
        const superAdminsCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
        if (superAdminsCount <= 1) {
          return NextResponse.json({ error: 'Cannot demote the only remaining Super Administrator.' }, { status: 400 });
        }
      }
      updateData.role = role as Role;
    }

    if (password && typeof password === 'string') {
      if (password.length < 6) {
        return NextResponse.json({ error: 'New password must be at least 6 characters.' }, { status: 400 });
      }
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      user: updated,
      message: `User ${updated.name} updated successfully.`,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE: Remove a system user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Permission denied. Administrator access required.' }, { status: 403 });
    }

    const { id } = await params;
    const targetUser = await prisma.user.findUnique({ where: { id } });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Guard: Cannot delete yourself
    if (targetUser.email === session.email || targetUser.id === session.userId) {
      return NextResponse.json({ error: 'Security restriction: You cannot delete your own account while logged in.' }, { status: 400 });
    }

    // Guard: Only SUPER_ADMIN can delete another admin or SUPER_ADMIN
    if (targetUser.role === 'SUPER_ADMIN' || targetUser.role === 'ADMIN') {
      if (session.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: 'Only a Super Admin can delete administrator accounts.' }, { status: 403 });
      }
    }

    // Guard: If deleting a SUPER_ADMIN, ensure there is at least one other remaining
    if (targetUser.role === 'SUPER_ADMIN') {
      const superAdminsCount = await prisma.user.count({ where: { role: 'SUPER_ADMIN' } });
      if (superAdminsCount <= 1) {
        return NextResponse.json({ error: 'Cannot delete the only remaining Super Administrator account.' }, { status: 400 });
      }
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      message: `User ${targetUser.name} (${targetUser.email}) was removed successfully.`,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
