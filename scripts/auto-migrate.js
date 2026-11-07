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
console.log('[auto-migrate] Build-time database migration is disabled by default.');
console.log('[auto-migrate] This avoids modifying a live database during a frontend build.');

if (process.env.RUN_PRISMA_MIGRATIONS === 'true') {
  if (!process.env.DATABASE_URL) {
    console.error('[auto-migrate] RUN_PRISMA_MIGRATIONS=true requires DATABASE_URL.');
    process.exit(1);
  }

  try {
    console.log('[auto-migrate] Applying committed Prisma migrations...');
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: process.env,
      timeout: 120000,
    });
    console.log('[auto-migrate] Committed Prisma migrations applied successfully.');
  } catch (err) {
    console.error('[auto-migrate] Prisma migrations failed. Aborting the build.');
    console.error('[auto-migrate] Reason:', err.message || err);
    process.exit(1);
  }
} else {
  console.log('[auto-migrate] Skipping database writes. Enable RUN_PRISMA_MIGRATIONS=true only after the production migration history has been safely baselined.');
}

console.log('----------------------------------------------------');
