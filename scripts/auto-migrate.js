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
  console.log('[auto-migrate] Runtime auto-migration will synchronize the database upon first request.');
  console.log('----------------------------------------------------');
  process.exit(0);
}

try {
  console.log('[auto-migrate] Synchronizing database schema with Prisma...');
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    stdio: 'inherit',
    env: process.env,
    timeout: 45000,
  });
  console.log('[auto-migrate] Database schema successfully synchronized with remote database.');
} catch (err) {
  console.warn('[auto-migrate] Notice: Build-time prisma db push was skipped or could not connect to database.');
  console.warn('[auto-migrate] Reason:', err.message || err);
  console.warn('[auto-migrate] The application runtime auto-migrator will safely self-heal tables/columns when the server boots.');
}

console.log('----------------------------------------------------');
process.exit(0);
