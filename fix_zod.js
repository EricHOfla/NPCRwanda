const fs = require('fs');
const path = require('path');

const apiPaths = [
  'npc-associations',
  'npc-associations/[id]',
  'npc-clubs',
  'npc-clubs/[id]',
  'npc-federations',
  'npc-federations/[id]',
  'dpsco-contacts',
  'dpsco-contacts/[id]',
];

apiPaths.forEach(p => {
  const filePath = path.join(__dirname, 'src/app/api', p, 'route.ts');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/error\.errors\[0\]\.message/g, 'error.issues[0].message');
    fs.writeFileSync(filePath, content, 'utf8');
  }
});
console.log('Fixed ZodError types');
