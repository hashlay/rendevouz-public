const fs = require('fs');
const path = require('path');

const replacements = [
  // Primary Brand Accent
  { regex: /#18BA46/gi, replace: '#48205D' },
  // Page Body & Modal Background
  { regex: /#012002/gi, replace: '#F7F6F8' },
  // Card & Section Container Background
  { regex: /#07380B/gi, replace: '#FFFFFF' },
  // Elevated Card & Header Background
  { regex: /#0B4A12/gi, replace: '#F0EAF3' },
  // Subtle Border & Divider Lines
  { regex: /#176523/gi, replace: '#DED2E5' },
  // Primary Heading & Title Text
  { regex: /#F4F8F4/gi, replace: '#351747' },
  // Secondary Sub-header Text
  { regex: /#A2D5A4/gi, replace: '#684477' },
  // Muted Text & Timestamps
  { regex: /#7EA681/gi, replace: '#817589' }
];

let filesModified = 0;
let totalReplacements = 0;

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let count = 0;

  for (const { regex, replace } of replacements) {
    const matches = newContent.match(regex);
    if (matches) {
      count += matches.length;
      newContent = newContent.replace(regex, replace);
    }
  }

  if (count > 0) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}: ${count} color replacements.`);
    filesModified++;
    totalReplacements += count;
  }
}

function traverse(dir) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    if (['node_modules', '.git', 'dist', 'scratch', 'backups'].includes(item.name)) continue;
    const full = path.join(dir, item.name);
    if (item.isDirectory()) {
      traverse(full);
    } else if (item.isFile() && /\.(tsx|ts|jsx|js|css|html|json)$/.test(item.name)) {
      processFile(full);
    }
  }
}

console.log('--- EXECUTING FANOOS 2K26 COLOR PALETTE REPLACEMENTS ---');
traverse('.');
console.log(`\n🎉 Completed: ${totalReplacements} color occurrences updated across ${filesModified} files.`);
