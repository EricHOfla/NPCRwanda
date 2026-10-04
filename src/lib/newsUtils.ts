export const ANNOUNCEMENT_CATEGORIES = [
  'announcement',
  'circular',
  'official circular',
  'notice',
  'public notice',
  'update',
  'important',
  'urgent notice',
  'press release'
];

export function isAnnouncementCategory(category?: string | null): boolean {
  if (!category) return false;
  const clean = category.trim().toLowerCase();
  return ANNOUNCEMENT_CATEGORIES.some(c => clean === c || clean.includes(c) || c.includes(clean));
}
