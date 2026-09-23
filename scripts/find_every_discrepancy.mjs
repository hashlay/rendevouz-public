import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://mfun938_db_user:dsNyPQNUELJgNVLo@cluster0.wmttalg.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function findEveryDiscrepancy() {
  try {
    await client.connect();
    const db = client.db('sahityotsav');
    const teamsCol = db.collection('teams');
    const compCol = db.collection('competitions');
    const partCol = db.collection('participants');
    const regCol = db.collection('registrations');

    const groupComps = await compCol.find({ participationType: 'group' }).toArray();
    const allTeams = await teamsCol.find().toArray();
    const allParts = await partCol.find().toArray();
    const partMap = {};
    allParts.forEach(p => partMap[p.id] = p);

    const issues = [];
    const teamSizesSummary = [];

    for (const gc of groupComps) {
      const teams = allTeams.filter(t => t.competitionId === gc.id);
      
      for (const t of teams) {
        const memberIds = t.memberIds || [];
        // Registered participants in this unit for this competition
        const regParts = allParts.filter(p => p.unitId === t.unitId && p.registeredEvents?.includes(gc.id));
        const regPartIds = regParts.map(p => p.id);

        const inRegButNotTeam = regParts.filter(p => !memberIds.includes(p.id));
        const inTeamButNotReg = memberIds.filter(id => !regPartIds.includes(id));

        teamSizesSummary.push({
          compCode: gc.code,
          compName: gc.name,
          category: gc.categoryId,
          unitId: t.unitId,
          teamName: t.teamName,
          teamMemberCount: memberIds.length,
          regCount: regParts.length,
          members: memberIds.map(id => partMap[id]?.chestNumber + " " + partMap[id]?.fullName).join(', ')
        });

        if (inRegButNotTeam.length > 0 || inTeamButNotReg.length > 0) {
          issues.push({
            comp: `[${gc.code}] ${gc.name}`,
            unit: t.unitId,
            teamName: t.teamName,
            teamMembersCount: memberIds.length,
            regPartsCount: regParts.length,
            inRegButNotTeam: inRegButNotTeam.map(p => `${p.chestNumber} (${p.fullName})`),
            inTeamButNotReg: inTeamButNotReg.map(id => partMap[id] ? `${partMap[id].chestNumber} (${partMap[id].fullName})` : id)
          });
        }
      }
    }

    console.log("=== ALL DISCREPANCIES BETWEEN TEAM MEMBERS AND REGISTERED PARTICIPANTS ===");
    console.log(`Total group competitions: ${groupComps.length}`);
    console.log(`Total teams evaluated: ${teamSizesSummary.length}`);
    console.log(`Total discrepancies found: ${issues.length}`);
    console.log(JSON.stringify(issues, null, 2));

    console.log("\n=== TEAMS WITH LESS THAN 3 MEMBERS ===");
    const smallTeams = teamSizesSummary.filter(t => t.teamMemberCount < 3);
    smallTeams.forEach(t => {
      console.log(`[${t.compCode}] ${t.compName} | Unit: ${t.unitId.replace('unit_', '')} | Count: ${t.teamMemberCount} members: [${t.members}]`);
    });

  } finally {
    await client.close();
  }
}

findEveryDiscrepancy();
