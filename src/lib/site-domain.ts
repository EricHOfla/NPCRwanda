export const PUBLIC_HOSTNAMES = ['npcrwanda.org', 'www.npcrwanda.org'];
export const ADMIN_HOSTNAMES = ['admin.npcrwanda.org', 'www.admin.npcrwanda.org'];

export function normalizeHostname(hostname?: string | null): string {
  return (hostname || '').split(':')[0].trim().replace(/\.$/, '').toLowerCase();
}

export function getBrowserHostname(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  return normalizeHostname(window.location.hostname);
}

export function isAdminHostname(hostname?: string | null): boolean {
  const normalized = normalizeHostname(hostname ?? getBrowserHostname());

  if (!normalized) return false;

  return ADMIN_HOSTNAMES.includes(normalized) || normalized === 'admin.npcrwanda.org' || normalized.endsWith('.admin.npcrwanda.org');
}

export function isPublicHostname(hostname?: string | null): boolean {
  const normalized = normalizeHostname(hostname ?? getBrowserHostname());

  if (!normalized) return true;

  if (isAdminHostname(normalized)) return false;

  return PUBLIC_HOSTNAMES.includes(normalized) || normalized === 'npcrwanda.org' || normalized.endsWith('.npcrwanda.org');
}

export function getPublicAppUrl(path = '/'): string {
  const base = process.env.PUBLIC_APP_URL || process.env.NEXT_PUBLIC_PUBLIC_APP_URL || 'https://npcrwanda.org';
  return new URL(path, base).toString();
}

export function getAdminAppUrl(path = '/'): string {
  const base = process.env.ADMIN_APP_URL || process.env.NEXT_PUBLIC_ADMIN_APP_URL || 'https://admin.npcrwanda.org';
  return new URL(path, base).toString();
}

export function getAppEntryUrl(path = '/'): string {
  return isAdminHostname() ? getAdminAppUrl(path) : getPublicAppUrl(path);
}
