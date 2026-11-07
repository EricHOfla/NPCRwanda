'use client';

import React, { createContext, useContext } from 'react';

export interface DashboardAuthProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

const DashboardAuthContext = createContext<DashboardAuthProfile | null>(null);

export function DashboardAuthProvider({
  profile,
  children,
}: {
  profile: DashboardAuthProfile;
  children: React.ReactNode;
}) {
  return (
    <DashboardAuthContext.Provider value={profile}>
      {children}
    </DashboardAuthContext.Provider>
  );
}

export function useDashboardAuth(): DashboardAuthProfile {
  const profile = useContext(DashboardAuthContext);
  if (!profile) {
    throw new Error('useDashboardAuth must be used inside DashboardAuthProvider');
  }
  return profile;
}
