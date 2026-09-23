import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://mfun938_db_user:dsNyPQNUELJgNVLo@cluster0.wmttalg.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

async function checkAllTeams() {
  try {
    await client.connect();
    const db = client.db('sahityotsav');
    const teamsCol = db.collection('teams');
    const compCol = db.collection('competitions');
    const partCol = db.collection('participants');
    const regCol = db.collection('registrations');

    // Fetch all
    const allComps = await compCol.find({ participationType: 'group' }).toArray();
    const allTeams = await teamsCol.find().toArray();
    const allParts = await partCol.find().toArray();
    const allRegs = await regCol.find().toArray();

    const partMap = {};
    allParts.forEach(p => { partMap[p.id] = p; });

    console.log(`\n================ ALL GROUP COMPETITIONS TEAM SIZES ================\n`);

    for (const comp of allComps) {
      console.log(`\n-------------------------------------------------------------`);
      console.log(`[${comp.code}] ${comp.name} (${comp.categoryId}) - Allowed Team Size: 2 - ${comp.teamSize}`);
      console.log(`-------------------------------------------------------------`);

      const compTeams = allTeams.filter(t => t.competitionId === comp.id);
      
      for (const team of compTeams) {
        const memberIds = team.memberIds || [];
        const memberNames = memberIds.map(id => {
          const p = partMap[id];
          return p ? `${p.chestNumber} (${p.fullName})` : id;
        });

        // Also find participants from this unit who have this event in registeredEvents
        const registeredForEvent = allParts.filter(p => p.unitId === team.unitId && p.registeredEvents?.includes(comp.id));
        const regPartNames = registeredForEvent.map(p => `${p.chestNumber} (${p.fullName})`);

        console.log(`Unit: ${team.unitId.replace('unit_', '')}`);
        console.log(`  Team Name: "${team.teamName}" | Member Count in Team: ${memberIds.length}`);
        console.log(`  Team Members:`, memberNames.join(', '));
        console.log(`  Participants with event in registeredEvents (${registeredForEvent.length}):`, regPartNames.join(', '));

        // Check if any discrepancy
        const missingInTeam = registeredForEvent.filter(p => !memberIds.includes(p.id));
        if (missingInTeam.length > 0) {
          console.log(`  ⚠️ MISMATCH: Participant has event registered, but not in team.memberIds:`, missingInTeam.map(p => `${p.chestNumber} (${p.fullName})`).join(', '));
        }
      }
    }

    // Now specifically for Sub Junior participants in Zanzibari Souqs and Tabrizi Taraz
    console.log(`\n================ SUB JUNIOR PARTICIPANTS IN ZANZIBARI SOUQS ================\n`);
    const zanzibariSJ = allParts.filter(p => p.unitId === 'unit_zanzibari_souqs' && p.selectedCategoryId === 'cat_sub_junior');
    for (const p of zanzibariSJ) {
      console.log(`${p.chestNumber} - ${p.fullName} (Registered events count: ${p.registeredEvents?.length || 0})`);
      const events = p.registeredEvents?.map(eId => {
        const c = allComps.find(x => x.id === eId);
        return c ? `${c.code}: ${c.name}` : eId;
      });
      console.log(`   Events:`, events);
    }

    console.log(`\n================ SUB JUNIOR PARTICIPANTS IN TABRIZI TARAZ ================\n`);
    const tabriziSJ = allParts.filter(p => p.unitId === 'unit_tabrizi_taraz' && p.selectedCategoryId === 'cat_sub_junior');
    for (const p of tabriziSJ) {
      console.log(`${p.chestNumber} - ${p.fullName} (Registered events count: ${p.registeredEvents?.length || 0})`);
      const events = p.registeredEvents?.map(eId => {
        const c = allComps.find(x => x.id === eId);
        return c ? `${c.code}: ${c.name}` : eId;
      });
      console.log(`   Events:`, events);
    }

  } finally {
    await client.close();
  }
}

checkAllTeams();
