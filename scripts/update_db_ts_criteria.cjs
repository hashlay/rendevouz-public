const fs = require('fs');
const file = 'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/server/db.ts';
let content = fs.readFileSync(file, 'utf8');
const needle = "if (!db.eventSettings.sahityotsavLogoUrl || db.eventSettings.sahityotsavLogoUrl.includes('base64') || db.eventSettings.sahityotsavLogoUrl.includes('zenith')) db.eventSettings.sahityotsavLogoUrl = '/tabassum_logo.jpg';";
if (content.includes(needle)) {
  content = content.replace(needle, needle + "\n      if (!db.eventSettings.participantLoginCriteria || db.eventSettings.participantLoginCriteria === 'dob') db.eventSettings.participantLoginCriteria = 'class';");
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated server/db.ts');
} else {
  console.log('Needle not found');
}
