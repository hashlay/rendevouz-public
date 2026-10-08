const fs = require('fs');

let dbTs = fs.readFileSync('ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/server/db.ts', 'utf8');

// Replace recovery check to honor empty categories and 2 units
dbTs = dbTs.replace(
  /\/\/ Explicit recovery check: if categories or units are empty, ensure default defaults exist[\s\S]*?if \(!db\.units \|\| db\.units\.length === 0\) \{[\s\S]*?\}\s*\}/,
  `// Explicit recovery check: ensure arrays are defined
    if (!db.categories) {
      db.categories = [];
    }
    if (!db.units || db.units.length === 0) {
      db.units = [
        { id: 'unit_1', name: 'Unit 1', code: 'U1', active: true },
        { id: 'unit_2', name: 'Unit 2', code: 'U2', active: true }
      ];
    }`
);

fs.writeFileSync('ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/server/db.ts', dbTs, 'utf8');
console.log('✅ Updated server/db.ts recovery logic.');
