const { MongoClient } = require('mongodb');
require('dotenv').config();

const URI = process.env.MONGODB_URI;

async function updateCorrections() {
  const client = new MongoClient(URI);
  await client.connect();
  const db = client.db('rendezvous_2026');

  // 1. Units
  const unitsCol = db.collection('units');
  await unitsCol.deleteMany({});
  const units = [
    { _id: 'unit_undulus', id: 'unit_undulus', name: 'Undulus', code: 'UND', active: true },
    { _id: 'unit_qudhs', id: 'unit_qudhs', name: 'Qudhs', code: 'QUD', active: true }
  ];
  await unitsCol.insertMany(units);
  console.log('✅ Updated units: Undulus (UND), Qudhs (QUD)');

  // 2. Categories: Junior, Senior, General
  const catCol = db.collection('categories');
  await catCol.deleteMany({});
  const categories = [
    { _id: 'cat_junior', id: 'cat_junior', name: 'Junior', code: 'JNR', startingChestNumber: 101, active: true },
    { _id: 'cat_senior', id: 'cat_senior', name: 'Senior', code: 'SNR', startingChestNumber: 201, active: true },
    { _id: 'cat_general', id: 'cat_general', name: 'General', code: 'GEN', startingChestNumber: 501, active: true }
  ];
  await catCol.insertMany(categories);
  console.log('✅ Updated categories: Junior (101), Senior (201), General (501)');

  // 3. Counters
  const counterCol = db.collection('counters');
  await counterCol.deleteMany({});
  const counters = [
    { _id: 'counter_junior', id: 'counter_junior', categoryId: 'cat_junior', currentValue: 100 },
    { _id: 'counter_senior', id: 'counter_senior', categoryId: 'cat_senior', currentValue: 200 },
    { _id: 'counter_general', id: 'counter_general', categoryId: 'cat_general', currentValue: 500 }
  ];
  await counterCol.insertMany(counters);
  console.log('✅ Updated counters for Junior, Senior, and General');

  // 4. Settings
  const settingsCol = db.collection('settings');
  const eventSettings = await settingsCol.findOne({ _id: 'eventSettings' }) || {};
  const updatedEventSettings = {
    ...eventSettings,
    _id: 'eventSettings',
    id: 'eventSettings',
    festivalName: 'FANOUS 2K26',
    eventTitle: 'Meelad Fest',
    campusName: 'Swalahul Huda Academy',
    sectorName: 'Swalahul Huda Academy',
    venue: 'Rifayiya Juma Masjid Muchila',
    location: 'Rifayiya Juma Masjid Muchila',
    eventDate: '2026-10-09',
    eventYear: '2026',
    participantLoginCriteria: 'dob'
  };
  await settingsCol.replaceOne({ _id: 'eventSettings' }, updatedEventSettings, { upsert: true });

  const cmsSettings = await settingsCol.findOne({ _id: 'cmsSettings' }) || {};
  const updatedCmsSettings = {
    ...cmsSettings,
    _id: 'cmsSettings',
    id: 'cmsSettings',
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
    aboutTitle: 'Swalahul Huda Academy',
    aboutDescription: 'Official Festival Portal for Fanous 2K26 Meelad Fest'
  };
  await settingsCol.replaceOne({ _id: 'cmsSettings' }, updatedCmsSettings, { upsert: true });

  await settingsCol.updateOne(
    { _id: 'state_version' },
    { $set: { version: Date.now(), updatedAt: new Date().toISOString() } },
    { upsert: true }
  );

  console.log('✅ Updated MongoDB settings with FANOUS 2K26 and Rifayiya Juma Masjid Muchila');
  await client.close();
}

updateCorrections().catch(err => {
  console.error(err);
  process.exit(1);
});
