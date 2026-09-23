import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://mfun938_db_user:dsNyPQNUELJgNVLo@cluster0.wmttalg.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const db = client.db('sahityotsav');
    const regCol = db.collection('registrations');
    const partCol = db.collection('participants');
    const compCol = db.collection('competitions');

    const targetChestNos = ['2026JM213', '2026JM111', '2026JM106', '2026JM115', '2026JM088', '2026JM090', '2026JM101'];
    const premierComp = await compCol.findOne({ id: 'comp_1790102162011_premier_hifzul_muthoon' });
    console.log("Competition:", premierComp?.code, premierComp?.name, premierComp?.id);

    const parts = await partCol.find({ chestNumber: { $in: targetChestNos } }).toArray();
    for (const p of parts) {
      let reg = await regCol.findOne({ participantId: p.id });
      if (!reg) {
        reg = await regCol.findOne({ "participants.participantId": p.id });
      }
      console.log({
        chestNumber: p.chestNumber,
        fullName: p.fullName,
        category: p.selectedCategoryId,
        registeredEventsCount: p.registeredEvents?.length,
        hasInRegisteredEvents: p.registeredEvents?.includes(premierComp.id),
        hasInRegistrationDoc: reg?.selectedIndividualCompetitionIds?.includes(premierComp.id)
      });
    }
  } finally {
    await client.close();
  }
}

run();
