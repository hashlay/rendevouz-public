import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://mfun938_db_user:dsNyPQNUELJgNVLo@cluster0.wmttalg.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function inspectSJ() {
  try {
    await client.connect();
    const db = client.db('sahityotsav');
    const teamsCol = db.collection('teams');
    const compCol = db.collection('competitions');
    const partCol = db.collection('participants');
    const regCol = db.collection('registrations');

    const sjComps = await compCol.find({ code: { $in: ['SJ18', 'SJ19'] } }).toArray();
    console.log("Competitions:");
    sjComps.forEach(c => console.log(c.code, c.name, c.id));

    for (const c of sjComps) {
      console.log(`\n================== ${c.code} - ${c.name} ==================`);
      const teams = await teamsCol.find({ competitionId: c.id }).toArray();
      console.log(`Teams found in 'teams' collection (${teams.length}):`);
      for (const t of teams) {
        console.log(`\n Team ID: ${t.id}, Unit: ${t.unitId}, Name: ${t.name || t.teamName}`);
        console.log(` Member IDs:`, t.members || t.memberIds || t.participantIds);
        // resolve members
        const memIds = t.members || t.memberIds || t.participantIds || [];
        const mems = await partCol.find({ id: { $in: memIds } }).toArray();
        mems.forEach(m => console.log(`   - ${m.chestNumber}: ${m.fullName}`));
      }

      console.log(`\n Participants with ${c.id} in registeredEvents:`);
      const parts = await partCol.find({ registeredEvents: c.id }).toArray();
      parts.forEach(p => console.log(`   [${p.unitId}] ${p.chestNumber}: ${p.fullName}`));

      console.log(`\n Registrations with ${c.id} in groupTeams or selectedGroupCompetitionIds:`);
      const regs = await regCol.find({
        $or: [
          { "groupTeams.competitionId": c.id },
          { selectedGroupCompetitionIds: c.id },
          { "participants.groupCompetitions": c.id }
        ]
      }).toArray();
      console.log(` Regs found: ${regs.length}`);
      regs.forEach(r => {
        console.log(`   Unit: ${r.unitId}, ID: ${r.id}`);
        if (r.groupTeams) {
          const gt = r.groupTeams.filter(g => g.competitionId === c.id);
          console.log(`   gt:`, JSON.stringify(gt));
        }
      });
    }

  } finally {
    await client.close();
  }
}

inspectSJ();
