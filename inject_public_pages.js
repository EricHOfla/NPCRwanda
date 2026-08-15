const fs = require('fs');
const path = require('path');

function replaceFileContent(filePath, replacer) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = replacer(content);
  fs.writeFileSync(filePath, content, 'utf8');
}

// 1. Associations Page
replaceFileContent(path.join(__dirname, 'src/app/members/associations/page.tsx'), (content) => {
  if (!content.includes('import { useData }')) {
    content = content.replace("import { useTranslation } from '@/context/LanguageContext';", "import { useTranslation } from '@/context/LanguageContext';\nimport { useData } from '@/context/DataContext';");
  }
  
  // Find the arrays
  const regexAssoc = /const associations = \[\s*\{[\s\S]*?\},\s*\];/;
  const regexClubs = /const clubs = \[\s*\{[\s\S]*?\},\s*\];/;
  
  content = content.replace(regexAssoc, "const { npcAssociations, npcClubs } = useData();\n  const associations = npcAssociations.filter(a => a.active);");
  content = content.replace(regexClubs, "const clubs = npcClubs.filter(c => c.active);");
  
  return content;
});

// 2. Federations Page
replaceFileContent(path.join(__dirname, 'src/app/members/federations/page.tsx'), (content) => {
  if (!content.includes('import { useData }')) {
    content = content.replace("import { useTranslation } from '@/context/LanguageContext';", "import { useTranslation } from '@/context/LanguageContext';\nimport { useData } from '@/context/DataContext';");
  }
  
  const regexFeds = /const federations = \[\s*\{[\s\S]*?\},\s*\];/;
  content = content.replace(regexFeds, "const { npcFederations } = useData();\n  const federations = npcFederations.filter(f => f.active);");
  
  return content;
});

// 3. DPSCO Page
replaceFileContent(path.join(__dirname, 'src/app/members/dpsco/page.tsx'), (content) => {
  if (!content.includes('import { useData }')) {
    content = content.replace("import { useTranslation } from '@/context/LanguageContext';", "import { useTranslation } from '@/context/LanguageContext';\nimport { useData } from '@/context/DataContext';");
  }
  
  const regexDpsco = /const dpscoContacts = \[\s*\{[\s\S]*?\},\s*\];/;
  content = content.replace(regexDpsco, "const { dpscoContacts: contacts } = useData();\n  const dpscoContacts = contacts.filter(c => c.active);");
  
  return content;
});

console.log('Public pages updated successfully!');
