const fs = require('fs');

const fileList = [
  'src/data/festivalData.ts',
  'src/components/HeroSection.tsx',
  'src/components/Logo.tsx',
  'src/components/AboutSection.tsx',
  'src/components/Footer.tsx',
  'index.html',
  'metadata.json',
  'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/server/db.ts'
];

for (const file of fileList) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Spelling corrections
    content = content.replace(/FANOOS/g, 'FANOUS');
    content = content.replace(/Fanoos/g, 'Fanous');
    content = content.replace(/fanoos/g, 'fanous');
    content = content.replace(/Rifaiyya Juma Masjid Mucchila/g, 'Rifayiya Juma Masjid Muchila');
    content = content.replace(/Rifaiyya/g, 'Rifayiya');
    content = content.replace(/Mucchila/g, 'Muchila');
    
    fs.writeFileSync(file, content, 'utf8');
    console.log(`✅ Updated ${file}`);
  }
}
