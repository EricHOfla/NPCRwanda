'use client';
/**
 * useProfile – Fetches the current admin session profile.
 * Returns the user's name, email, and role from /api/auth/profile.
 * Safe to call from any client component; returns a sensible default while loading.
 */
import { useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
}

const DEFAULT_PROFILE: UserProfile = { name: 'Admin', email: '', role: 'ADMIN' };

export function useProfile(): { profile: UserProfile; loading: boolean } {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled && json?.user) {
          setProfile({
            name: json.user.name || 'Admin',
            email: json.user.email || '',
            role: json.user.role || 'ADMIN',
          });
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { profile, loading };
}
