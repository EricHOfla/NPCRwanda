import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_npc_rwanda_2026';
const key = new TextEncoder().encode(JWT_SECRET);

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  name: string;
}

// Session timeout: 2 hours of inactivity/duration
export const SESSION_MAX_AGE_SECONDS = 2 * 60 * 60; // 7,200 seconds (2 hours)
export const SESSION_EXPIRATION_STR = '2h';

// Sign a JWT token containing user session details
export async function signJWT(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(SESSION_EXPIRATION_STR)
    .sign(key);
}

// Verify a JWT token
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Extract and verify session user from request cookies (Server Component / Route Handler helper)
export async function getSessionUser(request?: NextRequest): Promise<JWTPayload | null> {
  let token: string | undefined;

  if (request) {
    token = request.cookies.get('npc_session')?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get('npc_session')?.value;
  }

  if (!token) return null;
  return verifyJWT(token);
}

// Enforce auth role checks
export function hasRequiredRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole);
}

// Generate a 1-hour password reset token
export async function signResetToken(email: string, userId: string): Promise<string> {
  return new SignJWT({ email, userId, purpose: 'pwd_reset' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key);
}

// Verify a password reset token
export async function verifyResetToken(token: string): Promise<{ email: string; userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    if (payload.purpose !== 'pwd_reset') return null;
    return { email: payload.email as string, userId: payload.userId as string };
  } catch {
    return null;
  }
}

