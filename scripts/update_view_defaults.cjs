const fs = require('fs');

// 1. CompetitionsView.tsx
const compFile = 'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/src/components/CompetitionsView.tsx';
let compContent = fs.readFileSync(compFile, 'utf8');
compContent = compContent.replace(
  "const [catCriteriaType, setCatCriteriaType] = useState<'dob' | 'class'>('dob');",
  "const [catCriteriaType, setCatCriteriaType] = useState<'dob' | 'class'>('class');"
);
fs.writeFileSync(compFile, compContent, 'utf8');
console.log('CompetitionsView updated');

// 2. SettingsView.tsx
const settingsFile = 'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/src/components/SettingsView.tsx';
let settingsContent = fs.readFileSync(settingsFile, 'utf8');
settingsContent = settingsContent.replace(
  "const [catCriteria, setCatCriteria] = useState<'dob' | 'class'>('dob');",
  "const [catCriteria, setCatCriteria] = useState<'dob' | 'class'>('class');"
);
fs.writeFileSync(settingsFile, settingsContent, 'utf8');
console.log('SettingsView updated');
