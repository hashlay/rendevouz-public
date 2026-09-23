import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://mfun938_db_user:dsNyPQNUELJgNVLo@cluster0.wmttalg.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function inspectRegs() {
  try {
    await client.connect();
    const db = client.db('sahityotsav');
    const compCol = db.collection('competitions');
    const partCol = db.collection('participants');
    const regCol = db.collection('registrations');

    const sj18Id = 'comp_1789105589231_e29bk';
    const sj19Id = 'comp_1789105589231_lm8qa';

    console.log("=== REGISTRATIONS FOR SJ18 (Botanical Canvas) ===");
    const regs18 = await regCol.find({
      $or: [
        { "groupTeams.competitionId": sj18Id },
        { selectedGroupCompetitionIds: sj18Id },
        { "participants.groupCompetitions": sj18Id }
      ]
    }).toArray();

    for (const r of regs18) {
      const p = await partCol.findOne({ id: r.participantId });
      console.log(`Reg ${r.id}: partId=${r.participantId}, chest=${p?.chestNumber}, name=${p?.fullName}, unit=${p?.unitId}`);
    }

    console.log("\n=== REGISTRATIONS FOR SJ19 (Digital News Paper) ===");
    const regs19 = await regCol.find({
      $or: [
        { "groupTeams.competitionId": sj19Id },
        { selectedGroupCompetitionIds: sj19Id },
        { "participants.groupCompetitions": sj19Id }
      ]
    }).toArray();

    for (const r of regs19) {
      const p = await partCol.findOne({ id: r.participantId });
      console.log(`Reg ${r.id}: partId=${r.participantId}, chest=${p?.chestNumber}, name=${p?.fullName}, unit=${p?.unitId}`);
    }

    // Now let's check ALL group competitions to see if any team has fewer members in `teams` than in participant registrations
    console.log("\n=== CHECKING ALL GROUP COMPETITIONS ACROSS ALL TEAMS ===");
    const teamsCol = db.collection('teams');
    const groupComps = await compCol.find({ participationType: 'group' }).toArray();
    for (const gc of groupComps) {
      const teams = await teamsCol.find({ competitionId: gc.id }).toArray();
      for (const t of teams) {
        const teamMemberIds = new Set(t.members || t.participantIds || []);
        // Find participants from this unit with this competition in registeredEvents
        const registeredParts = await partCol.find({ unitId: t.unitId, registeredEvents: gc.id }).toArray();
        const missingInTeam = registeredParts.filter(p => !teamMemberIds.has(p.id));
        const extraInTeam = [...teamMemberIds].filter(id => !registeredParts.some(p => p.id === id));
        if (missingInTeam.length > 0 || extraInTeam.length > 0 || teamMemberIds.size < 3) {
          console.log(`\n[${gc.code}] ${gc.name} | Unit: ${t.unitId} (teamSize: ${gc.teamSize})`);
          console.log(`   Team members in 'teams' (${teamMemberIds.size}):`, [...teamMemberIds]);
          console.log(`   Participants registered for event (${registeredParts.length}):`, registeredParts.map(p => `${p.chestNumber} (${p.fullName})`));
          if (missingInTeam.length > 0) {
            console.log(`   ⚠️ MISSING from team.members:`, missingInTeam.map(p => `${p.chestNumber} (${p.fullName})`));
          }
          if (extraInTeam.length > 0) {
            console.log(`   ⚠️ Extra in team.members:`, extraInTeam);
          }
        }
      }
    }

  } finally {
    await client.close();
  }
}

inspectRegs();
