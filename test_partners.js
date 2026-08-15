const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const partners = await prisma.partner.findMany();
  console.log('PARTNERS COUNT:', partners.length);
  console.log(JSON.stringify(partners, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
