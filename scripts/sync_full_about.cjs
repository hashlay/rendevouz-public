const fs = require('fs');
const { MongoClient } = require('mongodb');

async function syncAll() {
  const fullAboutDesc = 'Swalahul Huda Academy, functioning under the guidance and management of Rifayiya Juma Masjid Muchila, proudly presents FANOUS 2K26 in grand commemoration of Meelad Fest. This annual arts and cultural festival provides an inspiring platform dedicated to nurturing intellectual, literary, and moral excellence among students.';
  
  const fullConceptDesc = [
    'FANOUS 2K26 is the premier annual arts, literary, and cultural festival presented by Swalahul Huda Academy, functioning under the guidance and management of Rifayiya Juma Masjid Muchila. Commemorating the auspicious occasion of Meelad Fest, FANOUS stands as a radiant beacon of intellectual illumination, spiritual devotion, and artistic excellence.',
    'The festival is designed to nurture and showcase the multidimensional talents of students across diverse artistic, literary, and oratory disciplines. Through rigorous academic competitions, creative writing, elocution, calligraphy, and cultural renditions, participants are inspired to achieve the highest benchmarks of performance and moral integrity.',
    'FANOUS—meaning "The Lantern of Guidance"—symbolizes the radiant light of knowledge that dispels ignorance. Rooted in traditional Islamic ethics and progressive scholastic aspirations, this grand platform fosters brotherhood, healthy competitive spirit, and collaborative leadership among students.',
    'With comprehensive judging standards, dynamic digital tabulation, and an inspiring celebration of youth potential, FANOUS 2K26 unites students, teachers, and the broader community in a joyous commemoration of love, wisdom, and creative devotion for Meelad Fest.'
  ].join('\n\n');

  // 1. Update data/db.json
  const dbPath = 'data/db.json';
  if (fs.existsSync(dbPath)) {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    if (data.cmsSettings) {
      data.cmsSettings.aboutDescription = fullAboutDesc;
      data.cmsSettings.conceptModalDescription = fullConceptDesc;
      data.cmsSettings.headerLogo = '/fanous_logo.png';
      data.cmsSettings.footerLogo = '/fanous_logo.png';
      data.cmsSettings.heroLogo = '/fanous_logo.png';
    }
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('✅ data/db.json synced');
  }

  // 2. Update MongoDB in rendezvous_2026 and festival_database
  const uri = 'mongodb+srv://admin:meK7Jy2qVXOuDZj1@cluster0.4muxwsa.mongodb.net/?appName=Cluster0';
  const client = new MongoClient(uri);
  await client.connect();

  const dbs = ['rendezvous_2026', 'festival_database'];
  for (const dbName of dbs) {
    const db = client.db(dbName);

    // Update settings collection (_id: 'cmsSettings')
    await db.collection('settings').updateOne(
      { _id: 'cmsSettings' },
      {
        $set: {
          aboutDescription: fullAboutDesc,
          conceptModalDescription: fullConceptDesc,
          headerLogo: '/fanous_logo.png',
          footerLogo: '/fanous_logo.png',
          heroLogo: '/fanous_logo.png'
        }
      },
      { upsert: true }
    );

    // Also update cmsSettings collection if present
    await db.collection('cmsSettings').updateOne(
      { _id: 'cmsSettings' },
      {
        $set: {
          aboutDescription: fullAboutDesc,
          conceptModalDescription: fullConceptDesc,
          headerLogo: '/fanous_logo.png',
          footerLogo: '/fanous_logo.png',
          heroLogo: '/fanous_logo.png'
        }
      },
      { upsert: true }
    );
    console.log(`✅ Updated ${dbName}`);
  }

  await client.close();
  console.log('✅ All MongoDB collections synced with full paragraph');
}

syncAll().catch(console.error);
