import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const events = [
    {
      title: 'National Paralympic Games 2026',
      description: 'Annual national competition bringing together para-athletes from all 30 districts of Rwanda.',
      date: '2026-08-15',
      endDate: '2026-08-20',
      location: 'Amahoro National Stadium, Kigali',
      category: 'National',
      status: 'Upcoming',
      img: 'sports-hero.jpg',
      featured: true,
    },
    {
      title: 'IPC Athletics Grand Prix',
      description: 'International athletics competition featuring Rwanda para-athletes competing in track and field events.',
      date: '2026-09-10',
      endDate: '2026-09-12',
      location: 'Kigali, Rwanda',
      category: 'International',
      status: 'Upcoming',
      img: 'news-volleyball.jpg',
      featured: true,
    },
    {
      title: 'Para-Powerlifting District Championship',
      description: 'District-level powerlifting championship to identify and develop emerging talent across Rwanda.',
      date: '2026-07-25',
      endDate: '2026-07-26',
      location: 'Huye District Sports Complex',
      category: 'Regional',
      status: 'Upcoming',
      img: 'news-powerlifting.jpg',
      featured: false,
    },
    {
      title: 'Goalball Training Camp',
      description: 'Three-day intensive training camp for national goalball team members preparing for the African Championships.',
      date: '2026-07-05',
      endDate: '2026-07-07',
      location: 'NPC Rwanda Training Center',
      category: 'Training',
      status: 'Completed',
      img: 'news-goalball.jpg',
      featured: false,
    },
    {
      title: 'Sitting Volleyball National League - Round 3',
      description: 'Third round of the national sitting volleyball league featuring 8 district teams.',
      date: '2026-08-02',
      endDate: '2026-08-03',
      location: 'Petit Stade, Kigali',
      category: 'National',
      status: 'Upcoming',
      img: 'news-sitting.jpg',
      featured: false,
    },
    {
      title: 'Para-Athlete Welfare Conference',
      description:
        'Annual conference discussing athlete welfare, classification updates, and development pathways for Rwanda para-sports.',
      date: '2026-06-20',
      endDate: '2026-06-20',
      location: 'Kigali Convention Centre',
      category: 'Conference',
      status: 'Completed',
      img: 'about-hero.jpg',
      featured: false,
    },
  ];

  for (const e of events) {
    const id = e.title.toLowerCase().replace(/\s+/g, '-');
    await prisma.event.upsert({
      where: { id },
      update: e,
      create: { ...e, id },
    });
  }

  console.log('Events seeded!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
