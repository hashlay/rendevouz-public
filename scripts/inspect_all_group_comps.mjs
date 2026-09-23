import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://mfun938_db_user:dsNyPQNUELJgNVLo@cluster0.wmttalg.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function inspectTeams() {
  try {
    await client.connect();
    const db = client.db('sahityotsav');
    const teamsCol = db.collection('teams');
    const compCol = db.collection('competitions');
    const partCol = db.collection('participants');
    const regCol = db.collection('registrations');

    const allTeams = await teamsCol.find().toArray();
    console.log(`Total teams in 'teams' collection: ${allTeams.length}`);

    // Print all teams
    for (const t of allTeams) {
      const comp = await compCol.findOne({ id: t.competitionId });
      console.log(`\nTeam: ${t.name || t.teamName || 'Unnamed'} | Unit: ${t.unitId} | Comp: ${comp?.code} - ${comp?.name} (${t.competitionId})`);
      console.log(`  Members (${t.members?.length || 0}):`, JSON.stringify(t.members));
      console.log(`  Participants (${t.participantIds?.length || 0}):`, JSON.stringify(t.participantIds));
      console.log(`  Raw team object keys:`, Object.keys(t));
      if (t.studentIds) console.log(`  studentIds:`, t.studentIds);
    }

    // Also check group competitions:
    const groupComps = await compCol.find({ participationType: 'group' }).toArray();
    console.log(`\nTotal Group Competitions: ${groupComps.length}`);
    for (const gc of groupComps) {
      console.log(`\n=== Group Comp: [${gc.code}] ${gc.name} (${gc.categoryId}) teamSize: ${gc.teamSize} ===`);
      // Find teams in teamsCol
      const gcTeams = allTeams.filter(t => t.competitionId === gc.id);
      console.log(`  Teams in 'teams' collection: ${gcTeams.length}`);
      gcTeams.forEach(t => {
        console.log(`    - Unit: ${t.unitId}, Members: ${JSON.stringify(t.members || t.participantIds || t.memberIds)}`);
      });

      // Find participants who have gc.id in registeredEvents
      const parts = await partCol.find({ registeredEvents: gc.id }).toArray();
      console.log(`  Participants with registeredEvents containing ${gc.code}: ${parts.length}`);
      const byUnit = {};
      parts.forEach(p => {
        if (!byUnit[p.unitId]) byUnit[p.unitId] = [];
        byUnit[p.unitId].push(`${p.chestNumber} - ${p.fullName}`);
      });
      for (const [u, plist] of Object.entries(byUnit)) {
        console.log(`    Unit ${u} (${plist.length}): ${plist.join(', ')}`);
      }
    }

  } finally {
    await client.close();
  }
}

inspectTeams();
