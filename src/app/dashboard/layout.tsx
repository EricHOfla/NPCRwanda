import type { Metadata } from 'next';
import React, { Suspense } from 'react';
import { redirect } from 'next/navigation';
import DashboardLayoutClient from '@/components/dashboard/DashboardLayoutClient';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { DashboardUserProfile } from '@/components/dashboard/DashboardTopbar';

export const metadata: Metadata = {
  title: 'Admin Dashboard | NPC Rwanda',
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // The signed session already contains the role issued after successful login.
  // Read it on the server so the dashboard never needs a client-side profile check.
  const session = await getSessionUser();

  if (!session) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({ where: { email: session.email }, select: { id: true } });
  const avatarSetting = user ? await prisma.systemSetting.findUnique({ where: { key: `user.avatar.${user.id}` }, select: { value: true } }) : null;

  const initialProfile: DashboardUserProfile = {
    name: session.name || 'Admin',
    email: session.email || '',
    role: session.role || 'EDITOR',
    avatar: avatarSetting?.value || 'avatar-1.svg',
  };

  return (
    <Suspense fallback={null}>
      <DashboardLayoutClient initialProfile={initialProfile}>{children}</DashboardLayoutClient>
    </Suspense>
  );
}
