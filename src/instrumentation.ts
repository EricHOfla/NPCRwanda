/**
 * Database schema changes are applied through explicit Prisma migrations.
 * Application startup must remain read-only and must never seed or rewrite
 * production records as a side effect of starting a web worker.
 */
export async function register() {
  // Intentionally no database writes during application startup.
}
