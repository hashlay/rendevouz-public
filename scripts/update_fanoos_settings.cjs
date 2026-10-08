const { MongoClient } = require('mongodb');
require('dotenv').config();

const URI = process.env.MONGODB_URI;

async function updateFestivalSettings() {
  const client = new MongoClient(URI);
  await client.connect();
  const db = client.db('rendezvous_2026');
  const settingsCol = db.collection('settings');

  const eventSettings = {
    _id: 'eventSettings',
    id: 'eventSettings',
    festivalName: 'FANOOS 2K26',
    eventTitle: 'Meelad Fest',
    campusName: 'Swalahul Huda Academy',
    sectorName: 'Swalahul Huda Academy',
    venue: 'Rifaiyya Juma Masjid Mucchila',
    location: 'Rifaiyya Juma Masjid Mucchila',
    eventDate: '2026-10-09',
    eventYear: '2026',
    registrationOpen: true,
    participantLoginCriteria: 'dob',
    primaryColor: '#48205D',
    accentColor: '#48205D',
    ssfLogoUrl: '/fanoos_logo.jpg',
    sahityotsavLogoUrl: '/fanoos_logo.jpg',
    enableCertificates: false,
    certificateGenerationEnabled: false,
    numJudges: 2,
    markDecimalPrecision: 2,
    autoRankingEnabled: true,
    entityMode: 'team',
    gradeSystemEnabled: true,
    globalPointsRank1: 20,
    globalPointsRank2: 14,
    globalPointsRank3: 7,
    globalPointsRank4: 0,
    globalPointsRank5: 0
  };

  await settingsCol.replaceOne({ _id: 'eventSettings' }, eventSettings, { upsert: true });

  const cmsSettings = {
    _id: 'cmsSettings',
    id: 'cmsSettings',
    headerLogoTitle: 'FANOOS',
    headerLogoSubtitle: '2K26',
    heroLogoTitle: 'FANOOS 2K26',
    heroLogoSubtitle: 'Meelad Fest',
    heroLogoBadge: 'SWALAHUL HUDA ACADEMY',
    heroTitle: 'FANOOS 2K26',
    heroSubtitle: 'Meelad Fest',
    heroDate: 'October 9, 2026',
    heroLocation: 'Rifaiyya Juma Masjid Mucchila',
    themeTitle: 'Meelad Fest',
    themeDescription: 'Annual Arts & Cultural Festival',
    aboutTitle: 'Swalahul Huda Academy',
    aboutDescription: 'Official Festival Portal for Fanoos 2K26 Meelad Fest',
    publishedTeamStandings: null,
    enableCertificates: false
  };

  await settingsCol.replaceOne({ _id: 'cmsSettings' }, cmsSettings, { upsert: true });

  await settingsCol.updateOne(
    { _id: 'state_version' },
    { $set: { version: Date.now(), updatedAt: new Date().toISOString() } },
    { upsert: true }
  );

  console.log('✅ Updated MongoDB eventSettings & cmsSettings for Fanoos 2K26!');
  await client.close();
}

updateFestivalSettings().catch(err => {
  console.error(err);
  process.exit(1);
});
