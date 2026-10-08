const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

async function syncAll() {
  const uri = 'mongodb+srv://admin:meK7Jy2qVXOuDZj1@cluster0.4muxwsa.mongodb.net/rendezvous_2026?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('rendezvous_2026');

  const cmsUpdate = {
    headerLogoTitle: 'FANOUS',
    headerLogoSubtitle: '2K26',
    heroLogoTitle: 'FANOUS 2K26',
    heroLogoSubtitle: 'Meelad Fest',
    heroLogoBadge: 'SWALAHUL HUDA ACADEMY',
    heroTitle: 'FANOUS 2K26',
    heroSubtitle: 'Meelad Fest',
    heroDate: 'October 9, 2026',
    heroLocation: 'Rifayiya Juma Masjid Muchila',
    themeTitle: 'Meelad Fest',
    themeDescription: 'Annual Arts & Cultural Festival',
    aboutTitle: 'Swalahul Huda Academy',
    aboutDescription: 'Official Festival Portal for Fanous 2K26 Meelad Fest',
    publishedTeamStandings: null,
    enableCertificates: false,
    contactEmail: 'zenith.theorganizer@gmail.com',
    contactPhone: '+91 7483138340',
    footerEmail: 'zenith.theorganizer@gmail.com',
    footerPhone: '+91 7483138340',
    footerLocation: 'Rifayiya Juma Masjid Muchila',
    heroDesktopImages: ['/fanous_hero_desktop.jpg'],
    heroMobileImages: ['/fanous_hero_mobile.jpg'],
    heroDesktopLoopEnabled: true,
    heroDesktopLoopInterval: 5,
    heroMobileLoopEnabled: true,
    heroMobileLoopInterval: 5
  };

  const eventUpdate = {
    festivalName: 'FANOUS 2K26',
    eventTitle: 'Meelad Fest',
    campusName: 'Swalahul Huda Academy',
    sectorName: 'Swalahul Huda Academy',
    venue: 'Rifayiya Juma Masjid Muchila',
    location: 'Rifayiya Juma Masjid Muchila',
    eventDate: '2026-10-09',
    eventYear: '2026',
    contactEmail: 'zenith.theorganizer@gmail.com',
    contactInfo: 'zenith.theorganizer@gmail.com',
    contactPhone: '+91 7483138340',
    phone: '+91 7483138340'
  };

  await db.collection('settings').updateOne({ _id: 'cmsSettings' }, { $set: cmsUpdate }, { upsert: true });
  await db.collection('settings').updateOne({ _id: 'eventSettings' }, { $set: eventUpdate }, { upsert: true });

  await db.collection('hero_media').deleteMany({});

  console.log('MongoDB settings successfully updated!');

  const files = ['data/db.json', 'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/data/db.json'];
  for (const f of files) {
    if (fs.existsSync(f)) {
      try {
        const content = JSON.parse(fs.readFileSync(f, 'utf8'));
        if (content.eventSettings) Object.assign(content.eventSettings, eventUpdate);
        if (content.cmsSettings) Object.assign(content.cmsSettings, cmsUpdate);
        if (content.heroMedia) content.heroMedia = [];
        fs.writeFileSync(f, JSON.stringify(content, null, 2), 'utf8');
        console.log('Updated ' + f);
      } catch (e) {
        console.log('Skipping ' + f + ': ' + e.message);
      }
    }
  }

  await client.close();
}

syncAll().catch(console.error);
