import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import {
  PUBLIC_HOSTNAMES,
  getAdminAppUrl,
  normalizeHostname,
  isAdminHostname,
} from '@/lib/site-domain';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_npc_rwanda_2026';
const key = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = normalizeHostname(request.headers.get('host'));
  const isAdminRequest = isAdminHostname(host);
  const isPublicRequest = PUBLIC_HOSTNAMES.includes(host) || (!isAdminRequest && host.endsWith('.npcrwanda.org'));
  const sessionCookie = request.cookies.get('npc_session')?.value;

  const setNoIndexHeader = (response: NextResponse) => {
    if (isAdminRequest) {
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    }
    return response;
  };

  const isValidSession = async (): Promise<boolean> => {
    if (!sessionCookie) return false;
    try {
      await jwtVerify(sessionCookie, key);
      return true;
    } catch {
      return false;
    }
  };

  if (isPublicRequest && pathname === '/login') {
    return NextResponse.redirect(new URL(getAdminAppUrl('/login'), request.url));
  }

  if (isPublicRequest && pathname.startsWith('/dashboard')) {
    const destination = (await isValidSession())
      ? new URL(getAdminAppUrl('/dashboard'), request.url)
      : new URL(getAdminAppUrl('/login?expired=true'), request.url);

    return NextResponse.redirect(destination);
  }

  if (isAdminRequest && pathname === '/') {
    if (await isValidSession()) {
      return setNoIndexHeader(NextResponse.redirect(new URL('/dashboard', request.url)));
    }
    return setNoIndexHeader(NextResponse.redirect(new URL('/login', request.url)));
  }

  if (pathname === '/login') {
    if (await isValidSession()) {
      const response = NextResponse.redirect(new URL('/dashboard', request.url));
      return setNoIndexHeader(response);
    }
    return setNoIndexHeader(NextResponse.next());
  }

  if (pathname.startsWith('/dashboard')) {
    if (!sessionCookie) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      return setNoIndexHeader(response);
    }

    try {
      await jwtVerify(sessionCookie, key);
      return setNoIndexHeader(NextResponse.next());
    } catch {
      const response = NextResponse.redirect(new URL('/login?expired=true', request.url));
      response.cookies.set('npc_session', '', { maxAge: 0, path: '/' });
      return setNoIndexHeader(response);
    }
  }

  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth') && !pathname.startsWith('/api/upload')) {
    const method = request.method;
    let requiresAuth = false;

    const isPublicFormRoute =
      pathname.startsWith('/api/contacts') ||
      pathname.startsWith('/api/volunteers') ||
      pathname.startsWith('/api/donations') ||
      pathname === '/api/subscribers';

    const isUnsubscribeRoute = pathname.startsWith('/api/subscribers/unsubscribe');
    const isSettingsRoute = pathname.startsWith('/api/system-settings');

    if (isUnsubscribeRoute) {
      requiresAuth = false;
    } else if (isPublicFormRoute) {
      if (['GET', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        requiresAuth = true;
      }
    } else if (isSettingsRoute) {
      requiresAuth = true;
    } else if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
      requiresAuth = true;
    }

    if (requiresAuth) {
      if (!sessionCookie) {
        return NextResponse.json(
          { error: 'Unauthorized. Please log in.' },
          { status: 401 }
        );
      }

      try {
        const { payload } = await jwtVerify(sessionCookie, key);

        if (method === 'DELETE') {
          const userRole = payload.role as string;
          if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
            return NextResponse.json(
              { error: 'Forbidden. Insufficient privileges.' },
              { status: 403 }
            );
          }
        }

        return NextResponse.next();
      } catch {
        return NextResponse.json(
          { error: 'Unauthorized. Session expired or invalid.' },
          { status: 401 }
        );
      }
    }
  }

  const response = NextResponse.next();
  return setNoIndexHeader(response);
}

export const config = {
  matcher: ['/', '/login', '/dashboard', '/dashboard/:path*', '/api/:path*'],
};
