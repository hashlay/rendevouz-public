const fs = require('fs');

// 1. Update routes.ts
let routes = fs.readFileSync('ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/server/routes.ts', 'utf8');

// Remove line 2631 app_state update
routes = routes.replace(
  /mongoDb\.collection\('greenRoomAssignments'\)\.deleteMany\(\{ participantId: partId \}\),\r?\n\s*mongoDb\.collection\('app_state'\)\.updateOne\(\{ _id: 'global_state' as any \}, \{ \$pull: \{ participants: \{ id: partId \} \} \} as any\)/g,
  "mongoDb.collection('greenRoomAssignments').deleteMany({ participantId: partId })"
);

// Remove line 3151 app_state update
routes = routes.replace(
  /mongoDb\.collection\('greenRoomAssignments'\)\.deleteMany\(\{ teamId: teamId \}\),\r?\n\s*mongoDb\.collection\('app_state'\)\.updateOne\(\{ _id: 'global_state' as any \}, \{ \$pull: \{ teams: \{ id: teamId \} \} \} as any\)/g,
  "mongoDb.collection('greenRoomAssignments').deleteMany({ teamId: teamId })"
);

// Remove lines 5074-5078 monolithic app_state replaceOne
routes = routes.replace(
  /,\r?\n\s*mongoDb\.collection\('app_state'\)\.replaceOne\(\r?\n\s*\{ _id: 'global_state' as any \},\r?\n\s*\{ \.\.\.db \},\r?\n\s*\{ upsert: true \}\r?\n\s*\)/g,
  ""
);

fs.writeFileSync('ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/server/routes.ts', routes, 'utf8');
console.log('✅ Updated routes.ts successfully');

// 2. Update server/db.ts
let dbTs = fs.readFileSync('ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/server/db.ts', 'utf8');
dbTs = dbTs.replace(/'sahityotsav'/g, "'rendezvous_2026'");
fs.writeFileSync('ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/server/db.ts', dbTs, 'utf8');
console.log('✅ Updated server/db.ts successfully');

// 3. Update server.mjs
let serverMjs = fs.readFileSync('server.mjs', 'utf8');
serverMjs = serverMjs.replace(/'sahityotsav'/g, "'rendezvous_2026'");
serverMjs = serverMjs.replace(/MongoDB sahityotsav/g, 'MongoDB rendezvous_2026');
fs.writeFileSync('server.mjs', serverMjs, 'utf8');
console.log('✅ Updated server.mjs successfully');
