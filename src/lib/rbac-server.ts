import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser, JWTPayload } from '@/lib/auth';
import { hasPermission, Permission, logAuthorizationFailure } from '@/lib/rbac';

export type AuthorizationResult =
  | { authorized: true; user: JWTPayload }
  | { authorized: false; response: NextResponse; user: JWTPayload | null };

/**
 * Server-side route handler authorization guard.
 *
 * Checks for a valid session and verifies the required granular permission.
 * Returns 401 if unauthenticated and 403 if authenticated but unauthorized.
 */
export async function authorizeRequest(
  request: NextRequest,
  requiredPermission: Permission
): Promise<AuthorizationResult> {
  const user = await getSessionUser(request);

  if (!user) {
    logAuthorizationFailure({
      reason: 'UNAUTHENTICATED',
      path: request.nextUrl.pathname,
      method: request.method,
      requiredPermission,
    });
    return {
      authorized: false,
      user: null,
      response: NextResponse.json(
        {
          error: 'Authentication required. Please sign in to continue.',
          code: 'UNAUTHENTICATED',
        },
        { status: 401 }
      ),
    };
  }

  if (!hasPermission(user.role, requiredPermission)) {
    logAuthorizationFailure({
      reason: 'FORBIDDEN',
      userId: user.userId,
      userEmail: user.email,
      userRole: user.role,
      path: request.nextUrl.pathname,
      method: request.method,
      requiredPermission,
    });
    return {
      authorized: false,
      user,
      response: NextResponse.json(
        {
          error: "You don't have permission to access this resource. Please contact your administrator if you believe you should have access.",
          code: 'FORBIDDEN',
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user };
}
