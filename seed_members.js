const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const associations = [
  { name: 'Rwanda Para-Athletics Federation (RPAF)', acronym: 'RPAF', desc: 'Oversees track and field events for para-athletes, coordinating training camps, selection meets, and national representation.', activities: ['Track & Field events', 'Wheelchair racing', 'Javelin, Discus, & Shot Put'], icon: 'fa-running', order: 1, active: true },
  { name: 'Rwanda Sitting Volleyball Association (RSVA)', acronym: 'RSVA', desc: "Governs sitting volleyball league matches, training clinics, and prepares the national men's and women's teams for global para-championships.", activities: ['National leagues', 'International tournaments', 'Referee and coach clinics'], icon: 'fa-volleyball-ball', order: 2, active: true },
  { name: 'Rwanda Para-Powerlifting Association (RPPA)', acronym: 'RPPA', desc: 'Promotes strength sports for athletes with lower limb impairments, focusing on bench press competitions and talent discovery.', activities: ['Bench press championships', 'Impairment classification clinics', 'Strength training systems'], icon: 'fa-dumbbell', order: 3, active: true },
  { name: 'Rwanda Wheelchair Basketball Association (RWBA)', acronym: 'RWBA', desc: 'Organizes wheelchair basketball matches, provides high-performance wheelchairs, and drives youth sports inclusion initiatives.', activities: ['Wheelchair basketball leagues', 'Youth sports training camps', 'Community awareness events'], icon: 'fa-basketball-ball', order: 4, active: true }
];

const clubs = [
  { name: 'Kigali Para-Sports Club', location: 'Kigali City', order: 1, active: true },
  { name: 'Musanze Paralympic Club', location: 'Northern Province', order: 2, active: true },
  { name: 'Huye Para-Athletes Club', location: 'Southern Province', order: 3, active: true },
  { name: 'Rwamagana Para-Sports Club', location: 'Eastern Province', order: 4, active: true },
  { name: 'Rubavu Wheelchair Club', location: 'Western Province', order: 5, active: true },
  { name: 'Gicumbi Sitting Volleyball Club', location: 'Northern Province', order: 6, active: true }
];

const federations = [
  { name: 'International Paralympic Committee', logo: 'https://npcrwanda.org/wp-content/uploads/2024/12/logo1-1-1.png', website: 'https://www.paralympic.org', role: 'Global governing body for the Paralympic Movement.', desc: 'The IPC coordinates the Paralympic Games and sets the global standards for para-sports.', order: 1, active: true },
  { name: 'African Paralympic Committee', logo: 'https://npcrwanda.org/wp-content/uploads/2024/12/logo2-1.png', website: 'https://africanparalympic.org/', role: 'Continental governing body for African para-sports.', desc: 'The APC promotes sports for athletes with impairments across the African continent.', order: 2, active: true },
  { name: 'World ParaVolley', logo: 'https://npcrwanda.org/wp-content/uploads/2024/12/World-Para-Volley-Logo-1.webp', website: 'https://www.worldparavolley.org', role: 'International federation for sitting volleyball.', desc: 'Oversees classification, international tournaments, and the development of sitting volleyball.', order: 3, active: true },
  { name: 'World Wheelchair Basketball', logo: 'https://npcrwanda.org/wp-content/uploads/2024/12/iwbf-dark-1.png', website: 'https://iwbf.org/', role: 'Global governing body for wheelchair basketball.', desc: 'Manages international rules, events, and the expansion of wheelchair basketball globally.', order: 4, active: true }
];

const dpscoContacts = [
  { province: 'Kigali City', district: 'Gasabo', coordinator: 'John Doe', phone: '+250 788 123 456', email: 'gasabo@npcrwanda.org', active: true },
  { province: 'Northern Province', district: 'Musanze', coordinator: 'Jane Smith', phone: '+250 788 234 567', email: 'musanze@npcrwanda.org', active: true },
  { province: 'Southern Province', district: 'Huye', coordinator: 'Jean Claude', phone: '+250 788 345 678', email: 'huye@npcrwanda.org', active: true },
  { province: 'Eastern Province', district: 'Rwamagana', coordinator: 'Alice Mutoni', phone: '+250 788 456 789', email: 'rwamagana@npcrwanda.org', active: true },
  { province: 'Western Province', district: 'Rubavu', coordinator: 'Eric Ndayisaba', phone: '+250 788 567 890', email: 'rubavu@npcrwanda.org', active: true }
];

async function main() {
  console.log('Seeding associations...');
  for (const a of associations) await prisma.npcAssociation.create({ data: a });
  console.log('Seeding clubs...');
  for (const c of clubs) await prisma.npcClub.create({ data: c });
  console.log('Seeding federations...');
  for (const f of federations) await prisma.npcFederation.create({ data: f });
  console.log('Seeding DPSCO contacts...');
  for (const d of dpscoContacts) await prisma.dpscoContact.create({ data: d });
  console.log('Seed complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
