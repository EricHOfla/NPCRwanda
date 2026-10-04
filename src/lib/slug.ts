/**
 * Slug normalization and matching utility for NPC Rwanda.
 * Handles URL-encoded characters, spaces, hyphens, and mixed cases.
 */

export function normalizeSlug(s: string | null | undefined): string {
  if (!s) return '';
  let str = s;
  try {
    str = decodeURIComponent(str);
  } catch {
    // Keep raw string if decoding fails
  }
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

/**
 * Checks if a news/announcement item matches a given slug or id.
 */
export function matchesSlug(
  item: { id?: string; slug?: string },
  targetSlugOrId: string | null | undefined
): boolean {
  if (!targetSlugOrId || !item) return false;

  const target = targetSlugOrId.trim();
  let decodedTarget = target;
  try {
    decodedTarget = decodeURIComponent(target);
  } catch {}

  const normalizedTarget = normalizeSlug(target);

  // 1. Direct ID match
  if (item.id && (item.id === target || item.id === decodedTarget)) {
    return true;
  }

  // 2. Direct slug match
  if (item.slug) {
    if (item.slug === target || item.slug === decodedTarget) {
      return true;
    }

    // 3. Case-insensitive match
    if (item.slug.toLowerCase() === target.toLowerCase() || item.slug.toLowerCase() === decodedTarget.toLowerCase()) {
      return true;
    }

    // 4. Normalized hyphen/space match
    if (normalizeSlug(item.slug) === normalizedTarget) {
      return true;
    }
  }

  return false;
}
