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
    const teamsCol = db.collection('teams'); // check if exists

    console.log("Collections in db:");
    const cols = await db.listCollections().toArray();
    cols.forEach(c => console.log(" -", c.name));

    // Find Botanical Canvas and Digital News Paper competitions
    const botCanvas = await compCol.findOne({ name: { $regex: /botanical\s*canvas/i } });
    const digNews = await compCol.findOne({ name: { $regex: /digital\s*news\s*paper/i } });
    console.log("\nBotanical Canvas:", botCanvas);
    console.log("\nDigital News Paper:", digNews);

    // Look at registrations documents
    const regs = await regCol.find().toArray();
    console.log(`\nFound ${regs.length} registration documents.`);

    for (const r of regs) {
      if (r.groupTeams && r.groupTeams.length > 0) {
        console.log(`\nUnit registration with groupTeams: ${r.unitId || r.id}, groupTeams count: ${r.groupTeams.length}`);
        const bcTeams = r.groupTeams.filter(t => t.competitionId === botCanvas?.id);
        const dnTeams = r.groupTeams.filter(t => t.competitionId === digNews?.id);
        if (bcTeams.length) console.log("BC teams in reg:", JSON.stringify(bcTeams, null, 2));
        if (dnTeams.length) console.log("DN teams in reg:", JSON.stringify(dnTeams, null, 2));
      }
    }

    // Check participants from Zanzibari Souqs
    const zanzibariParts = await partCol.find({ unitId: 'unit_zanzibari_souqs' }).toArray();
    console.log(`\nZanzibari Souqs participants (${zanzibariParts.length}):`);
    zanzibariParts.forEach(p => {
      const hasBC = p.registeredEvents?.includes(botCanvas?.id);
      const hasDN = p.registeredEvents?.includes(digNews?.id);
      console.log(` ${p.chestNumber} - ${p.fullName} (${p.selectedCategoryId}) | BC: ${hasBC}, DN: ${hasDN}`);
    });

    // Check participants from Tabrizi Taraz
    const tabriziParts = await partCol.find({ unitId: 'unit_tabrizi_taraz' }).toArray();
    console.log(`\nTabrizi Taraz participants (${tabriziParts.length}):`);
    tabriziParts.forEach(p => {
      const hasBC = p.registeredEvents?.includes(botCanvas?.id);
      const hasDN = p.registeredEvents?.includes(digNews?.id);
      if (hasBC || hasDN) {
        console.log(` ${p.chestNumber} - ${p.fullName} (${p.selectedCategoryId}) | BC: ${hasBC}, DN: ${hasDN}`);
      }
    });

    // Check participants from Sirafi Seafarers
    const sirafiParts = await partCol.find({ unitId: 'unit_sirafi_seafarers' }).toArray();
    console.log(`\nSirafi Seafarers participants (${sirafiParts.length}):`);
    sirafiParts.forEach(p => {
      const hasBC = p.registeredEvents?.includes(botCanvas?.id);
      const hasDN = p.registeredEvents?.includes(digNews?.id);
      if (hasBC || hasDN) {
        console.log(` ${p.chestNumber} - ${p.fullName} (${p.selectedCategoryId}) | BC: ${hasBC}, DN: ${hasDN}`);
      }
    });

  } finally {
    await client.close();
  }
}

run();
