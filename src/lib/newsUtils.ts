export const ANNOUNCEMENT_CATEGORIES = ['announcement', 'notice', 'update', 'important'];

export function isAnnouncementCategory(category?: string | null): boolean {
  if (!category) return false;
  return ANNOUNCEMENT_CATEGORIES.includes(category.trim().toLowerCase());
}
