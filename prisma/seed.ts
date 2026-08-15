import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Clean existing records
  await prisma.user.deleteMany({});
  await prisma.athlete.deleteMany({});
  await prisma.newsArticle.deleteMany({});
  await prisma.career.deleteMany({});
  await prisma.contactMessage.deleteMany({});
  await prisma.sportDiscipline.deleteMany({});
  await prisma.leader.deleteMany({});
  await prisma.systemComponent.deleteMany({});
  await prisma.systemSetting.deleteMany({});
  await prisma.governanceDocument.deleteMany({});
  await prisma.governancePolicy.deleteMany({});
  await prisma.partner.deleteMany({});
  await prisma.siteContent.deleteMany({});
  await prisma.contactInfo.deleteMany({});
  await prisma.socialLink.deleteMany({});
  await prisma.event.deleteMany({});

  // 2. Users (Admin, Editor)
  const superAdminPasswordHash = await bcrypt.hash('admin123', 10);
  const editorPasswordHash = await bcrypt.hash('editor123', 10);

  await prisma.user.create({
    data: {
      email: 'admin@npcrwanda.org',
      name: 'Administrator',
      passwordHash: superAdminPasswordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  await prisma.user.create({
    data: {
      email: 'editor@npcrwanda.org',
      name: 'Content Editor',
      passwordHash: editorPasswordHash,
      role: Role.EDITOR,
    },
  });

  console.log('Users seeded successfully');

  // 3. Athletes
  const athletes = [
    { name: 'Jean de Dieu Kundineza', sport: 'Sitting Volleyball', status: 'Active', country: 'Rwanda', avatar: '/assets/img/avatars/kundineza-jd.jpg', desc: 'Multiple-time African champion and key defensive anchor for the national team. Expert in tactical blocking and court positioning.' },
    { name: 'Liliane Mukobwankawe', sport: 'Sitting Volleyball', status: 'Active', country: 'Rwanda', avatar: '/assets/img/avatars/mukobwankawe-l.jpg', desc: "Captain of the women's national team and role model for emerging athletes. Leading scorer with exceptional setter skills." },
    { name: 'Hermas Muvunyi', sport: 'Para Athletics', status: 'Active', country: 'Rwanda', avatar: '/assets/img/avatars/muvunyi-h.jpg', desc: 'Paralympic veteran and world medalist in the 400m and 800m T46 classifications. Training towards 2026 Paralympic cycle.' },
    { name: 'Eric Nshimiyimana', sport: 'Wheelchair Basketball', status: 'Active', country: 'Rwanda', avatar: '/assets/img/avatars/nshimiyimana-e.jpg', desc: 'High-scoring guard for national wheelchair basketball team. Known for exceptional ball handling and court vision.' },
    { name: 'Claudine Mukamugiraneza', sport: 'Goalball', status: 'Active', country: 'Rwanda', avatar: '/assets/img/avatars/mukamugiraneza-c.jpg', desc: 'Lead scorer and playmaker for national women goalball team. Specialist in throw accuracy and tactical awareness.' },
    { name: 'Patrick Habineza', sport: 'Amputee Football', status: 'Active', country: 'Rwanda', avatar: '/assets/img/avatars/habineza-p.jpg', desc: 'International amputee footballer with experience in continental tournaments. Plays midfield with dynamic passing range.' },
    { name: 'Grace Mukamusoni', sport: 'Para Athletics', status: 'Active', country: 'Rwanda', avatar: '/assets/img/avatars/mukamusoni-g.jpg', desc: 'Young emerging talent in 100m and 200m sprint events (T12 classification). National record holder and training squad member.' },
    { name: 'Samuel Kwizera', sport: 'Wheelchair Basketball', status: 'Active', country: 'Rwanda', avatar: '/assets/img/avatars/kwizera-s.jpg', desc: 'Forward player with defensive strength. Competing in sub-regional wheelchair basketball leagues for development.' },
    { name: 'Therese Habimana', sport: 'Sitting Volleyball', status: 'Active', country: 'Rwanda', avatar: '/assets/img/avatars/habimana-t.jpg', desc: 'Defensive specialist for women sitting volleyball. Known for net coverage and strategic positioning.' },
    { name: 'David Munyankindi', sport: 'Goalball', status: 'Active', country: 'Rwanda', avatar: '/assets/img/avatars/munyankindi-d.jpg', desc: 'Men goalball captain with 8+ years of competitive experience. Leading national male goalball program.' },
  ];

  for (const athlete of athletes) {
    await prisma.athlete.create({ data: athlete });
  }
  console.log('Athletes seeded successfully');

  // 4. News Articles
  const news = [
    { 
      title: 'Goalball Championship: Elevating Visibility and Support', 
      date: 'Jul 2026', 
      category: 'Event', 
      status: 'Published', 
      img: '/assets/img/curated/news-goalball.jpg', 
      desc: "A milestone event for Rwanda's blind athletes and a call to expand resources and awareness.", 
      content: "The Goalball National Championship 2026 took place at Petit Stade, showcasing the incredible talent of visually impaired athletes. The event brought together teams from across the nation to compete for the ultimate trophy.\n\nNPC Rwanda President Dr. Jean Baptiste Murema addressed the crowd, emphasizing the need for more corporate sponsorships and public support. 'These athletes train with absolute dedication and represent the spirit of sportsmanship. We call upon everyone to support goalball development,' he noted.\n\nWith new training equipment and district coordinators, goalball is poised to expand into a year-round league, providing more opportunities for blind and visually impaired youth. The championship attracted sponsors from private sector organizations and support from the Ministry of Sports.",
      slug: 'goalball-championship-2026' 
    },
    { 
      title: 'Sitting Volleyball: Rwanda vs France Friendly Series', 
      date: 'Jun 2026', 
      category: 'Sport', 
      status: 'Published', 
      img: '/assets/img/curated/news-volleyball.jpg', 
      desc: 'A high-level exchange strengthening competitive readiness and international ties.', 
      content: "The national women's sitting volleyball team hosted their French counterparts in a series of international friendly matches in Kigali. This preparation is part of the build-up towards upcoming global competitions.\n\nThe friendly matches provided a tactical playground for national head coaches to test strategies and integrate newer players into the starting rotations. The local crowd cheered passionately, demonstrating the high popularity of sitting volleyball in the region.\n\nNPC Rwanda will continue coordinating with international federations to arrange further friendly exchanges, raising competitive levels ahead of the Paralympic cycle. The series resulted in 2-1 victory for Rwanda, boosting team confidence.",
      slug: 'volleyball-france-friendly' 
    },
    { 
      title: 'Boccia Championship at Petit Stadium', 
      date: 'May 2026', 
      category: 'Event', 
      status: 'Published', 
      img: '/assets/img/curated/news-boccia.jpg', 
      desc: 'A national showcase of precision sport and inclusive competition.', 
      content: "Athletes with severe physical impairments gathered in Kigali for the annual Boccia National Championship. Boccia is a sport requiring high mental concentration, precision, and strategy.\n\nThe tournament featured matches in individual, pairs, and team categories. Over 40 athletes from 10 clubs competed, highlighting the growth of the sport across local districts.\n\nWinners received medals and sports packages to help them continue training in their home areas. NPC Rwanda plans to purchase specialized ramps and boccia balls to distribute to rural clubs this year.",
      slug: 'boccia-championship' 
    },
    { 
      title: 'Para-Athletics: National Record Broken in 1500m Sprint', 
      date: 'Apr 2026', 
      category: 'Sport', 
      status: 'Published', 
      img: '/assets/img/curated/news-athletics.jpg', 
      desc: 'Grace Mukamusoni sets new national record in T12 classification.', 
      content: "In an impressive display of speed and endurance, young para-athlete Grace Mukamusoni shattered the national 1500m record in the T12 classification at the East African Para-Athletics Championships held in Nairobi.\n\nHer time of 4 minutes 52 seconds demonstrates the quality of coaching and athlete development systems now in place. NPC Rwanda coaches attribute the success to improved training facilities and international competition exposure.\n\nThe performance signals Rwanda's growing competitiveness in continental athletics and opens doors for further international competitions and sponsorships.",
      slug: 'para-athletics-record' 
    },
    { 
      title: 'Wheelchair Basketball League Kicks Off Season', 
      date: 'Mar 2026', 
      category: 'Event', 
      status: 'Published', 
      img: '/assets/img/curated/news-basketball.jpg', 
      desc: 'Six district teams compete in inaugural national wheelchair basketball league.', 
      content: "The 2026 National Wheelchair Basketball League launched with unprecedented enthusiasm as six district teams began their inaugural season. Games are held bi-weekly at the Petit Stade in Kigali with live streaming for remote audiences.\n\nTeams from Kigali, Huye, Musanze, Gitarama, Muhanga, and Rwamagana are competing in a round-robin format leading to playoffs in August.\n\nThe league aims to create sustainable competitive pathways and identify talent for the national team. Corporate partnerships with local businesses ensure prize funds and athlete stipends.",
      slug: 'wheelchair-basketball-league' 
    },
    { 
      title: 'NPC Rwanda Strategic Plan 2024-2028 Released', 
      date: 'Feb 2026', 
      category: 'Governance', 
      status: 'Published', 
      img: '/assets/img/curated/news-strategy.jpg', 
      desc: 'Comprehensive roadmap for Paralympic sport development across Rwanda.', 
      content: "The National Paralympic Committee of Rwanda has released its comprehensive Strategic Plan 2024-2028, outlining ambitious targets for athlete development, grassroots participation, and international performance.\n\nKey priorities include:\n• Expanding athlete identification programs to all 30 districts\n• Establishing specialized training centers for each discipline\n• Increasing government and private sector funding by 40%\n• Achieving medal targets at the 2028 Paralympics\n• Building sustainable coaching and sports science infrastructure\n\nThe plan was developed through consultations with athletes, coaches, district leaders, international partners, and government stakeholders.",
      slug: 'strategic-plan-2024-2028' 
    },
    { 
      title: 'Amputee Football Squad Announced for Regional Tournament', 
      date: 'Jan 2026', 
      category: 'Sport', 
      status: 'Published', 
      img: '/assets/img/curated/news-football.jpg', 
      desc: '18-member squad selected to represent Rwanda at African Amputee Football Championship.', 
      content: "The Rwanda Amputee Football Association has announced an 18-member squad for the upcoming African Amputee Football Championship in South Africa. The squad includes 8 returning players and 10 new talents identified through district trials.\n\nHead coach Patrick Habimweyo noted: 'This squad represents the best of Rwanda's amputee football talent. We've integrated experienced players with emerging youth to create a balanced, dynamic team.'\n\nThe team begins training camp in Kigali starting February, with international friendly matches planned against South African and Kenyan clubs.",
      slug: 'amputee-football-squad' 
    },
    { 
      title: 'Safeguarding Training for All District Coordinators', 
      date: 'Dec 2025', 
      category: 'Governance', 
      status: 'Published', 
      img: '/assets/img/curated/news-safeguarding.jpg', 
      desc: 'NPC Rwanda ensures compliance with international child protection standards.', 
      content: "NPC Rwanda conducted a comprehensive safeguarding training program for all 30 district coordinators and coaching staff. The initiative ensures compliance with International Paralympic Committee safeguarding requirements and protects young athletes.\n\nTopics covered included:\n• Child protection policies and procedures\n• Recognizing signs of abuse and reporting protocols\n• Creating inclusive, safe training environments\n• Digital safety and social media guidelines\n\nThe training was facilitated by international safeguarding experts and local child protection organizations.",
      slug: 'safeguarding-training' 
    },
    { 
      title: 'NPC Rwanda Receives Gold Standard Certification', 
      date: 'Nov 2025', 
      category: 'Governance', 
      status: 'Published', 
      img: '/assets/img/curated/news-certification.jpg', 
      desc: 'Recognition of excellence in transparency, governance, and athlete welfare.', 
      content: "The International Paralympic Committee has awarded NPC Rwanda with Gold Standard Certification in governance, financial management, and athlete protection protocols.\n\nThis prestigious recognition reflects years of commitment to building world-class systems and transparent operations. The certification places NPC Rwanda among elite national committees globally.\n\nPresident Dr. Murema thanked the board, staff, and athlete representatives: 'This certification validates our commitment to doing things right and setting the standard for Paralympic excellence in Africa.'",
      slug: 'gold-certification' 
    },
  ];

  for (const article of news) {
    await prisma.newsArticle.create({ data: article });
  }
  console.log('News articles seeded successfully');

  // 5. Careers
  const careers = [
    { title: 'Head Coach - Sitting Volleyball', location: 'Kigali', applicants: 5, status: 'Open', desc: 'Lead coaching role for national sitting volleyball teams (men and women). Requires international experience and proven track record in Paralympic competition.', slug: 'head-coach-volleyball' },
    { title: 'Athlete Development Officer', location: 'Kigali', applicants: 12, status: 'Open', desc: 'Support athlete pathways and talent identification. Will coordinate with district programs to identify emerging talent and manage development camps.', slug: 'athlete-development' },
    { title: 'Sports Medical Officer', location: 'Kigali', applicants: 8, status: 'Open', desc: 'Medical support for athletes. Provide injury prevention, treatment, and rehabilitation services. Qualifications: Medical degree + sports medicine specialization.', slug: 'sports-medic' },
    { title: 'Communications & Advocacy Specialist', location: 'Kigali', applicants: 18, status: 'Open', desc: 'Manage media relations, social media, and public advocacy campaigns. Create compelling stories to increase public awareness of Paralympic sports.', slug: 'communications-specialist' },
    { title: 'Finance & Administrative Manager', location: 'Kigali', applicants: 9, status: 'Open', desc: 'Oversee financial management, budgeting, and administrative operations. Ensure compliance with IPC regulations and donor requirements.', slug: 'finance-manager' },
    { title: 'Para Athletics Coach', location: 'Kigali', applicants: 6, status: 'Open', desc: 'Coach for track and field para-athletes. Specialize in sprint, middle distance, or field events. Experience with classification and training multiple disability types required.', slug: 'athletics-coach' },
    { title: 'District Para Sports Coordinator - North Region', location: 'Musanze', applicants: 4, status: 'Open', desc: 'Coordinate para-sports activities across northern districts (Gicumbi, Musanze, Burera). Manage grassroots programs and talent identification.', slug: 'north-coordinator' },
    { title: 'Volunteer Program Manager', location: 'Kigali', applicants: 14, status: 'Closed', desc: 'Recruit, train, and manage volunteer base for events and programs. Closed - position filled.', slug: 'volunteer-manager' },
    { title: 'Classification Assistant', location: 'Kigali', applicants: 3, status: 'Open', desc: 'Support international classification panel. Assist in athlete classification assessments. Requires sports science background and IPC training certification.', slug: 'classification-assistant' },
    { title: 'Groundskeeper - Training Facilities', location: 'Kigali', applicants: 7, status: 'Open', desc: 'Maintain and manage NPC Rwanda training facilities. Ensure equipment is in optimal condition and facilities are accessible to all athletes.', slug: 'groundskeeper' },
  ];

  for (const career of careers) {
    await prisma.career.create({ data: career });
  }
  console.log('Careers seeded successfully');

  // 6. Contact Messages
  const contacts = [
    { name: 'Alain Bizimungu', email: 'alain@minisports.gov.rw', subject: 'Ministry Sponsorship Inquiry', message: 'Hello, we would like to discuss possible government funding for the 2026 Paralympic Games preparation program. Can we schedule a meeting?', date: 'Jul 2026', read: false },
    { name: 'Marie Uwase', email: 'marie.uwase@gmail.com', subject: 'Volunteer Application', message: 'Hi there, I am a physiotherapist student wishing to volunteer in the athlete support clinics during the upcoming national championship.', date: 'Jul 2026', read: true },
    { name: 'Robert Niyonsenga', email: 'robert@rwandatv.rw', subject: 'Media Partnership Request', message: 'Dear NPC team, we represent Rwanda TV wishing to provide live coverage of the sitting volleyball championship next month.', date: 'Jun 2026', read: false },
    { name: 'Juliana Habimana', email: 'juliana@businessrwanda.com', subject: 'Corporate Sponsorship Proposal', message: 'Greetings, our company is interested in sponsoring the para-athletics development program. What are the partnership opportunities?', date: 'Jun 2026', read: true },
    { name: 'David Mutua', email: 'david@ipc.org', subject: 'Training Camp Coordination', message: 'Hello, IPC wants to coordinate a coaching development workshop for your district coordinators. Is March 2026 suitable?', date: 'May 2026', read: true },
    { name: 'Sophie Mbambazi', email: 'sophie@inclusivedev.org', subject: 'Inclusion Program Partnership', message: 'We are an NGO focused on disability inclusion in sports. We would like to explore partnership opportunities with NPC Rwanda.', date: 'May 2026', read: false },
    { name: 'Peter Kabuye', email: 'peter@coach-academy.rw', subject: 'Coach Certification Program', message: 'We offer international coaching certification programs. Would NPC Rwanda be interested in enrolling coaches in our courses?', date: 'Apr 2026', read: true },
    { name: 'Angela Uwimbabazi', email: 'angela@disabilityrights.rw', subject: 'Policy Consultation Request', message: 'Hello, we are consulting on disability rights policies and would like input from NPC Rwanda on safeguarding and inclusion standards.', date: 'Apr 2026', read: false },
  ];

  for (const contact of contacts) {
    await prisma.contactMessage.create({ data: contact });
  }
  console.log('Contact messages seeded successfully');

  // 6b. Volunteer Applications
  const volunteersList = [
    { name: 'Marie Uwase', email: 'marie.uwase@gmail.com', interest: 'Medical & Rehabilitation', skills: 'Physiotherapy student, First Aid certified', details: 'I would like to volunteer in athlete support clinics during national events.', read: false },
    { name: 'Jean Paul Habineza', email: 'jp.habineza@yahoo.fr', interest: 'Event Coordination', skills: 'Event logistics, IT support, Bilingual (FR/EN)', details: 'Eager to assist with organizing regional tournaments and athlete registration.', read: true },
    { name: 'Clarisse Mutoni', email: 'clarisse.mutoni@gmail.com', interest: 'Media & Photography', skills: 'Photography, Social Media, Content creation', details: 'Experienced in sports media and photo editing. Available for weekend games.', read: false },
  ];
  for (const vol of volunteersList) {
    await prisma.volunteerApplication.create({ data: vol });
  }
  console.log('Volunteer applications seeded successfully');

  // 6c. Donation Inquiries
  const donationsList = [
    { name: 'Juliana Habimana', email: 'juliana@businessrwanda.com', category: 'Corporate Sponsorship', supportType: 'Financial Grant', details: 'Interested in sponsoring the Para Athletics national development program with annual grant.', read: false },
    { name: 'Kigali Sports Supplies Ltd', email: 'info@kigalisports.rw', category: 'Equipment Partner', supportType: 'Equipment Donation', details: 'We wish to donate 10 specialized wheelchairs and sitting volleyball gear for district clubs.', read: true },
    { name: 'Dr. Eric Ndayishimiye', email: 'eric.ndayishimiye@health.gov.rw', category: 'Individual Donor', supportType: 'Medical Supplies', details: 'Offering monthly sports physiotherapy kits and first aid supplies for national squad.', read: false },
  ];
  for (const don of donationsList) {
    await prisma.donationInquiry.create({ data: don });
  }
  console.log('Donation inquiries seeded successfully');

  // 7. Sports (Disciplines)
  const sports = [
    { slug: 'sitting-volleyball', title: 'Sitting Volleyball', img: 'https://images.unsplash.com/photo-1511379938547-c1f69b13d835?w=800&h=450&fit=crop', desc: "Rwanda's flagship discipline with strong continental and international performances. Both men's and women's teams competing at elite levels." },
    { slug: 'wheelchair-basketball', title: 'Wheelchair Basketball', img: 'https://images.unsplash.com/photo-1546519638-68711109d298?w=800&h=450&fit=crop', desc: 'A fast, tactical team sport building resilience and high-performance skills. Growing league with multiple district teams.' },
    { slug: 'amputee-football', title: 'Amputee Football', img: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=450&fit=crop', desc: 'A rapidly growing program showcasing exceptional skill, speed, and agility. Continental championship regulars.' },
    { slug: 'para-athletics', title: 'Para Athletics', img: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=450&fit=crop', desc: 'Track and field events where our athletes pursue medals on regional and global stages. Multiple classifications supported.' },
    { slug: 'goalball', title: 'Goalball', img: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=450&fit=crop', desc: 'A sport exclusively for visually impaired athletes combining strategy, precision, and teamwork. Growing participation across districts.' },
    { slug: 'boccia', title: 'Boccia', img: 'https://images.unsplash.com/photo-1552674605-5defe6aa44bb?w=800&h=450&fit=crop', desc: 'Precision sport for athletes with cerebral palsy and other physical impairments. Developing grassroots and elite pathways.' },
    { slug: 'powerlifting', title: 'Para Powerlifting', img: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=450&fit=crop', desc: 'Competitive strength sport with athletes from across disability categories. District championships developing talent pipeline.' },
    { slug: 'swimming', title: 'Para Swimming', img: 'https://images.unsplash.com/photo-1576610616656-d3aa5d1f4534?w=800&h=450&fit=crop', desc: 'Swimming for athletes with physical and visual impairments. Pool access expanding in major regions.' },
  ];

  for (const sport of sports) {
    await prisma.sportDiscipline.create({ data: sport });
  }
  console.log('Sports disciplines seeded successfully');

  // 8. Leadership
  const leadership = [
    // 1. Board of Directors (committee: 'Board of Directors')
    { avatar: 'avatar-4.svg', name: 'MUREMA Jean Baptiste', role: 'Chairperson', desc: 'Leads the NPC Governing Board with physical impairment representation. Oversees general sports strategy and representation.', committee: 'Board of Directors', impairment: 'Physical' },
    { avatar: 'avatar-4.svg', name: 'Esperance Kanyange', role: '1st Vice-Chairperson', desc: 'First Vice-Chairperson in charge of Competition and Sports Development. Guides athletic programming.', committee: 'Board of Directors', impairment: 'Physical' },
    { avatar: 'avatar-4.svg', name: 'MUKARUSINE Claudine', role: '2nd Vice-Chairperson', desc: 'Second Vice-Chairperson representing Albenism. Focuses on social inclusion and athlete outreach.', committee: 'Board of Directors', impairment: 'Albenism' },
    { avatar: 'avatar-4.svg', name: 'Dr. MUTANGANA Dieudonne', role: 'Secretary General', desc: 'Coordinates administrative, communications, and logistical planning across associations.', committee: 'Board of Directors', impairment: 'Physical' },
    { avatar: 'avatar-4.svg', name: 'VUNINGABO Emile-cadet', role: 'Treasurer', desc: 'Responsible for fiscal management, accounting transparency, and financial auditing alignment.', committee: 'Board of Directors', impairment: 'Physical' },
    { avatar: 'avatar-4.svg', name: 'MUKANZIZA Venantie', role: 'Advisor', desc: 'Board Advisor representing Visual impairments. Advocates for adaptive equipment and blind sports.', committee: 'Board of Directors', impairment: 'Visual' },
    { avatar: 'avatar-4.svg', name: 'BIZIMANA Jean Damascene', role: 'Advisor', desc: 'Board Advisor representing Deaf impairments. Supports sign language interpretation and deaf athletic programs.', committee: 'Board of Directors', impairment: 'Deaf' },
    { avatar: 'avatar-4.svg', name: 'SEKAREMA Jean Paul', role: 'Advisor', desc: 'Board Advisor representing Intellectual/Mental impairments. Drives cognitive-inclusive sports events.', committee: 'Board of Directors', impairment: 'Mental' },
    { avatar: 'avatar-4.svg', name: 'MUKANYEMAZI Adele', role: 'Advisor', desc: 'Board Advisor representing Physical impairments. Focuses on accessible venues and physical-adapted logistics.', committee: 'Board of Directors', impairment: 'Physical' },
    { avatar: 'avatar-4.svg', name: 'MUKOBWANKAWE Liliane', role: 'Women Representative', desc: 'Advocates for female athlete participation, girls youth camps, and gender equality in adapted sports.', committee: 'Board of Directors', impairment: 'Physical' },
    { avatar: 'avatar-4.svg', name: 'TWAGIRAYEZU Callixte', role: 'Athletes Representative', desc: 'Serves as the voice of active athletes within the governing board. Drives welfare and athlete feedback.', committee: 'Board of Directors', impairment: 'Physical' },

    // 2. Audit Committee (committee: 'Audit Committee')
    { avatar: 'avatar-4.svg', name: 'TWIZERIMANA David', role: 'President', desc: 'President of the Internal Audit Committee. Ensures compliance with statutes and transparent audit procedures.', committee: 'Audit Committee', impairment: 'Physical' },
    { avatar: 'avatar-4.svg', name: 'INGABIRE Marthe', role: 'Vice-President', desc: 'Vice-President of the Internal Audit Committee. Reviews internal financial flows and performance indices.', committee: 'Audit Committee', impairment: 'Physical' },
    { avatar: 'avatar-4.svg', name: 'NDAYAMBAJE Theoneste', role: 'Secretary General', desc: 'Secretary of the Audit Committee. Minutes meetings, compiles audit findings and drafts compliance reports.', committee: 'Audit Committee', impairment: 'Physical' },

    // 3. Conflict Resolution Committee (committee: 'Conflict Resolution Committee')
    { avatar: 'avatar-4.svg', name: 'NGENDANDUMWE Augustin', role: 'President', desc: 'President of the Conflict Resolution Committee representing Visual impairments. Oversees grievance mediation.', committee: 'Conflict Resolution Committee', impairment: 'Visual' },
    { avatar: 'avatar-4.svg', name: 'RUTAYISIRE Jules', role: 'Vice President', desc: 'Vice President of the Conflict Resolution Committee representing Deaf impairments. Supports hearing-adapted dispute resolving.', committee: 'Conflict Resolution Committee', impairment: 'Deaf' },
    { avatar: 'avatar-4.svg', name: 'MUKANGOGA Louise', role: 'Secretary General', desc: 'Secretary of the Conflict Resolution Committee. Records cases and ensures fair arbitration procedures.', committee: 'Conflict Resolution Committee', impairment: 'Physical' },

    // 4. Staff Team (committee: 'Staff Team')
    { avatar: 'avatar-4.svg', name: 'Jean Marie Vianney NSENGIYUMVA', role: 'National Technical Director', desc: 'Directs overall technical development, classification workshops, and athlete training camps.', committee: 'Staff Team', email: 'jmrnsengi@npcrwanda.org', phone: '+250788564357' },
    { avatar: 'avatar-4.svg', name: 'Eric KARASIRA', role: 'Sport Director', desc: 'Oversees national leagues, match scheduling, regional cups, and district talent scouting.', committee: 'Staff Team', email: 'erickar@npcrwanda.org', phone: '+250788352800' },
    { avatar: 'avatar-4.svg', name: 'Dr. MOSAAD Rashad Elaiuty', role: 'National Sitting Volleyball Head Coach', desc: 'Prepares and coaches the elite national sitting volleyball squad for continental and global games.', committee: 'Staff Team', email: 'moselaity@npcrwanda.org', phone: '+250791701111' },
    { avatar: 'avatar-4.svg', name: 'Scovia KANOHELI', role: 'Accountant', desc: 'Manages bookkeeping, accounts payable/receivable, and helps draft annual budgets.', committee: 'Staff Team', email: 'kascovia@npcrwanda.org', phone: '+250788559022' },
    { avatar: 'avatar-4.svg', name: 'Francoise UWINKUNDA', role: 'Accountant Assistant', desc: 'Assists with payroll tracking, receipt indexing, and office expense reports.', committee: 'Staff Team', email: 'uwifanny@npcrwanda.org', phone: '+250784828986' },
    { avatar: 'avatar-4.svg', name: 'Joy MIREMBE', role: 'Receptionist & Interpreter', desc: 'Handles front desk communications, general inquiries, and sign/verbal language translation.', committee: 'Staff Team', email: 'mirejo@npcrwanda.org', phone: '+250789285370' },
  ];

  for (const leader of leadership) {
    await prisma.leader.create({ data: leader });
  }
  console.log('Leadership seeded successfully');

  // 9. System Components
  const systemComponents = [
    { title: 'system.npc_background', desc: 'system.npc_background_desc' },
    { title: 'system.board_members', desc: 'system.board_members_desc' },
    { title: 'system.audit_committees', desc: 'system.audit_committees_desc' },
    { title: 'system.conflict_resolution_committees', desc: 'system.conflict_resolution_committees_desc' },
    { title: 'system.schedule_plan', desc: 'system.schedule_plan_desc' },
    { title: 'system.publication', desc: 'system.publication_desc' },
    { title: 'system.sports', desc: 'system.sports_desc' },
    { title: 'system.npc_federations', desc: 'system.npc_federations_desc' },
    { title: 'system.events', desc: 'system.events_desc' },
    { title: 'system.dpsco_contacts', desc: 'system.dpsco_contacts_desc' },
    { title: 'system.npc_associations', desc: 'system.npc_associations_desc' },
    { title: 'system.resources', desc: 'system.resources_desc' },
    { title: 'system.social_media', desc: 'system.social_media_desc' },
    { title: 'system.staff', desc: 'system.staff_desc' },
  ];

  for (const comp of systemComponents) {
    await prisma.systemComponent.create({ data: comp });
  }
  console.log('System components seeded successfully');

  // 10. System Settings
  const settings = [
    { key: 'siteName', value: 'National Paralympic Committee of Rwanda' },
    { key: 'contactEmail', value: 'info@npcrwanda.org' },
    { key: 'contactPhone', value: '+250 788 123 456' },
    { key: 'address', value: 'Amahoro Stadium, Remera, Kigali, Rwanda' },
    { key: 'facebook', value: 'https://facebook.com/npcrwanda' },
    { key: 'twitter', value: 'https://twitter.com/npcrwanda' },
    { key: 'instagram', value: 'https://instagram.com/npcrwanda' },
    { key: 'logo', value: '/assets/img/logo.png' },
    { key: 'favicon', value: '/assets/img/favicon.ico' },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.create({ data: setting });
  }
  console.log('System settings seeded successfully');

  // 11. Governance Key Documents
  const govDocs = [
    { title: 'NPC Rwanda Constitution', desc: 'Foundational governance and operational mandate.', fileUrl: '#', order: 1 },
    { title: 'Strategic Plan 2024-2028', desc: 'Long-term priorities, targets, and delivery roadmap.', fileUrl: '#', order: 2 },
    { title: 'Annual Report 2023', desc: 'Review of programs, outcomes, and impact.', fileUrl: '#', order: 3 },
    { title: 'Financial Audit 2023', desc: 'Independent financial reporting and assurance.', fileUrl: '#', order: 4 },
  ];
  for (const doc of govDocs) {
    await prisma.governanceDocument.create({ data: doc });
  }
  console.log('Governance documents seeded successfully');

  // 12. Governance Official Policies
  const govPolicies = [
    { title: 'Safeguarding Policy', desc: 'Safeguarding standards for athletes, coaches, and staff.', fileUrl: '#', order: 1 },
    { title: 'Anti-Doping Regulations', desc: 'Clean sport standards and athlete education.', fileUrl: '#', order: 2 },
    { title: 'Selection Criteria', desc: 'Clear criteria for national team selection.', fileUrl: '#', order: 3 },
    { title: 'Classification Rules', desc: 'Classification standards for fair competition.', fileUrl: '#', order: 4 },
  ];
  for (const policy of govPolicies) {
    await prisma.governancePolicy.create({ data: policy });
  }
  console.log('Governance policies seeded successfully');

  // 13. Partners
  const partners = [
    // Government Sector
    { 
      name: 'Ministry of Sports', 
      logo: 'https://npcrwanda.org/wp-content/uploads/2024/12/Coat_of_arms_of_Rwanda.svg', 
      website: 'https://www.minisports.gov.rw/', 
      category: 'Government Sector', 
      order: 1, 
      active: true 
    },
    { 
      name: 'Special Guarantee Fund', 
      logo: 'https://npcrwanda.org/wp-content/uploads/2025/01/special-guarantee-fund-1.svg', 
      website: 'https://www.ikigega.rw', 
      category: 'Government Sector', 
      order: 2, 
      active: true 
    },
    { 
      name: 'Rwanda National Olympic and Sports Committee', 
      logo: 'https://npcrwanda.org/wp-content/uploads/2024/12/Rwanda_National_Olympic_and_Sports_Committee_logo.png', 
      website: 'https://olympicrwanda.org/', 
      category: 'Government Sector', 
      order: 3, 
      active: true 
    },
    { 
      name: 'National Council of Persons with Disabilities', 
      logo: 'https://npcrwanda.org/wp-content/uploads/2024/12/NCPD-FINAL-LOGO-ENGL-988x1024.jpg', 
      website: 'https://www.minisports.gov.rw/', 
      category: 'Government Sector', 
      order: 4, 
      active: true 
    },

    // International Sports bodies
    { 
      name: 'Agitos Foundation', 
      logo: 'https://npcrwanda.org/wp-content/uploads/2024/12/161019114537195_Agitos_Logo_final_symbol-01-1024x534.jpeg', 
      website: 'https://www.paralympic.org/news/agitos-foundation-launches-development-activities-support-toyota', 
      category: 'International Sports Bodies', 
      order: 5, 
      active: true 
    },
    { 
      name: 'International Paralympic Committee', 
      logo: 'https://npcrwanda.org/wp-content/uploads/2024/12/international-paralympic-committee-ipc-vector-logo-2022.png', 
      website: 'https://www.paralympic.org/', 
      category: 'International Sports Bodies', 
      order: 6, 
      active: true 
    },
    { 
      name: 'UNICEF Rwanda', 
      logo: 'https://npcrwanda.org/wp-content/uploads/2025/01/UNICEF.png', 
      website: 'https://www.unicef.org/rwanda/', 
      category: 'International Sports Bodies', 
      order: 7, 
      active: true 
    },
    { 
      name: 'World ParaVolley', 
      logo: 'https://npcrwanda.org/wp-content/uploads/2024/12/channels4_profile.jpeg', 
      website: 'https://worldparavolley.org/', 
      category: 'International Sports Bodies', 
      order: 8, 
      active: true 
    },
    { 
      name: 'African Paralympic Committee', 
      logo: 'https://npcrwanda.org/wp-content/uploads/2024/12/APC-LOGO-1024x428.png', 
      website: 'https://africanparalympics.org/en/', 
      category: 'International Sports Bodies', 
      order: 9, 
      active: true 
    },
    { 
      name: 'International Committee of the Red Cross', 
      logo: 'https://npcrwanda.org/wp-content/uploads/2025/01/ICRC.jpeg', 
      website: 'https://www.icrc.org/en/where-we-work/rwanda', 
      category: 'International Sports Bodies', 
      order: 10, 
      active: true 
    },

    // Other Non-Governmental Organizations
    { 
      name: 'National Union of Disability Organisations in Rwanda', 
      logo: 'https://npcrwanda.org/wp-content/uploads/2024/12/NUDOR-Logo.png', 
      website: 'https://www.nudor.org/', 
      category: 'Other Non-Governmental Organizations', 
      order: 11, 
      active: true 
    },
    { 
      name: 'Liliane Foundation / LWSFG', 
      logo: 'https://npcrwanda.org/wp-content/uploads/2024/12/logos_lwsfg_logo-1024x281.gif', 
      website: 'https://www.paralympic.org/', 
      category: 'Other Non-Governmental Organizations', 
      order: 12, 
      active: true 
    },
    { 
      name: 'CBM (Christian Blind Mission)', 
      logo: 'https://npcrwanda.org/wp-content/uploads/2024/12/cmb_logo_2023-768x547-1.jpeg', 
      website: 'https://www.cbm.org/', 
      category: 'Other Non-Governmental Organizations', 
      order: 13, 
      active: true 
    },
    { 
      name: 'JICA (Japan International Cooperation Agency)', 
      logo: 'https://npcrwanda.org/wp-content/uploads/2024/12/jica.jpeg', 
      website: 'https://www.jica.go.jp/english/', 
      category: 'Other Non-Governmental Organizations', 
      order: 14, 
      active: true 
    }
  ];
  for (const p of partners) {
    await prisma.partner.create({ data: p });
  }
  console.log('Partners seeded successfully');

  // 14. Contact Info
  await prisma.contactInfo.create({
    data: {
      address: 'Amahoro National Stadium, Remera, Kigali, Rwanda',
      phone: '+250 788 400 887',
      email: 'info@npcrwanda.org',
      mapUrl: 'https://maps.google.com/?q=Amahoro+National+Stadium+Kigali',
    },
  });
  console.log('Contact info seeded successfully');

  // 15. Social Links
  const socialLinks = [
    { platform: 'facebook', url: 'https://facebook.com/npcrwanda', icon: 'fa-facebook-f', order: 1, active: true },
    { platform: 'twitter', url: 'https://twitter.com/npcrwanda', icon: 'fa-twitter', order: 2, active: true },
    { platform: 'instagram', url: 'https://instagram.com/npcrwanda', icon: 'fa-instagram', order: 3, active: true },
    { platform: 'youtube', url: 'https://youtube.com/npcrwanda', icon: 'fa-youtube', order: 4, active: true },
  ];
  for (const s of socialLinks) {
    await prisma.socialLink.create({ data: s });
  }
  console.log('Social links seeded successfully');

  // 16. Events
  const eventsList = [
    { title: 'National Paralympic Games 2026', description: 'Annual national competition bringing together para-athletes from all 30 districts of Rwanda.', date: '2026-08-15', endDate: '2026-08-20', location: 'Amahoro National Stadium, Kigali', category: 'National', status: 'Upcoming', img: '/assets/img/curated/event-paralympic-games.jpg', featured: true },
    { title: 'IPC Athletics Grand Prix', description: 'International athletics competition featuring Rwanda para-athletes competing in track and field events.', date: '2026-09-10', endDate: '2026-09-12', location: 'Kigali, Rwanda', category: 'International', status: 'Upcoming', img: '/assets/img/curated/event-athletics-grandprix.jpg', featured: true },
    { title: 'Para-Powerlifting District Championship', description: 'District-level powerlifting championship to identify and develop emerging talent across Rwanda.', date: '2026-07-25', endDate: '2026-07-26', location: 'Huye District Sports Complex', category: 'Regional', status: 'Upcoming', img: '/assets/img/curated/event-powerlifting.jpg', featured: false },
    { title: 'Goalball Training Camp', description: 'Three-day intensive training camp for national goalball team members preparing for the African Championships.', date: '2026-07-05', endDate: '2026-07-07', location: 'NPC Rwanda Training Center', category: 'Training', status: 'Completed', img: '/assets/img/curated/event-goalball-camp.jpg', featured: false },
    { title: 'Sitting Volleyball National League - Round 3', description: 'Third round of the national sitting volleyball league featuring 8 district teams.', date: '2026-08-02', endDate: '2026-08-03', location: 'Petit Stade, Kigali', category: 'National', status: 'Upcoming', img: '/assets/img/curated/event-volleyball-league.jpg', featured: false },
    { title: 'Para-Athlete Welfare Conference', description: 'Annual conference discussing athlete welfare, classification updates, and development pathways for Rwanda para-sports.', date: '2026-06-20', endDate: '2026-06-20', location: 'Kigali Convention Centre', category: 'Conference', status: 'Completed', img: '/assets/img/curated/event-welfare-conference.jpg', featured: false },
  ];
  for (const e of eventsList) {
    await prisma.event.create({ data: e });
  }
  console.log('Events seeded successfully');

  // 17. Site Content
  const contents = [
    { key: 'hero.image', value: '/assets/img/curated/home-hero.jpg', type: 'image' },
    { key: 'hero.kicker', value: "RWANDA'S PARALYMPIC PRIDE", type: 'text' },
    { key: 'hero.title1', value: 'Empowering Ability.', type: 'text' },
    { key: 'hero.title2', value: 'Inspiring Rwanda.', type: 'text' },
    { key: 'hero.lead', value: 'We build inclusive pathways in sport and prepare elite para-athletes to represent Rwanda on the world stage. Ability comes first.', type: 'text' },
    { key: 'hero.stat1.title', value: 'Talent Identification', type: 'text' },
    { key: 'hero.stat1.desc', value: 'Community scouting and development across all districts.', type: 'text' },
    { key: 'hero.stat2.title', value: 'High Performance', type: 'text' },
    { key: 'hero.stat2.desc', value: 'Elite preparation for continental and global events.', type: 'text' },
    { key: 'hero.stat3.title', value: 'Athlete Welfare', type: 'text' },
    { key: 'hero.stat3.desc', value: 'Medical, classification, and safeguarding support.', type: 'text' },
    { key: 'hero.stat4.title', value: 'Partnerships', type: 'text' },
    { key: 'hero.stat4.desc', value: 'Working with federations, donors, and communities.', type: 'text' },
    { key: 'impact.eyebrow', value: 'Impact Snapshot', type: 'text' },
    { key: 'impact.title', value: 'Building Pathways for Inclusive Excellence', type: 'text' },
    { key: 'impact.desc', value: 'From grassroots participation to elite competition, NPC Rwanda connects athletes, coaches, and communities to grow para-sport opportunities nationwide.', type: 'text' },
    { key: 'stats.districts', value: '30', type: 'text' },
    { key: 'stats.disciplines', value: '12+', type: 'text' },
    { key: 'stats.founded', value: '2001', type: 'text' },
    { key: 'stats.clubs', value: '30+', type: 'text' },
    { key: 'about.previewImage', value: '/assets/img/curated/about-hero.jpg', type: 'image' },
    { key: 'about.eyebrow', value: 'Who We Are', type: 'text' },
    { key: 'about.previewTitle', value: 'Driving Inclusion Through Sport', type: 'text' },
    { key: 'about.previewText', value: 'The National Paralympic Committee of Rwanda (NPC Rwanda) is a national non-governmental organization established in 2001. Our vision is to be the leading Paralympic nation in Africa, and our mission is to build a sustainable system that enables para-athletes to achieve their sporting aspirations.', type: 'text' },
    { key: 'about.bullet1', value: 'Member of IPC & World ParaVolley', type: 'text' },
    { key: 'about.bullet2', value: 'Presence in all 30 Districts (DPSCO)', type: 'text' },
    { key: 'about.bullet3', value: 'Inclusive Sports for All Abilities', type: 'text' },
    { key: 'about.heroImage', value: '/assets/img/curated/about-hero.jpg', type: 'image' },
    { key: 'about.historyParagraph1', value: 'Founded in November 2001, the National Paralympic Committee of Rwanda has grown from a small group of advocates into a nationally coordinated movement. We have worked consistently to expand opportunities for athletes with disabilities while building a high-performance pathway that meets international standards.', type: 'text' },
    { key: 'about.historyParagraph2', value: "Rwanda's first Paralympic participation was in Athens 2004. Since then, our athletes have continued to prove that disability is not inability, delivering strong performances and inspiring the nation through resilience and excellence.", type: 'text' },
    { key: 'about.historyImage', value: '/assets/img/curated/about-history.jpg', type: 'image' },
    { key: 'about.vision', value: 'To be the leading Paralympic nation in Africa.', type: 'text' },
    { key: 'about.mission', value: 'To develop a sustainable Paralympic sport system in Rwanda for enabling Para-athletes to achieve their sporting aspirations in local and International sport arena.', type: 'text' },
    { key: 'about.value.phrase.Courage', value: 'The courage to compete at the highest level and redefine what is possible.', type: 'text' },
    { key: 'about.value.phrase.Determination', value: 'Relentless commitment to preparation, discipline, and sporting excellence.', type: 'text' },
    { key: 'about.value.phrase.Equality', value: 'Ensuring fair access, respect, and opportunity for all athletes.', type: 'text' },
    { key: 'about.value.phrase.Inspiration', value: 'Inspiring communities through achievement and leadership on and off the field.', type: 'text' },
    { key: 'about.value.phrase.Empowerment', value: 'Equipping athletes with the tools, training, and support they need to thrive.', type: 'text' },
    { key: 'about.value.phrase.Intersectionality', value: 'Recognizing the diverse experiences that shape our athletes and communities.', type: 'text' },
    { key: 'about.objective.phrase.Athlete Excellence', value: 'Strengthen coaching, science, and athlete support to compete for podium finishes internationally.', type: 'text' },
    { key: 'about.objective.phrase.Grassroots Development', value: 'Expand access in all 30 districts and identify talent early for long-term development.', type: 'text' },
    { key: 'about.objective.phrase.Safeguarding & Governance', value: 'Maintain strong safeguarding practices and transparent governance at all levels.', type: 'text' },
    { key: 'about.objective.phrase.Partnership Growth', value: 'Build sustainable partnerships with government, federations, and private sector sponsors.', type: 'text' },
    { key: 'cta.title', value: 'Support Inclusive Sports in Rwanda', type: 'text' },
    { key: 'cta.desc', value: 'Help us expand access, strengthen athlete pathways, and deliver excellence in para-sport.', type: 'text' },
    { key: 'footer.description', value: 'The National Paralympic Committee of Rwanda is dedicated to the development of Paralympic sports and fostering inclusion for persons with disabilities through the power of athletic excellence.', type: 'text' },
    { key: 'footer.logo', value: '/assets/img/logo.png', type: 'image' },
  ];
  for (const c of contents) {
    await prisma.siteContent.create({ data: c });
  }
  console.log('Site content seeded successfully');

  console.log('Database seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
