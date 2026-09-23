import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://mfun938_db_user:dsNyPQNUELJgNVLo@cluster0.wmttalg.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('sahityotsav');
    const teamsCol = db.collection('teams');
    const partCol = db.collection('participants');
    const regCol = db.collection('registrations');
    const compCol = db.collection('competitions');
    const setCol = db.collection('settings');

    // 1. Fix Tabrizi Taraz SJ19 team: Add Shafee Muhammed Jubair (part_1789026544129_sc0br) to team.memberIds
    const sj19Comp = await compCol.findOne({ code: 'SJ19' });
    const pShafee = await partCol.findOne({ chestNumber: '2025JM006' });
    
    if (sj19Comp && pShafee) {
      const tabriziSJ19Team = await teamsCol.findOne({ competitionId: sj19Comp.id, unitId: 'unit_tabrizi_taraz' });
      if (tabriziSJ19Team) {
        console.log("Current Tabrizi SJ19 team memberIds:", tabriziSJ19Team.memberIds);
        await teamsCol.updateOne(
          { _id: tabriziSJ19Team._id },
          { $addToSet: { memberIds: pShafee.id } }
        );
        console.log("✓ Added Shafee Muhammed Jubair (2025JM006) to Tabrizi Taraz SJ19 team!");
      }
    }

    // 2. Fix JR22 (Thadrees) participants registeredEvents sync
    const jr22Comp = await compCol.findOne({ code: 'JR22' });
    if (jr22Comp) {
      const pSaeed = await partCol.findOne({ chestNumber: '2024JMO018' });
      const pRashid = await partCol.findOne({ chestNumber: '2023JMF087' });
      if (pSaeed) {
        await partCol.updateOne({ _id: pSaeed._id }, { $addToSet: { registeredEvents: jr22Comp.id } });
        await regCol.updateMany({ participantId: pSaeed.id }, { $addToSet: { selectedGroupCompetitionIds: jr22Comp.id } });
        console.log("✓ Added JR22 to 2024JMO018 (Saeed Ibn Hameed) registeredEvents!");
      }
      if (pRashid) {
        await partCol.updateOne({ _id: pRashid._id }, { $addToSet: { registeredEvents: jr22Comp.id } });
        await regCol.updateMany({ participantId: pRashid.id }, { $addToSet: { selectedGroupCompetitionIds: jr22Comp.id } });
        console.log("✓ Added JR22 to 2023JMF087 (Rashid Gafoor) registeredEvents!");
      }
    }

    // Bump settings state_version
    await setCol.updateOne(
      { key: "state_version" },
      { $inc: { version: 1 }, $set: { updatedAt: new Date().toISOString() } },
      { upsert: true }
    );
    console.log("Settings state_version bumped!");

  } finally {
    await client.close();
  }
}

run();
