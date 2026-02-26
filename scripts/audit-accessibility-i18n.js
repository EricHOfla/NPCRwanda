const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function collectHtmlFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      collectHtmlFiles(fullPath, out);
      continue;
    }
    if (!entry.name.endsWith('.html')) continue;
    out.push(fullPath);
  }
  return out;
}

const checks = [
  { attr: 'alt', dataAttr: 'data-i18n-alt' },
  { attr: 'title', dataAttr: 'data-i18n-title' },
  { attr: 'aria-label', dataAttr: 'data-i18n-aria-label' }
];

let count = 0;
for (const filePath of collectHtmlFiles(root)) {
  const rel = path.relative(root, filePath);
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const check of checks) {
      if (line.includes(`${check.attr}="`) && !line.includes(`${check.dataAttr}="`)) {
        console.log(`${rel}:${i + 1} missing ${check.dataAttr} -> ${line.trim()}`);
        count++;
      }
    }
  });
}

console.log(`TOTAL_MISSING=${count}`);
