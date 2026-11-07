/**
 * Automated Test Suite: Role-Based Access Control (RBAC) System
 * NPC Rwanda Management Platform
 *
 * Validates permission matrices, role resolution, navigation guards,
 * and security barriers across all system roles.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessSection,
  getRolePermissions,
  normalizeRole,
} from '../../src/lib/rbac.ts';
import type { Permission, AppRole } from '../../src/lib/rbac.ts';

describe('RBAC: Role Normalization & Resolution', () => {
  it('normalizes role names regardless of case and surrounding whitespace', () => {
    assert.equal(normalizeRole('super_admin'), 'SUPER_ADMIN');
    assert.equal(normalizeRole('  admin  '), 'ADMIN');
    assert.equal(normalizeRole('Editor'), 'EDITOR');
    assert.equal(normalizeRole('manager'), 'MANAGER');
    assert.equal(normalizeRole('staff'), 'STAFF');
  });

  it('safely falls back to EDITOR when role is undefined or null', () => {
    assert.equal(normalizeRole(undefined), 'EDITOR');
    assert.equal(normalizeRole(null), 'EDITOR');
    assert.equal(normalizeRole(''), 'EDITOR');
  });
});

describe('RBAC: Super Administrator Permissions', () => {
  const role = 'SUPER_ADMIN';

  it('grants Super Admin exclusive access to System Settings', () => {
    assert.equal(hasPermission(role, 'system-settings.view'), true);
    assert.equal(hasPermission(role, 'system-settings.update'), true);
    assert.equal(hasPermission(role, 'system-settings.export-backup'), true);
  });

  it('grants Super Admin full access to User Management', () => {
    assert.equal(hasPermission(role, 'users.view'), true);
    assert.equal(hasPermission(role, 'users.create'), true);
    assert.equal(hasPermission(role, 'users.update'), true);
    assert.equal(hasPermission(role, 'users.delete'), true);
  });

  it('grants Super Admin full access to Financials and Donations', () => {
    assert.equal(hasPermission(role, 'donations.view'), true);
    assert.equal(hasPermission(role, 'donations.verify'), true);
    assert.equal(hasPermission(role, 'donations.manage'), true);
    assert.equal(hasPermission(role, 'donations.export'), true);
  });

  it('grants Super Admin full access to Sports & Community Desk', () => {
    assert.equal(hasPermission(role, 'community.view'), true);
    assert.equal(hasPermission(role, 'community.manage'), true);
    assert.equal(hasPermission(role, 'community.delete'), true);
  });

  it('allows Super Admin access to all dashboard sections', () => {
    assert.equal(canAccessSection(role, 'settings'), true);
    assert.equal(canAccessSection(role, 'users'), true);
    assert.equal(canAccessSection(role, 'donations-payments'), true);
    assert.equal(canAccessSection(role, 'community-sports'), true);
    assert.equal(canAccessSection(role, 'members'), true);
    assert.equal(canAccessSection(role, 'inbox'), true);
    assert.equal(canAccessSection(role, 'subscribers'), true);
    assert.equal(canAccessSection(role, 'pages'), true);
    assert.equal(canAccessSection(role, 'overview'), true);
  });
});

describe('RBAC: Administrator (ADMIN) Permissions & Security Boundary', () => {
  const role = 'ADMIN';

  it('STRICTLY DENIES Admin access to System Settings (Super Admin only)', () => {
    assert.equal(hasPermission(role, 'system-settings.view'), false);
    assert.equal(hasPermission(role, 'system-settings.update'), false);
    assert.equal(hasPermission(role, 'system-settings.export-backup'), false);
    assert.equal(canAccessSection(role, 'settings'), false);
  });

  it('grants Admin user management permissions', () => {
    assert.equal(hasPermission(role, 'users.view'), true);
    assert.equal(hasPermission(role, 'users.create'), true);
    assert.equal(hasPermission(role, 'users.update'), true);
    assert.equal(hasPermission(role, 'users.delete'), true);
    assert.equal(canAccessSection(role, 'users'), true);
  });

  it('grants Admin access to donation and payment management', () => {
    assert.equal(hasPermission(role, 'donations.view'), true);
    assert.equal(hasPermission(role, 'donations.verify'), true);
    assert.equal(hasPermission(role, 'donations.manage'), true);
    assert.equal(hasPermission(role, 'donations.export'), true);
    assert.equal(canAccessSection(role, 'donations-payments'), true);
  });

  it('grants Admin access to sports and community desk', () => {
    assert.equal(hasPermission(role, 'community.view'), true);
    assert.equal(hasPermission(role, 'community.manage'), true);
    assert.equal(hasPermission(role, 'community.delete'), true);
    assert.equal(canAccessSection(role, 'community-sports'), true);
  });
});

describe('RBAC: Manager Permissions', () => {
  const role = 'MANAGER';

  it('denies Manager access to System Settings and Database Backups', () => {
    assert.equal(hasPermission(role, 'system-settings.view'), false);
    assert.equal(hasPermission(role, 'system-settings.update'), false);
    assert.equal(hasPermission(role, 'system-settings.export-backup'), false);
    assert.equal(canAccessSection(role, 'settings'), false);
  });

  it('denies Manager access to User Management and User Creation/Deletion', () => {
    assert.equal(hasPermission(role, 'users.view'), false);
    assert.equal(hasPermission(role, 'users.create'), false);
    assert.equal(hasPermission(role, 'users.delete'), false);
    assert.equal(canAccessSection(role, 'users'), false);
  });

  it('grants Manager access to Donations viewing & export and Community Desk', () => {
    assert.equal(hasPermission(role, 'donations.view'), true);
    assert.equal(hasPermission(role, 'donations.export'), true);
    assert.equal(hasPermission(role, 'community.view'), true);
    assert.equal(hasPermission(role, 'community.manage'), true);
    assert.equal(canAccessSection(role, 'donations-payments'), true);
    assert.equal(canAccessSection(role, 'community-sports'), true);
  });
});

describe('RBAC: Content Editor Permissions', () => {
  const role = 'EDITOR';

  it('STRICTLY DENIES Editor access to System Settings', () => {
    assert.equal(hasPermission(role, 'system-settings.view'), false);
    assert.equal(hasPermission(role, 'system-settings.update'), false);
    assert.equal(canAccessSection(role, 'settings'), false);
  });

  it('STRICTLY DENIES Editor access to User Management', () => {
    assert.equal(hasPermission(role, 'users.view'), false);
    assert.equal(hasPermission(role, 'users.create'), false);
    assert.equal(canAccessSection(role, 'users'), false);
  });

  it('STRICTLY DENIES Editor access to Financial Donations & Payments', () => {
    assert.equal(hasPermission(role, 'donations.view'), false);
    assert.equal(hasPermission(role, 'donations.export'), false);
    assert.equal(canAccessSection(role, 'donations-payments'), false);
  });

  it('STRICTLY DENIES Editor access to Sports Development & Community Desk', () => {
    assert.equal(hasPermission(role, 'community.view'), false);
    assert.equal(canAccessSection(role, 'community-sports'), false);
  });

  it('grants Editor content authoring permissions', () => {
    assert.equal(hasPermission(role, 'content.view'), true);
    assert.equal(hasPermission(role, 'content.create'), true);
    assert.equal(hasPermission(role, 'content.update'), true);
    assert.equal(hasPermission(role, 'content.publish'), true);
    assert.equal(canAccessSection(role, 'pages'), true);
    assert.equal(canAccessSection(role, 'overview'), true);
  });
});

describe('RBAC: Staff Permissions', () => {
  const role = 'STAFF';

  it('denies Staff all administrative and configuration settings', () => {
    assert.equal(hasPermission(role, 'system-settings.view'), false);
    assert.equal(hasPermission(role, 'users.view'), false);
    assert.equal(hasPermission(role, 'donations.view'), false);
    assert.equal(canAccessSection(role, 'settings'), false);
    assert.equal(canAccessSection(role, 'users'), false);
    assert.equal(canAccessSection(role, 'donations-payments'), false);
  });

  it('grants Staff read-only access to content and communications', () => {
    assert.equal(hasPermission(role, 'content.view'), true);
    assert.equal(hasPermission(role, 'inbox.view'), true);
    assert.equal(hasPermission(role, 'reports.view'), true);
  });
});

describe('RBAC: Multi-Permission Helper Utilities', () => {
  it('correctly evaluates hasAnyPermission', () => {
    // Admin has users.view but not system-settings.view
    assert.equal(hasAnyPermission('ADMIN', ['system-settings.view', 'users.view']), true);
    // Editor has neither
    assert.equal(hasAnyPermission('EDITOR', ['system-settings.view', 'users.view']), false);
    // Editor has content.view
    assert.equal(hasAnyPermission('EDITOR', ['system-settings.view', 'content.view']), true);
  });

  it('correctly evaluates hasAllPermissions', () => {
    // Admin has users.view AND donations.view
    assert.equal(hasAllPermissions('ADMIN', ['users.view', 'donations.view']), true);
    // Admin does NOT have system-settings.view
    assert.equal(hasAllPermissions('ADMIN', ['users.view', 'system-settings.view']), false);
    // Super admin has both
    assert.equal(hasAllPermissions('SUPER_ADMIN', ['users.view', 'system-settings.view']), true);
  });
});
