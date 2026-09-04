import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { Role } from '@prisma/client';

let adminCheckCompleted = false;

/**
 * Automatically seeds a default SUPER_ADMIN (and optional EDITOR) in the database
 * if no SUPER_ADMIN currently exists in the users table.
 */
export async function ensureDefaultAdmin() {
  if (adminCheckCompleted) return;

  try {
    const adminCount = await prisma.user.count({
      where: { role: Role.SUPER_ADMIN },
    });

    if (adminCount === 0) {
      console.log('No SUPER_ADMIN found in database. Auto-seeding default admin...');

      const defaultAdminEmail = (process.env.DEFAULT_ADMIN_EMAIL || 'admin@npcrwanda.org').trim().toLowerCase();
      const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
      const defaultAdminName = process.env.DEFAULT_ADMIN_NAME || 'Administrator';
      const superAdminPasswordHash = await bcrypt.hash(defaultAdminPassword, 10);

      await prisma.user.upsert({
        where: { email: defaultAdminEmail },
        update: {
          role: Role.SUPER_ADMIN,
        },
        create: {
          email: defaultAdminEmail,
          name: defaultAdminName,
          passwordHash: superAdminPasswordHash,
          role: Role.SUPER_ADMIN,
        },
      });

      // Also ensure default editor if no users existed
      const totalUsers = await prisma.user.count();
      if (totalUsers <= 1) {
        const editorPasswordHash = await bcrypt.hash('editor123', 10);
        await prisma.user.upsert({
          where: { email: 'editor@npcrwanda.org' },
          update: {},
          create: {
            email: 'editor@npcrwanda.org',
            name: 'Content Editor',
            passwordHash: editorPasswordHash,
            role: Role.EDITOR,
          },
        });
      }

      console.log(`[Auto-Seed] Successfully created default admin: ${defaultAdminEmail}`);
    }

    adminCheckCompleted = true;
  } catch (error) {
    console.error('[Auto-Seed] Could not ensure default admin:', error);
    // Do not mark adminCheckCompleted so it can retry on next request if DB was temporarily unreachable
  }
}
