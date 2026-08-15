const fs = require('fs');
const path = require('path');

const apiRoutes = [
  'athletes/route.ts',
  'news/route.ts',
  'events/route.ts',
  'careers/route.ts',
  'sports/route.ts',
  'leaders/route.ts',
  'system/route.ts',
  'site-content/route.ts',
  'contact-info/route.ts',
  'social-links/route.ts',
  'governance-docs/route.ts',
  'governance-policies/route.ts'
];

const basePath = path.join(__dirname, 'src', 'app', 'api');

for (const route of apiRoutes) {
  const filePath = path.join(basePath, route);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (!content.includes("export const dynamic = 'force-dynamic';")) {
      // Find the last import statement
      const importMatches = [...content.matchAll(/^import.*$/gm)];
      if (importMatches.length > 0) {
        const lastImport = importMatches[importMatches.length - 1];
        const insertPos = lastImport.index + lastImport[0].length;
        content = content.slice(0, insertPos) + "\n\nexport const dynamic = 'force-dynamic';" + content.slice(insertPos);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${route}`);
      }
    }
  } else {
    console.log(`Not found: ${route}`);
  }
}
