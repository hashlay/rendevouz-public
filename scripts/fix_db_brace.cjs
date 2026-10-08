const fs = require('fs');
let dbTs = fs.readFileSync('ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/server/db.ts', 'utf8');

const target = `    if (!db.units || db.units.length === 0) {
      db.units = [
        { id: 'unit_1', name: 'Unit 1', code: 'U1', active: true },
        { id: 'unit_2', name: 'Unit 2', code: 'U2', active: true }
      ];
    } catch (err) {`;

const replacement = `    if (!db.units || db.units.length === 0) {
      db.units = [
        { id: 'unit_1', name: 'Unit 1', code: 'U1', active: true },
        { id: 'unit_2', name: 'Unit 2', code: 'U2', active: true }
      ];
    }
  } catch (err) {`;

if (dbTs.includes(target)) {
  dbTs = dbTs.replace(target, replacement);
  fs.writeFileSync('ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/server/db.ts', dbTs, 'utf8');
  console.log('✅ Correctly added closing brace to try block in db.ts');
} else {
  // Let's replace by regex
  dbTs = dbTs.replace(
    /(\[\s*\{\s*id:\s*'unit_1'[\s\S]*?\}\s*\];\s*\})(\s*catch\s*\(err\))/,
    '$1\n  }$2'
  );
  fs.writeFileSync('ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/server/db.ts', dbTs, 'utf8');
  console.log('✅ Correctly added closing brace by regex to db.ts');
}
