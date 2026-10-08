const { MongoClient } = require('mongodb');
const fs = require('fs');

async function run() {
  const uri = 'mongodb+srv://admin:meK7Jy2qVXOuDZj1@cluster0.4muxwsa.mongodb.net/rendezvous_2026?retryWrites=true&w=majority&appName=Cluster0';
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('rendezvous_2026');

  await db.collection('settings').updateOne(
    { _id: 'eventSettings' },
    {
      $set: {
        gradeSystemEnabled: false,
        globalPointsRank1: 20,
        globalPointsRank2: 14,
        globalPointsRank3: 7,
        globalPointsRank4: 0,
        globalPointsRank5: 0
      }
    }
  );

  console.log('MongoDB eventSettings set to gradeSystemEnabled: false');

  const files = ['data/db.json', 'ssf-ninthikal-sector-sahityotsav-management-system (2) - Copy/data/db.json'];
  for (const f of files) {
    if (fs.existsSync(f)) {
      try {
        const data = JSON.parse(fs.readFileSync(f, 'utf8'));
        if (data.eventSettings) {
          data.eventSettings.gradeSystemEnabled = false;
          data.eventSettings.globalPointsRank1 = 20;
          data.eventSettings.globalPointsRank2 = 14;
          data.eventSettings.globalPointsRank3 = 7;
          data.eventSettings.globalPointsRank4 = 0;
          data.eventSettings.globalPointsRank5 = 0;
          fs.writeFileSync(f, JSON.stringify(data, null, 2), 'utf8');
          console.log('Updated ' + f);
        }
      } catch (err) {
        console.error(err);
      }
    }
  }

  await client.close();
}

run().catch(console.error);
