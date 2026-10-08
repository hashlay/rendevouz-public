const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

// 1. Update src/index.css
const indexCssPath = 'src/index.css';
if (fs.existsSync(indexCssPath)) {
  let css = fs.readFileSync(indexCssPath, 'utf8');
  css = css.replace(/--color-primary-accent:\s*[^;]+;/g, '--color-primary-accent: #18BA46;');
  css = css.replace(/--color-body-bg:\s*[^;]+;/g, '--color-body-bg: #012002;');
  css = css.replace(/--color-card-bg:\s*[^;]+;/g, '--color-card-bg: #07380B;');
  css = css.replace(/--color-card-elevated-bg:\s*[^;]+;/g, '--color-card-elevated-bg: #0B4A12;');
  css = css.replace(/--color-border-subtle:\s*[^;]+;/g, '--color-border-subtle: #176523;');
  css = css.replace(/--color-text-primary:\s*[^;]+;/g, '--color-text-primary: #F4F8F4;');
  css = css.replace(/--color-text-secondary:\s*[^;]+;/g, '--color-text-secondary: #A2D5A4;');
  css = css.replace(/--color-text-muted:\s*[^;]+;/g, '--color-text-muted: #7EA681;');
  css = css.replace(/--color-gold-accent:\s*[^;]+;/g, '--color-gold-accent: #FFA28A;');
  css = css.replace(/--color-success-accent:\s*[^;]+;/g, '--color-success-accent: #10B981;');
  fs.writeFileSync(indexCssPath, css, 'utf8');
  console.log('src/index.css restored to green palette');
}

