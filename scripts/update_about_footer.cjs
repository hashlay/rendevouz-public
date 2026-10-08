const fs = require('fs');

// 1. Update AboutSection.tsx
let about = fs.readFileSync('src/components/AboutSection.tsx', 'utf8');
about = about.replace(/'Kulliyathu Imam Rabbani'/g, "'Swalahul Huda Academy'");
about = about.replace(/'Off-Campus of Markaz Garden, Poonoor'/g, "'Meelad Fest 2K26'");
about = about.replace(/'Decoding Phytolore'/g, "'Meelad Fest'");
about = about.replace(
  /<strong>Kulliyathu Imam Rabbani<\/strong>[\s\S]*?40\+ disciplines\./,
  '<strong>Swalahul Huda Academy</strong> presents <strong>FANOOS 2K26 (Meelad Fest)</strong>, an annual celebration of intellectual, creative, and moral excellence.'
);
about = about.replace(
  /'In an interconnected world, \'Decoding Phytolore\' calls upon the youth to explore the deeper symbiosis between nature, wisdom, spiritual clarity, and moral fortitude\.'/,
  "'A celebration of artistic, intellectual, and spiritual expression uniting students through healthy creative competition.'"
);
fs.writeFileSync('src/components/AboutSection.tsx', about, 'utf8');
console.log('✅ Updated AboutSection.tsx');

// 2. Update Footer.tsx
let footer = fs.readFileSync('src/components/Footer.tsx', 'utf8');
footer = footer.replace(/\/rendezvous_icon\.png/g, '/fanoos_logo.jpg');
footer = footer.replace(/return 'RENDEZVOUS';/g, "return 'FANOOS';");
footer = footer.replace(/return '26';/g, "return '2K26';");
footer = footer.replace(/return 'IMAM RABBANI LIFE FESTIVAL';/g, "return 'SWALAHUL HUDA ACADEMY';");
footer = footer.replace(/'Imam Rabbani Campus'/g, "'Rifaiyya Juma Masjid Mucchila'");
footer = footer.replace(
  /Rendezvous 26 is a vibrant celebration[\s\S]*?shared values\./,
  'FANOOS 2K26 is a vibrant celebration of talent, creativity, knowledge, and togetherness, proudly organized by Swalahul Huda Academy for Meelad Fest.'
);
fs.writeFileSync('src/components/Footer.tsx', footer, 'utf8');
console.log('✅ Updated Footer.tsx');

// 3. Update index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/<title>.*?<\/title>/, '<title>FANOOS 2K26 | Meelad Fest — Swalahul Huda Academy</title>');
indexHtml = indexHtml.replace(/\/rendezvous_icon\.png/g, '/fanoos_logo.jpg');
fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('✅ Updated index.html');

// 4. Update metadata.json
let meta = JSON.parse(fs.readFileSync('metadata.json', 'utf8'));
meta.name = 'FANOOS 2K26 | Meelad Fest';
meta.description = 'Official festival portal for FANOOS 2K26 - Meelad Fest (Swalahul Huda Academy)';
fs.writeFileSync('metadata.json', JSON.stringify(meta, null, 2), 'utf8');
console.log('✅ Updated metadata.json');
