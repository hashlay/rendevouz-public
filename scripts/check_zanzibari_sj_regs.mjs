import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://mfun938_db_user:dsNyPQNUELJgNVLo@cluster0.wmttalg.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function checkZanzibariSJRegs() {
  try {
    await client.connect();
    const db = client.db('sahityotsav');
    const partCol = db.collection('participants');
    const regCol = db.collection('registrations');

    const sj18Id = 'comp_1789105589231_e29bk';
    const sj19Id = 'comp_1789105589231_lm8qa';

    const zanzibariSJ = await partCol.find({ unitId: 'unit_zanzibari_souqs', selectedCategoryId: 'cat_sub_junior' }).toArray();
    console.log(`Found ${zanzibariSJ.length} Sub Junior participants in Zanzibari Souqs:`);

    for (const p of zanzibariSJ) {
      const reg = await regCol.findOne({ participantId: p.id });
      console.log(`\nChest: ${p.chestNumber}, Name: ${p.fullName}`);
      console.log(`  registeredEvents (${p.registeredEvents?.length}):`, p.registeredEvents);
      if (reg) {
        console.log(`  registration.selectedGroupCompetitionIds:`, reg.selectedGroupCompetitionIds);
        console.log(`  registration.selectedIndividualCompetitionIds (${reg.selectedIndividualCompetitionIds?.length})`);
      }
    }
  } finally {
    await client.close();
  }
}

checkZanzibariSJRegs();
