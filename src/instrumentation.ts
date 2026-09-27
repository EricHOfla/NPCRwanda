export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    try {
      const { ensureAutoMigrated } = await import('@/lib/autoMigrate');
      await ensureAutoMigrated();
      console.log('[AutoMigrate] Server startup database schema check completed.');
    } catch (err) {
      console.error('[AutoMigrate] Error during startup auto-migration:', err);
    }
  }
}
