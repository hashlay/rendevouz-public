const { MongoClient } = require('mongodb');
require('dotenv').config();

async function run() {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  const db = client.db('rendezvous_2026');
  
  const result = await db.collection('settings').updateOne(
    { _id: 'eventSettings' },
    {
      $set: {
        participantLoginCriteria: 'class',
        availableClasses: ['+1', '+2']
      }
    },
    { upsert: true }
  );
  
  console.log('Update result:', result);
  const updated = await db.collection('settings').findOne({ _id: 'eventSettings' });
  console.log('Current participantLoginCriteria:', updated?.participantLoginCriteria);
  console.log('Current availableClasses:', updated?.availableClasses);
  await client.close();
}

run().catch(console.error);
