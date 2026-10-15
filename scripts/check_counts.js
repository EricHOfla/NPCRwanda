const {PrismaClient} = require('@prisma/client');
const p = new PrismaClient();
Promise.all([
  p.npcAssociation.count().then(c => console.log('npcAssociations:', c)),
  p.npcClub.count().then(c => console.log('npcClubs:', c)),
  p.npcFederation.count().then(c => console.log('npcFederations:', c)),
  p.dpscoContact.count().then(c => console.log('dpscoContacts:', c)),
  p.siteContent.count().then(c => console.log('siteContent:', c)),
  p.athlete.count().then(c => console.log('athletes:', c)),
  p.leader.count().then(c => console.log('leaders:', c)),
  p.partner.count().then(c => console.log('partners:', c)),
  p.newsArticle.count().then(c => console.log('newsArticles:', c)),
  p.event.count().then(c => console.log('events:', c)),
  p.sportDiscipline.count().then(c => console.log('sportDisciplines:', c)),
]).then(() => p.$disconnect()).catch(e => { console.error(e); p.$disconnect(); });
