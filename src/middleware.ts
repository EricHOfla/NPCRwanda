import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_npc_rwanda_2026';
const key = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('npc_session')?.value;

  // Helper: verify JWT validity
  const isValidSession = async (): Promise<boolean> => {
    if (!sessionCookie) return false;
    try {
      await jwtVerify(sessionCookie, key);
      return true;
    } catch {
      return false;
    }
  };

  // 1. If already logged in and trying to visit /login → redirect to dashboard
  if (pathname === '/login') {
    if (await isValidSession()) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 2. Dashboard protection — must be logged in
  if (pathname.startsWith('/dashboard')) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      await jwtVerify(sessionCookie, key);
      return NextResponse.next();
    } catch {
      // Expired or invalid token — clear cookie and send to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set('npc_session', '', { maxAge: 0, path: '/' });
      return response;
    }
  }

  // 3. Protected API endpoints
  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
    const method = request.method;
    let requiresAuth = false;

    const isInboxRoute =
      pathname.startsWith('/api/contacts') ||
      pathname.startsWith('/api/volunteers') ||
      pathname.startsWith('/api/donations');

    const isSettingsRoute = pathname.startsWith('/api/system-settings');

    if (isInboxRoute) {
      // GET, PUT, DELETE require auth. POST is public (form submissions).
      if (['GET', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        requiresAuth = true;
      }
    } else if (isSettingsRoute) {
      // All system-settings methods require auth
      requiresAuth = true;
    } else {
      // All write operations require auth; GET is public
      if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
        requiresAuth = true;
      }
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

        // Editors cannot delete resources
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

  return NextResponse.next();
}

// Match dashboard, login, and all API routes
export const config = {
  matcher: ['/login', '/dashboard/:path*', '/api/:path*'],
};
