/**
 * Admin-facing entity types
 */
export type {
  ContactMessage,
  VolunteerApplication,
  DonationInquiry,
  SystemUser,
} from '@/context/DataContext';

export type {
  JWTPayload,
} from '@/lib/auth';

export type {
  AppRole,
  Permission,
  DashboardSection,
} from '@/lib/rbac';
