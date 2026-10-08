const fs = require('fs');
const { MongoClient } = require('mongodb');

async function run() {
  const dbPath = 'data/db.json';
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // 1. Update eventSettings
  if (data.eventSettings) {
    data.eventSettings.ssfLogoUrl = '/fanous_logo.png';
    data.eventSettings.sahityotsavLogoUrl = '/fanous_logo.png';
  }

  // 2. Update cmsSettings
  if (data.cmsSettings) {
    data.cmsSettings.headerLogo = '/fanous_logo.png';
    data.cmsSettings.footerLogo = '/fanous_logo.png';
    data.cmsSettings.heroLogo = '/fanous_logo.png';
    data.cmsSettings.aboutTitle = 'Swalahul Huda Academy';
    data.cmsSettings.aboutSubtitle = 'Meelad Fest 2K26';
    data.cmsSettings.aboutDescription = 'Swalahul Huda Academy, functioning under the guidance and management of Rifayiya Juma Masjid Muchila, proudly presents FANOUS 2K26 in grand celebration of Meelad Fest. This annual arts and cultural festival provides an inspiring platform dedicated to nurturing intellectual, literary, and moral excellence among students.';
    data.cmsSettings.themeTitle = 'Meelad Fest';
    data.cmsSettings.themeDescription = 'An inspiring confluence of artistic devotion, ethical scholarship, and youth talent commemorating Meelad Fest at Rifayiya Juma Masjid Muchila.';
    data.cmsSettings.conceptModalTitle = 'FANOUS 2K26 — MEELAD FEST';
    data.cmsSettings.conceptModalSubtitle = 'Swalahul Huda Academy • Under Rifayiya Juma Masjid Muchila';
    data.cmsSettings.conceptModalBadge = 'Festival Concept & Vision';
    data.cmsSettings.conceptModalDescription = [
      'FANOUS 2K26 is the premier annual arts, literary, and cultural festival presented by Swalahul Huda Academy, functioning under the guidance and management of Rifayiya Juma Masjid Muchila. Commemorating the auspicious occasion of Meelad Fest, FANOUS stands as a radiant beacon of intellectual illumination, spiritual devotion, and artistic excellence.',
      'The festival is designed to nurture and showcase the multidimensional talents of students across diverse artistic, literary, and oratory disciplines. Through rigorous academic competitions, creative writing, elocution, calligraphy, and cultural renditions, participants are inspired to achieve the highest benchmarks of performance and moral integrity.',
      'FANOUS—meaning "The Lantern of Guidance"—symbolizes the radiant light of knowledge that dispels ignorance. Rooted in traditional Islamic ethics and progressive scholastic aspirations, this grand platform fosters brotherhood, healthy competitive spirit, and collaborative leadership among students.',
      'With comprehensive judging standards, dynamic digital tabulation, and an inspiring celebration of youth potential, FANOUS 2K26 unites students, teachers, and the broader community in a joyous commemoration of love, wisdom, and creative devotion for Meelad Fest.'
    ].join('\n\n');
  }

  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  console.log('✅ data/db.json updated successfully');

  // Also sync to MongoDB
  const uri = 'mongodb+srv://admin:meK7Jy2qVXOuDZj1@cluster0.4muxwsa.mongodb.net/?appName=Cluster0';
  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    const db = client.db('festival_database');

    await db.collection('eventSettings').updateOne(
      { $or: [{ id: 'eventSettings' }, { _id: 'eventSettings' }] },
      { $set: { ssfLogoUrl: '/fanous_logo.png', sahityotsavLogoUrl: '/fanous_logo.png' } },
      { upsert: true }
    );
    console.log('✅ MongoDB eventSettings updated');

    await db.collection('cmsSettings').updateOne(
      { $or: [{ id: 'cmsSettings' }, { _id: 'cmsSettings' }] },
      { $set: data.cmsSettings },
      { upsert: true }
    );
    console.log('✅ MongoDB cmsSettings updated');

    await client.close();
  } catch (err) {
    console.log('MongoDB update note:', err.message);
  }
}

run();
