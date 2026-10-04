export const ANNOUNCEMENT_CATEGORIES = ['announcement', 'circular', 'notice', 'update', 'important', 'press release'];

export function isAnnouncementCategory(category?: string | null): boolean {
  if (!category) return false;
  return ANNOUNCEMENT_CATEGORIES.includes(category.trim().toLowerCase());
}
