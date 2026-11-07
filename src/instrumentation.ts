import { ensureAutoMigrated } from '@/lib/autoMigrate';

/**
 * Keep the existing additive schema compatibility checks during startup.
 * These checks only create missing tables/columns/indexes; they never seed,
 * update, or delete application records. Destructive or data-changing work
 * belongs in reviewed Prisma migrations.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      await ensureAutoMigrated();
      console.log('[AutoMigrate] Additive schema compatibility check completed.');
    } catch (err) {
      console.error('[AutoMigrate] Schema compatibility check failed:', err);
    }
  }
}
