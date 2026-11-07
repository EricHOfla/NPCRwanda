// scripts/auto-migrate.js
// Runs during `npm run build` on deployment servers.
// If DATABASE_URL is accessible, automatically synchronizes the database schema using Prisma.
// If DATABASE_URL is not accessible from the build environment, it safely skips without failing the build.

const { execSync } = require('child_process');

try {
  require('dotenv').config();
} catch (e) {
  // dotenv optional
}

console.log('----------------------------------------------------');
console.log('[auto-migrate] Checking database configuration...');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.log('[auto-migrate] DATABASE_URL is not set in this build environment.');
  console.log('[auto-migrate] No database writes will be attempted during this build.');
  console.log('[auto-migrate] Apply committed Prisma migrations separately in the deployment environment.');
  console.log('----------------------------------------------------');
  process.exit(0);
}

try {
  console.log('[auto-migrate] Applying committed Prisma migrations (no schema reset or data-loss flags)...');
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env,
    timeout: 120000,
  });
  console.log('[auto-migrate] Committed database migrations applied successfully.');
} catch (err) {
  console.error('[auto-migrate] Prisma migrations failed. Aborting the build to prevent deploying against an incompatible schema.');
  console.error('[auto-migrate] Reason:', err.message || err);
  process.exit(1);
}

console.log('----------------------------------------------------');
