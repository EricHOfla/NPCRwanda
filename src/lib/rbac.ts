/**
 * Role-Based Access Control (RBAC) System
 * NPC Rwanda Management Platform
 *
 * Implements granular, permission-based authorization across frontend and backend.
 * Isomorphic: permission checks run cleanly in Client Components, Server Components,
 * Middleware, and Route Handlers.
 */

import type { NextRequest, NextResponse } from 'next/server';
import type { JWTPayload } from '@/lib/auth';

// Standard system roles supported by the platform
export type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'EDITOR' | 'STAFF' | string;

// Granular permission strings
export type Permission =
  // System Configuration & Settings
  | 'system-settings.view'
  | 'system-settings.update'
  | 'system-settings.export-backup'
  // User Account Management
  | 'users.view'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  // Donations & Financial Records
  | 'donations.view'
  | 'donations.verify'
  | 'donations.manage'
  | 'donations.export'
  // Sports Development & Community Desk
  | 'community.view'
  | 'community.manage'
  | 'community.delete'
  // Members Directory (Federations, Clubs, Associations)
  | 'members.view'
  | 'members.manage'
  | 'members.delete'
  // Website Pages & Content Management (CMS)
  | 'content.view'
  | 'content.create'
  | 'content.update'
  | 'content.delete'
  | 'content.publish'
  // Inquiries & Communications (Contact, Volunteers, Job Applications)
  | 'inbox.view'
  | 'inbox.manage'
  | 'inbox.delete'
  | 'inbox.clean-spam'
  // Subscribers & Newsletter
  | 'subscribers.view'
  | 'subscribers.send'
  | 'subscribers.manage'
  // Analytics & Dashboard Reports
  | 'reports.view'
  | 'reports.export';

// Dashboard navigational sections
export type DashboardSection =
  | 'overview'
  | 'settings'
  | 'users'
  | 'donations'
  | 'donations-payments'
  | 'community'
  | 'community-sports'
  | 'members'
  | 'contacts'
  | 'inbox'
  | 'subscribers'
  | 'pages'
  | 'profile';

/**
 * Explicit role-to-permissions map.
 * Only SUPER_ADMIN possesses 'system-settings.*' permissions.
 */
const ROLE_PERMISSIONS_MAP: Record<string, Permission[]> = {
  SUPER_ADMIN: [
    'system-settings.view',
    'system-settings.update',
    'system-settings.export-backup',
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'donations.view',
    'donations.verify',
    'donations.manage',
    'donations.export',
    'community.view',
    'community.manage',
    'community.delete',
    'members.view',
    'members.manage',
    'members.delete',
    'content.view',
    'content.create',
    'content.update',
    'content.delete',
    'content.publish',
    'inbox.view',
    'inbox.manage',
    'inbox.delete',
    'inbox.clean-spam',
    'subscribers.view',
    'subscribers.send',
    'subscribers.manage',
    'reports.view',
    'reports.export',
  ],

  ADMIN: [
    // Note: ADMIN explicitly does NOT have system-settings.view, system-settings.update, or system-settings.export-backup
    'users.view',
    'users.create',
    'users.update',
    'users.delete',
    'donations.view',
    'donations.verify',
    'donations.manage',
    'donations.export',
    'community.view',
    'community.manage',
    'community.delete',
    'members.view',
    'members.manage',
    'members.delete',
    'content.view',
    'content.create',
    'content.update',
    'content.delete',
    'content.publish',
    'inbox.view',
    'inbox.manage',
    'inbox.delete',
    'inbox.clean-spam',
    'subscribers.view',
    'subscribers.send',
    'subscribers.manage',
    'reports.view',
    'reports.export',
  ],

  MANAGER: [
    'donations.view',
    'donations.export',
    'community.view',
    'community.manage',
    'members.view',
    'members.manage',
    'content.view',
    'content.create',
    'content.update',
    'content.publish',
    'inbox.view',
    'inbox.manage',
    'subscribers.view',
    'subscribers.send',
    'reports.view',
    'reports.export',
  ],

  EDITOR: [
    'content.view',
    'content.create',
    'content.update',
    'content.publish',
    'reports.view',
  ],

  STAFF: [
    'content.view',
    'inbox.view',
    'reports.view',
  ],
};

/**
 * Normalizes role string to standard uppercase format.
 */
export function normalizeRole(role?: string | null): string {
  if (!role || typeof role !== 'string') return 'EDITOR';
  return role.trim().toUpperCase();
}

/**
 * Retrieves all permissions assigned to a given role.
 */
export function getRolePermissions(role?: string | null): Permission[] {
  const norm = normalizeRole(role);
  return ROLE_PERMISSIONS_MAP[norm] || ROLE_PERMISSIONS_MAP.EDITOR;
}

/**
 * Checks whether a role has a specific permission.
 */
export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  const permissions = getRolePermissions(role);
  return permissions.includes(permission);
}

/**
 * Checks whether a role has at least one of the provided permissions.
 */
export function hasAnyPermission(role: string | null | undefined, permissions: Permission[]): boolean {
  const userPerms = new Set(getRolePermissions(role));
  return permissions.some((p) => userPerms.has(p));
}

/**
 * Checks whether a role has all of the provided permissions.
 */
export function hasAllPermissions(role: string | null | undefined, permissions: Permission[]): boolean {
  const userPerms = new Set(getRolePermissions(role));
  return permissions.every((p) => userPerms.has(p));
}

/**
 * Section-to-permission mapping for navigation and page routing.
 */
const SECTION_PERMISSION_MAP: Record<DashboardSection, Permission | Permission[]> = {
  overview: 'reports.view',
  settings: 'system-settings.view',
  users: 'users.view',
  donations: 'donations.view',
  'donations-payments': 'donations.view',
  community: 'community.view',
  'community-sports': 'community.view',
  members: 'members.view',
  contacts: 'inbox.view',
  inbox: 'inbox.view',
  subscribers: 'subscribers.view',
  pages: 'content.view',
  profile: 'reports.view',
};

/**
 * Evaluates whether a role is authorized to access a given dashboard section.
 */
export function canAccessSection(role: string | null | undefined, section: DashboardSection): boolean {
  const required = SECTION_PERMISSION_MAP[section];
  if (!required) return false;
  if (Array.isArray(required)) {
    return hasAnyPermission(role, required);
  }
  return hasPermission(role, required);
}

/**
 * Audit log helper: securely logs authorization failures without leaking sensitive credentials.
 */
export function logAuthorizationFailure(details: {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  requiredPermission?: Permission | string;
  path?: string;
  method?: string;
  reason: 'UNAUTHENTICATED' | 'FORBIDDEN';
}) {
  const timestamp = new Date().toISOString();
  console.warn(
    `[SECURITY AUDIT] ${timestamp} | Auth Failure | reason=${details.reason} | path=${details.path || 'unknown'} | method=${details.method || 'GET'} | user=${details.userEmail || 'anonymous'} | role=${details.userRole || 'none'} | required=${details.requiredPermission || 'none'}`
  );
}

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
  const { getSessionUser } = await import('@/lib/auth');
  const { NextResponse } = await import('next/server');

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
