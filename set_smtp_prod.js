// Run this on the PRODUCTION server to save SMTP settings to the production DB
// Usage: node set_smtp_prod.js
// (place in project root, run once, then delete)

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const settings = [
    { key: 'smtpHost',   value: 'smtp.npcrwanda.org' },
    { key: 'smtpPort',   value: '465' },
    { key: 'smtpUser',   value: 'notification@npcrwanda.org' },
    { key: 'smtpPass',   value: 'ZWA,PGKLZPnJ' },
    { key: 'smtpFrom',   value: 'NPC Rwanda <notification@npcrwanda.org>' },
    { key: 'smtpSecure', value: 'true' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: { key: s.key, value: s.value },
    });
    console.log(`✓ ${s.key} saved`);
  }
  console.log('\n✅ SMTP settings saved to production DB successfully.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