// 2. Update HeroSection.tsx
const heroPath = 'src/components/HeroSection.tsx';
if (fs.existsSync(heroPath)) {
  let hero = fs.readFileSync(heroPath, 'utf8');
  hero = hero.replace(/bg-\[#F7F6F8\]/g, 'bg-[#012002]');
  hero = hero.replace(/from-\[#F7F6F8\]\/80 via-transparent to-\[#F7F6F8\]\/40/g, 'from-[#012002]/90 via-[#012002]/30 to-transparent');
  hero = hero.replace(/brightness-\[0\.98\]/g, 'brightness-[0.65]');
  hero = hero.replace(/border-purple-200/g, 'border-emerald-500/30');
  hero = hero.replace(/text-purple-900/g, 'text-emerald-400');
  hero = hero.replace(/border-purple-300\/40/g, 'border-emerald-500/30');
  hero = hero.replace(/bg-white\/80/g, 'bg-black/50');
  hero = hero.replace(/bg-white\/70/g, 'bg-black/50');
  hero = hero.replace(/bg-white\/90/g, 'bg-black/40');
  hero = hero.replace(/text-\[#351747\]/g, 'text-[#F4F8F4]');
  hero = hero.replace(/text-\[#684477\]/g, 'text-[#A2D5A4]');
  hero = hero.replace(/#48205D/g, '#18BA46');
  hero = hero.replace(/#DED2E5/g, '#176523');
  hero = hero.replace(/#74359A/g, '#18BA46');
  hero = hero.replace(/#100D17/g, '#012002');
  hero = hero.replace(/#1D1628/g, '#07380B');
  hero = hero.replace(/#2B1E3B/g, '#0B4A12');
  hero = hero.replace(/#483454/g, '#176523');
  hero = hero.replace(/#F8F6FA/g, '#F4F8F4');
  hero = hero.replace(/#D4BEDF/g, '#A2D5A4');
  hero = hero.replace(/#A69AAC/g, '#7EA681');
  fs.writeFileSync(heroPath, hero, 'utf8');
  console.log('src/components/HeroSection.tsx restored to dark green theme');
}

// 3. Update Logo.tsx
const logoPath = 'src/components/Logo.tsx';
if (fs.existsSync(logoPath)) {
  let logo = fs.readFileSync(logoPath, 'utf8');
  logo = logo.replace(/#48205D/g, '#18BA46');
  logo = logo.replace(/#74359A/g, '#18BA46');
  fs.writeFileSync(logoPath, logo, 'utf8');
  console.log('src/components/Logo.tsx updated');
}

// 4. Update AboutSection.tsx
const aboutPath = 'src/components/AboutSection.tsx';
if (fs.existsSync(aboutPath)) {
  let about = fs.readFileSync(aboutPath, 'utf8');
  about = about.replace(/bg-\[#FF2B2B\]\/5/g, 'bg-emerald-500/10');
  about = about.replace(/#48205D/g, '#18BA46');
  fs.writeFileSync(aboutPath, about, 'utf8');
  console.log('src/components/AboutSection.tsx updated');
}

// 5. Update CMSWebsiteStudio.tsx
const cmsPath = 'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/src/components/CMSWebsiteStudio.tsx';
if (fs.existsSync(cmsPath)) {
  let cms = fs.readFileSync(cmsPath, 'utf8');
  cms = cms.replace(/primaryAccent:\s*['"][^'"]+['"]/g, "primaryAccent: '#18BA46'");
  cms = cms.replace(/bodyBg:\s*['"][^'"]+['"]/g, "bodyBg: '#012002'");
  cms = cms.replace(/cardBg:\s*['"][^'"]+['"]/g, "cardBg: '#07380B'");
  cms = cms.replace(/cardElevatedBg:\s*['"][^'"]+['"]/g, "cardElevatedBg: '#0B4A12'");
  cms = cms.replace(/borderSubtle:\s*['"][^'"]+['"]/g, "borderSubtle: '#176523'");
  cms = cms.replace(/textPrimary:\s*['"][^'"]+['"]/g, "textPrimary: '#F4F8F4'");
  cms = cms.replace(/textSecondary:\s*['"][^'"]+['"]/g, "textSecondary: '#A2D5A4'");
  cms = cms.replace(/textMuted:\s*['"][^'"]+['"]/g, "textMuted: '#7EA681'");
  cms = cms.replace(/goldAccent:\s*['"][^'"]+['"]/g, "goldAccent: '#FFA28A'");
  cms = cms.replace(/successAccent:\s*['"][^'"]+['"]/g, "successAccent: '#10B981'");

  // Update COLOR_ITEMS defaults
  cms = cms.replace(/default:\s*'#48205D'/g, "default: '#18BA46'");
  cms = cms.replace(/default:\s*'#F7F6F8'/g, "default: '#012002'");
  cms = cms.replace(/default:\s*'#FFFFFF'/g, "default: '#07380B'");
  cms = cms.replace(/default:\s*'#F0EAF3'/g, "default: '#0B4A12'");
  cms = cms.replace(/default:\s*'#DED2E5'/g, "default: '#176523'");
  cms = cms.replace(/default:\s*'#351747'/g, "default: '#F4F8F4'");
  cms = cms.replace(/default:\s*'#684477'/g, "default: '#A2D5A4'");
  cms = cms.replace(/default:\s*'#817589'/g, "default: '#7EA681'");
  cms = cms.replace(/default:\s*'#74359A'/g, "default: '#18BA46'");
  cms = cms.replace(/default:\s*'#100D17'/g, "default: '#012002'");
  cms = cms.replace(/default:\s*'#1D1628'/g, "default: '#07380B'");
  cms = cms.replace(/default:\s*'#2B1E3B'/g, "default: '#0B4A12'");
  cms = cms.replace(/default:\s*'#483454'/g, "default: '#176523'");
  cms = cms.replace(/default:\s*'#F8F6FA'/g, "default: '#F4F8F4'");
  cms = cms.replace(/default:\s*'#D4BEDF'/g, "default: '#A2D5A4'");
  cms = cms.replace(/default:\s*'#A69AAC'/g, "default: '#7EA681'");

  fs.writeFileSync(cmsPath, cms, 'utf8');
  console.log('CMSWebsiteStudio.tsx updated');
}

// 6. Update MongoDB & local db.json
async function updateDb() {
  const uri = 'mongodb+srv://admin:meK7Jy2qVXOuDZj1@cluster0.4muxwsa.mongodb.net/rendezvous_2026?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('rendezvous_2026');

  const greenPalette = {
    primaryAccent: '#18BA46',
    bodyBg: '#012002',
    cardBg: '#07380B',
    cardElevatedBg: '#0B4A12',
    borderSubtle: '#176523',
    textPrimary: '#F4F8F4',
    textSecondary: '#A2D5A4',
    textMuted: '#7EA681',
    goldAccent: '#FFA28A',
    successAccent: '#10B981'
  };

  await db.collection('settings').updateOne(
    { _id: 'eventSettings' },
    { $set: { primaryColor: '#18BA46', accentColor: '#18BA46' } }
  );

  await db.collection('settings').updateOne(
    { _id: 'cmsSettings' },
    { $set: { colorTheme: greenPalette } }
  );

  console.log('MongoDB settings updated with green palette');

  const files = ['data/db.json', 'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/data/db.json'];
  for (const f of files) {
    if (fs.existsSync(f)) {
      try {
        const d = JSON.parse(fs.readFileSync(f, 'utf8'));
        if (d.eventSettings) {
          d.eventSettings.primaryColor = '#18BA46';
          d.eventSettings.accentColor = '#18BA46';
        }
        if (d.cmsSettings) {
          d.cmsSettings.colorTheme = greenPalette;
        }
        fs.writeFileSync(f, JSON.stringify(d, null, 2), 'utf8');
        console.log('Updated ' + f);
      } catch (e) {
        console.error(e);
      }
    }
  }

  await client.close();
}

updateDb().catch(console.error);
