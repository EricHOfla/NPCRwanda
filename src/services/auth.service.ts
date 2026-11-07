/**
 * Authentication API service helpers
 * Thin wrappers around /api/auth/* endpoints.
 * These are isomorphic fetch helpers — no React dependency.
 */

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

export async function loginUser(credentials: LoginCredentials): Promise<LoginResult> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) return { success: false, error: data.error || 'Login failed.' };
    return { success: true };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

export async function logoutUser(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' });
}

export async function fetchProfile(): Promise<{ name: string; email: string; role: string } | null> {
  try {
    const res = await fetch('/api/auth/profile');
    if (!res.ok) return null;
    const data = await res.json();
    return data?.user ?? null;
  } catch {
    return null;
  }
}
