const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('rendezvous_2026');
  
  // 1. Update settings collection
  const res1 = await db.collection('settings').updateOne(
    { _id: 'eventSettings' },
    { $set: { participantLoginCriteria: 'class', availableClasses: ['+1', '+2'] } },
    { upsert: true }
  );
  console.log('Updated settings.eventSettings:', res1.modifiedCount || res1.upsertedCount);

  // 2. Check all collections
  const cols = await db.listCollections().toArray();
  for (const c of cols) {
    const found = await db.collection(c.name).find({
      $or: [
        { _id: 'eventSettings' },
        { 'eventSettings.participantLoginCriteria': { $exists: true } },
        { participantLoginCriteria: { $exists: true } }
      ]
    }).toArray();
    if (found.length > 0) {
      console.log('Collection', c.name, 'matched docs:', found.length);
      await db.collection(c.name).updateMany(
        { 'eventSettings.participantLoginCriteria': { $exists: true } },
        { $set: { 'eventSettings.participantLoginCriteria': 'class', 'eventSettings.availableClasses': ['+1', '+2'] } }
      );
      await db.collection(c.name).updateMany(
        { participantLoginCriteria: { $exists: true } },
        { $set: { participantLoginCriteria: 'class', availableClasses: ['+1', '+2'] } }
      );
    }
  }

  const check = await db.collection('settings').findOne({ _id: 'eventSettings' });
  console.log('Current settings.eventSettings in Mongo:', check?.participantLoginCriteria);

  await client.close();
}

run().catch(console.error);
