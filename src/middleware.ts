import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { hasPermission, type Permission } from '@/lib/rbac';
import {
  PUBLIC_HOSTNAMES,
  getAdminAppUrl,
  normalizeHostname,
  isAdminHostname,
} from '@/lib/site-domain';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_npc_rwanda_2026';
const key = new TextEncoder().encode(JWT_SECRET);

/**
 * Central API permission policy. Public submission endpoints remain anonymous;
 * management reads and every mutation are checked against the role matrix here.
 */
function getRequiredApiPermission(pathname: string, method: string): Permission | null {
  const is = (prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);
  const isWrite = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  if (is('/api/system-settings')) return method === 'GET' ? 'system-settings.view' : 'system-settings.update';
  if (is('/api/backup/export')) return 'system-settings.export-backup';
  if (is('/api/users')) {
    if (method === 'GET') return 'users.view';
    if (method === 'POST') return 'users.create';
    if (method === 'DELETE') return 'users.delete';
    if (isWrite) return 'users.update';
  }
  if (is('/api/donations/payments') || pathname === '/api/donations' && method === 'GET' || /^\/api\/donations\/[^/]+$/.test(pathname)) {
    if (method === 'GET') return 'donations.view';
    if (isWrite) return 'donations.manage';
  }
  if (is('/api/admin/clean-spam')) return 'inbox.clean-spam';
  if (is('/api/admin/community')) return method === 'GET' ? 'community.view' : 'community.manage';
  if (is('/api/dashboard/analytics')) return 'reports.view';

  const inboxRoots = ['/api/contacts', '/api/volunteers', '/api/job-applications', '/api/athlete-enquiries', '/api/event-registrations', '/api/sponsor-enquiries'];
  if (inboxRoots.some(is)) {
    if (method === 'GET') return 'inbox.view';
    if (method === 'DELETE') return 'inbox.delete';
    if (['PUT', 'PATCH'].includes(method)) return 'inbox.manage';
    // Public forms are allowed to submit; only administrative verbs are guarded.
    return null;
  }

  if (is('/api/subscribers')) {
    if (pathname.includes('/send')) return 'subscribers.send';
    if (pathname.includes('/unsubscribe') || pathname.includes('/init')) return null;
    if (method === 'GET') return 'subscribers.view';
    if (method === 'DELETE' || method === 'PUT' || method === 'PATCH') return 'subscribers.manage';
    return null;
  }

  if (is('/api/careers') && pathname.endsWith('/apply')) return null;

  const memberRoots = ['/api/npc-associations', '/api/npc-clubs', '/api/npc-federations', '/api/dpsco-contacts'];
  if (memberRoots.some(is)) {
    if (method === 'GET') return null; // public directory; admin scope is handled by the route
    if (method === 'DELETE') return 'members.delete';
    if (isWrite) return 'members.manage';
  }

  const communityRoots = ['/api/training-programs', '/api/competition-results', '/api/gallery'];
  if (communityRoots.some(is)) {
    if (method === 'GET') return null;
    if (method === 'DELETE') return 'community.delete';
    if (isWrite) return 'community.manage';
  }

  const contentRoots = [
    '/api/athletes', '/api/sports', '/api/leaders', '/api/events', '/api/news',
    '/api/careers', '/api/governance-docs', '/api/governance-policies',
    '/api/partners', '/api/social-links', '/api/site-content', '/api/contact-info',
    '/api/media', '/api/upload',
  ];
  if (contentRoots.some(is)) {
    if (!isWrite) return null; // public content reads are filtered by their handlers
    if (method === 'DELETE') return 'content.delete';
    if (method === 'POST') return 'content.create';
    return 'content.update';
  }

  return null;
}

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
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isPublicRequest && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url));
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

  if (pathname.startsWith('/api') && !pathname.startsWith('/api/auth')) {
    const method = request.method;
    let requiresAuth = false;

    const isAdminApiRoute = pathname.startsWith('/api/admin/');
    const isPublicFormRoute =
      pathname.startsWith('/api/contacts') ||
      pathname.startsWith('/api/volunteers') ||
      pathname.startsWith('/api/donations') ||
      pathname.startsWith('/api/athlete-enquiries') ||
      pathname.startsWith('/api/event-registrations') ||
      pathname.startsWith('/api/sponsor-enquiries') ||
      pathname === '/api/subscribers' ||
      pathname === '/api/careers/apply';

    const isUnsubscribeRoute = pathname.startsWith('/api/subscribers/unsubscribe');
    const isSettingsRoute = pathname.startsWith('/api/system-settings');
    const requiredPermission = getRequiredApiPermission(pathname, method);
    if (requiredPermission) requiresAuth = true;

    if (isAdminApiRoute) {
      requiresAuth = true;
    } else if (isUnsubscribeRoute) {
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
        const userRole = (payload.role as string || '').toUpperCase();
        if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
          return NextResponse.json(
            { error: 'Forbidden. Your role does not have permission for this action.', code: 'FORBIDDEN' },
            { status: 403 }
          );
        }

        // RBAC Enforcement Layer
        // 1. System Settings & Database Backups: Strictly Super Administrator only
        if (pathname.startsWith('/api/system-settings') || pathname.startsWith('/api/backup/export')) {
          if (userRole !== 'SUPER_ADMIN') {
            return NextResponse.json(
              {
                error: "You don't have permission to access this resource. Please contact your administrator if you believe you should have access.",
                code: 'FORBIDDEN',
              },
              { status: 403 }
            );
          }
        }

        // 2. User Account Management: Administrator or Super Administrator only
        if (pathname.startsWith('/api/users')) {
          if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
            return NextResponse.json(
              {
                error: "You don't have permission to access this resource. Please contact your administrator if you believe you should have access.",
                code: 'FORBIDDEN',
              },
              { status: 403 }
            );
          }
        }

        // 3. Donation Payments & Records: Administrator or Super Administrator only
        if (pathname.startsWith('/api/donations/payments')) {
          if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
            return NextResponse.json(
              {
                error: "You don't have permission to access this resource. Please contact your administrator if you believe you should have access.",
                code: 'FORBIDDEN',
              },
              { status: 403 }
            );
          }
        }

        // 4. Admin Community & Spam cleaning: Administrator or Super Administrator only
        if (pathname.startsWith('/api/admin/clean-spam') || pathname.startsWith('/api/admin/community')) {
          if (userRole !== 'SUPER_ADMIN' && userRole !== 'ADMIN') {
            return NextResponse.json(
              {
                error: "You don't have permission to access this resource. Please contact your administrator if you believe you should have access.",
                code: 'FORBIDDEN',
              },
              { status: 403 }
            );
          }
        }

        if (method === 'DELETE') {
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
