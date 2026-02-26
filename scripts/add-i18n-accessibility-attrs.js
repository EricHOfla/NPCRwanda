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

function shouldKey(value) {
  const text = value.trim();
  if (!text) return false;
  return /[A-Za-z]/.test(text);
}

function injectInTag(tag) {
  let updated = tag;

  const entries = [
    { attr: 'alt', dataAttr: 'data-i18n-alt' },
    { attr: 'title', dataAttr: 'data-i18n-title' },
    { attr: 'aria-label', dataAttr: 'data-i18n-aria-label' }
  ];

  for (const entry of entries) {
    const attrRegex = new RegExp(`\\s${entry.attr}="([^"]+)"`);
    const match = updated.match(attrRegex);
    if (!match) continue;
    if (updated.includes(`${entry.dataAttr}=`)) continue;
    const value = match[1];
    if (!shouldKey(value)) continue;
    updated = updated.replace(attrRegex, (full, val) => `${full} ${entry.dataAttr}="phrase.${val}"`);
  }

  return updated;
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = original.replace(/<[^>]+>/g, injectInTag);
  if (updated !== original) {
    fs.writeFileSync(filePath, updated, 'utf8');
    return true;
  }
  return false;
}

const files = collectHtmlFiles(root);
for (const filePath of files) {
  if (processFile(filePath)) {
    console.log('updated ' + path.relative(root, filePath));
  }
}
