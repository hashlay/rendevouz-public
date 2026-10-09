const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('rendezvous_2026');

  // 1. Update eventSettings
  const sRes = await db.collection('settings').updateOne(
    { _id: 'eventSettings' },
    { $set: { participantLoginCriteria: 'class', availableClasses: ['+1', '+2'] } },
    { upsert: true }
  );
  console.log('eventSettings updated:', sRes.modifiedCount || sRes.upsertedCount);

  // 2. Disable Photo Hub in dragBlocks collection
  const bRes = await db.collection('dragBlocks').updateMany(
    { $or: [{ id: '5' }, { type: 'smile' }, { title: /Photo Hub/i }] },
    { $set: { enabled: false } }
  );
  console.log('dragBlocks updated count:', bRes.modifiedCount);

  // 3. Disable Photo Hub in cmsSettings collection and settings collection
  await db.collection('cmsSettings').updateMany(
    {},
    { $set: { showPhotoHub: false, showSmile: false } }
  );
  await db.collection('settings').updateOne(
    { _id: 'cmsSettings' },
    { $set: { showPhotoHub: false, showSmile: false } }
  );

  // 4. Verify state
  const updatedSettings = await db.collection('settings').findOne({ _id: 'eventSettings' });
  console.log('Verified participantLoginCriteria:', updatedSettings?.participantLoginCriteria);
  console.log('Verified availableClasses:', updatedSettings?.availableClasses);
  const blocks = await db.collection('dragBlocks').find({}).toArray();
  console.log('Verified blocks:');
  blocks.forEach(b => console.log(`  - [${b.enabled ? 'ENABLED ' : 'DISABLED'}] ${b.title} (${b.type || b.id})`));

  await client.close();
  console.log('Done!');
}

run().catch(console.error);
