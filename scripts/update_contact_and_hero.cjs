const { MongoClient } = require('mongodb');
require('dotenv').config();

const URI = process.env.MONGODB_URI;

async function updateContactAndHero() {
  const client = new MongoClient(URI);
  await client.connect();
  const db = client.db('rendezvous_2026');
  const settingsCol = db.collection('settings');

  // 1. Update eventSettings
  const eventSettings = await settingsCol.findOne({ _id: 'eventSettings' }) || {};
  await settingsCol.updateOne(
    { _id: 'eventSettings' },
    {
      $set: {
        contactInfo: 'zenith.theorganizer@gmail.com',
        contactEmail: 'zenith.theorganizer@gmail.com',
        contactPhone: '+91 7483138340',
        phone: '+91 7483138340'
      }
    },
    { upsert: true }
  );
  console.log('✅ Updated eventSettings contact info in MongoDB');

  // 2. Update cmsSettings
  const cmsSettings = await settingsCol.findOne({ _id: 'cmsSettings' }) || {};
  await settingsCol.updateOne(
    { _id: 'cmsSettings' },
    {
      $set: {
        contactEmail: 'zenith.theorganizer@gmail.com',
        contactPhone: '+91 7483138340',
        heroDesktopImages: ['/fanous_hero_desktop.jpg'],
        heroMobileImages: ['/fanous_hero_mobile.jpg'],
        footerEmail: 'zenith.theorganizer@gmail.com',
        footerPhone: '+91 7483138340'
      }
    },
    { upsert: true }
  );
  console.log('✅ Updated cmsSettings contact info and hero images in MongoDB');

  // 3. State version
  await settingsCol.updateOne(
    { _id: 'state_version' },
    { $set: { version: Date.now(), updatedAt: new Date().toISOString() } },
    { upsert: true }
  );

  await client.close();
  console.log('✅ All MongoDB settings updated successfully!');
}

updateContactAndHero().catch(err => {
  console.error(err);
  process.exit(1);
});
