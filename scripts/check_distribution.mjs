import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://mfun938_db_user:dsNyPQNUELJgNVLo@cluster0.wmttalg.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('sahityotsav');
    const compCol = db.collection('competitions');
    const partCol = db.collection('participants');
    const regCol = db.collection('registrations');

    const comps = await compCol.find().toArray();
    const parts = await partCol.find().toArray();
    const regs = await regCol.find().toArray();

    const counts = {};
    comps.forEach(c => {
      counts[c.id] = { code: c.code, name: c.name, category: c.categoryId, type: c.participationType, count: 0 };
    });

    parts.forEach(p => {
      (p.registeredEvents || []).forEach(cId => {
        if (counts[cId]) counts[cId].count++;
      });
    });

    regs.forEach(r => {
      (r.groupTeams || []).forEach(t => {
        if (counts[t.competitionId]) counts[t.competitionId].count++;
      });
      (r.selectedGroupCompetitionIds || []).forEach(cId => {
        if (counts[cId]) {
          // If group team not already counted
          if (!r.groupTeams || !r.groupTeams.some(t => t.competitionId === cId)) {
            counts[cId].count++;
          }
        }
      });
    });

    const sorted = Object.values(counts).sort((a, b) => a.count - b.count);
    console.log("Lowest registered competitions:");
    sorted.slice(0, 10).forEach(c => console.log(`  ${c.code} - ${c.name} (${c.category}, ${c.type}): ${c.count} registrations`));

    console.log("\nHighest registered competitions:");
    sorted.slice(-5).forEach(c => console.log(`  ${c.code} - ${c.name} (${c.category}, ${c.type}): ${c.count} registrations`));
  } finally {
    await client.close();
  }
}

run();
