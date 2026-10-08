const fs = require('fs');
const path = require('path');

// 1. AboutSection.tsx
const aboutPath = 'src/components/AboutSection.tsx';
if (fs.existsSync(aboutPath)) {
  let content = fs.readFileSync(aboutPath, 'utf8');
  content = content.replace(
    /'In an interconnected world, \'Decoding Phytolore\' calls upon the youth to explore the deeper symbiosis between nature, wisdom, spiritual clarity, and moral fortitude\.'/g,
    `'“Fanous – Meelad Fest 2K26”, the grand celebration of faith, knowledge, and creativity at Swalahul Huda Academy, Yenmoor, Muchila. Join us on a beautiful journey of inspiration, unity, and talent as we celebrate the blessed legacy of Prophet Muhammad ﷺ.'`
  );
  content = content.replace(/alt="Students at Imam Rabbani on Stage"/g, 'alt="Swalahul Huda Academy Meelad Fest"');
  content = content.replace(/'Main Stage Auditorium • Imam Rabbani Campus'/g, `'Swalahul Huda Academy • Rifayiya Juma Masjid Muchila'`);
  content = content.replace(/'Imam Rabbani Life Festival'/g, `'Swalahul Huda Academy'`);
  fs.writeFileSync(aboutPath, content, 'utf8');
  console.log('Updated AboutSection.tsx');
}

// 2. posterRenderer.ts
const prPath = 'src/utils/posterRenderer.ts';
if (fs.existsSync(prPath)) {
  let content = fs.readFileSync(prPath, 'utf8');
  content = content.replace(/eventSettings\?\.slogan \|\| 'Decoding Phytolore'/g, `eventSettings?.slogan || 'Meelad Fest'`);
  content = content.replace(/eventSettings\?\.sectorName \|\| 'Imam Rabbani Life Festival'/g, `eventSettings?.sectorName || 'Swalahul Huda Academy'`);
  content = content.replace(/#Rendezvous26 #ImamRabbani #LifeFestival #DecodingPhytolore #Results #Congratulations/g, `#Fanous2K26 #SwalahulHudaAcademy #MeeladFest #Results #Muchila`);
  fs.writeFileSync(prPath, content, 'utf8');
  console.log('Updated posterRenderer.ts');
}

// 3. CertificatesView.tsx (admin)
const certPath = 'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/src/components/CertificatesView.tsx';
if (fs.existsSync(certPath)) {
  let content = fs.readFileSync(certPath, 'utf8');
  content = content.replace(/eventSettings\?\.slogan \|\| 'Decoding Phytolore'/g, `eventSettings?.slogan || 'Meelad Fest'`);
  content = content.replace(/eventSettings\?\.sectorName \|\| 'Imam Rabbani Life Festival'/g, `eventSettings?.sectorName || 'Swalahul Huda Academy'`);
  content = content.replace(/#Rendezvous26 #ImamRabbani #LifeFestival #DecodingPhytolore #Results #Congratulations/g, `#Fanous2K26 #SwalahulHudaAcademy #MeeladFest #Results #Muchila`);
  fs.writeFileSync(certPath, content, 'utf8');
  console.log('Updated CertificatesView.tsx');
}

// 4. Logo.tsx (admin)
const logoPath = 'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/src/components/Logo.tsx';
if (fs.existsSync(logoPath)) {
  let content = fs.readFileSync(logoPath, 'utf8');
  content = content.replace(/'IMAM RABBANI LIFE FESTIVAL'/g, `'SWALAHUL HUDA ACADEMY'`);
  fs.writeFileSync(logoPath, content, 'utf8');
  console.log('Updated admin Logo.tsx');
}

// 5. SettingsView.tsx, Sidebar.tsx, JudgmentSheetsView.tsx, LoginView.tsx (admin)
const adminFiles = [
  'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/src/components/SettingsView.tsx',
  'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/src/components/Sidebar.tsx',
  'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/src/components/JudgmentSheetsView.tsx',
  'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/src/components/LoginView.tsx',
  'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/server/db.ts'
];

adminFiles.forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/'Imam Rabbani Life Festival'/g, `'Swalahul Huda Academy'`);
    content = content.replace(/'Imam Rabbani Campus'/g, `'Rifayiya Juma Masjid Muchila'`);
    content = content.replace(/'Decoding Phytolore'/g, `'Meelad Fest'`);
    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated ' + f);
  }
});

// 6. CMSWebsiteStudio.tsx (admin) placeholders
const cmsStudioPath = 'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/src/components/CMSWebsiteStudio.tsx';
if (fs.existsSync(cmsStudioPath)) {
  let content = fs.readFileSync(cmsStudioPath, 'utf8');
  content = content.replace(/placeholder="IMAM RABBANI LIFE FESTIVAL"/g, 'placeholder="SWALAHUL HUDA ACADEMY"');
  content = content.replace(/placeholder="Decoding Phytolore"/g, 'placeholder="Meelad Fest"');
  content = content.replace(/placeholder="Imam Rabbani"/g, 'placeholder="Swalahul Huda"');
  content = content.replace(/placeholder="Imam Rabbani Campus"/g, 'placeholder="Rifayiya Juma Masjid Muchila"');
  content = content.replace(/placeholder="Kulliyathu Imam Rabbani"/g, 'placeholder="Swalahul Huda Academy"');
  content = content.replace(/placeholder="Kulliyathu Imam Rabbani stands as a premier center\.\.\."/g, 'placeholder="Swalahul Huda Academy proudly presents FANOUS 2K26..."');
  content = content.replace(/placeholder="KULLIYATHU IMAM RABBANI"/g, 'placeholder="SWALAHUL HUDA ACADEMY"');
  content = content.replace(/placeholder="DECODING PHYTOLORE"/g, 'placeholder="FANOUS 2K26"');
  content = content.replace(/placeholder="Imam Rabbani Life Festival"/g, 'placeholder="Meelad Fest"');
  content = content.replace(/placeholder="Decoding Phytolore delves into the profound wisdom of natural heritage, botanical lore, and life systems\.\.\."/g, 'placeholder="“Fanous – Meelad Fest 2K26”, the grand celebration of faith, knowledge, and creativity..."');
  content = content.replace(/placeholder="Rendezvous 26 is a vibrant celebration of talent, creativity, knowledge, and togetherness, proudly organized by Imam Rabbani Life Festival, bringing students together through meaningful learning, healthy competition, and shared values\."/g, 'placeholder="Fanous 2K26 is a vibrant celebration of talent, creativity, knowledge, and togetherness, proudly organized by Swalahul Huda Academy at Rifayiya Juma Masjid Muchila."');
  content = content.replace(/placeholder="© 2026 Imam Rabbani Life Festival\. All rights reserved\. Developed by Zenith\."/g, 'placeholder="© 2026 Fanous 2K26 – Meelad Fest. Swalahul Huda Academy. All rights reserved. Developed by Zenith."');
  fs.writeFileSync(cmsStudioPath, content, 'utf8');
  console.log('Updated CMSWebsiteStudio.tsx placeholders');
}
